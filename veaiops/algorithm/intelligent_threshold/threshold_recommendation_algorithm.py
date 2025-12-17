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

"""Intelligent threshold recommendation algorithm module.

This module provides algorithms for calculating intelligent thresholds for time series data,
including time-based splitting, sliding window analysis, and anomaly detection using DBSCAN.
"""

from datetime import datetime
from typing import Dict, List, Literal, Optional, Union
from zoneinfo import ZoneInfo

import numpy as np
from dbscan1d.core import DBSCAN1D

from veaiops.algorithm.intelligent_threshold.configs import (
    DEFAULT_NUMBER_OF_TIME_SPLIT,
    DEFAULT_TIMEZONE,
    MICROSECOND_THRESHOLD,
    MILLISECOND_THRESHOLD,
    NANOSECOND_THRESHOLD,
    NEGATIVE_INFINITY,
    SECONDS_PER_HOUR,
    SECONDS_PER_MINUTE,
)
from veaiops.algorithm.intelligent_threshold.robust_daily_period_detector import RobustDailyPeriodDetector
from veaiops.utils.log import logger


class ThresholdRecommendAlgorithm:
    """Intelligent threshold recommendation algorithm for time series data.

    This class provides comprehensive threshold calculation capabilities including:
    - Time-based data splitting and analysis
    - Sliding window threshold computation
    - Daily periodicity detection
    - Anomaly detection using DBSCAN clustering
    - Multi-directional threshold recommendations

    Attributes:
        timezone (str): Timezone for timestamp processing.
        time_split_ranges (List[List[float]]): Time ranges for splitting analysis.
        period_detector (RobustDailyPeriodDetector): Daily period detection instance.
    """

    def __init__(self, timezone: str = DEFAULT_TIMEZONE, time_split_ranges: Optional[List[List[float]]] = None) -> None:
        """Initialize the ThresholdRecommendAlgorithm.

        Args:
            timezone (str): Timezone for timestamp processing.
            time_split_ranges (Optional[List[List[float]]]): Custom time split ranges.
        """
        self.timezone = timezone

        if time_split_ranges is None:
            self.time_split_ranges = []
            start_time = 0.0
            for _ in range(DEFAULT_NUMBER_OF_TIME_SPLIT):
                end_time = start_time + 24 / DEFAULT_NUMBER_OF_TIME_SPLIT
                self.time_split_ranges.append([start_time, end_time])
                start_time = end_time
        else:
            self.time_split_ranges = time_split_ranges
        self.period_detector = RobustDailyPeriodDetector()

        logger.debug(f"Initialized ThresholdRecommendAlgorithm with timezone={timezone}")

    def get_timestamp_hour(self, timestamp: float) -> float:
        """Get the hour of the timestamp in the configured time zone.

        Args:
            timestamp (float): The timestamp in seconds.

        Returns:
            float: The hour of the timestamp as a decimal (e.g., 14.5 for 2:30 PM).
        """
        timezone = ZoneInfo(self.timezone)
        dt_object = datetime.fromtimestamp(timestamp, tz=timezone)
        hours_decimal = dt_object.hour + dt_object.minute / SECONDS_PER_MINUTE + dt_object.second / SECONDS_PER_HOUR
        return hours_decimal

    @staticmethod
    def normalize_timestamp_to_seconds(timestamp: float) -> float:
        """Convert timestamps of different precisions to Unix timestamps in seconds.

        Handles nanosecond, microsecond, millisecond, and second precision timestamps.

        Args:
            timestamp (float): The timestamp to be normalized.

        Returns:
            float: The normalized Unix timestamp in seconds.
        """
        if timestamp >= NANOSECOND_THRESHOLD:
            return timestamp / 1_000_000_000
        elif timestamp >= MICROSECOND_THRESHOLD:
            return timestamp / 1_000_000
        elif timestamp >= MILLISECOND_THRESHOLD:
            return timestamp / 1_000
        return timestamp

    def recommend_threshold(
        self,
        timestamp_list: List[float],
        value_list: List[float],
        default_window_size: int,
        time_split: bool,
        auto_window_adjust: bool,
        min_value: Optional[float],
        max_value: Optional[float],
        normal_threshold: Optional[float],
        min_ts_length: int,
        sensitivity: float,
        direction: Literal["up", "down"] = "up",
    ) -> List[Dict]:
        """Recommend thresholds for time series data.

        Analyzes time series data to determine optimal thresholds, with support for
        time-based splitting and daily periodicity detection.

        Args:
            timestamp_list (List[float]): List of timestamps in seconds.
            value_list (List[float]): List of values corresponding to the timestamps.
            default_window_size (int): Default window size for threshold recommendation.
            time_split (bool): Whether to split the time series data into different time periods.
            auto_window_adjust (bool): Whether to automatically adjust the window size.
            min_value (Optional[float]): Minimum value constraint for the time series data.
            max_value (Optional[float]): Maximum value constraint for the time series data.
            normal_threshold (Optional[float]): Normal threshold baseline for the time series data.
            min_ts_length (int): Minimum required length of the time series data.
            sensitivity (float): Sensitivity of the threshold recommendation algorithm.
            direction (Literal["up", "down"]): Direction of the threshold recommendation.

        Returns:
            List[Dict]: List of threshold groups with start_hour, end_hour, upper_bound,
                       lower_bound, and window_size.
        """
        logger.debug(
            f"Starting threshold recommendation: data_points={len(timestamp_list)}, "
            f"time_split={time_split}, direction={direction}"
        )

        # Normalize timestamps to seconds
        normalized_timestamps = [self.normalize_timestamp_to_seconds(ts) for ts in timestamp_list]

        # Detect daily periodicity
        daily_periodic = self.period_detector.detect(normalized_timestamps, value_list)

        logger.debug(f"Daily periodicity detected: {daily_periodic}")

        if not time_split or not daily_periodic:
            # Process as single time period
            return self._process_single_time_period(
                normalized_timestamps,
                value_list,
                default_window_size,
                auto_window_adjust,
                min_value,
                max_value,
                normal_threshold,
                direction,
                sensitivity,
            )
        else:
            # Process with time splitting
            return self._process_time_split_periods(
                normalized_timestamps,
                value_list,
                default_window_size,
                auto_window_adjust,
                min_value,
                max_value,
                normal_threshold,
                min_ts_length,
                direction,
                sensitivity,
            )

    def _process_single_time_period(
        self,
        timestamp_list: List[float],
        value_list: List[float],
        default_window_size: int,
        auto_window_adjust: bool,
        min_value: Optional[float],
        max_value: Optional[float],
        normal_threshold: Optional[float],
        direction: Literal["up", "down"],
        sensitivity: float,
    ) -> List[Dict]:
        """Process time series as a single time period without splitting.

        Args:
            timestamp_list (List[float]): Normalized timestamps.
            value_list (List[float]): Corresponding values.
            default_window_size (int): Default window size.
            auto_window_adjust (bool): Whether to auto-adjust window size.
            min_value (Optional[float]): Minimum value constraint.
            max_value (Optional[float]): Maximum value constraint.
            normal_threshold (Optional[float]): Normal threshold baseline.
            direction (Literal["up", "down"]): Threshold direction.
            sensitivity (float): Sensitivity of the threshold recommendation algorithm.

        Returns:
            List[Dict]: Single threshold group covering 24 hours.
        """
        threshold, window_size = self.threshold_recommendation_with_sliding_window(
            timestamp_list,
            value_list,
            default_window_size,
            auto_window_adjust,
            min_value,
            max_value,
            normal_threshold,
            1,
            direction,
            sensitivity,
        )

        threshold_group = {
            "start_hour": 0,
            "end_hour": 24,
            "upper_bound": None,
            "lower_bound": None,
            "window_size": window_size,
        }

        if direction == "up":
            threshold_group["upper_bound"] = threshold
        else:
            threshold_group["lower_bound"] = threshold

        return [threshold_group]

    def _process_time_split_periods(
        self,
        timestamp_list: List[float],
        value_list: List[float],
        default_window_size: int,
        auto_window_adjust: bool,
        min_value: Optional[float],
        max_value: Optional[float],
        normal_threshold: Optional[float],
        min_ts_length: int,
        direction: Literal["up", "down"],
        sensitivity: float,
    ) -> List[Dict]:
        """Process time series with time period splitting.

        Args:
            timestamp_list (List[float]): Normalized timestamps.
            value_list (List[float]): Corresponding values.
            default_window_size (int): Default window size.
            auto_window_adjust (bool): Whether to auto-adjust window size.
            min_value (Optional[float]): Minimum value constraint.
            max_value (Optional[float]): Maximum value constraint.
            normal_threshold (Optional[float]): Normal threshold baseline.
            min_ts_length (int): Minimum required data length.
            direction (Literal["up", "down"]): Threshold direction.
            sensitivity (float): Sensitivity of the threshold recommendation algorithm.

        Returns:
            List[Dict]: Multiple threshold groups for different time periods.
        """
        # Split data by time periods
        data_split: List[List[List[float]]] = [[[], []] for _ in range(len(self.time_split_ranges))]

        for index in range(len(timestamp_list)):
            timestamp = timestamp_list[index]
            value = value_list[index]
            hour = self.get_timestamp_hour(timestamp)

            for time_index in range(len(self.time_split_ranges)):
                if self.time_split_ranges[time_index][0] <= hour < self.time_split_ranges[time_index][1]:
                    data_split[time_index][0].append(timestamp)
                    data_split[time_index][1].append(value)

        # Calculate thresholds for each time period
        thresholds: List = []
        for time_index in range(len(data_split)):
            sub_timestamp_list = data_split[time_index][0]
            sub_value_list = data_split[time_index][1]

            # Check if we have enough data for this time period
            required_length = (
                min_ts_length / 24 * (self.time_split_ranges[time_index][1] - self.time_split_ranges[time_index][0])
            )

            if len(sub_timestamp_list) < required_length:
                thresholds.append([time_index, None, None, None, None, 1.0])
            else:
                # Calculate threshold with ignore_count=1
                threshold, window_size = self.threshold_recommendation_with_sliding_window(
                    sub_timestamp_list,
                    sub_value_list,
                    default_window_size,
                    auto_window_adjust,
                    min_value,
                    max_value,
                    normal_threshold,
                    1,
                    direction,
                    sensitivity,
                )

                # Calculate threshold with ignore_count=0
                threshold_no_ignore, window_size_no_ignore = self.threshold_recommendation_with_sliding_window(
                    sub_timestamp_list,
                    sub_value_list,
                    default_window_size,
                    auto_window_adjust,
                    min_value,
                    max_value,
                    normal_threshold,
                    0,
                    direction,
                    sensitivity,
                )

                # Calculate ratio for sorting
                ratio = threshold_no_ignore / threshold if threshold != 0 else 1.0
                thresholds.append(
                    [
                        time_index,
                        threshold,
                        window_size,
                        threshold_no_ignore,
                        window_size_no_ignore,
                        ratio,
                    ]
                )

        # Sort by ratio and create threshold groups
        thresholds.sort(key=lambda x: x[-1], reverse=True)
        threshold_groups: List[Dict] = []

        for i, threshold_data in enumerate(thresholds):
            time_index = threshold_data[0]

            # Use different thresholds based on priority
            if i == 0:
                threshold = threshold_data[1]
                window_size = threshold_data[2]
            else:
                threshold = threshold_data[3]
                window_size = threshold_data[4]

            threshold_group = {
                "start_hour": self.time_split_ranges[time_index][0],
                "end_hour": self.time_split_ranges[time_index][1],
                "upper_bound": None,
                "lower_bound": None,
                "window_size": window_size,
            }

            if direction == "up":
                threshold_group["upper_bound"] = threshold
            else:
                threshold_group["lower_bound"] = threshold

            threshold_groups.append(threshold_group)

        return threshold_groups

    def _check_and_consolidate_threshold_groups(
        self, threshold_groups: List[Dict], direction: Literal["up", "down"]
    ) -> Optional[Dict]:
        """Check if threshold groups should be consolidated into a single group.

        Consolidation occurs when:
        1. The difference between max and min thresholds is <= 10% of the max threshold
        2. All window_sizes are the same

        Args:
            threshold_groups (List[Dict]): List of threshold groups from different time periods.
            direction (Literal["up", "down"]): Direction of the threshold recommendation.

        Returns:
            Optional[Dict]: Consolidated threshold group if consolidation is needed, None otherwise.
        """
        # Filter out groups with None thresholds (insufficient data)
        valid_groups = [
            group
            for group in threshold_groups
            if (direction == "up" and group.get("upper_bound") is not None)
            or (direction == "down" and group.get("lower_bound") is not None)
        ]

        if len(valid_groups) <= 1:
            return None

        # Extract thresholds and window_sizes
        if direction == "up":
            thresholds = [group["upper_bound"] for group in valid_groups]
        else:
            thresholds = [group["lower_bound"] for group in valid_groups]

        window_sizes = [group["window_size"] for group in valid_groups]

        # Check if all window_sizes are the same
        if len(set(window_sizes)) != 1:
            return None

        # Calculate max and min thresholds
        max_threshold = max(thresholds)
        min_threshold = min(thresholds)

        if max_threshold == 0:
            if max_threshold != min_threshold:
                return None
        else:
            threshold_diff_ratio = (max_threshold - min_threshold) / max_threshold
            if threshold_diff_ratio > 0.1:  # 10% threshold
                return None

        # Consolidation is needed - create single group
        consolidated_threshold = max_threshold if direction == "up" else min_threshold

        return {
            "start_hour": 0,
            "end_hour": 24,
            "upper_bound": consolidated_threshold if direction == "up" else None,
            "lower_bound": consolidated_threshold if direction == "down" else None,
            "window_size": window_sizes[0],  # All window_sizes are the same
        }

    def threshold_recommendation_with_sliding_window(
        self,
        timestamp_list: List[float],
        value_list: List[float],
        default_window_size: int,
        auto_window_adjust: bool,
        min_value: Optional[float],
        max_value: Optional[float],
        normal_threshold: Optional[float],
        ignore_count: int,
        direction: Literal["up", "down"],
        sensitivity: float,
    ) -> tuple[float, int]:
        """Threshold recommendation with sliding window.

        Args:
            timestamp_list (List[float]): List of timestamps in seconds.
            value_list (List[float]): List of values corresponding to the timestamps.
            default_window_size (int): Default window size for threshold recommendation.
            auto_window_adjust (bool): Whether to automatically adjust the window size.
            min_value (Optional[float]): Minimum value of the time series data.
            max_value (Optional[float]): Maximum value of the time series data.
            normal_threshold (Optional[float]): Normal threshold for the time series data.
            ignore_count (int): Number of data points to ignore at the beginning of the time series.
            direction (Literal["up", "down"]): Direction of the threshold recommendation.
            sensitivity (float): Sensitivity of the threshold recommendation algorithm.

        Returns:
            tuple[float, int]: Tuple of threshold and window size.
        """
        windows = [default_window_size]
        if auto_window_adjust:
            windows += list(range(default_window_size + 1, 10))

        last_threshold = 0.0
        last_window_size = windows[-1]

        for window_size in windows:
            result = self.recommend_general_threshold(
                timestamp_list,
                value_list,
                window_size,
                ignore_count,
                min_value,
                max_value,
                direction,
                sensitivity,
            )

            # If threshold calculation failed, continue with next window size
            if not result["status"]:
                continue

            threshold = result["threshold"]

            last_threshold = threshold
            last_window_size = window_size

            if direction == "up":
                if max_value is None or threshold < max_value:
                    break
            else:
                if min_value is None or threshold > min_value:
                    break

        # Apply normal threshold constraints
        if direction == "up":
            if normal_threshold is not None:
                last_threshold = max(last_threshold, normal_threshold)
        else:
            if normal_threshold is not None:
                last_threshold = min(last_threshold, normal_threshold)

        return last_threshold, last_window_size

    def recommend_general_threshold(
        self,
        timestamp_list_original: List[float],
        value_list_original: List[float],
        window_size: int,
        ignore_count: int,
        min_value: Optional[float],
        max_value: Optional[float],
        direction: Literal["up", "down"],
        sensitivity: float,
    ) -> Dict[str, Union[bool, float]]:
        """Recommend general threshold for time series data.

        Args:
            timestamp_list_original (List[float]): List of timestamps in seconds.
            value_list_original (List[float]): List of values corresponding to the timestamps.
            window_size (int): Window size for threshold recommendation.
            ignore_count (int): Number of data points to ignore at the beginning of the time series.
            min_value (Optional[float]): Minimum value of the time series data.
            max_value (Optional[float]): Maximum value of the time series data.
            direction (Literal["up", "down"]): Direction of the threshold recommendation.
            sensitivity (float): Sensitivity of the threshold recommendation algorithm.

        Returns:
            Dict[str, Union[bool, float]]: Dictionary with keys:
                'status': True if calculation succeeded, False if failed.
                'threshold': Recommended threshold value (only valid when status is True).
        """
        timestamp_list = timestamp_list_original
        value_list = value_list_original if direction == "up" else [-v for v in value_list_original]
        coefficient = 1.05 + 0.3 * sensitivity

        # Calculate time interval
        intervals = []
        for i in range(1, len(timestamp_list)):
            intervals.append(timestamp_list[i] - timestamp_list[i - 1])
        time_interval = np.median(intervals)
        if time_interval <= 0:
            return {"status": False, "threshold": -1.0}

        cluster_size = min(len(value_list), max(1, int(SECONDS_PER_HOUR / time_interval)))

        # Perform DBSCAN clustering
        data = np.array([[item] for item in value_list])
        clustering = DBSCAN1D(eps=float(abs(np.mean(value_list)) / 5), min_samples=cluster_size).fit(data)
        labels = clustering.labels_
        if labels is None:
            return {"status": False, "threshold": -1.0}

        labels = labels.tolist()
        clusters: Dict[int, int] = {}
        clusters_data: Dict[int, List[float]] = {}
        for j in range(len(labels)):
            c = int(labels[j])
            if c not in clusters:
                clusters.setdefault(c, 0)
                clusters_data.setdefault(c, [])
            clusters[c] += 1
            clusters_data[c].append(value_list[j])

        # Find maximum value from valid clusters
        final_max_value = NEGATIVE_INFINITY
        for cluster in clusters:
            if cluster == -1:  # Skip noise points
                continue
            if len(clusters_data[cluster]) < cluster_size:
                continue
            final_max_value = max(final_max_value, max(clusters_data[cluster]))

        # Process anomalies iteratively
        while True:
            abnormals: List[List[Union[int, float]]] = []
            abnormal = False
            for i in range(len(value_list)):
                if value_list[i] <= final_max_value:
                    if abnormal:
                        abnormal = False
                else:
                    if abnormal:
                        abnormals[-1][1] = i
                        abnormals[-1][2] = min(abnormals[-1][2], value_list[i])
                    else:
                        abnormal = True
                        abnormals.append([i, i, value_list[i]])

            # Filter abnormals by window size
            abnormals_valid = []
            for left, right, value in abnormals:
                if right - left + 1 >= window_size:
                    abnormals_valid.append([left, right, value])
            abnormals = abnormals_valid

            # Merge nearby abnormals
            abnormals_metadata = []
            if len(abnormals) > 0:
                abnormals_merge = [abnormals[0]]
                for i in range(1, len(abnormals)):
                    if (
                        timestamp_list[int(abnormals[i][0])] - timestamp_list[int(abnormals_merge[-1][1])]
                        < SECONDS_PER_HOUR
                    ):
                        abnormals_merge[-1][1] = abnormals[i][1]
                        abnormals_merge[-1][2] = min(abnormals_merge[-1][2], abnormals[i][2])
                    else:
                        abnormals_merge.append(abnormals[i])
                abnormals = abnormals_merge

                for i in range(len(abnormals)):
                    left, right, min_value_local = abnormals[i]
                    if right - left + 1 < window_size or min_value_local <= final_max_value:
                        continue
                    abnormals_metadata.append([right - left + 1, min_value_local])
                abnormals_metadata.sort(key=lambda x: x[1], reverse=True)

            if len(abnormals_metadata) <= ignore_count:
                break
            final_max_value = max(final_max_value, abnormals_metadata[-1][1])

        # Handle case where no valid clusters were found
        if final_max_value == NEGATIVE_INFINITY:
            # Fallback strategy: use percentile as baseline
            if len(value_list) > 0:
                if direction == "up":
                    # For up direction, use 95th percentile of original values
                    baseline = float(np.percentile(value_list, 95))
                    return {"status": True, "threshold": baseline * coefficient}
                else:
                    # For down direction, value_list is already negated, so use 95th percentile of negated values
                    # which corresponds to the 5th percentile of original values
                    baseline = float(np.percentile(value_list, 95))  # This is the max of negated values
                    # Apply the same logic as the original down direction
                    final_threshold = 0 - baseline  # Convert back to positive
                    return {"status": True, "threshold": final_threshold / coefficient}
            else:
                # Empty data case - should not happen as we check earlier, but safety fallback
                return {"status": False, "threshold": -1.0}

        if direction == "up":
            threshold = final_max_value * coefficient
            if max_value is not None:
                threshold = min(max_value, threshold)
            return {"status": True, "threshold": threshold}
        else:
            final_max_value = 0 - final_max_value
            threshold = final_max_value / coefficient
            if min_value is not None:
                threshold = max(min_value, threshold)
            return {"status": True, "threshold": final_max_value / coefficient}
