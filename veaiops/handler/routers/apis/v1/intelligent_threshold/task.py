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

from datetime import datetime, timezone
from typing import List, Optional

from beanie import PydanticObjectId
from fastapi import APIRouter, BackgroundTasks, Depends, Query, status

from veaiops.handler.errors import BadRequestError, InternalServerError, RecordNotFoundError
from veaiops.handler.services.intelligent_threshold.auto_refresh_task import (
    initialize_auto_refresh_task,
    scheduled_process_record_detail_tasks,
)
from veaiops.handler.services.intelligent_threshold.mcp import call_threshold_agent
from veaiops.handler.services.intelligent_threshold.task import (
    delete_task,
    list_task_versions as list_task_versions_service,
    list_tasks as list_tasks_service,
    update_task_result,
)
from veaiops.handler.services.user import get_current_user
from veaiops.metrics.volcengine import logger
from veaiops.schema.documents import (
    IntelligentThresholdTaskVersion,
)
from veaiops.schema.documents.intelligent_threshold.auto_refresh_task import AutoIntelligentThresholdTaskRecord
from veaiops.schema.documents.intelligent_threshold.task import (
    IntelligentThresholdTask,
)
from veaiops.schema.documents.meta.user import User
from veaiops.schema.models.base import APIResponse, PaginatedAPIResponse, TimeRange
from veaiops.schema.models.intelligent_threshold import (
    CreateIntelligentThresholdTaskPayload,
    IntelligentThresholdTaskDetail,
    RerunIntelligentThresholdTaskPayload,
    UpdateAutoRefreshSwitchPayload,
    UpdateTaskResultPayload,
)
from veaiops.schema.types import DataSourceType, IntelligentThresholdTaskStatus, TaskPriority

task_router = APIRouter(prefix="/task", tags=["IntelligentThresholdTask"])


@task_router.post("/", response_model=APIResponse[IntelligentThresholdTask], status_code=status.HTTP_201_CREATED)
async def create_task(
    body: CreateIntelligentThresholdTaskPayload, current_user: User = Depends(get_current_user)
) -> APIResponse[IntelligentThresholdTask]:
    """Create a new intelligent threshold task and its first version."""
    if await IntelligentThresholdTask.find_one({"task_name": body.task_name}):
        raise BadRequestError(message=f"Active task with name '{body.task_name}' already exists")

    # Check if a task with the same datasource_id already exists
    if await IntelligentThresholdTask.find_one({"datasource_id": body.datasource_id}):
        raise BadRequestError(message=f"Active task with datasource_id '{body.datasource_id}' already exists")

    task_doc = IntelligentThresholdTask(
        task_name=body.task_name,
        datasource_id=body.datasource_id,
        datasource_type=body.datasource_type,
        auto_update=body.auto_update,
        projects=body.projects,
        created_user=current_user.username,
        updated_user=current_user.username,
    )
    version_doc = IntelligentThresholdTaskVersion(
        version=1,
        task_id=task_doc.id,
        metric_template_value=body.metric_template_value,
        n_count=body.n_count,
        direction=body.direction,
        sensitivity=body.sensitivity,
        status=IntelligentThresholdTaskStatus.RUNNING,
        created_user=current_user.username,
        updated_user=current_user.username,
    )
    try:
        await task_doc.insert()
        version_doc.task_id = task_doc.id
        await version_doc.insert()

        # Call algorithm function via HTTP
        await call_threshold_agent(
            task_id=task_doc.id,
            task_version=version_doc.version,
            datasource_id=str(body.datasource_id),
            metric_template_value=body.metric_template_value,
            n_count=body.n_count,
            direction=body.direction,
            task_priority=TaskPriority.HIGH,
        )

        return APIResponse(message="Task created successfully", data=task_doc)
    except Exception as e:
        # rollback
        if await IntelligentThresholdTask.get(task_doc.id):
            await task_doc.delete()
        if await IntelligentThresholdTaskVersion.get(version_doc.id):
            await version_doc.delete()
        raise InternalServerError(message=f"Failed to create task: {e}")


@task_router.get("/{doc_id}", response_model=APIResponse[IntelligentThresholdTaskDetail])
async def get_task(doc_id: PydanticObjectId) -> APIResponse[IntelligentThresholdTaskDetail]:
    """Get an intelligent threshold task by ID, including its latest version."""
    task_doc = await IntelligentThresholdTask.find_one({"_id": doc_id})
    if not task_doc:
        raise RecordNotFoundError(message="Task not found")
    latest_version = (
        await IntelligentThresholdTaskVersion.find({"task_id": doc_id})
        .sort(-IntelligentThresholdTaskVersion.version)
        .first_or_none()
    )
    response_data = task_doc.model_dump()
    response_data["id"] = task_doc.id
    response_data["latest_version"] = latest_version
    response_obj = IntelligentThresholdTaskDetail.model_validate(response_data)

    return APIResponse(message="Task retrieved successfully", data=response_obj)


@task_router.post(
    "/rerun", response_model=APIResponse[IntelligentThresholdTaskVersion], status_code=status.HTTP_201_CREATED
)
async def rerun_task(
    body: RerunIntelligentThresholdTaskPayload, current_user: User = Depends(get_current_user)
) -> APIResponse[IntelligentThresholdTaskVersion]:
    """Rerun an intelligent threshold task, creating a new version."""
    task_doc = await IntelligentThresholdTask.find_one({"_id": body.task_id})
    if not task_doc:
        raise RecordNotFoundError(message="Task not found")

    latest_version = (
        await IntelligentThresholdTaskVersion.find({"task_id": task_doc.id})
        .sort(-IntelligentThresholdTaskVersion.version)
        .first_or_none()
    )

    if not latest_version:
        raise RecordNotFoundError(message="No existing version found for the task")

    new_version_number = latest_version.version + 1

    # Create new version with user tracking
    new_version_doc = IntelligentThresholdTaskVersion(
        task_id=body.task_id,
        version=new_version_number,
        metric_template_value=body.metric_template_value,
        n_count=body.n_count,
        direction=body.direction,
        created_user=current_user.username,  # Use current user instead of copying from latest version
        updated_user=current_user.username,
        status=IntelligentThresholdTaskStatus.RUNNING,
    )
    await new_version_doc.insert()

    # Update task's updated_at timestamp and user tracking
    task_doc.updated_at = datetime.now(timezone.utc)
    task_doc.updated_user = current_user.username
    await task_doc.save()

    # Call algorithm function via HTTP
    try:
        await call_threshold_agent(
            task_id=task_doc.id,
            task_version=new_version_doc.version,
            datasource_id=str(task_doc.datasource_id),
            metric_template_value=body.metric_template_value,
            n_count=body.n_count,
            direction=body.direction,
            task_priority=TaskPriority.HIGH,
        )
    except Exception as e:
        new_version_doc.status = IntelligentThresholdTaskStatus.FAILED
        new_version_doc.updated_user = current_user.username
        await new_version_doc.save()
        logger.error(f"Failed to rerun task: {e}")
        raise InternalServerError(message=f"Failed to trigger threshold agent: {e}")

    return APIResponse(message="Task rerun successful, new version created", data=new_version_doc)


@task_router.get("/versions/", response_model=PaginatedAPIResponse[List[IntelligentThresholdTaskVersion]])
async def list_task_versions(
    task_id: PydanticObjectId = Query(...),
    status: Optional[IntelligentThresholdTaskStatus] = Query(None, description="Filter by task status"),
    created_at_start: Optional[datetime] = Query(None, description="Start of created_at time range"),
    created_at_end: Optional[datetime] = Query(None, description="End of created_at time range"),
    updated_at_start: Optional[datetime] = Query(None, description="Start of updated_at time range"),
    updated_at_end: Optional[datetime] = Query(None, description="End of updated_at time range"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return"),
) -> PaginatedAPIResponse[List[IntelligentThresholdTaskVersion]]:
    """List and filter versions of an intelligent threshold task with pagination."""
    created_at_range = None
    if created_at_start and created_at_end:
        st = created_at_start.astimezone(timezone.utc)
        et = created_at_end.astimezone(timezone.utc)
        if st > et:
            raise BadRequestError(message="created_at_start not later than created_at_end")
        created_at_range = TimeRange(start_time=int(st.timestamp()), end_time=int(et.timestamp()))

    updated_at_range = None
    if updated_at_start and updated_at_end:
        st = updated_at_start.astimezone(timezone.utc)
        et = updated_at_end.astimezone(timezone.utc)
        if st > et:
            raise BadRequestError(message="updated_at_start not later than updated_at_end")
        updated_at_range = TimeRange(start_time=int(st.timestamp()), end_time=int(et.timestamp()))

    versions, total = await list_task_versions_service(
        task_id=task_id,
        status=status,
        created_at_range=created_at_range,
        updated_at_range=updated_at_range,
        skip=skip,
        limit=limit,
    )

    return PaginatedAPIResponse(
        message="list task versions successfully",
        data=versions,
        limit=limit,
        skip=skip,
        total=total,
    )


@task_router.get("/", response_model=PaginatedAPIResponse[List[IntelligentThresholdTask]])
async def list_tasks(
    projects: Optional[List[str]] = Query(None),
    task_name: Optional[str] = Query(None, description="Filter by task name"),
    datasource_type: DataSourceType = Query(DataSourceType.Volcengine),
    auto_update: Optional[bool] = Query(None),
    created_at_start: Optional[datetime] = Query(None, description="Start of created_at time range"),
    created_at_end: Optional[datetime] = Query(None, description="End of created_at time range"),
    updated_at_start: Optional[datetime] = Query(None, description="Start of updated_at time range"),
    updated_at_end: Optional[datetime] = Query(None, description="End of updated_at time range"),
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of items to return"),
) -> PaginatedAPIResponse[List[IntelligentThresholdTask]]:
    """List intelligent threshold tasks with filtering, pagination."""
    created_at_range = None
    if created_at_start and created_at_end:
        created_at_range = TimeRange(
            start_time=int(created_at_start.timestamp()), end_time=int(created_at_end.timestamp())
        )

    updated_at_range = None
    if updated_at_start and updated_at_end:
        updated_at_range = TimeRange(
            start_time=int(updated_at_start.timestamp()), end_time=int(updated_at_end.timestamp())
        )

    tasks, total = await list_tasks_service(
        projects=projects,
        datasource_type=datasource_type,
        auto_update=auto_update,
        skip=skip,
        limit=limit,
        task_name=task_name,
        created_at_range=created_at_range,
        updated_at_range=updated_at_range,
    )
    return PaginatedAPIResponse(
        message="list tasks successfully",
        data=tasks,
        limit=limit,
        skip=skip,
        total=total,
    )


@task_router.post("/{task_id}/update_result", response_model=APIResponse[dict])
async def update_task_result_endpoint(
    task_id: PydanticObjectId, body: UpdateTaskResultPayload, current_user: User = Depends(get_current_user)
) -> APIResponse[dict]:
    """Update task result and status."""
    # Verify task exists
    task = await IntelligentThresholdTask.find_one({"_id": body.task_id})
    if not task:
        raise RecordNotFoundError(message="Task not found")

    # Call update function
    await update_task_result(
        task_id=task_id,
        status=body.status,
        task_version=body.task_version,
        result=body.results if body.results else None,
        error_message=body.error_message if body.error_message else None,
    )

    # Update task's updated_user
    task.updated_user = current_user.username
    await task.save()

    return APIResponse(message="Task result updated successfully", data=None)


@task_router.post("/auto-refresh/initialize", response_model=APIResponse[AutoIntelligentThresholdTaskRecord])
async def initialize_auto_refresh_task_endpoint() -> APIResponse[AutoIntelligentThresholdTaskRecord]:
    """Initialize intelligent threshold auto-refresh task.

    This endpoint creates a new auto-refresh task record and associated detail records
    for all intelligent threshold tasks with auto_update=True.
    """
    try:
        task_record = await initialize_auto_refresh_task()
        return APIResponse(message="Auto refresh task initialized successfully", data=task_record)
    except Exception as e:
        raise InternalServerError(message=f"Failed to initialize auto refresh task: {e}")


@task_router.post("/auto-refresh/process", response_model=APIResponse[dict])
async def process_auto_refresh_task_endpoint(
    background_tasks: BackgroundTasks,
    max_iterations: int = Query(100, description="Maximum iteration count to prevent infinite loops"),
    gap_time: int = Query(10, description="Gap time between iterations in minutes"),
) -> APIResponse[dict]:
    """Process auto-refresh task records.

    This endpoint processes the most recent auto-refresh task record if its status is Processing.
    It handles the threshold calculation and alarm rule injection for each task detail.
    """
    background_tasks.add_task(scheduled_process_record_detail_tasks, max_iterations=max_iterations, gap_time=gap_time)
    return APIResponse(message="scheduled process task processed successfully")


@task_router.delete("/{task_id}", response_model=APIResponse[dict])
async def delete_task_endpoint(task_id: PydanticObjectId) -> APIResponse[dict]:
    """Delete an intelligent threshold task and all its associated versions."""
    success = await delete_task(task_id)
    if not success:
        raise InternalServerError(message="Failed to delete task")

    return APIResponse(message="Task and all its versions deleted successfully")


@task_router.post("/auto-refresh-switch", response_model=APIResponse[dict])
async def auto_refresh_switch(body: UpdateAutoRefreshSwitchPayload) -> APIResponse[dict]:
    """Update auto_update field for a list of intelligent threshold tasks."""
    # Update auto_update field for all specified tasks
    if not body.task_ids:
        raise BadRequestError(message="task_ids cannot be empty")
    result = await IntelligentThresholdTask.find({"_id": {"$in": body.task_ids}}).update(
        {"$set": {"auto_update": body.auto_update}}
    )

    if getattr(result, "matched_count", 0) == 0:
        raise RecordNotFoundError(message="No intelligent threshold tasks found")
    return APIResponse(
        message=(
            f"Update success, match: {getattr(result, 'matched_count', 0)},"
            f"modify: {getattr(result, 'modified_count', 0)}"
        ),
        data={
            "matched_count": getattr(result, "matched_count", 0),
            "modified_count": getattr(result, "modified_count", 0),
        },
    )
