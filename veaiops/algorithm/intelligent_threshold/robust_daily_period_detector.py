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

"""Robust daily period detector for time series analysis.

This module provides a robust algorithm for detecting daily periodicity in time series data.
The detector is designed to handle missing values, irregular sampling intervals, and noisy data
while maintaining high accuracy in identifying repeating daily patterns.
"""

import traceback
from typing import Dict, List, Optional, Set

import numpy as np
from scipy import stats

from veaiops.algorithm.intelligent_threshold.configs import (
    DEFAULT_CORRELATION_THRESHOLD,
    DEFAULT_MIN_COMMON_POINTS,
    DEFAULT_MIN_DATA_POINTS_PER_DAY,
    MIN_ANALYSIS_PERIOD_DAYS,
    MIN_DAYS_FOR_ANALYSIS,
    SECONDS_PER_DAY,
)
from veaiops.utils.log import logger


class RobustDailyPeriodDetector:
    """Robust detector for daily periodicity in time series data.

    This class implements a sophisticated algorithm to identify repeating daily patterns
    in time series data. It is designed to be robust against:
    - Missing data points
    - Irregular sampling intervals
    - Noisy measurements
    - Incomplete daily coverage

    The algorithm works by:
    1. Preprocessing and organizing data by days
    2. Filtering days with insufficient data
    3. Computing correlations between daily patterns
    4. Determining periodicity based on correlation thresholds

    Attributes:
        correlation_threshold (float): Minimum correlation coefficient for periodicity detection.
        min_data_points_per_day (int): Minimum data points required per day for analysis.
        min_common_points (int): Minimum common time points needed between days.
    """

    def __init__(
        self,
        correlation_threshold: float = DEFAULT_CORRELATION_THRESHOLD,
        min_data_points_per_day: int = DEFAULT_MIN_DATA_POINTS_PER_DAY,
        min_common_points: int = DEFAULT_MIN_COMMON_POINTS,
    ) -> None:
        """Initialize the daily period detector.

        Args:
            correlation_threshold (float): Correlation coefficient threshold for determining
                daily periodicity. Higher values require stronger correlations.
            min_data_points_per_day (int): Minimum number of data points required per day
                to include that day in the analysis.
            min_common_points (int): Minimum number of common time points required
                between different days for correlation calculation.

        Raises:
            ValueError: If any parameter is outside valid range.
        """
        if not 0 <= correlation_threshold <= 1:
            raise ValueError("correlation_threshold must be between 0 and 1")
        if min_data_points_per_day <= 0:
            raise ValueError("min_data_points_per_day must be positive")
        if min_common_points <= 0:
            raise ValueError("min_common_points must be positive")

        self.correlation_threshold = correlation_threshold
        self.min_data_points_per_day = min_data_points_per_day
        self.min_common_points = min_common_points

        logger.debug(
            f"Initialized RobustDailyPeriodDetector with correlation_threshold={correlation_threshold}, "
            f"min_data_points_per_day={min_data_points_per_day}, "
            f"min_common_points={min_common_points}"
        )

    def detect(self, timestamp_list: List[float], value_list: List[float]) -> bool:
        """Detect daily periodicity in time series data.

        This method analyzes the provided time series data to determine if it exhibits
        a repeating daily pattern. The algorithm is robust to missing data and irregular
        sampling intervals.

        Args:
            timestamp_list (List[float]): List of timestamps in seconds (Unix time).
            value_list (List[float]): List of corresponding values for each timestamp.

        Returns:
            bool: True if daily periodicity is detected, False otherwise.

        Raises:
            ValueError: If input data is invalid or insufficient.
        """
        logger.debug(f"Starting daily periodicity detection for {len(timestamp_list)} data points")

        # Validate Input Data
        time_span = max(timestamp_list) - min(timestamp_list)

        # Use a more lenient requirement: at least 3 day of data
        if time_span < MIN_DAYS_FOR_ANALYSIS * SECONDS_PER_DAY:
            logger.warning(
                f"Insufficient time span: {time_span / SECONDS_PER_DAY:.1f} days "
                f"(need at least {MIN_DAYS_FOR_ANALYSIS} days), skipping this time series"
            )
            return False

        # Preprocess and organize data
        try:
            processed_data = self._preprocess_data(timestamp_list, value_list)
            if not processed_data:
                logger.warning("Data preprocessing failed or insufficient data")
                return False

            # Analyze daily patterns
            return self._analyze_daily_patterns(processed_data)

        except Exception as e:
            logger.error(f"Error during daily periodicity detection: {e}\nTraceback: {traceback.format_exc()}")
            return False

    def _preprocess_data(self, timestamp_list: List[float], value_list: List[float]) -> Optional[Dict]:
        """Preprocess time series data for daily pattern analysis.

        Args:
            timestamp_list (List[float]): List of timestamps.
            value_list (List[float]): List of values.

        Returns:
            Optional[Dict]: Processed data structure or None if preprocessing fails.
        """
        # Sort data by timestamp
        sorted_indices = sorted(range(len(timestamp_list)), key=lambda i: timestamp_list[i])
        sorted_timestamps = [timestamp_list[i] for i in sorted_indices]
        sorted_values = [value_list[i] for i in sorted_indices]

        # Limit analysis to recent data (last 7 days)
        cutoff_time = sorted_timestamps[-1] - SECONDS_PER_DAY * MIN_ANALYSIS_PERIOD_DAYS
        start_idx = 0
        while start_idx < len(sorted_timestamps) and sorted_timestamps[start_idx] < cutoff_time:
            start_idx += 1

        if start_idx >= len(sorted_timestamps):
            logger.warning("No data within analysis period")
            return None

        analysis_timestamps = sorted_timestamps[start_idx:]
        analysis_values = sorted_values[start_idx:]

        # Determine the most common sampling interval
        sampling_interval = self._determine_sampling_interval(analysis_timestamps)
        if sampling_interval <= 0:
            logger.warning("Could not determine valid sampling interval")
            return None

        # Organize data by days
        organized_data = self._organize_data_by_days(analysis_timestamps, analysis_values, sampling_interval)
        if not organized_data:
            logger.warning("Failed to organize data by days")
            return None

        # Merge the organized data with additional metadata
        result = organized_data.copy()
        result.update({"sampling_interval": sampling_interval, "start_timestamp": analysis_timestamps[0]})

        return result

    def _determine_sampling_interval(self, timestamps: List[float]) -> float:
        """Determine the most common sampling interval in the data.

        Args:
            timestamps (List[float]): Sorted list of timestamps.

        Returns:
            float: The most common sampling interval, or 0 if none found.
        """
        if len(timestamps) < 2:
            return 0

        # Calculate intervals between consecutive timestamps
        intervals = {}
        for i in range(1, len(timestamps)):
            interval = int(timestamps[i] - timestamps[i - 1])
            if interval > 0:  # Only consider positive intervals
                intervals[interval] = intervals.get(interval, 0) + 1

        if not intervals:
            return 0

        # Find the most frequent interval
        interval_counts = [(interval, count) for interval, count in intervals.items()]
        interval_counts.sort(key=lambda x: x[1], reverse=True)

        return interval_counts[0][0]

    def _organize_data_by_days(
        self, timestamps: List[float], values: List[float], sampling_interval: float
    ) -> Optional[Dict]:
        """Organize time series data by days for pattern analysis.

        Args:
            timestamps (List[float]): Sorted list of timestamps.
            values (List[float]): Corresponding values.
            sampling_interval (float): Determined sampling interval.

        Returns:
            Optional[Dict]: Organized daily data or None if organization fails.
        """
        if not timestamps or not values:
            return None

        start_timestamp = timestamps[0]
        daily_data = {}
        day_coverage = {}

        # Organize data points by day and time within day
        for timestamp, value in zip(timestamps, values):
            day_key = int((timestamp - start_timestamp) / SECONDS_PER_DAY)
            time_within_day = (timestamp - start_timestamp) % SECONDS_PER_DAY
            time_bucket = int(time_within_day / sampling_interval)

            if day_key not in daily_data:
                daily_data[day_key] = {}
                day_coverage[day_key] = [time_within_day, time_within_day]

            daily_data[day_key][time_bucket] = value
            day_coverage[day_key][0] = min(time_within_day, day_coverage[day_key][0])
            day_coverage[day_key][1] = max(time_within_day, day_coverage[day_key][1])

        # Determine which days have sufficient coverage
        day_completeness = {}
        expected_span = SECONDS_PER_DAY - sampling_interval
        for day_key, (min_time, max_time) in day_coverage.items():
            coverage_span = max_time - min_time
            is_complete = coverage_span >= expected_span
            day_completeness[day_key] = is_complete

        return {"daily_data": daily_data, "day_completeness": day_completeness, "day_coverage": day_coverage}

    def _analyze_daily_patterns(self, processed_data: Dict) -> bool:
        """Analyze daily patterns to detect periodicity.

        Args:
            processed_data (Dict): Preprocessed data structure.

        Returns:
            bool: True if daily periodicity is detected, False otherwise.
        """
        daily_data = processed_data["daily_data"]
        day_completeness = processed_data["day_completeness"]

        # Filter days with sufficient data points
        filtered_daily_data = {}
        for day, values in daily_data.items():
            if len(values) >= self.min_data_points_per_day:
                filtered_daily_data[day] = values

        if len(filtered_daily_data) < 2:
            logger.error(f"Insufficient days with enough data: {len(filtered_daily_data)}")
            return False

        # Check for non-overlapping value ranges between complete days
        if not self._check_value_range_overlap(filtered_daily_data, day_completeness):
            logger.debug("Non-overlapping value ranges detected between complete days")
            return False

        # Calculate correlations between daily patterns
        return self._calculate_daily_correlations(filtered_daily_data)

    def _check_value_range_overlap(self, daily_data: Dict, day_completeness: Dict) -> bool:
        """Check if daily value ranges overlap sufficiently.

        Args:
            daily_data (Dict): Daily data organized by day.
            day_completeness (Dict): Day completeness information.

        Returns:
            bool: True if ranges overlap sufficiently, False otherwise.
        """
        # Calculate daily statistics
        daily_stats = {}
        for day, values in daily_data.items():
            valid_values = list(values.values())
            if valid_values:
                daily_stats[day] = {
                    "max": max(valid_values),
                    "min": min(valid_values),
                    "mean": sum(valid_values) / len(valid_values),
                    "std": np.std(valid_values),
                    "count": len(valid_values),
                }

        # Check for non-overlapping ranges between complete days
        complete_days = [day for day, is_complete in day_completeness.items() if is_complete]

        for i, day_i in enumerate(complete_days):
            for day_j in complete_days[i + 1 :]:
                if day_i in daily_stats and day_j in daily_stats:
                    stat_i = daily_stats[day_i]
                    stat_j = daily_stats[day_j]

                    # If one day's values are completely above or below another's, no overlap
                    if stat_i["min"] >= stat_j["max"] or stat_i["max"] <= stat_j["min"]:
                        return False

        return True

    def _calculate_daily_correlations(self, daily_data: Dict) -> bool:
        """Calculate correlations between daily patterns.

        Args:
            daily_data (Dict): Daily data organized by day.

        Returns:
            bool: True if correlations indicate periodicity, False otherwise.
        """
        # Find common time points across all days
        common_time_points = set.intersection(*[set(day_data.keys()) for day_data in daily_data.values()])

        if len(common_time_points) >= self.min_common_points:
            # Use common time points for correlation calculation
            return self._correlate_common_timepoints(daily_data, common_time_points)
        else:
            # Fall back to pairwise correlation with individual common points
            return self._calculate_pairwise_correlation(daily_data)

    def _correlate_common_timepoints(self, daily_data: Dict, common_time_points: Set) -> bool:
        """Calculate correlations using common time points across all days.

        Args:
            daily_data (Dict): Daily data organized by day.
            common_time_points (Set): Time points common to all days.

        Returns:
            bool: True if correlations indicate periodicity, False otherwise.
        """
        days = list(daily_data.keys())
        day_values = {}

        # Extract values for common time points
        for day in days:
            day_values[day] = [daily_data[day][time_point] for time_point in sorted(common_time_points)]

        # Calculate pairwise correlations
        correlations = []
        for i in range(len(days)):
            for j in range(i + 1, len(days)):
                correlation = self._calculate_correlation(day_values[days[i]], day_values[days[j]])
                if correlation is not None:
                    correlations.append(correlation)

        if not correlations:
            logger.debug("No valid correlations calculated")
            return False

        avg_correlation = sum(correlations) / len(correlations)
        logger.debug(f"Average correlation: {avg_correlation:.3f} (threshold: {self.correlation_threshold})")

        return avg_correlation >= self.correlation_threshold

    def _calculate_correlation(self, values1: List[float], values2: List[float]) -> Optional[float]:
        """Safely calculate Pearson correlation coefficient.

        Args:
            values1 (List[float]): First set of values.
            values2 (List[float]): Second set of values.

        Returns:
            Optional[float]: Correlation coefficient or None if calculation fails.
        """
        try:
            # Convert to numpy arrays for efficient computation
            arr1 = np.array(values1)
            arr2 = np.array(values2)

            if len(arr1) == 0 or len(arr2) == 0:
                logger.debug("Cannot calculate correlation: empty arrays")
                return None

            if len(arr1) != len(arr2):
                logger.debug("Cannot calculate correlation: arrays have different lengths")
                return None

            if np.all(arr1 == arr1[0]) or np.all(arr2 == arr2[0]):
                logger.debug("Cannot calculate correlation: input array is constant")
                return None

            corr, _ = stats.pearsonr(arr1, arr2)

            # Check for NaN result
            if np.isnan(corr):
                logger.debug("Correlation calculation resulted in NaN")
                return None

            return float(corr)

        except Exception as e:
            logger.debug(f"Failed to calculate correlation: {e}")
            return None

    def _calculate_pairwise_correlation(self, daily_data: Dict) -> bool:
        """Calculate correlations between different days using a pairwise approach.

        This method is used when there are insufficient common time points across all days.
        It calculates correlations for each pair of days using their individual common points.

        Args:
            daily_data (Dict): Data grouped by day.

        Returns:
            bool: True if pairwise correlations indicate daily periodicity, False otherwise.
        """
        days = list(daily_data.keys())
        correlations = []

        logger.debug(f"Calculating pairwise correlations for {len(days)} days")

        for i in range(len(days)):
            for j in range(i + 1, len(days)):
                day_i = days[i]
                day_j = days[j]

                # Find common time points between this pair of days
                common_time_points = set(daily_data[day_i].keys()) & set(daily_data[day_j].keys())

                if len(common_time_points) >= self.min_common_points:
                    # Extract values for common time points
                    values_i = [daily_data[day_i][time_point] for time_point in sorted(common_time_points)]
                    values_j = [daily_data[day_j][time_point] for time_point in sorted(common_time_points)]

                    # Calculate correlation for this pair
                    correlation = self._calculate_correlation(values_i, values_j)
                    if correlation is not None:
                        correlations.append(correlation)
                        logger.debug(f"Correlation between day {day_i} and {day_j}: {correlation:.3f}")
                else:
                    logger.debug(
                        f"Insufficient common points between day {day_i} and {day_j}: "
                        f"{len(common_time_points)} < {self.min_common_points}"
                    )

        if not correlations:
            logger.debug("No valid pairwise correlations calculated")
            return False

        avg_correlation = sum(correlations) / len(correlations)
        logger.debug(f"Average pairwise correlation: {avg_correlation:.3f} (threshold: {self.correlation_threshold})")

        return avg_correlation >= self.correlation_threshold
