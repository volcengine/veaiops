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

"""Threshold recommender module for intelligent threshold calculation.

This module provides functionality to handle asynchronous threshold calculation tasks,
including data fetching, threshold computation, result processing, task scheduling,
and concurrency control with priority queue management.
"""

import asyncio
import heapq
import time
import traceback
from dataclasses import dataclass, field
from functools import partial
from typing import Any, Dict, List, Literal, Optional, Tuple

from beanie import PydanticObjectId
from tenacity import retry, stop_after_attempt, wait_exponential

from veaiops.algorithm.intelligent_threshold.configs import (
    EXTREME_VALUE_THRESHOLD,
    FETCH_DATA_TIMEOUT,
    HISTORICAL_DAYS,
    SECONDS_PER_DAY,
    TIMESERIES_DATA_INTERVAL,
)
from veaiops.algorithm.intelligent_threshold.threshold_recommendation_algorithm import ThresholdRecommendAlgorithm
from veaiops.handler.services.datasource.fetch_data import fetch_data
from veaiops.handler.services.intelligent_threshold.task import update_task_result
from veaiops.schema.base import IntelligentThresholdConfig, MetricThresholdResult
from veaiops.schema.models.template import MetricTemplateValue
from veaiops.schema.types import IntelligentThresholdTaskStatus, TaskPriority
from veaiops.utils.log import logger


@dataclass
class TaskRequest:
    """Represents a threshold calculation task request."""

    task_id: PydanticObjectId
    task_version: int
    datasource_id: str
    metric_template_value: MetricTemplateValue
    window_size: int
    direction: Literal["up", "down", "both"]
    priority: TaskPriority
    sensitivity: float = 0.5
    created_at: float = field(default_factory=time.time)

    def __lt__(self, other: "TaskRequest") -> bool:
        """Compare tasks for priority queue ordering.

        Higher priority values and earlier creation times have higher precedence.
        """
        if self.priority.value != other.priority.value:
            return self.priority.value > other.priority.value  # Higher priority first
        return self.created_at < other.created_at  # Earlier tasks first for same priority


class ThresholdRecommender:
    """Intelligent threshold recommendation system with task scheduling and concurrency control.

    This class provides comprehensive threshold recommendation capabilities including:
    - Asynchronous threshold calculation task handling
    - Task scheduling with priority queue management
    - Concurrency control (max 5 concurrent tasks)
    - Data fetching and processing
    - Result computation and callback management
    - Error handling and status tracking

    Attributes:
        threshold_algorithm (ThresholdRecommendAlgorithm): Threshold recommendation algorithm instance.
        max_concurrent_tasks (int): Maximum number of concurrent tasks (default: 5).
        task_queue (List[TaskRequest]): Priority queue for pending tasks.
        running_tasks (Dict[str, asyncio.Task]): Currently running tasks.
        queue_lock (asyncio.Lock): Lock for thread-safe queue operations.
    """

    def __init__(
        self, threshold_algorithm: Optional[ThresholdRecommendAlgorithm] = None, max_concurrent_tasks: int = 5
    ) -> None:
        """Initialize the ThresholdRecommender.

        Args:
            threshold_algorithm (Optional[ThresholdRecommendAlgorithm]): Threshold recommender algorithm instance.
            max_concurrent_tasks (int): Maximum number of concurrent tasks (default: 5).
        """
        self.threshold_algorithm = threshold_algorithm or ThresholdRecommendAlgorithm()
        self.max_concurrent_tasks = max_concurrent_tasks
        self.task_queue: List[TaskRequest] = []
        self.running_tasks: Dict[str, asyncio.Task] = {}
        self.queue_lock = asyncio.Lock()

        logger.debug(f"Initialized ThresholdRecommender with max_concurrent_tasks={max_concurrent_tasks}")

    async def _process_queue(self) -> None:
        """Process the task queue and start new tasks if capacity allows."""
        async with self.queue_lock:
            while len(self.running_tasks) < self.max_concurrent_tasks and self.task_queue:
                # Get the highest priority task
                task_request = heapq.heappop(self.task_queue)
                task_key = str(task_request.task_id)

                logger.info(f"Starting task {task_key} with priority {task_request.priority.name}")

                # Create and start the task
                calculate_task = asyncio.create_task(self._execute_task(task_request))

                # Add callback for cleanup
                callback_with_args = partial(self._task_completion_callback, task_request=task_request)
                calculate_task.add_done_callback(callback_with_args)

                # Track the running task
                self.running_tasks[task_key] = calculate_task

    def _task_completion_callback(self, task: asyncio.Task, task_request: TaskRequest) -> None:
        """Handle task completion and cleanup.

        Args:
            task (asyncio.Task): The completed task.
            task_request (TaskRequest): The original task request.
        """
        task_key = str(task_request.task_id)

        # Remove from running tasks
        if task_key in self.running_tasks:
            del self.running_tasks[task_key]

        # Process the task result
        self.send_task_response_callback(task, task_request.task_id, task_request.task_version)

        # Try to process more tasks from the queue
        asyncio.create_task(self._process_queue())

    async def _execute_task(self, task_request: TaskRequest) -> Dict[str, Any]:
        """Execute a threshold calculation task.

        Args:
            task_request (TaskRequest): The task request to execute.

        Returns:
            Dict[str, Any]: Task result.
        """
        return await self.calculate_threshold(
            task_request.datasource_id,
            task_request.metric_template_value,
            task_request.window_size,
            task_request.direction,
            task_request.sensitivity,
        )

    async def handle_task(
        self,
        task_id: PydanticObjectId,
        task_version: int,
        datasource_id: str,
        metric_template_value: MetricTemplateValue,
        window_size: int,
        direction: Literal["up", "down", "both"],
        task_priority: TaskPriority = TaskPriority.NORMAL,
        sensitivity: float = 0.5,
    ) -> None:
        """Handle intelligent threshold calculation task asynchronously with priority scheduling.

        Adds the task to a priority queue for execution. Tasks are executed based on priority
        and creation time, with a maximum of 5 concurrent tasks.

        Args:
            task_id (PydanticObjectId): Unique identifier for the task.
            task_version (int): Version number of the task.
            datasource_id (str): Identifier for the data source.
            metric_template_value (MetricTemplateValue): Configuration for metric processing.
            window_size (int): Size of the sliding window for threshold calculation.
            direction (Literal["up", "down", "both"]): Direction for threshold detection.
                "up" for upper bound only, "down" for lower bound only, "both" for both bounds.
            task_priority (TaskPriority): Priority level for the task (default: NORMAL).
            sensitivity (float): Sensitivity parameter for threshold calculation (default: 0.5).
        """
        logger.info(
            f"Queuing threshold calculation task: task_id={task_id}, "
            f"datasource_id={datasource_id}, direction={direction}, window_size={window_size}, "
            f"priority={task_priority.name}"
        )

        try:
            # Create task request
            task_request = TaskRequest(
                task_id=task_id,
                task_version=task_version,
                datasource_id=datasource_id,
                metric_template_value=metric_template_value,
                window_size=window_size,
                direction=direction,
                priority=task_priority,
                sensitivity=sensitivity,
            )

            # Add to priority queue
            async with self.queue_lock:
                heapq.heappush(self.task_queue, task_request)
                queue_size = len(self.task_queue)
                running_count = len(self.running_tasks)

            logger.info(
                f"Task {task_id} added to queue (priority: {task_priority.name}). "
                f"Queue size: {queue_size}, Running: {running_count}/{self.max_concurrent_tasks}"
            )

            # Try to process the queue
            await self._process_queue()

        except Exception as e:
            error_trace = traceback.format_exc()
            logger.error(f"Failed to queue threshold calculation task {task_id}: {e}\n{error_trace}")
            # Update task status to failed if task queuing fails
            await update_task_result(
                task_id,
                IntelligentThresholdTaskStatus.FAILED,
                task_version,
                None,
                f"Failed to queue threshold calculation task {task_id}: {e}\n{error_trace}",
            )

    async def get_queue_status(self) -> Dict[str, Any]:
        """Get current queue and task status.

        Returns:
            Dict[str, Any]: Status information including queue size and running tasks.
        """
        async with self.queue_lock:
            queue_size = len(self.task_queue)
            running_count = len(self.running_tasks)

            # Get priority distribution in queue
            priority_counts = {}
            for task_req in self.task_queue:
                priority_name = task_req.priority.name
                priority_counts[priority_name] = priority_counts.get(priority_name, 0) + 1

        return {
            "queue_size": queue_size,
            "running_tasks": running_count,
            "max_concurrent_tasks": self.max_concurrent_tasks,
            "priority_distribution": priority_counts,
            "running_task_ids": list(self.running_tasks.keys()),
        }

    def _validate_input_data(self, timestamp_list: list[float], value_list: list[float]) -> dict[str, Any]:
        """Validate input data for threshold calculation.

        Args:
            timestamp_list (list[float]): List of timestamps.
            value_list (list[float]): List of values.

        Returns:
            bool: True if data is valid, False otherwise.
        """
        if not timestamp_list or not value_list:
            logger.warning("Empty timestamp or value list")
            return {"status": False, "msg": "Empty timestamp or value list"}

        if len(timestamp_list) != len(value_list):
            logger.error("Timestamp and value lists have different lengths")
            return {"status": False, "msg": "Timestamp and value lists have different lengths"}

        if len(timestamp_list) < SECONDS_PER_DAY / TIMESERIES_DATA_INTERVAL:
            logger.error("Insufficient data points (need at least 1 day data)")
            return {"status": False, "msg": "Insufficient data points (need at least 1 day data)"}

        return {"status": True, "msg": "Input data is valid"}

    def _validate_and_normalize_values(
        self, min_value: Optional[float], max_value: Optional[float]
    ) -> tuple[Optional[float], Optional[float]]:
        """Validate and normalize min/max values.

        Args:
            min_value (float): Minimum value from template.
            max_value (float): Maximum value from template.

        Returns:
            tuple[Optional[float], Optional[float]]: Normalized min and max values.
        """
        # Swap if min > max
        if min_value is not None and max_value is not None and min_value > max_value:
            min_value, max_value = max_value, min_value

        # Handle extreme values
        normalized_min = None if min_value is not None and min_value < -EXTREME_VALUE_THRESHOLD else min_value
        normalized_max = None if max_value is not None and max_value > EXTREME_VALUE_THRESHOLD else max_value

        return normalized_min, normalized_max

    def _get_normal_threshold(
        self, metric_template_value: MetricTemplateValue, direction: Literal["up", "down"]
    ) -> Optional[float]:
        """Get normal threshold based on direction and template values.

        Args:
            metric_template_value (MetricTemplateValue): Template configuration.
            direction (Literal["up", "down"]): Threshold direction.

        Returns:
            Optional[float]: Normal threshold value.
        """
        normal_range_start = metric_template_value.normal_range_start
        normal_range_end = metric_template_value.normal_range_end

        # Handle extreme values
        if normal_range_start is None or normal_range_start < -EXTREME_VALUE_THRESHOLD:
            normal_range_start = None
        if normal_range_end is None or normal_range_end > EXTREME_VALUE_THRESHOLD:
            normal_range_end = None

        return normal_range_end if direction == "up" else normal_range_start

    def _merge_threshold_results(
        self, up_results: list[MetricThresholdResult], down_results: list[MetricThresholdResult]
    ) -> list[MetricThresholdResult]:
        """Merge upper and lower bound threshold results.

        Args:
            up_results (list[MetricThresholdResult]): Results from "up" direction calculation.
            down_results (list[MetricThresholdResult]): Results from "down" direction calculation.

        Returns:
            list[MetricThresholdResult]: Merged results with both upper and lower bounds.
            If either direction failed for a metric, the merged result will be failed.

        Note:
            If one direction is consolidated (fewer time periods) and the other is not,
            we distribute the consolidated threshold evenly across the non-consolidated periods.
        """
        merged_results = []

        # Create a mapping of down results by unique_key for efficient lookup
        down_results_map = {result.unique_key: result for result in down_results}

        for up_result in up_results:
            down_result = down_results_map.get(up_result.unique_key)

            if down_result:
                # Check if either direction failed
                if up_result.status != "Success" or down_result.status != "Success":
                    # If either direction failed, the merged result is failed
                    error_message = ""
                    if up_result.status != "Success":
                        error_message = up_result.error_message
                    elif down_result.status != "Success":
                        error_message = down_result.error_message

                    merged_result = MetricThresholdResult(
                        name=up_result.name,
                        labels=up_result.labels,
                        unique_key=up_result.unique_key,
                        thresholds=[],  # Empty thresholds on failure
                        status="Failed",
                        error_message=error_message,
                    )
                    merged_results.append(merged_result)
                else:
                    # Both directions succeeded, handle consolidation mismatch
                    up_thresholds = up_result.thresholds
                    down_thresholds = down_result.thresholds

                    # Check if there's a consolidation mismatch
                    up_consolidated = (
                        len(up_thresholds) == 1 and up_thresholds[0].start_hour == 0 and up_thresholds[0].end_hour == 24
                    )
                    down_consolidated = (
                        len(down_thresholds) == 1
                        and down_thresholds[0].start_hour == 0
                        and down_thresholds[0].end_hour == 24
                    )

                    if up_consolidated and not down_consolidated:
                        # Up is consolidated, down is not - distribute up threshold across down periods
                        merged_thresholds = []
                        for down_threshold in down_thresholds:
                            merged_threshold = IntelligentThresholdConfig(
                                start_hour=down_threshold.start_hour,
                                end_hour=down_threshold.end_hour,
                                upper_bound=up_thresholds[0].upper_bound,
                                lower_bound=down_threshold.lower_bound,
                                window_size=down_threshold.window_size,
                            )
                            merged_thresholds.append(merged_threshold)
                    elif not up_consolidated and down_consolidated:
                        # Down is consolidated, up is not - distribute down threshold across up periods
                        merged_thresholds = []
                        for up_threshold in up_thresholds:
                            merged_threshold = IntelligentThresholdConfig(
                                start_hour=up_threshold.start_hour,
                                end_hour=up_threshold.end_hour,
                                upper_bound=up_threshold.upper_bound,
                                lower_bound=down_thresholds[0].lower_bound,
                                window_size=up_threshold.window_size,
                            )
                            merged_thresholds.append(merged_threshold)
                    elif up_consolidated and down_consolidated:
                        # Both are consolidated - use the consolidated periods
                        merged_thresholds = []
                        for up_threshold in up_thresholds:
                            # Find corresponding down threshold (should be same time range)
                            corresponding_down = next(
                                (
                                    dt
                                    for dt in down_thresholds
                                    if dt.start_hour == up_threshold.start_hour and dt.end_hour == up_threshold.end_hour
                                ),
                                None,
                            )
                            if corresponding_down:
                                merged_threshold = IntelligentThresholdConfig(
                                    start_hour=up_threshold.start_hour,
                                    end_hour=up_threshold.end_hour,
                                    upper_bound=up_threshold.upper_bound,
                                    lower_bound=corresponding_down.lower_bound,
                                    window_size=up_threshold.window_size,
                                )
                                merged_thresholds.append(merged_threshold)
                            else:
                                # No corresponding down threshold, use up threshold as is
                                merged_thresholds.append(up_threshold)
                    else:
                        # Neither is consolidated - normal merge logic
                        merged_thresholds = []

                        # Create a mapping of down thresholds by time range for efficient lookup
                        down_thresholds_map = {
                            (threshold.start_hour, threshold.end_hour): threshold for threshold in down_thresholds
                        }

                        for up_threshold in up_thresholds:
                            time_key = (up_threshold.start_hour, up_threshold.end_hour)
                            down_threshold = down_thresholds_map.get(time_key)

                            if down_threshold:
                                # Merge upper and lower bounds
                                merged_threshold = IntelligentThresholdConfig(
                                    start_hour=up_threshold.start_hour,
                                    end_hour=up_threshold.end_hour,
                                    upper_bound=up_threshold.upper_bound,
                                    lower_bound=down_threshold.lower_bound,
                                    window_size=up_threshold.window_size,
                                )
                            else:
                                # Only upper bound available
                                merged_threshold = up_threshold

                            merged_thresholds.append(merged_threshold)

                        # Add any down thresholds that don't have corresponding up thresholds
                        for down_threshold in down_thresholds:
                            time_key = (down_threshold.start_hour, down_threshold.end_hour)
                            if not any((t.start_hour, t.end_hour) == time_key for t in up_thresholds):
                                merged_thresholds.append(down_threshold)

                    merged_result = MetricThresholdResult(
                        name=up_result.name,
                        labels=up_result.labels,
                        unique_key=up_result.unique_key,
                        thresholds=merged_thresholds,
                        status="Success",
                        error_message="",
                    )
                    merged_results.append(merged_result)
            else:
                # Only upper bound results available
                if up_result.status != "Success":
                    # If up result failed, keep it as failed
                    merged_results.append(up_result)
                else:
                    # Only upper bound available and it succeeded
                    merged_results.append(up_result)

        # Add any down results that don't have corresponding up results
        up_unique_keys = {result.unique_key for result in up_results}
        for down_result in down_results:
            if down_result.unique_key not in up_unique_keys:
                if down_result.status != "Success":
                    # If down result failed, keep it as failed
                    merged_results.append(down_result)
                else:
                    # Only down bound available and it succeeded
                    merged_results.append(down_result)

        return merged_results

    async def _fetch_and_validate_data(
        self, datasource_id: str
    ) -> Tuple[Optional[List[Dict[str, Any]]], Dict[str, Any]]:
        """Fetch and validate data from datasource.

        Args:
            datasource_id (str): Identifier for the data source.

        Returns:
            Tuple containing (task_data, error_response)
            where error_response is empty dict if successful
        """
        # Calculate time range for historical data
        end_time = int(time.time())
        start_time = end_time - SECONDS_PER_DAY * HISTORICAL_DAYS

        logger.debug(f"Fetching data from {start_time} to {end_time} for datasource: {datasource_id}")
        try:
            task_data = await asyncio.wait_for(
                fetch_data(datasource_id, start_time, end_time, TIMESERIES_DATA_INTERVAL),
                timeout=FETCH_DATA_TIMEOUT,
            )
        except asyncio.TimeoutError:
            logger.error(f"Data fetch timeout for datasource: {datasource_id}")
            return None, {
                "status": "Failed",
                "result": [],
                "message": f"Data fetch timeout after {FETCH_DATA_TIMEOUT} seconds",
            }
        except asyncio.CancelledError:
            logger.warning(f"Data fetch cancelled for datasource: {datasource_id}")
            return None, {"status": "Failed", "result": [], "message": "Data fetch was cancelled"}

        if not task_data:
            logger.warning(f"No data retrieved for datasource: {datasource_id}")
            return None, {"status": "NoData", "result": [], "message": "No data available for threshold calculation"}

        return task_data, {"status": "Success"}

    async def _process_time_series_data(
        self,
        task_data: List[Dict[str, Any]],
        metric_template_value: MetricTemplateValue,
        window_size: int,
        direction: Literal["up", "down"],
        min_value: Optional[float],
        max_value: Optional[float],
        normal_threshold: Optional[float],
        sensitivity: float,
    ) -> Tuple[List[MetricThresholdResult], int, int, int]:
        """Process time series data and calculate thresholds.

        Args:
            task_data: List of time series data items
            metric_template_value: Configuration for metric processing
            window_size: Size of the sliding window
            direction: Direction for threshold detection ("up" or "down")
            min_value: Minimum value for normalization
            max_value: Maximum value for normalization
            normal_threshold: Normal threshold value
            sensitivity (float): Sensitivity of the threshold recommendation algorithm

        Returns:
            Tuple containing (threshold_results, success_count, data_validation_errors, internal_errors)
        """
        threshold_response_full = []
        success_instance_count = 0
        data_validation_error_count = 0
        internal_server_error_count = 0

        for i, data_item in enumerate(task_data):
            try:
                timestamp_list = [float(ts) for ts in data_item["timestamps"]]
                value_list = data_item["values"]

                # Validate input data before processing
                valid_result = self._validate_input_data(timestamp_list, value_list)
                if not valid_result["status"]:
                    logger.warning(f"Skipping time series {i + 1} due to invalid data")
                    data_validation_error_count += 1
                    threshold_result = MetricThresholdResult(
                        name=data_item["name"],
                        labels=data_item["labels"],
                        unique_key=data_item["unique_key"],
                        thresholds=[],
                        status="Failed",
                        error_message=valid_result["msg"],
                    )
                    threshold_response_full.append(threshold_result)
                    continue

                threshold_groups = self.threshold_algorithm.recommend_threshold(
                    timestamp_list,
                    value_list,
                    window_size,
                    True,  # time_split
                    True,  # auto_window_adjust
                    min_value,
                    max_value,
                    normal_threshold,
                    int(metric_template_value.min_ts_length),
                    sensitivity,
                    direction,
                )

                # Convert Dict objects to IntelligentThresholdConfig objects
                threshold_configs = []
                for group in threshold_groups:
                    # Handle case where window_size might be None (when data is insufficient for time period)
                    ws = group.get("window_size") or window_size
                    if ws is None:
                        # Use default window size as fallback
                        ws = window_size

                    threshold_configs.append(
                        IntelligentThresholdConfig(
                            start_hour=group["start_hour"],
                            end_hour=group["end_hour"],
                            upper_bound=group["upper_bound"],
                            lower_bound=group["lower_bound"],
                            window_size=ws,
                        )
                    )

                threshold_result = MetricThresholdResult(
                    name=data_item["name"],
                    labels=data_item["labels"],
                    unique_key=data_item["unique_key"],
                    thresholds=threshold_configs,
                    status="Success",
                    error_message="",
                )
                threshold_response_full.append(threshold_result)
                success_instance_count += 1

                if (i + 1) % 10 == 0:  # Log progress every 10 items
                    logger.debug(f"Processed {i + 1}/{len(task_data)} time series")

            except Exception as e:
                error_trace = traceback.format_exc()
                logger.warning(
                    f"Failed to process time series {i} ({data_item.get('name', 'unknown')}): {e}\n{error_trace}"
                )

                internal_server_error_count += 1
                threshold_result = MetricThresholdResult(
                    name=data_item["name"],
                    labels=data_item["labels"],
                    unique_key=data_item["unique_key"],
                    thresholds=[],
                    status="Failed",
                    error_message=f"Internal Server Error: {e}",
                )
                threshold_response_full.append(threshold_result)
                # Continue processing other time series
                continue

        return threshold_response_full, success_instance_count, data_validation_error_count, internal_server_error_count

    async def calculate_threshold(
        self,
        datasource_id: str,
        metric_template_value: MetricTemplateValue,
        window_size: int,
        direction: Literal["up", "down", "both"],
        sensitivity: float,
    ) -> Dict[str, Any]:
        """Calculate intelligent thresholds for time series data.

        Fetches historical data and computes threshold recommendations using the
        intelligent threshold algorithm.

        Args:
            datasource_id (str): Identifier for the data source.
            metric_template_value (MetricTemplateValue): Configuration for metric processing.
            window_size (int): Size of the sliding window for threshold calculation.
            direction (Literal["up", "down", "both"]): Direction for threshold detection.
                "up" for upper bound only, "down" for lower bound only, "both" for both bounds.
            sensitivity (float): Sensitivity of the threshold recommendation algorithm.

        Returns:
            Dict[str, Any]: Task response containing status, results, and message.
        """
        logger.info(f"Starting threshold calculation for datasource: {datasource_id}, direction: {direction}")

        try:
            # Handle "both" direction by calculating both "up" and "down" separately but with single data fetch
            if direction == "both":
                logger.debug("Calculating both upper and lower bounds with single data fetch")

                # Fetch data only once
                task_data, error_response = await self._fetch_and_validate_data(datasource_id)
                if task_data is None:
                    return error_response

                # Validate and normalize template values
                min_value, max_value = self._validate_and_normalize_values(
                    metric_template_value.min_value, metric_template_value.max_value
                )

                # Process for upper bounds
                normal_threshold_up = self._get_normal_threshold(metric_template_value, "up")
                up_results, up_success, up_data_errors, up_internal_errors = await self._process_time_series_data(
                    task_data,
                    metric_template_value,
                    window_size,
                    "up",
                    min_value,
                    max_value,
                    normal_threshold_up,
                    sensitivity,
                )

                # Process for lower bounds
                normal_threshold_down = self._get_normal_threshold(metric_template_value, "down")
                (
                    down_results,
                    down_success,
                    down_data_errors,
                    down_internal_errors,
                ) = await self._process_time_series_data(
                    task_data,
                    metric_template_value,
                    window_size,
                    "down",
                    min_value,
                    max_value,
                    normal_threshold_down,
                    sensitivity,
                )

                # Merge results
                merged_results = self._merge_threshold_results(up_results, down_results)

                total_success = up_success + down_success
                total_data_errors = up_data_errors + down_data_errors
                total_internal_errors = up_internal_errors + down_internal_errors

                logger.info(f"Successfully merged thresholds for {len(merged_results)} time series")

                if total_success == 0:
                    logger.warning(f"No time series were successfully processed for datasource {datasource_id}")
                    if total_internal_errors > total_data_errors:
                        error_reason = "Internal Server Error"
                    else:
                        error_reason = "Input Data Validation Error"
                    return {"status": "Failed", "result": merged_results, "message": error_reason}

                return {"status": "Success", "result": merged_results, "message": "Task Success!"}

            # Handle single direction (up or down) - original logic
            # Calculate time range for historical data
            end_time = int(time.time())
            start_time = end_time - SECONDS_PER_DAY * HISTORICAL_DAYS

            logger.debug(f"Fetching data from {start_time} to {end_time} for datasource: {datasource_id}")
            try:
                task_data = await asyncio.wait_for(
                    fetch_data(datasource_id, start_time, end_time, TIMESERIES_DATA_INTERVAL),
                    timeout=FETCH_DATA_TIMEOUT,
                )
            except asyncio.TimeoutError:
                logger.error(f"Data fetch timeout for datasource: {datasource_id}")
                return {
                    "status": "Failed",
                    "result": [],
                    "message": f"Data fetch timeout after {FETCH_DATA_TIMEOUT} seconds",
                }
            except asyncio.CancelledError:
                logger.warning(f"Data fetch cancelled for datasource: {datasource_id}")
                return {"status": "Failed", "result": [], "message": "Data fetch was cancelled"}

            if not task_data:
                logger.warning(f"No data retrieved for datasource: {datasource_id}")
                return {"status": "NoData", "result": [], "message": "No data available for threshold calculation"}

            # Validate and normalize template values
            min_value, max_value = self._validate_and_normalize_values(
                metric_template_value.min_value, metric_template_value.max_value
            )

            normal_threshold = self._get_normal_threshold(metric_template_value, direction)

            logger.debug(
                f"Processing {len(task_data)} time series with "
                f"min_value={min_value}, max_value={max_value}, "
                f"normal_threshold={normal_threshold}, direction={direction}"
            )

            # Process each time series
            (
                threshold_response_full,
                success_instance_count,
                data_validation_error_count,
                internal_server_error_count,
            ) = await self._process_time_series_data(
                task_data,
                metric_template_value,
                window_size,
                direction,
                min_value,
                max_value,
                normal_threshold,
                sensitivity,
            )
            logger.info(f"Successfully calculated thresholds for {success_instance_count}/{len(task_data)} time series")

            # Check if any time series were successfully processed
            if success_instance_count == 0:
                logger.warning(f"No time series were successfully processed for datasource {datasource_id}")
                if internal_server_error_count > data_validation_error_count:
                    error_reason = "Internal Server Error"
                else:
                    error_reason = "Input Data Validation Error"
                return {"status": "Failed", "result": threshold_response_full, "message": error_reason}

            return {"status": "Success", "result": threshold_response_full, "message": "Task Success!"}

        except Exception as e:
            error_trace = traceback.format_exc()
            logger.error(f"Threshold calculation failed for datasource {datasource_id}: {e}\n{error_trace}")

            return {"status": "Failed", "result": [], "message": f"Error: {e}"}

    @staticmethod
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=1, max=10),
        retry_error_callback=lambda retry_state: logger.warning(
            f"Retry attempt {retry_state.attempt_number} failed for update_task_result"
        ),
    )
    async def _update_task_result(
        task_id: PydanticObjectId,
        status: IntelligentThresholdTaskStatus,
        task_version: int,
        result: Any,
        error_message: Optional[str] = None,
    ) -> None:
        """Safely update task result with retry mechanism.

        This function wraps update_task_result with retry logic to handle
        transient failures gracefully.

        Args:
            task_id (PydanticObjectId): Unique identifier for the task.
            status (IntelligentThresholdTaskStatus): Task status.
            task_version (int): Version number of the task.
            result (Any): Task result data.
            error_message (Optional[str]): Optional error message.
        """
        await update_task_result(task_id, status, task_version, result, error_message)

    @staticmethod
    def send_task_response_callback(task: asyncio.Task, task_id: PydanticObjectId, task_version: int) -> None:
        """Handle task completion callback and update task result.

        Processes the completed threshold calculation task and updates the database
        with the appropriate status and results. Uses retry mechanism to handle
        transient failures when updating task results.

        Args:
            task (asyncio.Task): The completed asyncio task.
            task_id (PydanticObjectId): Unique identifier for the task.
            task_version (int): Version number of the task.
        """

        def schedule_update(
            status: IntelligentThresholdTaskStatus, result: Any = None, message: Optional[str] = None
        ) -> None:
            """Helper function to schedule task result update with retry mechanism."""
            asyncio.create_task(
                ThresholdRecommender._update_task_result(task_id, status, task_version, result, message)
            )

        try:
            if task.cancelled():
                logger.warning(f"Task {task_id} was cancelled")
                schedule_update(IntelligentThresholdTaskStatus.FAILED, None, f"Task {task_id} was cancelled")
            elif task.exception():
                exception = task.exception()
                logger.error(f"Task {task_id} failed with exception: {exception}")
                schedule_update(
                    IntelligentThresholdTaskStatus.FAILED,
                    None,
                    f"Task {task_id} failed with exception: {exception}",
                )
            else:
                # Task completed successfully
                task_result = task.result()
                task_status = task_result.get("status")
                task_message = task_result.get("message")

                if task_status == "Success":
                    logger.info(f"Task {task_id} completed successfully")
                    schedule_update(IntelligentThresholdTaskStatus.SUCCESS, task_result["result"])
                elif task_status == "NoData":
                    logger.warning(f"Task {task_id} completed with no data available")
                    schedule_update(IntelligentThresholdTaskStatus.FAILED, task_result["result"], task_message)
                else:
                    logger.error(f"Task {task_id} completed with failure: {task_message}")
                    schedule_update(IntelligentThresholdTaskStatus.FAILED, None, task_message)

        except Exception as e:
            logger.error(f"Failed to process task callback for {task_id}: {e}")
            # Use retry mechanism for the fallback update as well
            schedule_update(
                IntelligentThresholdTaskStatus.FAILED, None, f"Failed to process task callback for {task_id}: {e}"
            )
