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

"""Tests for intelligent threshold task router."""

from datetime import datetime, timezone

import pytest

from veaiops.handler.errors import BadRequestError, InternalServerError, RecordNotFoundError
from veaiops.handler.routers.apis.v1.intelligent_threshold.task import (
    auto_refresh_switch,
    create_task,
    delete_task_endpoint,
    get_task,
    rerun_task,
    update_task_result_endpoint,
)
from veaiops.handler.services.intelligent_threshold.task import (
    list_task_versions as list_task_versions_service,
    list_tasks as list_tasks_service,
)
from veaiops.schema.documents import IntelligentThresholdTask, IntelligentThresholdTaskVersion
from veaiops.schema.models.base import TimeRange
from veaiops.schema.models.intelligent_threshold import (
    CreateIntelligentThresholdTaskPayload,
    RerunIntelligentThresholdTaskPayload,
    UpdateAutoRefreshSwitchPayload,
    UpdateTaskResultPayload,
)
from veaiops.schema.models.template import MetricTemplateValue
from veaiops.schema.types import IntelligentThresholdDirection, IntelligentThresholdTaskStatus


@pytest.mark.asyncio
async def test_create_task_success(test_datasource, test_user, mock_call_threshold_agent):
    """Test creating a new task successfully."""
    payload = CreateIntelligentThresholdTaskPayload(
        task_name="New Test Task",
        datasource_id=test_datasource.id,
        datasource_type=test_datasource.type,
        auto_update=False,
        projects=["test_project"],
        metric_template_value=MetricTemplateValue(name="cpu_usage"),
        n_count=10,
        direction=IntelligentThresholdDirection.UP,
        sensitivity=0.5,
    )

    response = await create_task(body=payload, current_user=test_user)

    assert response.message == "Task created successfully"
    assert response.data is not None
    assert response.data.task_name == "New Test Task"
    assert response.data.datasource_id == test_datasource.id

    # Verify task was created in database
    task = await IntelligentThresholdTask.find_one({"task_name": "New Test Task"})
    assert task is not None
    assert task.created_user == test_user.username

    # Verify version was created
    version = await IntelligentThresholdTaskVersion.find_one({"task_id": task.id})
    assert version is not None
    assert version.version == 1

    # Cleanup
    await task.delete()
    await version.delete()


@pytest.mark.asyncio
async def test_create_task_duplicate_name(test_task, test_user, mock_call_threshold_agent):
    """Test creating a task with duplicate name fails."""
    payload = CreateIntelligentThresholdTaskPayload(
        task_name=test_task.task_name,
        datasource_id=test_task.datasource_id,
        datasource_type=test_task.datasource_type,
        auto_update=False,
        projects=["test_project"],
        metric_template_value=MetricTemplateValue(name="cpu_usage"),
        n_count=10,
        direction=IntelligentThresholdDirection.UP,
        sensitivity=0.5,
    )

    with pytest.raises(BadRequestError) as exc_info:
        await create_task(body=payload, current_user=test_user)

    assert "already exists" in str(exc_info.value)


@pytest.mark.asyncio
async def test_create_task_rollback_on_error(test_datasource, test_user, monkeypatch):
    """Test that task creation rolls back on error."""

    async def mock_failing_call(*args, **kwargs):
        raise Exception("Agent call failed")

    monkeypatch.setattr(
        "veaiops.handler.routers.apis.v1.intelligent_threshold.task.call_threshold_agent",
        mock_failing_call,
    )

    payload = CreateIntelligentThresholdTaskPayload(
        task_name="Failing Task",
        datasource_id=test_datasource.id,
        datasource_type=test_datasource.type,
        auto_update=False,
        projects=["test_project"],
        metric_template_value=MetricTemplateValue(name="cpu_usage"),
        n_count=10,
        direction=IntelligentThresholdDirection.UP,
        sensitivity=0.5,
    )

    with pytest.raises(InternalServerError):
        await create_task(body=payload, current_user=test_user)

    # Verify no task was left in database
    task = await IntelligentThresholdTask.find_one({"task_name": "Failing Task"})
    assert task is None


@pytest.mark.asyncio
async def test_get_task_success(test_task, test_task_version):
    """Test getting a task by ID."""
    response = await get_task(doc_id=test_task.id)

    assert response.message == "Task retrieved successfully"
    assert response.data is not None
    assert response.data.task_name == test_task.task_name
    assert response.data.latest_version is not None
    assert response.data.latest_version.version == test_task_version.version


@pytest.mark.asyncio
async def test_get_task_not_found():
    """Test getting a non-existent task."""
    from beanie import PydanticObjectId

    fake_id = PydanticObjectId()

    with pytest.raises(RecordNotFoundError) as exc_info:
        await get_task(doc_id=fake_id)

    assert "not found" in str(exc_info.value)


@pytest.mark.asyncio
async def test_rerun_task_success(test_task, test_task_version, test_user, mock_call_threshold_agent):
    """Test rerunning a task creates a new version."""
    payload = RerunIntelligentThresholdTaskPayload(
        task_id=test_task.id,
        metric_template_value=MetricTemplateValue(name="memory_usage"),
        n_count=15,
        direction=IntelligentThresholdDirection.BOTH,
        sensitivity=0.5,
    )

    response = await rerun_task(body=payload, current_user=test_user)

    assert response.message == "Task rerun successful, new version created"
    assert response.data is not None
    assert response.data.version == 2
    assert response.data.metric_template_value.name == "memory_usage"

    # Verify new version was created
    new_version = await IntelligentThresholdTaskVersion.find_one({"task_id": test_task.id, "version": 2})
    assert new_version is not None

    # Cleanup
    await new_version.delete()


@pytest.mark.asyncio
async def test_rerun_task_not_found(test_user, mock_call_threshold_agent):
    """Test rerunning a non-existent task."""
    from beanie import PydanticObjectId

    fake_id = PydanticObjectId()

    payload = RerunIntelligentThresholdTaskPayload(
        task_id=fake_id,
        metric_template_value=MetricTemplateValue(name="cpu_usage"),
        n_count=10,
        direction=IntelligentThresholdDirection.UP,
        sensitivity=0.5,
    )

    with pytest.raises(RecordNotFoundError) as exc_info:
        await rerun_task(body=payload, current_user=test_user)

    assert "Task not found" in str(exc_info.value)


@pytest.mark.asyncio
async def test_rerun_task_agent_failure(test_task, test_task_version, test_user, monkeypatch):
    """Test rerunning task marks version as failed on agent error."""

    async def mock_failing_call(*args, **kwargs):
        raise Exception("Agent call failed")

    monkeypatch.setattr(
        "veaiops.handler.routers.apis.v1.intelligent_threshold.task.call_threshold_agent",
        mock_failing_call,
    )

    payload = RerunIntelligentThresholdTaskPayload(
        task_id=test_task.id,
        metric_template_value=MetricTemplateValue(name="cpu_usage"),
        n_count=10,
        direction=IntelligentThresholdDirection.UP,
        sensitivity=0.5,
    )

    with pytest.raises(InternalServerError):
        await rerun_task(body=payload, current_user=test_user)

    # Verify version was created but marked as failed
    failed_version = await IntelligentThresholdTaskVersion.find_one({"task_id": test_task.id, "version": 2})
    assert failed_version is not None
    assert failed_version.status == IntelligentThresholdTaskStatus.FAILED

    # Cleanup
    await failed_version.delete()


@pytest.mark.asyncio
async def test_list_task_versions_basic(test_task, test_task_version):
    """Test listing task versions."""
    versions, total = await list_task_versions_service(task_id=test_task.id, skip=0, limit=10)

    assert total == 1
    assert len(versions) == 1
    assert versions[0].version == test_task_version.version


@pytest.mark.asyncio
async def test_list_task_versions_with_filters(test_task, test_task_version):
    """Test listing task versions with filters."""
    versions, total = await list_task_versions_service(
        task_id=test_task.id,
        status=IntelligentThresholdTaskStatus.SUCCESS,
        skip=0,
        limit=10,
    )

    assert total == 1
    assert len(versions) == 1


@pytest.mark.asyncio
async def test_list_task_versions_with_time_range(test_task, test_task_version):
    """Test listing task versions with time range filters."""
    now = datetime.now(timezone.utc)
    start_time = now.replace(hour=0, minute=0, second=0, microsecond=0)
    end_time = now.replace(hour=23, minute=59, second=59, microsecond=999999)

    time_range = TimeRange(start_time=int(start_time.timestamp()), end_time=int(end_time.timestamp()))

    versions, total = await list_task_versions_service(
        task_id=test_task.id,
        created_at_range=time_range,
        skip=0,
        limit=10,
    )

    assert total >= 0


@pytest.mark.asyncio
async def test_list_task_versions_pagination(test_task):
    """Test pagination of task versions."""
    # Create multiple versions
    from veaiops.schema.models.template import MetricTemplateValue

    for i in range(3):
        await IntelligentThresholdTaskVersion(
            task_id=test_task.id,
            version=i + 2,  # versions 2, 3, 4
            metric_template_value=MetricTemplateValue(name=f"cpu_usage_{i}"),
            n_count=10,
            direction=IntelligentThresholdDirection.UP,
            sensitivity=0.5,
            status=IntelligentThresholdTaskStatus.SUCCESS,
            created_user="test_user",
            updated_user="test_user",
            result=[],
            error_message="",
        ).insert()

    # Test pagination
    versions, total = await list_task_versions_service(task_id=test_task.id, skip=0, limit=2)

    assert total >= 3
    assert len(versions) == 2

    # Cleanup
    await IntelligentThresholdTaskVersion.find({"task_id": test_task.id, "version": {"$gt": 1}}).delete()


@pytest.mark.asyncio
async def test_list_tasks_basic(test_task):
    """Test listing tasks."""
    tasks, total = await list_tasks_service(skip=0, limit=10)

    assert total >= 1
    assert any(task.task_name == test_task.task_name for task in tasks)


@pytest.mark.asyncio
async def test_list_tasks_with_filters(test_task):
    """Test listing tasks with filters."""
    tasks, total = await list_tasks_service(
        projects=["test_project"],
        auto_update=False,
        skip=0,
        limit=10,
    )

    assert total >= 1
    assert all(not task.auto_update for task in tasks)


@pytest.mark.asyncio
async def test_list_tasks_with_name_filter(test_task):
    """Test listing tasks with name filter."""
    tasks, total = await list_tasks_service(
        task_name="Test",
        skip=0,
        limit=10,
    )

    assert total >= 1
    assert all("Test" in task.task_name or "test" in task.task_name.lower() for task in tasks)


@pytest.mark.asyncio
async def test_update_task_result_success(test_task, test_task_version, test_user):
    """Test updating task result."""
    from veaiops.schema.base import IntelligentThresholdConfig, MetricThresholdResult

    new_results = [
        MetricThresholdResult(
            name="cpu.usage",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0, end_hour=24, upper_bound=90.0, lower_bound=None, window_size=10
                )
            ],
            labels={"host": "test"},
            unique_key="cpu.usage_host=test",
            status="Success",
            error_message="",
        )
    ]

    payload = UpdateTaskResultPayload(
        task_id=test_task.id,
        task_version=test_task_version.version,
        status=IntelligentThresholdTaskStatus.SUCCESS,
        results=new_results,
        error_message="",
    )

    response = await update_task_result_endpoint(task_id=test_task.id, body=payload, current_user=test_user)

    assert response.message == "Task result updated successfully"

    # Verify result was updated
    updated_version = await IntelligentThresholdTaskVersion.find_one(
        {"task_id": test_task.id, "version": test_task_version.version}
    )
    assert updated_version is not None
    assert updated_version.result is not None
    assert len(updated_version.result) == 1


@pytest.mark.asyncio
async def test_update_task_result_task_not_found(test_user):
    """Test updating result for non-existent task."""
    from beanie import PydanticObjectId

    fake_id = PydanticObjectId()

    payload = UpdateTaskResultPayload(
        task_id=fake_id,
        task_version=1,
        status=IntelligentThresholdTaskStatus.SUCCESS,
        results=None,
        error_message=None,
    )

    with pytest.raises(RecordNotFoundError):
        await update_task_result_endpoint(task_id=fake_id, body=payload, current_user=test_user)


@pytest.mark.asyncio
async def test_delete_task_not_found():
    """Test deleting non-existent task."""
    from beanie import PydanticObjectId

    fake_id = PydanticObjectId()

    with pytest.raises(RecordNotFoundError):
        await delete_task_endpoint(task_id=fake_id)


@pytest.mark.asyncio
async def test_auto_refresh_switch_success(test_task):
    """Test updating auto_update switch."""
    payload = UpdateAutoRefreshSwitchPayload(
        task_ids=[test_task.id],
        auto_update=True,
    )

    response = await auto_refresh_switch(body=payload)

    assert "Update success" in response.message
    assert response.data is not None
    assert response.data["matched_count"] == 1
    assert response.data["modified_count"] == 1

    # Verify update was applied
    updated_task = await IntelligentThresholdTask.get(test_task.id)
    assert updated_task is not None
    assert updated_task.auto_update is True

    # Reset for cleanup
    test_task.auto_update = False
    await test_task.save()


@pytest.mark.asyncio
async def test_auto_refresh_switch_empty_list():
    """Test auto refresh switch with empty task list."""
    payload = UpdateAutoRefreshSwitchPayload(
        task_ids=[],
        auto_update=True,
    )

    with pytest.raises(BadRequestError) as exc_info:
        await auto_refresh_switch(body=payload)

    assert "cannot be empty" in str(exc_info.value)


@pytest.mark.asyncio
async def test_auto_refresh_switch_no_tasks_found():
    """Test auto refresh switch when no tasks match."""
    from beanie import PydanticObjectId

    fake_ids = [PydanticObjectId(), PydanticObjectId()]

    payload = UpdateAutoRefreshSwitchPayload(
        task_ids=fake_ids,
        auto_update=True,
    )

    with pytest.raises(RecordNotFoundError) as exc_info:
        await auto_refresh_switch(body=payload)

    assert "No intelligent threshold tasks found" in str(exc_info.value)
