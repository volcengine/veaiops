# Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#      https://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

from datetime import datetime, timedelta, timezone
from typing import List, Optional

from fastapi import APIRouter, Body, Depends, Query, Request
from fastapi.concurrency import run_in_threadpool

from veaiops.handler.errors import BadRequestError, RecordNotFoundError
from veaiops.handler.services.user import get_current_user
from veaiops.metrics.datasource_factory import DataSourceFactory
from veaiops.metrics.timeseries import InputTimeSeries
from veaiops.metrics.zabbix import (
    DEFAULT_PAGE_SIZE,
    ZabbixClient,
    ZabbixHost,
    ZabbixItem,
    ZabbixMediatype,
    ZabbixTemplate,
    ZabbixTemplateMetric,
    ZabbixUserGroup,
)
from veaiops.schema.base import ZabbixDataSourceConfig
from veaiops.schema.documents import Connect, DataSource
from veaiops.schema.documents.intelligent_threshold.task import IntelligentThresholdTask
from veaiops.schema.documents.meta.user import User
from veaiops.schema.models.base import APIResponse, PaginatedAPIResponse
from veaiops.schema.models.datasource.base import BaseTimeseriesRequestPayload
from veaiops.schema.types import DataSourceType
from veaiops.utils.crypto import decrypt_secret_value

zabbix_router = APIRouter(prefix="/zabbix", tags=["Zabbix Data Sources"])


@zabbix_router.get("/", response_model=PaginatedAPIResponse[List[DataSource]])
async def get_all_zabbix_datasource(
    request: Request, skip: int = 0, limit: int = 100, name: Optional[str] = None, is_active: Optional[bool] = None
) -> PaginatedAPIResponse[List[DataSource]]:
    """Get all Zabbix data sources with optional skip, limit, name fuzzy matching, and active status filtering.

    Args:
        request (Request): FastAPI request object.
        skip (int): Number of data sources to skip (default: 0).
        limit (int): Maximum number of data sources to return (default: 100).
        name (Optional[str]): Optional name filter for fuzzy matching.
        is_active (Optional[bool]): Filter by active status if provided.

    Returns:
        PaginatedResponse[List[DataSource]]: API response containing list of data sources with pagination info.
    """
    # Build query based on provided parameters
    query_conditions = {"type": DataSourceType.Zabbix}
    if is_active is not None:
        query_conditions["is_active"] = is_active
    if name:
        query_conditions["name"] = {"$regex": name, "$options": "i"}

    query = DataSource.find(query_conditions)

    # Calculate total count
    total = await query.count()

    # Apply skip and limit
    datasource = await query.skip(skip).limit(limit).to_list()

    return PaginatedAPIResponse(
        message="Zabbix data sources retrieved successfully",
        data=datasource,
        limit=limit,
        skip=skip,
        total=total,
    )


@zabbix_router.get("/{datasource_id}", response_model=APIResponse[DataSource])
async def get_zabbix_datasource_by_id(request: Request, datasource_id: str) -> APIResponse[DataSource]:
    """Get a Zabbix data source by ID.

    Args:
        request (Request): FastAPI request object.
        datasource_id (str): The ID of the data source to retrieve.

    Returns:
        APIResponse[DataSource]: API response containing the data source.
    """
    # Find the data source by ID (using MongoDB's _id field)
    datasource = await DataSource.get(datasource_id)
    if not datasource or datasource.type != DataSourceType.Zabbix:
        raise RecordNotFoundError(message=f"Zabbix data source with ID {datasource_id} not found")

    return APIResponse(
        message="Zabbix data source retrieved successfully",
        data=datasource,
    )


@zabbix_router.post("/", response_model=APIResponse[DataSource])
async def create_zabbix_datasource(
    request: Request, datasource_config: ZabbixDataSourceConfig, user: User = Depends(get_current_user)
) -> APIResponse[DataSource]:
    """Create a new Zabbix data source.

    Args:
        request (Request): FastAPI request object.
        datasource_config (ZabbixDataSourceConfig): Zabbix data source configuration.
        user (User): The current user.

    Returns:
        APIResponse[DataSource]: API response containing the created data source.
    """
    connect = await Connect.find_one({"name": datasource_config.connect_name})
    if not connect:
        raise RecordNotFoundError(message=f"Connect with name {datasource_config.connect_name} not found")

    # Use provided name or generate one if not provided
    datasource_name = datasource_config.name
    # Create DataSource object (MongoDB will auto-generate _id)
    datasource = DataSource(
        name=datasource_name,
        type=DataSourceType.Zabbix,
        connect=connect,
        zabbix_config=datasource_config,
        created_user=user.username,
        updated_user=user.username,
    )

    # Save the data source
    await datasource.insert()

    return APIResponse(
        message="Zabbix data source created successfully",
        data=datasource,
    )


@zabbix_router.put("/{datasource_id}", response_model=APIResponse[DataSource])
async def update_zabbix_datasource(
    request: Request,
    datasource_id: str,
    datasource_config: ZabbixDataSourceConfig,
    user: User = Depends(get_current_user),
) -> APIResponse[DataSource]:
    """Update a Zabbix data source.

    Args:
        request (Request): FastAPI request object.
        datasource_id (str): The ID of the data source to update.
        datasource_config (ZabbixDataSourceConfig): Updated Zabbix data source configuration.
        user (User): The current user.

    Returns:
        APIResponse[DataSource]: API response containing the updated data source.
    """
    # Find the data source by ID (using MongoDB's _id field)
    datasource = await DataSource.get(datasource_id)

    if not datasource or datasource.type != DataSourceType.Zabbix:
        raise RecordNotFoundError(message=f"Data source with ID {datasource_id} not found")

    # Update the data source configuration
    datasource.zabbix_config = datasource_config
    datasource.updated_at = datetime.now(timezone.utc)
    datasource.updated_user = user.username

    # Save the updated data source
    await datasource.save()

    return APIResponse(
        message="Zabbix data source updated successfully",
        data=datasource,
    )


@zabbix_router.delete("/{datasource_id}", response_model=APIResponse[bool])
async def delete_zabbix_datasource(request: Request, datasource_id: str) -> APIResponse[bool]:
    """Delete a Zabbix data source by ID.

    Args:
        request (Request): FastAPI request object.
        datasource_id (str): The ID of the data source to delete.

    Returns:
        APIResponse[bool]: API response indicating success or failure of deletion.
    """
    # Find the data source by ID (using MongoDB's _id field)
    datasource = await DataSource.get(datasource_id)

    if not datasource or datasource.type != DataSourceType.Zabbix:
        raise RecordNotFoundError(message=f"Data source with ID {datasource_id} not found")

    # Check if there are any associated intelligent threshold tasks
    intelligent_threshold_tasks = await IntelligentThresholdTask.find(
        {"datasource_type": DataSourceType.Zabbix}
    ).to_list()
    for task in intelligent_threshold_tasks:
        if str(task.datasource_id) == datasource_id:
            raise BadRequestError(
                message=f"Cannot delete data source because it has associated "
                f"intelligent threshold task: {task.task_name}",
            )

    # Delete the data source
    await datasource.delete()

    return APIResponse(
        message=f"Zabbix data source with ID {datasource_id} deleted successfully",
        data=True,
    )


@zabbix_router.get("/{connect_name}/templates", response_model=APIResponse[List[ZabbixTemplate]])
async def get_zabbix_templates(
    request: Request, connect_name: str, name: Optional[str] = None
) -> APIResponse[List[ZabbixTemplate]]:
    """Get Zabbix templates by data source ID.

    Args:
        request (Request): FastAPI request object.
        connect_name (str): The name of the connect to retrieve templates for.
        name (Optional[str]): Optional name pattern to filter templates by name.

    Returns:
        APIResponse[List[ZabbixTemplate]]: API response containing the list of templates.
    """
    connect = await Connect.find_one({"name": connect_name, "type": DataSourceType.Zabbix})
    if not connect:
        raise RecordNotFoundError(message=f"Connect with name {connect_name} not found")

    templates = ZabbixClient(
        connect.zabbix_api_url,
        connect.zabbix_api_user,
        decrypt_secret_value(connect.zabbix_api_password),
    ).get_templates(name=name)

    return APIResponse(
        message="Zabbix templates retrieved successfully",
        data=templates,
    )


@zabbix_router.get(
    "/{connect_name}/templates/{template_id}/metrics", response_model=APIResponse[List[ZabbixTemplateMetric]]
)
async def get_metrics_by_template_id(connect_name: str, template_id: str) -> APIResponse[List[ZabbixTemplateMetric]]:
    """Get Zabbix metrics by template ID.

    Args:
        connect_name: Connect name
        template_id: The ID of the template to get metrics for

    Returns:
        APIResponse with list of metrics
    """
    # Get data source instance
    connect = await Connect.find_one({"name": connect_name, "type": DataSourceType.Zabbix})
    if not connect:
        raise RecordNotFoundError(message=f"Connect with name {connect_name} not found")

    metrics = ZabbixClient(
        connect.zabbix_api_url,
        connect.zabbix_api_user,
        decrypt_secret_value(connect.zabbix_api_password),
    ).get_metrics_by_template_id(template_id)

    return APIResponse(message="Zabbix metrics retrieved successfully", data=metrics)


@zabbix_router.get("/{connect_name}/templates/{template_id}/hosts", response_model=APIResponse[List[ZabbixHost]])
async def get_zabbix_template_hosts(connect_name: str, template_id: str) -> APIResponse[List[ZabbixHost]]:
    """Get Zabbix hosts by template ID.

    Args:
        connect_name (str): Connect name
        template_id: The ID of the template to get hosts for

    Returns:
        APIResponse with list of hosts
    """
    connect = await Connect.find_one({"name": connect_name, "type": DataSourceType.Zabbix})
    if not connect:
        raise RecordNotFoundError(message=f"Connect with name {connect_name} not found")

    hosts = ZabbixClient(
        connect.zabbix_api_url,
        connect.zabbix_api_user,
        decrypt_secret_value(connect.zabbix_api_password),
    ).get_hosts_by_template_id(template_id)

    return APIResponse(message="Zabbix hosts retrieved successfully", data=hosts)


@zabbix_router.get("/{connect_name}/items", response_model=APIResponse[List[ZabbixItem]])
async def get_zabbix_items_by_host_and_metric(
    connect_name: str,
    host: str = Query(min_length=1),
    metric_name: str = Query(min_length=1),
) -> APIResponse[List[ZabbixItem]]:
    """Get Zabbix items by host and metric name.

    Args:
        connect_name: The name of the Zabbix connection
        host: The host name to get items for
        metric_name: The metric name (item key_) to filter by

    Returns:
        APIResponse with list of Zabbix items
    """
    connect = await Connect.find_one({"name": connect_name, "type": DataSourceType.Zabbix})
    if not connect:
        raise RecordNotFoundError(message=f"Connect with name {connect_name} not found")

    items = ZabbixClient(
        connect.zabbix_api_url,
        connect.zabbix_api_user,
        decrypt_secret_value(connect.zabbix_api_password),
    ).get_items_by_host_and_metric_name(host=host, metric_name=metric_name)

    return APIResponse(message="Zabbix items retrieved successfully", data=items)


@zabbix_router.post("/metrics/timeseries", response_model=APIResponse[List[InputTimeSeries]])
async def get_metrics_timeseries(
    request: Request,
    timeseries_request: BaseTimeseriesRequestPayload = Body(..., description="Time series request parameters"),
):
    """Get time series data for Zabbix metrics.

    Returns time series data points with timestamps and values for the specified metric.
    """
    datasource_id = timeseries_request.datasource_id

    start_time = timeseries_request.start_time
    end_time = timeseries_request.end_time
    period = timeseries_request.period
    instances = timeseries_request.instances

    datasource = await DataSource.get(datasource_id)
    if not datasource or datasource.type != DataSourceType.Zabbix:
        raise RecordNotFoundError(message=f"Zabbix data source with ID {datasource_id} not found")
    await datasource.fetch_link(DataSource.connect)
    zabbix_config = datasource.zabbix_config
    if not zabbix_config:
        raise RecordNotFoundError(message=f"Zabbix config for data source with ID {datasource_id} not found")

    zabbix_datasource = DataSourceFactory.create_datasource(datasource)

    # If start_time and end_time are not provided, calculate them
    if not start_time or not end_time:
        now = datetime.now(timezone.utc)
        # Round down to the nearest minute for end_time
        end_time_dt = now.replace(second=0, microsecond=0)
        # Calculate start_time as 10 minutes before end_time
        start_time_dt = end_time_dt - timedelta(minutes=10)
        # Convert to timestamp in seconds
        if not end_time:
            end_time = int(end_time_dt.timestamp())
        if not start_time:
            start_time = int(start_time_dt.timestamp())

    # Set the period in seconds for the Zabbix data source
    if period.endswith("s"):
        zabbix_datasource.interval_seconds = int(period[:-1])
    elif period.endswith("m"):
        zabbix_datasource.interval_seconds = int(period[:-1]) * 60
    elif period.endswith("h"):
        zabbix_datasource.interval_seconds = int(period[:-1]) * 3600
    elif period.endswith("d"):
        zabbix_datasource.interval_seconds = int(period[:-1]) * 86400
    elif period.endswith("w"):
        zabbix_datasource.interval_seconds = int(period[:-1]) * 604800
    else:
        zabbix_datasource.interval_seconds = 60  # Default to 60 seconds

    # Fetch data from Zabbix API using client.get_metric_data method
    # If instances are provided, use itemids from instances, otherwise use all targets
    if instances:
        # Extract itemids from instances parameter
        item_ids = []
        for instance in instances:
            if "itemid" in instance:
                item_ids.append(int(instance["itemid"]))
    else:
        # Use all targets if no instances are provided
        item_ids = [int(target.itemid) for target in zabbix_datasource.targets]

    # Convert datetime to timestamp
    start_time_ts = int(start_time)
    end_time_ts = int(end_time)

    # Get history type from datasource
    history_type = zabbix_datasource.history_type

    # Fetch data using pagination to ensure all data is retrieved
    all_history_data = []
    last_clock = start_time_ts
    page_size = DEFAULT_PAGE_SIZE

    # Add maximum iterations limit to prevent infinite loop
    max_iterations = 100
    iteration_count = 0

    while iteration_count < max_iterations:
        page_data = await zabbix_datasource.client.get_metric_data(
            item_ids=item_ids,
            time_from=last_clock,
            time_till=end_time_ts,
            history_type=history_type,
            page_size=page_size,
        )

        if not page_data:
            break

        # Validate page_data structure before processing
        if not isinstance(page_data, list) or len(page_data) == 0:
            raise BadRequestError(message="Received invalid page_data: expected non-empty list")

        # Ensure page_data items have required fields
        valid_items = [item for item in page_data if isinstance(item, dict) and "clock" in item]
        if not valid_items:
            raise BadRequestError(message="Received page_data with no valid items containing 'clock' field")

        all_history_data.extend(page_data)

        # Check if we have a valid last item before accessing its clock
        if page_data and isinstance(page_data[-1], dict) and "clock" in page_data[-1]:
            last_clock = int(page_data[-1]["clock"])
        else:
            raise BadRequestError(message="Last item in page_data is invalid or missing 'clock' field")

        # If we got less data than the page size, we've reached the end
        if len(page_data) < page_size:
            break

        # Increment iteration counter
        iteration_count += 1

    # Raise exception if we reached maximum iterations
    if iteration_count >= max_iterations:
        raise BadRequestError(
            message=f"Maximum iterations ({max_iterations}) reached while fetching Zabbix data. "
            f"This might indicate an issue with data retrieval or pagination logic."
        )

    # Convert history data to time series format
    timeseries_data = zabbix_datasource._convert_history_to_timeseries(all_history_data)

    return APIResponse(
        message="success",
        data=timeseries_data,
    )


@zabbix_router.get(
    "/datasource/{datasource_id}/mediatypes",
    response_model=APIResponse[List[ZabbixMediatype]],
)
async def get_zabbix_mediatypes(
    datasource_id: str,
) -> APIResponse[List[ZabbixMediatype]]:
    """Get Zabbix mediatypes by datasource ID.

    Args:
        datasource_id (str): The ID of the datasource to retrieve mediatypes for.

    Returns:
        APIResponse[List[ZabbixMediatype]]: API response containing the list of mediatypes.
    """
    datasource = await DataSource.get(datasource_id)
    if not datasource or datasource.type != DataSourceType.Zabbix:
        raise RecordNotFoundError(message=f"Zabbix data source with ID {datasource_id} not found")
    await datasource.fetch_link(DataSource.connect)

    if not datasource.zabbix_config:
        raise RecordNotFoundError(message=f"Zabbix config for data source with ID {datasource_id} not found")

    client = ZabbixClient(
        datasource.connect.zabbix_api_url,
        datasource.connect.zabbix_api_user,
        decrypt_secret_value(datasource.connect.zabbix_api_password),
    )
    mediatypes = await run_in_threadpool(client.get_mediatypes)

    return APIResponse(
        message="Zabbix mediatypes retrieved successfully",
        data=mediatypes,
    )


@zabbix_router.get(
    "/datasource/{datasource_id}/usergroups",
    response_model=APIResponse[List[ZabbixUserGroup]],
)
async def get_zabbix_usergroups(
    datasource_id: str,
) -> APIResponse[List[ZabbixUserGroup]]:
    """Get Zabbix usergroups by datasource ID.

    Args:
        datasource_id (str): The ID of the datasource to retrieve usergroups for.

    Returns:
        APIResponse[List[ZabbixUserGroup]]: API response containing the list of usergroups.
    """
    datasource = await DataSource.get(datasource_id)
    if not datasource or datasource.type != DataSourceType.Zabbix:
        raise RecordNotFoundError(message=f"Zabbix data source with ID {datasource_id} not found")
    await datasource.fetch_link(DataSource.connect)
    if not datasource.zabbix_config:
        raise RecordNotFoundError(message=f"Zabbix config for data source with ID {datasource_id} not found")

    client = ZabbixClient(
        datasource.connect.zabbix_api_url,
        datasource.connect.zabbix_api_user,
        decrypt_secret_value(datasource.connect.zabbix_api_password),
    )
    usergroups = await run_in_threadpool(client.get_usergroups)

    return APIResponse(
        message="Zabbix usergroups retrieved successfully",
        data=usergroups,
    )
