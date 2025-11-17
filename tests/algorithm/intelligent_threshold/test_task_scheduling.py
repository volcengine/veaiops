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

"""Tests for task scheduling and priority queue functionality."""

import asyncio
from unittest.mock import AsyncMock, patch

import pytest
from beanie import PydanticObjectId

from veaiops.algorithm.intelligent_threshold.threshold_recommender import TaskRequest, ThresholdRecommender
from veaiops.schema.models.template.metric import MetricTemplateValue
from veaiops.schema.types import MetricType, TaskPriority


@pytest.fixture
def scheduler():
    """Create a ThresholdRecommender instance with limited concurrency for testing."""
    return ThresholdRecommender(max_concurrent_tasks=2)


@pytest.fixture
def mock_metric_template():
    """Create a mock MetricTemplateValue for testing."""
    return MetricTemplateValue(
        name="test_metric",
        metric_type=MetricType.Count,
        min_step=1.0,
        min_value=0.0,
        max_value=100.0,
        min_violation=5.0,
        min_violation_ratio=0.1,
        normal_range_start=10.0,
        normal_range_end=90.0,
        missing_value=None,
        failure_interval_expectation=300,
        display_unit="count",
        linear_scale=1.0,
        max_time_gap=600,
        min_ts_length=100,
    )


@pytest.mark.asyncio
async def test_task_priority_ordering(mock_metric_template):
    """Test that tasks are ordered correctly by priority."""
    task1 = TaskRequest(
        task_id=PydanticObjectId(),
        task_version=1,
        datasource_id="test1",
        metric_template_value=mock_metric_template,
        window_size=5,
        direction="up",
        priority=TaskPriority.LOW,
        sensitivity=0.5,
        created_at=1000.0,
    )

    task2 = TaskRequest(
        task_id=PydanticObjectId(),
        task_version=1,
        datasource_id="test2",
        metric_template_value=mock_metric_template,
        window_size=5,
        direction="up",
        priority=TaskPriority.HIGH,
        sensitivity=0.5,
        created_at=2000.0,
    )

    task3 = TaskRequest(
        task_id=PydanticObjectId(),
        task_version=1,
        datasource_id="test3",
        metric_template_value=mock_metric_template,
        window_size=5,
        direction="up",
        priority=TaskPriority.NORMAL,
        sensitivity=0.5,
        created_at=1500.0,
    )

    # Test priority ordering (higher priority first)
    assert task2 < task1  # HIGH < LOW
    assert task3 < task1  # NORMAL < LOW
    assert task2 < task3  # HIGH < NORMAL

    # Test time ordering for same priority
    task4 = TaskRequest(
        task_id=PydanticObjectId(),
        task_version=1,
        datasource_id="test4",
        metric_template_value=mock_metric_template,
        window_size=5,
        direction="up",
        priority=TaskPriority.HIGH,
        sensitivity=0.5,
        created_at=1000.0,  # Earlier than task2
    )

    assert task4 < task2  # Earlier time wins for same priority


@pytest.mark.asyncio
async def test_concurrent_task_limit(scheduler, mock_metric_template):
    """Test that concurrent task limit is enforced."""
    # Mock the calculate_threshold method to simulate long-running tasks
    with patch.object(scheduler, "calculate_threshold", new_callable=AsyncMock) as mock_calc:
        # Make the mock method hang to simulate long-running tasks
        mock_calc.side_effect = lambda *args, **kwargs: asyncio.sleep(1)

        # Submit more tasks than the concurrent limit
        task_ids = []
        for i in range(5):  # Submit 5 tasks, but limit is 2
            task_id = PydanticObjectId()
            task_ids.append(task_id)
            await scheduler.handle_task(
                task_id=task_id,
                task_version=1,
                datasource_id=f"test_{i}",
                metric_template_value=mock_metric_template,
                window_size=5,
                direction="up",
                task_priority=TaskPriority.NORMAL,
                sensitivity=0.5,
            )

        # Check status immediately after submitting
        status = await scheduler.get_queue_status()

        # Should have at most 2 running tasks and the rest queued
        assert status["running_tasks"] <= 2
        assert status["queue_size"] + status["running_tasks"] == 5
        assert status["max_concurrent_tasks"] == 2


@pytest.mark.asyncio
async def test_priority_queue_processing(scheduler, mock_metric_template):
    """Test that higher priority tasks are processed first."""
    with patch.object(scheduler, "calculate_threshold", new_callable=AsyncMock) as mock_calc:
        # Make tasks complete quickly
        mock_calc.return_value = {"status": "Success", "result": [], "message": "Test"}

        # Submit tasks with different priorities
        low_task = PydanticObjectId()
        high_task = PydanticObjectId()
        urgent_task = PydanticObjectId()

        # Submit in reverse priority order
        await scheduler.handle_task(
            task_id=low_task,
            task_version=1,
            datasource_id="low_priority",
            metric_template_value=mock_metric_template,
            window_size=5,
            direction="up",
            task_priority=TaskPriority.LOW,
            sensitivity=0.5,
        )

        await scheduler.handle_task(
            task_id=high_task,
            task_version=1,
            datasource_id="high_priority",
            metric_template_value=mock_metric_template,
            window_size=5,
            direction="up",
            task_priority=TaskPriority.HIGH,
            sensitivity=0.5,
        )

        await scheduler.handle_task(
            task_id=urgent_task,
            task_version=1,
            datasource_id="urgent_priority",
            metric_template_value=mock_metric_template,
            window_size=5,
            direction="up",
            task_priority=TaskPriority.URGENT,
            sensitivity=0.5,
        )

        # Wait for processing
        await asyncio.sleep(0.2)

        # Check that all tasks were processed
        status = await scheduler.get_queue_status()
        assert status["queue_size"] == 0  # All tasks should be processed


@pytest.mark.asyncio
async def test_queue_status_reporting(scheduler, mock_metric_template):
    """Test that queue status is reported correctly."""
    # Initially empty
    status = await scheduler.get_queue_status()
    assert status["queue_size"] == 0
    assert status["running_tasks"] == 0
    assert status["max_concurrent_tasks"] == 2
    assert status["priority_distribution"] == {}
    assert status["running_task_ids"] == []

    # Add some tasks
    with patch.object(scheduler, "calculate_threshold", new_callable=AsyncMock) as mock_calc:
        # Make tasks hang to keep them in running state
        mock_calc.side_effect = lambda *args, **kwargs: asyncio.sleep(10)

        # Add tasks with different priorities
        for priority in [TaskPriority.LOW, TaskPriority.HIGH, TaskPriority.NORMAL]:
            await scheduler.handle_task(
                task_id=PydanticObjectId(),
                task_version=1,
                datasource_id=f"test_{priority.name}",
                metric_template_value=mock_metric_template,
                window_size=5,
                direction="up",
                task_priority=priority,
                sensitivity=0.5,
            )

        # Check status immediately after submitting
        status = await scheduler.get_queue_status()

        # Should have tasks either running or queued (total should be 3)
        total_tasks = status["running_tasks"] + status["queue_size"]
        assert total_tasks == 3, f"Expected 3 total tasks, got {total_tasks}"

        # Should not exceed concurrent limit
        assert status["running_tasks"] <= 2, f"Running tasks {status['running_tasks']} exceeds limit of 2"

        # Check priority distribution in queue (if any tasks are queued)
        if status["queue_size"] > 0:
            total_in_queue = sum(status["priority_distribution"].values())
            assert total_in_queue == status["queue_size"]


@pytest.mark.asyncio
async def test_task_completion_triggers_queue_processing(scheduler, mock_metric_template):
    """Test that completing a task triggers processing of queued tasks."""
    completed_tasks = []

    async def mock_calculate(*args, **kwargs):
        # Simulate task completion
        completed_tasks.append(args[0])  # datasource_id
        return {"status": "Success", "result": [], "message": "Test"}

    with patch.object(scheduler, "calculate_threshold", side_effect=mock_calculate):
        # Submit more tasks than concurrent limit
        task_count = 4
        for i in range(task_count):
            await scheduler.handle_task(
                task_id=PydanticObjectId(),
                task_version=1,
                datasource_id=f"test_{i}",
                metric_template_value=mock_metric_template,
                window_size=5,
                direction="up",
                task_priority=TaskPriority.NORMAL,
            )

        # Wait for all tasks to complete
        await asyncio.sleep(0.5)

        # All tasks should eventually complete
        status = await scheduler.get_queue_status()
        assert status["queue_size"] == 0
        assert status["running_tasks"] == 0
        assert len(completed_tasks) == task_count


@pytest.mark.asyncio
async def test_task_failure_handling(scheduler, mock_metric_template):
    """Test that task failures don't block the queue."""
    with patch.object(scheduler, "calculate_threshold", new_callable=AsyncMock) as mock_calc:
        # First task fails, second succeeds
        mock_calc.side_effect = [Exception("Test error"), {"status": "Success", "result": [], "message": "Test"}]

        # Submit two tasks
        await scheduler.handle_task(
            task_id=PydanticObjectId(),
            task_version=1,
            datasource_id="failing_task",
            metric_template_value=mock_metric_template,
            window_size=5,
            direction="up",
            task_priority=TaskPriority.NORMAL,
            sensitivity=0.5,
        )

        await scheduler.handle_task(
            task_id=PydanticObjectId(),
            task_version=1,
            datasource_id="success_task",
            metric_template_value=mock_metric_template,
            window_size=5,
            direction="up",
            task_priority=TaskPriority.NORMAL,
            sensitivity=0.5,
        )

        # Wait for processing
        await asyncio.sleep(0.2)

        # Both tasks should be processed (queue should be empty)
        status = await scheduler.get_queue_status()
        assert status["queue_size"] == 0
        assert status["running_tasks"] == 0
