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

import asyncio
from unittest.mock import MagicMock, patch

import pytest
from beanie import PydanticObjectId

from veaiops.algorithm.intelligent_threshold.configs import (
    HISTORICAL_DAYS,
    SECONDS_PER_DAY,
    TIMESERIES_DATA_INTERVAL,
)
from veaiops.algorithm.intelligent_threshold.threshold_recommender import ThresholdRecommender
from veaiops.schema.base.intelligent_threshold import MetricThresholdResult
from veaiops.schema.models.template.metric import MetricTemplateValue
from veaiops.schema.types import IntelligentThresholdTaskStatus, MetricType, TaskPriority


@pytest.fixture
def threshold_recommender():
    """Create a ThresholdRecommender instance for testing."""
    return ThresholdRecommender(max_concurrent_tasks=2)  # Use smaller limit for testing


@pytest.fixture
def mock_metric_template_value():
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


@pytest.fixture
def mock_task_data():
    """Create mock task data for testing."""
    return [
        {
            "name": "cpu_usage",
            "labels": {"host": "server1"},
            "unique_key": "cpu_usage_server1",
            "timestamps": [1640995200 + i * 60 for i in range(2880)],  # 2880 data points
            "values": [50.0 + i * 0.1 for i in range(2880)],  # Increasing values
        },
        {
            "name": "memory_usage",
            "labels": {"host": "server2"},
            "unique_key": "memory_usage_server2",
            "timestamps": [1640995200 + i * 60 for i in range(2880)],
            "values": [30.0 + i * 0.2 for i in range(2880)],
        },
    ]


@pytest.mark.asyncio
async def test_handle_task_success(threshold_recommender, mock_metric_template_value):
    """Test successful task handling with priority queue."""
    task_id = PydanticObjectId()
    task_version = 1
    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"
    task_priority = TaskPriority.HIGH

    # Test that handle_task adds task to queue
    await threshold_recommender.handle_task(
        task_id=task_id,
        task_version=task_version,
        datasource_id=datasource_id,
        metric_template_value=mock_metric_template_value,
        window_size=window_size,
        direction=direction,
        task_priority=task_priority,
    )

    # Check queue status
    status = await threshold_recommender.get_queue_status()

    # Task should either be in queue or running (depending on timing)
    total_tasks = status["queue_size"] + status["running_tasks"]
    assert total_tasks >= 1, "Task should be queued or running"

    # Wait a bit for task processing
    await asyncio.sleep(0.1)

    # Check that priority is handled correctly
    if status["priority_distribution"]:
        assert "HIGH" in status["priority_distribution"] or status["running_tasks"] > 0


@pytest.mark.asyncio
async def test_calculate_threshold_success(threshold_recommender, mock_metric_template_value, mock_task_data):
    """Test successful threshold calculation."""
    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"

    with (
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data") as mock_fetch_data,
        patch.object(threshold_recommender.threshold_algorithm, "recommend_threshold") as mock_threshold_rec,
        patch("time.time") as mock_time,
    ):
        # Mock time.time() to return a fixed timestamp
        mock_time.return_value = 1641081600  # Fixed timestamp

        # Mock fetch_data to return test data
        mock_fetch_data.return_value = mock_task_data

        # Mock recommend_threshold to return test thresholds
        mock_threshold_rec.return_value = [
            {
                "start_hour": 0,
                "end_hour": 24,
                "upper_bound": 75.0,
                "lower_bound": None,
                "window_size": 5,
            }
        ]

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=mock_metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        # Verify the result structure
        assert result["status"] == "Success"
        assert result["message"] == "Task Success!"
        assert len(result["result"]) == 2  # Two metrics in mock_task_data

        # Verify fetch_data was called with correct parameters
        expected_end_time = 1641081600
        expected_start_time = expected_end_time - SECONDS_PER_DAY * HISTORICAL_DAYS
        mock_fetch_data.assert_called_once_with(
            datasource_id, expected_start_time, expected_end_time, TIMESERIES_DATA_INTERVAL
        )

        # Verify recommend_threshold was called for each metric
        assert mock_threshold_rec.call_count == 2

        # Verify the result contains MetricThresholdResult objects
        for metric_result in result["result"]:
            assert isinstance(metric_result, MetricThresholdResult)
            assert metric_result.name in ["cpu_usage", "memory_usage"]
            assert metric_result.thresholds is not None


@pytest.mark.asyncio
async def test_calculate_threshold_with_invalid_min_max_values(threshold_recommender, mock_task_data):
    """Test threshold calculation with invalid min/max values."""
    # Create metric template with invalid min/max values

    metric_template_value = MetricTemplateValue(
        name="test_metric",
        metric_type=MetricType.Count,
        min_step=1.0,
        min_value=100.0,  # min > max (invalid)
        max_value=50.0,
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

    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"

    with (
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data") as mock_fetch_data,
        patch.object(threshold_recommender.threshold_algorithm, "recommend_threshold") as mock_threshold_rec,
        patch("time.time") as mock_time,
    ):
        mock_time.return_value = 1641081600
        mock_fetch_data.return_value = mock_task_data
        mock_threshold_rec.return_value = []

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        # Should still succeed but with swapped min/max values
        assert result["status"] == "Success"

        # Verify that recommend_threshold was called with swapped values
        calls = mock_threshold_rec.call_args_list
        for call in calls:
            args = call[0]
            # min_value should be 50.0 (swapped from max_value)
            # max_value should be 100.0 (swapped from min_value)
            assert args[5] == 50.0  # min_value
            assert args[6] == 100.0  # max_value


@pytest.mark.asyncio
async def test_calculate_threshold_with_extreme_values(threshold_recommender, mock_task_data):
    """Test threshold calculation with extreme values."""
    # Create metric template with extreme values

    metric_template_value = MetricTemplateValue(
        name="test_metric",
        metric_type=MetricType.Count,
        min_step=1.0,
        min_value=-1e60,  # Extreme negative value
        max_value=1e60,  # Extreme positive value
        min_violation=5.0,
        min_violation_ratio=0.1,
        normal_range_start=-1e60,
        normal_range_end=1e60,
        missing_value=None,
        failure_interval_expectation=300,
        display_unit="count",
        linear_scale=1.0,
        max_time_gap=600,
        min_ts_length=100,
    )

    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"

    with (
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data") as mock_fetch_data,
        patch.object(threshold_recommender.threshold_algorithm, "recommend_threshold") as mock_threshold_rec,
        patch("time.time") as mock_time,
    ):
        mock_time.return_value = 1641081600
        mock_fetch_data.return_value = mock_task_data
        mock_threshold_rec.return_value = []

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        assert result["status"] == "Success"

        # Verify that extreme values are set to None
        calls = mock_threshold_rec.call_args_list
        for call in calls:
            args = call[0]
            assert args[5] is None  # min_value should be None
            assert args[6] is None  # max_value should be None


@pytest.mark.asyncio
async def test_calculate_threshold_direction_down(threshold_recommender, mock_metric_template_value, mock_task_data):
    """Test threshold calculation with direction='down'."""
    datasource_id = "test_datasource"
    window_size = 5
    direction = "down"

    with (
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data") as mock_fetch_data,
        patch.object(threshold_recommender.threshold_algorithm, "recommend_threshold") as mock_threshold_rec,
        patch("time.time") as mock_time,
    ):
        mock_time.return_value = 1641081600
        mock_fetch_data.return_value = mock_task_data
        mock_threshold_rec.return_value = []

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=mock_metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        assert result["status"] == "Success"

        # Verify that normal_threshold is set to normal_range_start for direction='down'
        calls = mock_threshold_rec.call_args_list
        for call in calls:
            args = call[0]
            assert args[7] == 10.0  # normal_threshold should be normal_range_start
            assert args[9] == "down"  # direction should be 'down'


@pytest.mark.asyncio
async def test_calculate_threshold_exception_handling(threshold_recommender, mock_metric_template_value):
    """Test threshold calculation exception handling."""
    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"

    with patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data") as mock_fetch_data:
        # Mock fetch_data to raise an exception
        mock_fetch_data.side_effect = Exception("Data fetch failed")

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=mock_metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        # Verify error handling
        assert result["status"] == "Failed"
        assert result["result"] == []
        assert "Data fetch failed" in result["message"]


@pytest.mark.asyncio
async def test_send_task_response_callback_success(threshold_recommender):
    """Test successful task response callback."""
    task_id = PydanticObjectId()
    task_version = 1

    # Create a mock task that completed successfully
    mock_task = MagicMock()
    mock_task.cancelled.return_value = False
    mock_task.exception.return_value = None
    mock_task.result.return_value = {
        "status": "Success",
        "result": [{"name": "test_metric", "thresholds": []}],
        "message": "Task Success!",
    }

    with patch.object(ThresholdRecommender, "_update_task_result") as mock_safe_update:
        mock_safe_update.return_value = None

        threshold_recommender.send_task_response_callback(task=mock_task, task_id=task_id, task_version=task_version)

        # Wait a bit for the async task to complete
        await asyncio.sleep(0.01)

        # Verify _update_task_result was called with success status
        mock_safe_update.assert_called_once_with(
            task_id,
            IntelligentThresholdTaskStatus.SUCCESS,
            task_version,
            [{"name": "test_metric", "thresholds": []}],
            None,  # error_message parameter
        )


@pytest.mark.asyncio
async def test_send_task_response_callback_cancelled(threshold_recommender):
    """Test task response callback when task is cancelled."""
    task_id = PydanticObjectId()
    task_version = 1

    # Create a mock task that was cancelled
    mock_task = MagicMock()
    mock_task.cancelled.return_value = True
    mock_task.exception.return_value = None

    with patch.object(ThresholdRecommender, "_update_task_result") as mock_safe_update:
        mock_safe_update.return_value = None

        threshold_recommender.send_task_response_callback(task=mock_task, task_id=task_id, task_version=task_version)

        # Wait a bit for the async task to complete
        await asyncio.sleep(0.01)

        # Verify _update_task_result was called with failed status
        mock_safe_update.assert_called_once_with(
            task_id,
            IntelligentThresholdTaskStatus.FAILED,
            task_version,
            None,
            f"Task {task_id} was cancelled",
        )


@pytest.mark.asyncio
async def test_send_task_response_callback_exception(threshold_recommender):
    """Test task response callback when task has exception."""
    task_id = PydanticObjectId()
    task_version = 1

    # Create a mock task that had an exception
    mock_task = MagicMock()
    mock_task.cancelled.return_value = False
    mock_task.exception.return_value = Exception("Task failed")

    with patch.object(ThresholdRecommender, "_update_task_result") as mock_safe_update:
        mock_safe_update.return_value = None

        threshold_recommender.send_task_response_callback(task=mock_task, task_id=task_id, task_version=task_version)

        # Wait a bit for the async task to complete
        await asyncio.sleep(0.01)

        # Verify _update_task_result was called with failed status
        mock_safe_update.assert_called_once_with(
            task_id,
            IntelligentThresholdTaskStatus.FAILED,
            task_version,
            None,
            f"Task {task_id} failed with exception: Task failed",
        )


@pytest.mark.asyncio
async def test_calculate_threshold_with_invalid_normal_range(threshold_recommender, mock_task_data):
    """Test threshold calculation with invalid normal range values."""
    # Create metric template with invalid normal range (start > end)

    metric_template_value = MetricTemplateValue(
        name="test_metric",
        metric_type=MetricType.Count,
        min_step=1.0,
        min_value=0.0,
        max_value=100.0,
        min_violation=5.0,
        min_violation_ratio=0.1,
        normal_range_start=90.0,  # start > end (invalid)
        normal_range_end=10.0,
        missing_value=None,
        failure_interval_expectation=300,
        display_unit="count",
        linear_scale=1.0,
        max_time_gap=600,
        min_ts_length=100,
    )

    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"

    with (
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data") as mock_fetch_data,
        patch.object(threshold_recommender.threshold_algorithm, "recommend_threshold") as mock_threshold_rec,
        patch("time.time") as mock_time,
    ):
        mock_time.return_value = 1641081600
        mock_fetch_data.return_value = mock_task_data
        mock_threshold_rec.return_value = []

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        assert result["status"] == "Success"

        # Verify that normal range values are used directly (no swapping)
        calls = mock_threshold_rec.call_args_list
        for call in calls:
            args = call[0]
            # normal_threshold should be normal_range_end (10.0) for direction='up' without swapping
            assert args[7] == 10.0  # normal_threshold


@pytest.mark.asyncio
async def test_calculate_threshold_empty_data(threshold_recommender, mock_metric_template_value):
    """Test threshold calculation with empty data."""
    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"

    with (
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data") as mock_fetch_data,
        patch("time.time") as mock_time,
    ):
        mock_time.return_value = 1641081600
        # Return empty data
        mock_fetch_data.return_value = []

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=mock_metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        # Should return NoData status for empty data
        assert result["status"] == "NoData"
        assert result["result"] == []
        assert "No data available" in result["message"]
        assert result["message"] == "No data available for threshold calculation"


@pytest.mark.asyncio
async def test_calculate_threshold_direction_both(threshold_recommender, mock_metric_template_value, mock_task_data):
    """Test threshold calculation with direction='both'."""
    datasource_id = "test_datasource"
    window_size = 5
    direction = "both"

    with (
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data") as mock_fetch_data,
        patch.object(threshold_recommender.threshold_algorithm, "recommend_threshold") as mock_threshold_rec,
        patch("time.time") as mock_time,
    ):
        mock_time.return_value = 1641081600
        mock_fetch_data.return_value = mock_task_data

        # Mock different thresholds for up and down directions
        def mock_threshold_side_effect(*args, **kwargs):
            direction_arg = args[9] if len(args) > 9 else kwargs.get("direction", "up")
            if direction_arg == "up":
                return [
                    {
                        "start_hour": 0,
                        "end_hour": 24,
                        "upper_bound": 75.0,
                        "lower_bound": None,
                        "window_size": 5,
                    }
                ]
            elif direction_arg == "down":
                return [
                    {
                        "start_hour": 0,
                        "end_hour": 24,
                        "upper_bound": None,
                        "lower_bound": 25.0,
                        "window_size": 5,
                    }
                ]
            return []

        mock_threshold_rec.side_effect = mock_threshold_side_effect

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=mock_metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        assert result["status"] == "Success"
        assert len(result["result"]) == 2  # Two time series

        # Check that both upper and lower bounds are present
        for threshold_result in result["result"]:
            assert len(threshold_result.thresholds) == 1
            threshold_config = threshold_result.thresholds[0]
            assert threshold_config.upper_bound == 75.0
            assert threshold_config.lower_bound == 25.0
            assert threshold_config.window_size == 5


@pytest.mark.asyncio
async def test_handle_task_direction_both(threshold_recommender, mock_metric_template_value):
    """Test handle_task with 'both' direction using queue mechanism."""
    task_id = PydanticObjectId()
    task_version = 1
    datasource_id = "test_datasource"
    window_size = 5
    direction = "both"

    # Test that handle_task adds task to queue with 'both' direction
    await threshold_recommender.handle_task(
        task_id=task_id,
        task_version=task_version,
        datasource_id=datasource_id,
        metric_template_value=mock_metric_template_value,
        window_size=window_size,
        direction=direction,
        task_priority=TaskPriority.NORMAL,
    )

    # Check that task was queued
    status = await threshold_recommender.get_queue_status()
    total_tasks = status["queue_size"] + status["running_tasks"]
    assert total_tasks >= 1, "Task should be queued or running"

    # Wait a bit for task processing
    await asyncio.sleep(0.1)


@pytest.mark.asyncio
async def test_merge_threshold_results(threshold_recommender):
    """Test the _merge_threshold_results method."""
    from veaiops.schema.base.intelligent_threshold import IntelligentThresholdConfig, MetricThresholdResult

    # Create mock up results (upper bounds only)
    up_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=75.0,
                    lower_bound=None,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        ),
        MetricThresholdResult(
            name="metric2",
            labels={"instance": "server2"},
            unique_key="metric2_server2",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=12,
                    upper_bound=80.0,
                    lower_bound=None,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=12,
                    end_hour=24,
                    upper_bound=85.0,
                    lower_bound=None,
                    window_size=5,
                ),
            ],
            status="Success",
            error_message="",
        ),
    ]

    # Create mock down results (lower bounds only)
    down_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=None,
                    lower_bound=25.0,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        ),
        MetricThresholdResult(
            name="metric2",
            labels={"instance": "server2"},
            unique_key="metric2_server2",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=12,
                    upper_bound=None,
                    lower_bound=20.0,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=12,
                    end_hour=24,
                    upper_bound=None,
                    lower_bound=15.0,
                    window_size=5,
                ),
            ],
            status="Success",
            error_message="",
        ),
    ]

    # Test merging
    merged_results = threshold_recommender._merge_threshold_results(up_results, down_results)

    assert len(merged_results) == 2

    # Check first metric
    metric1_result = next(r for r in merged_results if r.unique_key == "metric1_server1")
    assert len(metric1_result.thresholds) == 1
    threshold = metric1_result.thresholds[0]
    assert threshold.upper_bound == 75.0
    assert threshold.lower_bound == 25.0

    # Check second metric
    metric2_result = next(r for r in merged_results if r.unique_key == "metric2_server2")
    assert len(metric2_result.thresholds) == 2

    # Check first time period (0-12)
    threshold_0_12 = next(t for t in metric2_result.thresholds if t.start_hour == 0 and t.end_hour == 12)
    assert threshold_0_12.upper_bound == 80.0
    assert threshold_0_12.lower_bound == 20.0

    # Check second time period (12-24)
    threshold_12_24 = next(t for t in metric2_result.thresholds if t.start_hour == 12 and t.end_hour == 24)
    assert threshold_12_24.upper_bound == 85.0
    assert threshold_12_24.lower_bound == 15.0


def test_merge_threshold_results_with_up_failure(threshold_recommender):
    """Test _merge_threshold_results when up direction fails."""
    from veaiops.schema.base.intelligent_threshold import IntelligentThresholdConfig, MetricThresholdResult

    # Create mock up results with failure
    up_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[],
            status="Failed",
            error_message="Up calculation failed",
        )
    ]

    # Create mock down results (successful)
    down_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=None,
                    lower_bound=25.0,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        )
    ]

    # Test merging
    merged_results = threshold_recommender._merge_threshold_results(up_results, down_results)

    assert len(merged_results) == 1

    # Check that the merged result is failed
    metric1_result = merged_results[0]
    assert metric1_result.status == "Failed"
    assert metric1_result.error_message == "Up calculation failed"
    assert len(metric1_result.thresholds) == 0  # Empty thresholds on failure


def test_merge_threshold_results_with_down_failure(threshold_recommender):
    """Test _merge_threshold_results when down direction fails."""
    from veaiops.schema.base.intelligent_threshold import IntelligentThresholdConfig, MetricThresholdResult

    # Create mock up results (successful)
    up_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=75.0,
                    lower_bound=None,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        )
    ]

    # Create mock down results with failure
    down_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[],
            status="Failed",
            error_message="Down calculation failed",
        )
    ]

    # Test merging
    merged_results = threshold_recommender._merge_threshold_results(up_results, down_results)

    assert len(merged_results) == 1

    # Check that the merged result is failed
    metric1_result = merged_results[0]
    assert metric1_result.status == "Failed"
    assert metric1_result.error_message == "Down calculation failed"
    assert len(metric1_result.thresholds) == 0  # Empty thresholds on failure


def test_merge_threshold_results_with_both_failure(threshold_recommender):
    """Test _merge_threshold_results when both directions fail."""
    from veaiops.schema.base.intelligent_threshold import MetricThresholdResult

    # Create mock up results with failure
    up_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[],
            status="Failed",
            error_message="Up calculation failed",
        )
    ]

    # Create mock down results with different failure
    down_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[],
            status="Failed",
            error_message="Down calculation failed",
        )
    ]

    # Test merging
    merged_results = threshold_recommender._merge_threshold_results(up_results, down_results)

    assert len(merged_results) == 1

    # Check that the merged result is failed (should use up error message when both fail)
    metric1_result = merged_results[0]
    assert metric1_result.status == "Failed"
    assert metric1_result.error_message == "Up calculation failed"  # Up error takes precedence
    assert len(metric1_result.thresholds) == 0  # Empty thresholds on failure


def test_merge_threshold_results_mixed_success_failure(threshold_recommender):
    """Test _merge_threshold_results with mixed success and failure scenarios."""
    from veaiops.schema.base.intelligent_threshold import IntelligentThresholdConfig, MetricThresholdResult

    # Create mock up results - one success, one failure
    up_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=75.0,
                    lower_bound=None,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        ),
        MetricThresholdResult(
            name="metric2",
            labels={"instance": "server2"},
            unique_key="metric2_server2",
            thresholds=[],
            status="Failed",
            error_message="Up failed for metric2",
        ),
    ]

    # Create mock down results - one success, one failure (opposite pattern)
    down_results = [
        MetricThresholdResult(
            name="metric1",
            labels={"instance": "server1"},
            unique_key="metric1_server1",
            thresholds=[],
            status="Failed",
            error_message="Down failed for metric1",
        ),
        MetricThresholdResult(
            name="metric2",
            labels={"instance": "server2"},
            unique_key="metric2_server2",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=None,
                    lower_bound=25.0,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        ),
    ]

    # Test merging
    merged_results = threshold_recommender._merge_threshold_results(up_results, down_results)

    assert len(merged_results) == 2

    # Check metric1 - should be failed because down failed
    metric1_result = next(r for r in merged_results if r.unique_key == "metric1_server1")
    assert metric1_result.status == "Failed"
    assert metric1_result.error_message == "Down failed for metric1"
    assert len(metric1_result.thresholds) == 0

    # Check metric2 - should be failed because up failed
    metric2_result = next(r for r in merged_results if r.unique_key == "metric2_server2")
    assert metric2_result.status == "Failed"
    assert metric2_result.error_message == "Up failed for metric2"
    assert len(metric2_result.thresholds) == 0


@pytest.mark.asyncio
async def test_calculate_threshold_with_none_window_size(
    threshold_recommender, mock_metric_template_value, mock_task_data
):
    """Test threshold calculation when window_size is None in threshold groups."""
    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"

    with (
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data") as mock_fetch_data,
        patch.object(threshold_recommender.threshold_algorithm, "recommend_threshold") as mock_threshold_rec,
        patch("time.time") as mock_time,
    ):
        mock_time.return_value = 1641081600
        mock_fetch_data.return_value = mock_task_data

        # Mock threshold groups with None window_size (simulating insufficient data for time period)
        mock_threshold_groups = [
            {
                "start_hour": 0,
                "end_hour": 12,
                "upper_bound": 75.0,
                "lower_bound": None,
                "window_size": None,  # This simulates insufficient data scenario
            },
            {
                "start_hour": 12,
                "end_hour": 24,
                "upper_bound": 80.0,
                "lower_bound": None,
                "window_size": 7,  # This has valid window_size
            },
        ]

        mock_threshold_rec.return_value = mock_threshold_groups

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=mock_metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        assert result["status"] == "Success"
        assert len(result["result"]) == 2  # Two time series

        # Check that window_size is properly handled
        for threshold_result in result["result"]:
            assert len(threshold_result.thresholds) == 2

            # First threshold should use fallback window_size (5)
            first_threshold = threshold_result.thresholds[0]
            assert first_threshold.start_hour == 0
            assert first_threshold.end_hour == 12
            assert first_threshold.upper_bound == 75.0
            assert first_threshold.window_size == 5  # Should use fallback window_size

            # Second threshold should use original window_size (7)
            second_threshold = threshold_result.thresholds[1]
            assert second_threshold.start_hour == 12
            assert second_threshold.end_hour == 24
            assert second_threshold.upper_bound == 80.0
            assert second_threshold.window_size == 7  # Should use original window_size


@pytest.mark.asyncio
async def test_send_task_response_callback_no_data(threshold_recommender):
    """Test send_task_response_callback with NoData status."""
    task_id = PydanticObjectId()
    task_version = 1

    # Create a mock task that returns NoData status
    mock_task = MagicMock()
    mock_task.cancelled.return_value = False
    mock_task.exception.return_value = None
    mock_task.result.return_value = {
        "status": "NoData",
        "result": [],
        "message": "No data available for threshold calculation",
    }

    with patch.object(ThresholdRecommender, "_update_task_result") as mock_safe_update:
        threshold_recommender.send_task_response_callback(mock_task, task_id, task_version)

        # Wait a bit for the async task to complete
        await asyncio.sleep(0.01)

        # Should update task status to FAILED
        mock_safe_update.assert_called_once()
        call_args = mock_safe_update.call_args[0]
        assert call_args[0] == task_id
        assert call_args[1] == IntelligentThresholdTaskStatus.FAILED
        assert call_args[2] == task_version
        assert call_args[3] == []  # Empty result list


@pytest.mark.asyncio
async def test_calculate_threshold_fetch_data_timeout(threshold_recommender, mock_metric_template_value):
    """Test threshold calculation when fetch_data times out."""

    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"

    async def slow_fetch_data(*args, **kwargs):
        # Simulate a slow response that exceeds timeout
        await asyncio.sleep(5)  # Longer than 3 second test timeout
        return []

    with (
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data", side_effect=slow_fetch_data),
        patch("veaiops.algorithm.intelligent_threshold.threshold_recommender.FETCH_DATA_TIMEOUT", 3),
        patch("time.time") as mock_time,
    ):
        mock_time.return_value = 1641081600

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=mock_metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        # Should return Failed status due to timeout
        assert result["status"] == "Failed"
        assert result["result"] == []
        assert "timeout" in result["message"].lower()
        assert "3 seconds" in result["message"]


@pytest.mark.asyncio
async def test_calculate_threshold_fetch_data_cancelled(threshold_recommender, mock_metric_template_value):
    """Test threshold calculation when fetch_data is cancelled."""

    datasource_id = "test_datasource"
    window_size = 5
    direction = "up"

    async def cancelled_fetch_data(*args, **kwargs):
        # Simulate a cancelled operation
        raise asyncio.CancelledError("Operation was cancelled")

    with (
        patch(
            "veaiops.algorithm.intelligent_threshold.threshold_recommender.fetch_data", side_effect=cancelled_fetch_data
        ),
        patch("time.time") as mock_time,
    ):
        mock_time.return_value = 1641081600

        result = await threshold_recommender.calculate_threshold(
            datasource_id=datasource_id,
            metric_template_value=mock_metric_template_value,
            window_size=window_size,
            direction=direction,
        )

        # Should return Failed status due to cancellation
        assert result["status"] == "Failed"
        assert result["result"] == []
        assert "cancelled" in result["message"].lower()


def test_merge_threshold_results_consolidation_mismatch_up_consolidated_down_not(threshold_recommender):
    """Test _merge_threshold_results when up is consolidated but down is not."""
    from veaiops.schema.base.intelligent_threshold import IntelligentThresholdConfig

    # Create up results with consolidated threshold (1 period)
    up_results = [
        MetricThresholdResult(
            name="test_metric",
            labels={"instance": "server1"},
            unique_key="test_metric_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=80.0,
                    lower_bound=None,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        )
    ]

    # Create down results without consolidation (4 periods)
    down_results = [
        MetricThresholdResult(
            name="test_metric",
            labels={"instance": "server1"},
            unique_key="test_metric_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=6,
                    upper_bound=None,
                    lower_bound=20.0,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=6,
                    end_hour=12,
                    upper_bound=None,
                    lower_bound=25.0,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=12,
                    end_hour=18,
                    upper_bound=None,
                    lower_bound=30.0,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=18,
                    end_hour=24,
                    upper_bound=None,
                    lower_bound=35.0,
                    window_size=5,
                ),
            ],
            status="Success",
            error_message="",
        )
    ]

    # Test merging
    merged_results = threshold_recommender._merge_threshold_results(up_results, down_results)

    assert len(merged_results) == 1
    result = merged_results[0]
    assert result.status == "Success"
    assert len(result.thresholds) == 4  # Should match the non-consolidated direction (down)

    # Check that up threshold (80.0) is distributed across all down periods
    for i, threshold in enumerate(result.thresholds):
        assert threshold.upper_bound == 80.0  # All should have the consolidated up threshold
        assert threshold.lower_bound == down_results[0].thresholds[i].lower_bound  # Keep original down bounds
        assert threshold.start_hour == down_results[0].thresholds[i].start_hour
        assert threshold.end_hour == down_results[0].thresholds[i].end_hour


def test_merge_threshold_results_consolidation_mismatch_down_consolidated_up_not(threshold_recommender):
    """Test _merge_threshold_results when down is consolidated but up is not."""
    from veaiops.schema.base.intelligent_threshold import IntelligentThresholdConfig

    # Create up results without consolidation (4 periods)
    up_results = [
        MetricThresholdResult(
            name="test_metric",
            labels={"instance": "server1"},
            unique_key="test_metric_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=6,
                    upper_bound=70.0,
                    lower_bound=None,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=6,
                    end_hour=12,
                    upper_bound=72.0,
                    lower_bound=None,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=12,
                    end_hour=18,
                    upper_bound=35.0,
                    lower_bound=None,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=18,
                    end_hour=24,
                    upper_bound=36.0,
                    lower_bound=None,
                    window_size=5,
                ),
            ],
            status="Success",
            error_message="",
        )
    ]

    # Create down results with consolidated threshold (1 period)
    down_results = [
        MetricThresholdResult(
            name="test_metric",
            labels={"instance": "server1"},
            unique_key="test_metric_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=None,
                    lower_bound=25.0,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        )
    ]

    # Test merging
    merged_results = threshold_recommender._merge_threshold_results(up_results, down_results)

    assert len(merged_results) == 1
    result = merged_results[0]
    assert result.status == "Success"
    assert len(result.thresholds) == 2  # Should match the non-consolidated direction (up)

    assert result.thresholds[0].upper_bound == up_results[0].thresholds[1].upper_bound  # Keep original up bounds
    assert result.thresholds[0].lower_bound == 25.0  # All should have the consolidated down threshold
    assert result.thresholds[0].start_hour == up_results[0].thresholds[0].start_hour
    assert result.thresholds[0].end_hour == up_results[0].thresholds[1].end_hour
    assert result.thresholds[1].upper_bound == up_results[0].thresholds[3].upper_bound  # Keep original up bounds
    assert result.thresholds[1].lower_bound == 25.0  # All should have the consolidated down threshold
    assert result.thresholds[1].start_hour == up_results[0].thresholds[2].start_hour
    assert result.thresholds[1].end_hour == up_results[0].thresholds[3].end_hour


def test_merge_threshold_results_both_consolidated(threshold_recommender):
    """Test _merge_threshold_results when both directions are consolidated."""
    from veaiops.schema.base.intelligent_threshold import IntelligentThresholdConfig

    # Create up results with consolidated threshold (1 period)
    up_results = [
        MetricThresholdResult(
            name="test_metric",
            labels={"instance": "server1"},
            unique_key="test_metric_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=80.0,
                    lower_bound=None,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        )
    ]

    # Create down results with consolidated threshold (1 period)
    down_results = [
        MetricThresholdResult(
            name="test_metric",
            labels={"instance": "server1"},
            unique_key="test_metric_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=24,
                    upper_bound=None,
                    lower_bound=25.0,
                    window_size=5,
                )
            ],
            status="Success",
            error_message="",
        )
    ]

    # Test merging
    merged_results = threshold_recommender._merge_threshold_results(up_results, down_results)

    assert len(merged_results) == 1
    result = merged_results[0]
    assert result.status == "Success"
    assert len(result.thresholds) == 1  # Both consolidated, so 1 period

    threshold = result.thresholds[0]
    assert threshold.start_hour == 0
    assert threshold.end_hour == 24
    assert threshold.upper_bound == 80.0
    assert threshold.lower_bound == 25.0


def test_merge_threshold_results_neither_consolidated(threshold_recommender):
    """Test _merge_threshold_results when neither direction is consolidated (normal case)."""
    from veaiops.schema.base.intelligent_threshold import IntelligentThresholdConfig

    # Create up results without consolidation (4 periods)
    up_results = [
        MetricThresholdResult(
            name="test_metric",
            labels={"instance": "server1"},
            unique_key="test_metric_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=6,
                    upper_bound=70.0,
                    lower_bound=None,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=6,
                    end_hour=12,
                    upper_bound=75.0,
                    lower_bound=None,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=12,
                    end_hour=18,
                    upper_bound=80.0,
                    lower_bound=None,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=18,
                    end_hour=24,
                    upper_bound=85.0,
                    lower_bound=None,
                    window_size=5,
                ),
            ],
            status="Success",
            error_message="",
        )
    ]

    # Create down results without consolidation (4 periods)
    down_results = [
        MetricThresholdResult(
            name="test_metric",
            labels={"instance": "server1"},
            unique_key="test_metric_server1",
            thresholds=[
                IntelligentThresholdConfig(
                    start_hour=0,
                    end_hour=6,
                    upper_bound=None,
                    lower_bound=20.0,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=6,
                    end_hour=12,
                    upper_bound=None,
                    lower_bound=25.0,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=12,
                    end_hour=18,
                    upper_bound=None,
                    lower_bound=30.0,
                    window_size=5,
                ),
                IntelligentThresholdConfig(
                    start_hour=18,
                    end_hour=24,
                    upper_bound=None,
                    lower_bound=35.0,
                    window_size=5,
                ),
            ],
            status="Success",
            error_message="",
        )
    ]

    # Test merging
    merged_results = threshold_recommender._merge_threshold_results(up_results, down_results)

    assert len(merged_results) == 1
    result = merged_results[0]
    assert result.status == "Success"
    assert len(result.thresholds) == 4  # Should have 4 periods (normal merge)

    # Check that all thresholds are properly merged
    for i, threshold in enumerate(result.thresholds):
        assert threshold.upper_bound == up_results[0].thresholds[i].upper_bound
        assert threshold.lower_bound == down_results[0].thresholds[i].lower_bound
        assert threshold.start_hour == up_results[0].thresholds[i].start_hour
        assert threshold.end_hour == up_results[0].thresholds[i].end_hour
