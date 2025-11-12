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
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional

from alibabacloud_cms20190101 import models as cms_20190101_models
from fastapi import APIRouter, Depends, Query, Request

from veaiops.handler.errors import RecordNotFoundError
from veaiops.handler.services.datasource.connect import (
    create_connect,
    delete_connect,
    get_all_connects,
    get_connect_by_id,
    update_connect,
)
from veaiops.handler.services.user import get_current_user
from veaiops.metrics.aliyun import AliyunClient
from veaiops.metrics.volcengine import VolcengineClient
from veaiops.metrics.zabbix import ZabbixClient
from veaiops.schema.documents import Connect, User
from veaiops.schema.models.base import APIResponse, PaginatedAPIResponse
from veaiops.schema.models.datasource import (
    AliyunContactGroup,
    AliyunMetric,
    AliyunMetricConfig,
    AliyunMetricMetaListPayload,
    AliyunProject,
    AliyunProjectMetaPayload,
    ConnectCreatePayload,
    ConnectUpdatePayload,
)
from veaiops.schema.types import DataSourceType
from veaiops.utils.crypto import decrypt_secret_value

connect_router = APIRouter(prefix="/connect", tags=["DataSource Connect"])


@connect_router.get("/", response_model=PaginatedAPIResponse[List[Connect]])
async def get_all_connects_endpoint(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    name: Optional[str] = None,
    datasource_type: Optional[DataSourceType] = Query(None, description="Filter by data source type"),
) -> PaginatedAPIResponse[List[Connect]]:
    """Get all Connect objects with optional pagination and name filtering.

    Args:
        request (Request): FastAPI request object.
        skip (int): Number of connects to skip (default: 0).
        limit (int): Maximum number of connects to return (default: 100).
        name (Optional[str]): Optional name filter for fuzzy matching.
        datasource_type (Optional[DataSourceType]): Optional type filter.

    Returns:
        PaginatedAPIResponse[List[Connect]]: API response containing list of connects with pagination info.
    """
    # Get all connects with pagination
    connects, total = await get_all_connects(skip=skip, limit=limit, name=name, datasource_type=datasource_type)

    return PaginatedAPIResponse(
        message="Connects retrieved successfully",
        data=connects,
        limit=limit,
        skip=skip,
        total=total,
    )


@connect_router.get("/{connect_id}", response_model=APIResponse[Connect])
async def get_connect_by_id_endpoint(request: Request, connect_id: str) -> APIResponse[Connect]:
    """Get a Connect object by ID.

    Args:
        request (Request): FastAPI request object.
        connect_id (str): The ID of the Connect to retrieve.

    Returns:
        APIResponse[Connect]: API response containing the Connect object.
    """
    # Get the connect by ID
    connect = await get_connect_by_id(connect_id)

    if not connect:
        raise RecordNotFoundError(message=f"Connect with ID {connect_id} not found")

    return APIResponse(
        message="Connect retrieved successfully",
        data=connect,
    )


@connect_router.post("/", response_model=APIResponse[Connect])
async def create_connect_endpoint(
    connect_create: ConnectCreatePayload, user: User = Depends(get_current_user)
) -> APIResponse[Connect]:
    """Create a new Connect object.

    Args:
        connect_create (ConnectCreatePayload): The connect creation data.
        user (User): The current user.

    Returns:
        APIResponse[Connect]: API response containing the created Connect object.
    """
    # Extract credentials based on type
    credentials = {}
    if connect_create.type == DataSourceType.Zabbix:
        credentials = {
            "zabbix_api_url": connect_create.zabbix_api_url,
            "zabbix_api_user": connect_create.zabbix_api_user,
            "zabbix_api_password": connect_create.zabbix_api_password,
        }
    elif connect_create.type == DataSourceType.Aliyun:
        credentials = {
            "aliyun_access_key_id": connect_create.aliyun_access_key_id,
            "aliyun_access_key_secret": connect_create.aliyun_access_key_secret,
        }
    elif connect_create.type == DataSourceType.Volcengine:
        credentials = {
            "volcengine_access_key_id": connect_create.volcengine_access_key_id,
            "volcengine_access_key_secret": connect_create.volcengine_access_key_secret,
        }

    # Create connect with user information
    connect = await create_connect(
        connect_create.name,
        connect_create.type,
        credentials,
        created_user=user.username,
    )

    return APIResponse(
        message="Connect created successfully",
        data=connect,
    )


@connect_router.put("/{connect_id}", response_model=APIResponse[Connect])
async def update_connect_endpoint(
    connect_id: str,
    connect_update: ConnectUpdatePayload,
    user: User = Depends(get_current_user),
) -> APIResponse[Connect]:
    """Update an existing Connect object.

    Args:
        connect_id (str): The ID of the Connect to update.
        connect_update (ConnectUpdate): The connect update data.
        user (User): The current user.

    Returns:
        APIResponse[Connect]: API response containing the updated Connect object.
    """
    # Convert ConnectUpdate to dict and filter out None values
    update_data = connect_update.dict(exclude_unset=True)

    connect = await update_connect(connect_id, update_data, updated_user=user.username)

    return APIResponse(
        message="Connect updated successfully",
        data=connect,
    )


@connect_router.delete("/{connect_id}", response_model=APIResponse[bool])
async def delete_connect_endpoint(request: Request, connect_id: str) -> APIResponse[bool]:
    """Delete a Connect object by ID.

    Args:
        request (Request): FastAPI request object.
        connect_id (str): The ID of the Connect to delete.

    Returns:
        APIResponse[bool]: API response indicating success or failure of deletion.
    """
    # Delete connect
    result = await delete_connect(connect_id)

    return APIResponse(
        message="Connect deleted successfully",
        data=result,
    )


@connect_router.post(
    "/aliyun/{connect_id}/describe-project-meta",
    response_model=PaginatedAPIResponse[List[AliyunProject]],
    summary="Describe Aliyun Project Meta",
)
async def describe_aliyun_project_meta(
    request: Request,
    connect_id: str,
    payload: AliyunProjectMetaPayload,
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=0),
) -> PaginatedAPIResponse[List[AliyunProject]]:
    """Get project meta data from Aliyun.

    Args:
        request (Request): FastAPI  request object.
        connect_id (str): The ID of the Aliyun connect.
        payload (AliyunProjectMetaPayload): The request body containing project name filter.
        skip (int, optional): Number of records to skip for pagination. Defaults to 0.
        limit (int, optional): Maximum number of records to return. Defaults to 10.

    Returns:
        PaginatedAPIResponse[List[AliyunProject]]: API response containing project meta data.
    """
    # Find the connect by id
    connect = await get_connect_by_id(connect_id)

    if not connect:
        raise RecordNotFoundError(message=f"Connect with ID {connect_id} not found")

    if connect.type != DataSourceType.Aliyun:
        raise RecordNotFoundError(message=f"Connect {connect_id} is not an Aliyun connect")

    # Create Aliyun client

    client = AliyunClient(
        ak=connect.aliyun_access_key_id,
        sk=decrypt_secret_value(connect.aliyun_access_key_secret),
        region="cn-beijing",  # Default region, can be changed as needed
    )

    # Aliyun API uses page_number and page_size, not skip/limit.
    page_number = (skip // limit) + 1 if limit > 0 else 1

    # Prepare request
    describe_project_meta_request = cms_20190101_models.DescribeProjectMetaRequest(
        page_number=page_number, page_size=limit
    )
    if payload.project:
        describe_project_meta_request.project = payload.project

    # Call the API
    response = client.describe_project_meta(describe_project_meta_request)
    response_dict = response.to_map() if hasattr(response, "to_map") else {}

    # Extract data and total
    resources = response_dict.get("body", {}).get("Resources", {}).get("Resource", [])
    total = response_dict.get("body", {}).get("Total", 0)

    # Create a list of AliyunProject objects
    projects = [AliyunProject.model_validate(r) for r in resources]

    return PaginatedAPIResponse(
        message="Project meta data retrieved successfully",
        data=projects,
        skip=skip,
        limit=limit,
        total=total,
    )


@connect_router.post(
    "/aliyun/{connect_id}/describe-metric-meta-list",
    response_model=PaginatedAPIResponse[List[AliyunMetric]],
)
async def describe_aliyun_metric_meta_list(
    request: Request,
    connect_id: str,
    payload: AliyunMetricMetaListPayload,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=0),
) -> PaginatedAPIResponse[List[AliyunMetric]]:
    """Get metric meta list from Aliyun.

    Args:
        request (Request): FastAPI request object.
        connect_id (str): The ID of the Aliyun connect.
        payload (AliyunMetricMetaListPayload): Request body containing namespace and metric name filters.
        skip (int): Number of records to skip (default: 0).
        limit (int): Maximum number of records to return (default: 100).

    Returns:
        PaginatedAPIResponse[List[AliyunMetric]]: API response containing metric meta list.
    """
    # Find the connect by id
    connect = await get_connect_by_id(connect_id)

    if not connect:
        raise RecordNotFoundError(message=f"Connect with ID {connect_id} not found")

    if connect.type != DataSourceType.Aliyun:
        raise RecordNotFoundError(message=f"Connect {connect_id} is not an Aliyun connect")

    client = AliyunClient(
        ak=connect.aliyun_access_key_id,
        sk=decrypt_secret_value(connect.aliyun_access_key_secret),
        region="cn-beijing",  # Default region, can be changed as needed
    )

    # Aliyun API uses page_number and page_size, not skip/limit.
    page_number = (skip // limit) + 1 if limit > 0 else 1

    # Prepare request
    describe_metric_meta_list_request = cms_20190101_models.DescribeMetricMetaListRequest(
        page_number=page_number, page_size=limit
    )
    if payload.namespace:
        describe_metric_meta_list_request.namespace = payload.namespace
    if payload.metric_name:
        describe_metric_meta_list_request.metric_name = payload.metric_name

    # Call the API
    response = client.describe_metric_meta_list(describe_metric_meta_list_request)
    response_dict = response.to_map() if hasattr(response, "to_map") else {}

    # Extract data and total
    resources = response_dict.get("body", {}).get("Resources", {}).get("Resource", [])
    total = response_dict.get("body", {}).get("TotalCount", 0)

    # Create a list of AliyunMetric objects
    metrics = []
    for r in resources:
        metric_labels = json.loads(r["Labels"])
        is_alarm_supported = False
        for label in metric_labels:
            if label.get("name") == "is_alarm" and label.get("value") == "true":
                is_alarm_supported = True
                break

        if not is_alarm_supported:
            continue

        statistics = r.get("Statistics")
        if not statistics or "Average" not in statistics:
            continue

        metrics.append(AliyunMetric.model_validate(r))

    return PaginatedAPIResponse(
        message="Metric meta list retrieved successfully",
        data=metrics,
        skip=skip,
        limit=limit,
        total=total,
    )


@connect_router.post(
    "/aliyun/{connect_id}/describe-contact-group-list",
    response_model=PaginatedAPIResponse[List[AliyunContactGroup]],
)
async def describe_aliyun_contact_group_list(
    request: Request,
    connect_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1),
) -> PaginatedAPIResponse[List[AliyunContactGroup]]:
    """Get contact group list from Aliyun.

    Args:
        request (Request): FastAPI request object.
        connect_id (str): The ID of the Aliyun connect.
        skip (int): Number of records to skip (default: 0).
        limit (int): Maximum number of records to return (default: 100).

    Returns:
        PaginatedAPIResponse[List[AliyunContactGroup]]: API response containing contact group list.
    """
    # Find the connect by id
    connect = await get_connect_by_id(connect_id)

    if not connect:
        raise RecordNotFoundError(message=f"Connect with ID {connect_id} not found")

    if connect.type != DataSourceType.Aliyun:
        raise RecordNotFoundError(message=f"Connect {connect_id} is not an Aliyun connect")

    client = AliyunClient(
        ak=connect.aliyun_access_key_id,
        sk=decrypt_secret_value(connect.aliyun_access_key_secret),
        region="cn-beijing",  # It is irrelevant to the region
    )

    # Aliyun API uses page_number and page_size, not skip/limit.
    page_number = (skip // limit) + 1

    # Prepare request
    describe_contact_group_list_request = cms_20190101_models.DescribeContactGroupListRequest(
        page_number=page_number, page_size=limit
    )

    # Call the API
    response = client.describe_contact_group_list(describe_contact_group_list_request)
    response_dict = response.to_map() if hasattr(response, "to_map") else {}

    # Extract data and total
    resources = response_dict.get("body", {}).get("ContactGroups", {}).get("ContactGroup", [])
    total = response_dict.get("body", {}).get("Total", 0)

    # Handle both string and dict representations of contact groups
    processed_resources = []
    for resource in resources:
        if isinstance(resource, str):
            # Handle string representation by creating a minimal dict
            processed_resources.append(
                {
                    "Name": resource,
                }
            )
        else:
            # Handle dict representation as usual
            processed_resources.append(resource)

    # Create a list of AliyunContactGroup objects
    contact_groups = [AliyunContactGroup.model_validate(r) for r in processed_resources]

    return PaginatedAPIResponse(
        message="Contact group list retrieved successfully",
        data=contact_groups,
        skip=skip,
        limit=limit,
        total=total,
    )


@connect_router.post("/dail", response_model=APIResponse)
async def test_connect_endpoint(request: Request, connect_create: ConnectCreatePayload) -> APIResponse:
    """Test if a Connect object can be established.

    Args:
        request (Request): FastAPI request object.
        connect_create (ConnectCreatePayload): The connect creation data for testing.

    Returns:
        APIResponse: API response indicating if connection test was successful.
    """
    # Test connection based on type
    if connect_create.type == DataSourceType.Zabbix:
        client = ZabbixClient(
            url=connect_create.zabbix_api_url,
            user=connect_create.zabbix_api_user,
            password=connect_create.zabbix_api_password,
        )
        client.test_connection()

        client.create_default_mediatype()

        client.create_default_action(connect_create.zabbix_api_user)
    elif connect_create.type == DataSourceType.Aliyun:
        client = AliyunClient(
            ak=connect_create.aliyun_access_key_id,
            sk=connect_create.aliyun_access_key_secret,
            region="cn-beijing",  # Default region for testing
        )
        client.test_connection()
    elif connect_create.type == DataSourceType.Volcengine:
        client = VolcengineClient(
            ak=connect_create.volcengine_access_key_id,
            sk=connect_create.volcengine_access_key_secret,
            region="cn-beijing",  # Default region for testing
        )
        client.test_connection()
    else:
        raise ValueError(f"Unsupported data source type: {connect_create.type}")

    return APIResponse(
        message="Connection test successful",
    )


@connect_router.post("/aliyun/metrics/instances", response_model=APIResponse[List[Dict[str, str]]])
async def search_instances(request: Request, metrics_config: AliyunMetricConfig):
    """Search Aliyun metrics instances."""
    connect = await Connect.find_one({"name": metrics_config.connect_name})
    if not connect:
        raise RecordNotFoundError(message=f"Connect with name {metrics_config.connect_name} not found")

    client = AliyunClient(
        ak=connect.aliyun_access_key_id,
        sk=decrypt_secret_value(connect.aliyun_access_key_secret),
        region=metrics_config.region,
    )

    # Calculate start_time as the most recent full ten minutes ago
    now = datetime.now()
    # Round down to the nearest minute for end_time
    end_time = now.replace(second=0, microsecond=0)
    # Calculate start_time as 10 minutes before end_time
    start_time = end_time - timedelta(minutes=10)
    express = {"groupby": metrics_config.group_by} if metrics_config.group_by else {}

    all_data_points = []
    next_token = None

    max_pages = 100
    page_count = 0
    while page_count < max_pages:
        resp = client.get_metric_data(
            namespace=metrics_config.namespace,
            metric_name=metrics_config.metric_name,
            dimensions=metrics_config.dimensions,
            start_time=start_time.strftime("%Y-%m-%d %H:%M:%S"),
            end_time=end_time.strftime("%Y-%m-%d %H:%M:%S"),
            express=express,
            next_token=next_token,
        )

        data_points = []
        if hasattr(resp, "body") and hasattr(resp.body, "datapoints") and resp.body.datapoints:
            data_points = json.loads(resp.body.datapoints)

        if isinstance(data_points, list):
            all_data_points.extend(data_points)

        if hasattr(resp, "body") and hasattr(resp.body, "next_token") and resp.body.next_token:
            next_token = resp.body.next_token
            page_count += 1
        else:
            break

    instances = []
    seen = set()
    for data_point in all_data_points:
        labels = {}
        for key, value in data_point.items():
            if key not in ["timestamp", "Value", "Average", "Minimum", "Maximum"]:
                labels[key] = str(value)
        key = tuple(sorted(labels.items()))
        if labels and key not in seen:
            seen.add(key)
            instances.append(labels)

    return APIResponse(
        message="success",
        data=instances,
    )
