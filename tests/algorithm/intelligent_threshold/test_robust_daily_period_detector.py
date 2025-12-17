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

import math
import warnings
from unittest.mock import patch

import numpy as np
import pytest
from scipy import stats

from veaiops.algorithm.intelligent_threshold.robust_daily_period_detector import (
    SECONDS_PER_DAY,
    RobustDailyPeriodDetector,
)


@pytest.fixture
def detector():
    """Create a RobustDailyPeriodDetector instance with default parameters."""
    return RobustDailyPeriodDetector()


@pytest.fixture
def custom_detector():
    """Create a RobustDailyPeriodDetector instance with custom parameters."""
    return RobustDailyPeriodDetector(
        correlation_threshold=0.8,
        min_data_points_per_day=500,
        min_common_points=500,
    )


@pytest.fixture
def periodic_data():
    """Generate periodic time series data with daily pattern."""
    start_time = 1640995200  # 2022-01-01 00:00:00 UTC
    timestamps = []
    values = []

    # Generate 7 days of data with 5-minute intervals
    for day in range(7):
        for hour in range(24):
            for minute in range(0, 60, 5):  # Every 5 minutes
                timestamp = start_time + day * SECONDS_PER_DAY + hour * 3600 + minute * 60
                timestamps.append(timestamp)

                # Create a daily pattern: higher during day (6-18), lower at night
                if 6 <= hour < 18:
                    base_value = 70 + 20 * math.sin((hour - 6) * math.pi / 12)
                else:
                    base_value = 30 + 10 * math.sin((hour + 6) * math.pi / 12)

                # Add some noise but keep the pattern
                noise = np.random.normal(0, 3)
                values.append(max(0, base_value + noise))

    return timestamps, values


@pytest.fixture
def non_periodic_data():
    """Generate non-periodic time series data."""
    start_time = 1640995200
    timestamps = []
    values = []

    # Generate 7 days of random walk data
    current_value = 50.0
    for day in range(7):
        for hour in range(24):
            for minute in range(0, 60, 5):  # Every 5 minutes
                timestamp = start_time + day * SECONDS_PER_DAY + hour * 3600 + minute * 60
                timestamps.append(timestamp)

                # Random walk
                change = np.random.normal(0, 2)
                current_value = max(0, current_value + change)
                values.append(current_value)

    return timestamps, values


@pytest.fixture
def short_data():
    """Generate short time series data (less than 3 days)."""
    start_time = 1640995200
    timestamps = []
    values = []

    # Generate 2 days of data
    for day in range(2):
        for hour in range(24):
            for minute in range(0, 60, 10):  # Every 10 minutes
                timestamp = start_time + day * SECONDS_PER_DAY + hour * 3600 + minute * 60
                timestamps.append(timestamp)
                values.append(50.0 + np.random.normal(0, 5))

    return timestamps, values


def test_init_default_parameters():
    """Test initialization with default parameters."""
    detector = RobustDailyPeriodDetector()
    assert detector.correlation_threshold == 0.3
    assert detector.min_data_points_per_day == 720
    assert detector.min_common_points == 720


def test_init_custom_parameters():
    """Test initialization with custom parameters."""
    detector = RobustDailyPeriodDetector(
        correlation_threshold=0.8,
        min_data_points_per_day=500,
        min_common_points=500,
    )
    assert detector.correlation_threshold == 0.8
    assert detector.min_data_points_per_day == 500
    assert detector.min_common_points == 500


def test_detect_mismatched_data(detector):
    """Test detection with mismatched timestamp and value lists."""
    timestamps = [1, 2, 3]
    values = [10, 20]  # Different length
    assert detector.detect(timestamps, values) is False


def test_detect_single_data_point(detector):
    """Test detection with single data point."""
    assert detector.detect([1640995200], [50.0]) is False


def test_detect_insufficient_time_span(detector):
    """Test detection with insufficient time span (less than 3 days)."""
    start_time = 1640995200
    timestamps = [start_time + i * 3600 for i in range(48)]  # 2 days
    values = [50.0] * 48
    assert detector.detect(timestamps, values) is False


def test_detect_periodic_data(detector, periodic_data):
    """Test detection with periodic data."""
    timestamps, values = periodic_data

    # Mock the correlation calculation to return high correlation
    with patch.object(stats, "pearsonr") as mock_pearsonr:
        mock_pearsonr.return_value = (0.85, 0.001)  # High correlation, low p-value

        # Also need to ensure sufficient data points per day
        detector.min_data_points_per_day = 100  # Lower threshold for test data
        detector.min_common_points = 100

        result = detector.detect(timestamps, values)
        assert result is True


def test_detect_non_periodic_data(detector, non_periodic_data):
    """Test detection with non-periodic data."""
    timestamps, values = non_periodic_data

    # Mock the correlation calculation to return low correlation
    with patch.object(stats, "pearsonr") as mock_pearsonr:
        mock_pearsonr.return_value = (0.3, 0.1)  # Low correlation

        result = detector.detect(timestamps, values)
        assert result is False


def test_detect_unordered_timestamps(detector):
    """Test detection with unordered timestamps."""
    # Create unordered timestamps
    timestamps = [1640995200, 1641081600, 1641000000, 1641168000]  # Out of order
    values = [50.0, 60.0, 55.0, 65.0]

    # Should handle unordered data by sorting
    result = detector.detect(timestamps, values)
    # Result depends on the actual correlation, but should not crash
    assert isinstance(result, bool)


def test_detect_with_missing_data_gaps(detector):
    """Test detection with missing data gaps."""
    start_time = 1640995200
    timestamps = []
    values = []

    # Generate data with gaps (skip some hours)
    for day in range(7):
        for hour in range(24):
            if hour % 3 == 0:  # Skip 2/3 of the hours to create gaps
                for minute in range(0, 60, 10):
                    timestamp = start_time + day * SECONDS_PER_DAY + hour * 3600 + minute * 60
                    timestamps.append(timestamp)
                    values.append(50.0 + 20 * math.sin(hour * math.pi / 12))

    result = detector.detect(timestamps, values)
    assert isinstance(result, bool)


def test_detect_insufficient_data_points_per_day(detector):
    """Test detection when days have insufficient data points."""
    start_time = 1640995200
    timestamps = []
    values = []

    # Generate very sparse data (much less than min_data_points_per_day)
    for day in range(7):
        for hour in range(0, 24, 6):  # Only 4 data points per day
            timestamp = start_time + day * SECONDS_PER_DAY + hour * 3600
            timestamps.append(timestamp)
            values.append(50.0)

    result = detector.detect(timestamps, values)
    assert result is False


def test_detect_with_extreme_value_differences(detector):
    """Test detection with extreme value differences between days."""
    start_time = 1640995200
    timestamps = []
    values = []

    # Generate data where some days have completely different value ranges
    for day in range(7):
        for hour in range(24):
            for minute in range(0, 60, 5):
                timestamp = start_time + day * SECONDS_PER_DAY + hour * 3600 + minute * 60
                timestamps.append(timestamp)

                if day < 3:
                    values.append(50.0)  # Low values for first 3 days
                else:
                    values.append(500.0)  # High values for last 4 days

    result = detector.detect(timestamps, values)
    # Should return False due to extreme differences
    assert result is False


def test_detect_insufficient_common_minutes(detector):
    """Test detection when there are insufficient common minutes between days."""
    start_time = 1640995200
    timestamps = []
    values = []

    # Generate data where each day has different time points
    for day in range(7):
        start_hour = day * 2  # Each day starts at different hour
        for hour in range(start_hour, start_hour + 4):  # Only 4 hours per day
            for minute in range(0, 60, 15):
                timestamp = start_time + day * SECONDS_PER_DAY + (hour % 24) * 3600 + minute * 60
                timestamps.append(timestamp)
                values.append(50.0)

    # This should trigger the pairwise correlation method
    result = detector.detect(timestamps, values)
    assert isinstance(result, bool)


def test_calculate_pairwise_correlation_sufficient_common_minutes(detector):
    """Test pairwise correlation calculation with sufficient common minutes."""
    # Create data with overlapping time points between days
    daily_data = {
        0: {i: 50.0 + i * 0.1 for i in range(1000)},  # Day 0
        1: {i: 50.0 + i * 0.1 + np.random.normal(0, 1) for i in range(1000)},  # Day 1, similar pattern
        2: {i: 50.0 + i * 0.1 + np.random.normal(0, 1) for i in range(1000)},  # Day 2, similar pattern
    }

    with patch.object(stats, "pearsonr") as mock_pearsonr:
        mock_pearsonr.return_value = (0.85, 0.001)  # High correlation

        result = detector._calculate_pairwise_correlation(daily_data)
        assert result is True


def test_calculate_pairwise_correlation_insufficient_common_minutes(detector):
    """Test pairwise correlation calculation with insufficient common minutes."""
    # Create data with no overlapping time points between days
    daily_data = {
        0: {i: 50.0 for i in range(100)},  # Day 0: minutes 0-99
        1: {i: 50.0 for i in range(100, 200)},  # Day 1: minutes 100-199
        2: {i: 50.0 for i in range(200, 300)},  # Day 2: minutes 200-299
    }

    result = detector._calculate_pairwise_correlation(daily_data)
    assert result is False


def test_calculate_pairwise_correlation_low_correlation(detector):
    """Test pairwise correlation calculation with low correlation."""
    daily_data = {
        0: {i: 50.0 for i in range(1000)},
        1: {i: 100.0 for i in range(1000)},  # Different pattern
        2: {i: 25.0 for i in range(1000)},  # Different pattern
    }

    with patch.object(stats, "pearsonr") as mock_pearsonr:
        mock_pearsonr.return_value = (0.3, 0.1)  # Low correlation

        result = detector._calculate_pairwise_correlation(daily_data)
        assert result is False


def test_calculate_pairwise_correlation_nan_correlation(detector):
    """Test pairwise correlation calculation when correlation is NaN."""
    daily_data = {
        0: {i: 50.0 for i in range(1000)},  # Constant values
        1: {i: 50.0 for i in range(1000)},  # Same constant values
    }

    with patch.object(stats, "pearsonr") as mock_pearsonr:
        mock_pearsonr.return_value = (np.nan, 0.1)  # NaN correlation

        result = detector._calculate_pairwise_correlation(daily_data)
        assert result is False


def test_calculate_pairwise_correlation_exception_handling(detector):
    """Test pairwise correlation calculation with exception handling."""
    daily_data = {
        0: {i: 50.0 for i in range(1000)},
        1: {i: 60.0 for i in range(1000)},
    }

    with patch.object(stats, "pearsonr") as mock_pearsonr:
        mock_pearsonr.side_effect = Exception("Correlation calculation failed")

        # Should handle exception gracefully
        result = detector._calculate_pairwise_correlation(daily_data)
        assert result is False


def test_detect_with_custom_thresholds(custom_detector, periodic_data):
    """Test detection with custom threshold parameters."""
    timestamps, values = periodic_data

    with patch.object(stats, "pearsonr") as mock_pearsonr:
        # Return correlation just below the custom threshold
        mock_pearsonr.return_value = (0.75, 0.001)  # Below 0.8 threshold

        # Adjust thresholds for test data
        custom_detector.min_data_points_per_day = 100
        custom_detector.min_common_points = 100

        result = custom_detector.detect(timestamps, values)
        assert result is False

        # Return correlation above the custom threshold
        mock_pearsonr.return_value = (0.85, 0.001)  # Above 0.8 threshold

        result = custom_detector.detect(timestamps, values)
        assert result is True


def test_detect_data_filtering_and_processing(detector):
    """Test the data filtering and processing logic."""
    start_time = 1640995200
    timestamps = []
    values = []

    # Generate 8 days of data, but only use last 7 days
    for day in range(8):
        for hour in range(24):
            for minute in range(0, 60, 1):  # Every minute
                timestamp = start_time + day * SECONDS_PER_DAY + hour * 3600 + minute * 60
                timestamps.append(timestamp)
                values.append(50.0 + hour)  # Simple pattern

    with patch.object(stats, "pearsonr") as mock_pearsonr:
        mock_pearsonr.return_value = (0.8, 0.001)

        result = detector.detect(timestamps, values)
        assert isinstance(result, bool)


def test_detect_day_completeness_check(detector):
    """Test the day completeness checking logic."""
    start_time = 1640995200
    timestamps = []
    values = []

    # Generate data with some complete days and some incomplete days
    for day in range(7):
        if day < 3:
            # Complete days (full 24 hours)
            for hour in range(24):
                for minute in range(0, 60, 1):
                    timestamp = start_time + day * SECONDS_PER_DAY + hour * 3600 + minute * 60
                    timestamps.append(timestamp)
                    values.append(50.0)
        else:
            # Incomplete days (only few hours)
            for hour in range(2):
                for minute in range(0, 60, 1):
                    timestamp = start_time + day * SECONDS_PER_DAY + hour * 3600 + minute * 60
                    timestamps.append(timestamp)
                    values.append(100.0)  # Different values for incomplete days

    result = detector.detect(timestamps, values)
    # Should handle mix of complete and incomplete days
    assert isinstance(result, bool)


def test_detect_with_warnings_suppression(detector, periodic_data):
    """Test that warnings are properly suppressed during correlation calculation."""
    timestamps, values = periodic_data

    with patch.object(stats, "pearsonr") as mock_pearsonr:
        # Simulate a function that would normally raise warnings
        def mock_pearsonr_with_warning(*args, **kwargs):
            warnings.warn("Test warning", RuntimeWarning)
            return (0.8, 0.001)

        mock_pearsonr.side_effect = mock_pearsonr_with_warning

        # Should not raise warnings
        with warnings.catch_warnings(record=True) as w:
            warnings.simplefilter("always")
            result = detector.detect(timestamps, values)

            # Check that warnings were suppressed (no warnings should be recorded)
            warning_messages = [str(warning.message) for warning in w]
            assert "Test warning" not in warning_messages
            assert isinstance(result, bool)


def test_day_completeness_with_different_sampling_intervals(detector):
    """Test that day completeness judgment adapts to different sampling intervals."""
    start_time = 1640995200  # 2022-01-01 00:00:00 UTC

    # Create a simple test: data from 0 to 85000 seconds (23.6 hours)
    end_time = start_time + 85000

    # Test with different intervals to verify the fix
    test_cases = [
        (600, 85000),  # expected_span = 86400 - 600 = 85800, 85000 < 85800 -> incomplete
        (2000, 85000),  # expected_span = 86400 - 2000 = 84400, 85000 > 84400 -> complete
    ]

    for interval, coverage_span in test_cases:
        timestamps = []
        values = []
        current_time = start_time

        while current_time <= end_time:
            timestamps.append(current_time)
            values.append(50.0)
            current_time += interval

        # Test the _organize_data_by_days method directly
        organized_data = detector._organize_data_by_days(timestamps, values, interval)

        assert organized_data is not None
        day_completeness = organized_data["day_completeness"]
        day_coverage = organized_data["day_coverage"]

        # Calculate expected result based on our fix
        if 0 in day_coverage:
            min_time, max_time = day_coverage[0]
            actual_coverage_span = max_time - min_time
            expected_span = SECONDS_PER_DAY - interval
            expected_complete = actual_coverage_span >= expected_span

            # Verify the fix: completeness should depend on sampling interval
            assert day_completeness[0] == expected_complete, (
                f"Day completeness logic incorrect for interval {interval}s: "
                f"actual_span={actual_coverage_span}, expected_span={expected_span}, "
                f"should_be_complete={expected_complete}, got={day_completeness[0]}"
            )
