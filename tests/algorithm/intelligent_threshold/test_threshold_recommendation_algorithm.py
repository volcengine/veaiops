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
from datetime import datetime
from unittest.mock import MagicMock, patch
from zoneinfo import ZoneInfo

import numpy as np
import pytest
import tzlocal

from veaiops.algorithm.intelligent_threshold.configs import DEFAULT_TIMEZONE
from veaiops.algorithm.intelligent_threshold.threshold_recommendation_algorithm import ThresholdRecommendAlgorithm


@pytest.fixture
def threshold_recommender():
    """Create a ThresholdRecommendAlgorithm instance for testing."""
    return ThresholdRecommendAlgorithm()


def test_get_timestamp_hour(threshold_recommender):
    """Test getting hour from timestamp."""
    # Test with a known timestamp in local timezone
    timezone = ZoneInfo(DEFAULT_TIMEZONE)
    dt = datetime(2022, 1, 1, 12, 30, 45, tzinfo=timezone)
    timestamp = dt.timestamp()

    hour = threshold_recommender.get_timestamp_hour(timestamp)
    expected_hour = 12 + 30 / 60 + 45 / 3600  # 12.5125
    assert abs(hour - expected_hour) < 0.001


def test_get_timestamp_hour_midnight(threshold_recommender):
    """Test getting hour from midnight timestamp."""
    timezone = ZoneInfo(DEFAULT_TIMEZONE)
    dt = datetime(2022, 1, 1, 0, 0, 0, tzinfo=timezone)
    timestamp = dt.timestamp()

    result = threshold_recommender.get_timestamp_hour(timestamp)
    assert result == 0.0


def test_get_timestamp_hour_end_of_day(threshold_recommender):
    """Test getting hour from timestamp at end of day."""
    timezone = ZoneInfo(DEFAULT_TIMEZONE)
    dt = datetime(2022, 1, 1, 23, 59, 59, tzinfo=timezone)
    timestamp = dt.timestamp()

    hour = threshold_recommender.get_timestamp_hour(timestamp)
    expected_hour = 23 + 59 / 60 + 59 / 3600
    assert abs(hour - expected_hour) < 0.001


def test_local_timezone_detection():
    """Test that local timezone is properly detected."""
    # Test that we can create an instance with default timezone
    recommender = ThresholdRecommendAlgorithm()
    assert recommender.timezone == DEFAULT_TIMEZONE

    # Test that local timezone is detected (should not raise an exception)
    try:
        local_tz = tzlocal.get_localzone_name()
        assert DEFAULT_TIMEZONE == local_tz
    except Exception:
        # If local timezone detection fails, should fallback to Shanghai
        assert DEFAULT_TIMEZONE == "Asia/Shanghai"


def test_normalize_timestamp_to_seconds(threshold_recommender):
    """Test timestamp normalization to seconds."""
    # Test nanoseconds (19 digits)
    nanoseconds = 1640995200123456789
    result = threshold_recommender.normalize_timestamp_to_seconds(nanoseconds)
    assert result == 1640995200.123456789

    # Test microseconds (16 digits)
    microseconds = 1640995200123456
    result = threshold_recommender.normalize_timestamp_to_seconds(microseconds)
    assert result == 1640995200.123456

    # Test milliseconds (13 digits)
    milliseconds = 1640995200123
    result = threshold_recommender.normalize_timestamp_to_seconds(milliseconds)
    assert result == 1640995200.123

    # Test seconds (10 digits)
    seconds = 1640995200
    result = threshold_recommender.normalize_timestamp_to_seconds(seconds)
    assert result == 1640995200


def test_normalize_timestamp_edge_cases(threshold_recommender):
    """Test timestamp normalization edge cases."""
    # Test exactly at boundaries
    assert threshold_recommender.normalize_timestamp_to_seconds(10**18) == 10**9
    assert threshold_recommender.normalize_timestamp_to_seconds(10**15) == 10**9
    assert threshold_recommender.normalize_timestamp_to_seconds(10**12) == 10**9

    # Test just below boundaries - these follow the >= logic
    # For values just below 10^18 but >= 10^15, they should be divided by 1000000
    result1 = threshold_recommender.normalize_timestamp_to_seconds(10**18 - 1)
    expected1 = (10**18 - 1) / 1000000  # >= 10^15, so divided by 1000000
    assert abs(result1 - expected1) < 1e-3

    # For values just below 10^15 but >= 10^12, they should be divided by 1000
    result2 = threshold_recommender.normalize_timestamp_to_seconds(10**15 - 1)
    expected2 = (10**15 - 1) / 1000  # >= 10^12, so divided by 1000
    assert abs(result2 - expected2) < 1e-3

    # For values just below 10^12, they should remain unchanged
    result3 = threshold_recommender.normalize_timestamp_to_seconds(10**12 - 1)
    expected3 = 10**12 - 1  # < 10^12, so unchanged
    assert abs(result3 - expected3) < 1e-3


@pytest.fixture
def sample_timestamps():
    """Generate sample timestamps for 7 days with 1-minute intervals."""
    start_time = 1640995200  # 2022-01-01 00:00:00 UTC
    return [start_time + i * 60 for i in range(7 * 24 * 60)]  # 7 days of data


@pytest.fixture
def sample_values_periodic():
    """Generate sample values with daily periodicity in the algorithm's timezone."""
    from datetime import datetime
    from zoneinfo import ZoneInfo

    from veaiops.algorithm.intelligent_threshold.configs import DEFAULT_TIMEZONE

    timezone = ZoneInfo(DEFAULT_TIMEZONE)
    # Set fixed random seed for reproducible tests
    np.random.seed(42)

    # Create a pattern that repeats daily with some noise
    values = []
    for day in range(7):
        for hour in range(24):
            for minute in range(60):
                # Convert UTC timestamp to local timezone to determine day/night pattern
                utc_timestamp = 1640995200 + (day * 24 * 60 + hour * 60 + minute) * 60
                local_dt = datetime.fromtimestamp(utc_timestamp, tz=timezone)
                local_hour = local_dt.hour

                # Use local hour for day/night determination (6-18 is daytime)
                if 6 <= local_hour < 18:
                    base_value = 70 + 10 * math.sin((local_hour - 6) * math.pi / 12)
                else:
                    base_value = 30 + 5 * math.sin((local_hour + 6) * math.pi / 12)

                # Add some noise
                noise = np.random.normal(0, 2)
                values.append(base_value + noise)
    return values


@pytest.fixture
def sample_values_non_periodic():
    """Generate sample values without daily periodicity."""
    # Random walk without daily pattern
    values = [50.0]  # Starting value
    for _ in range(7 * 24 * 60 - 1):
        values.append(max(0, values[-1]))
    return values


def test_recommend_threshold_no_time_split(threshold_recommender, sample_timestamps, sample_values_periodic):
    """Test threshold recommendation without time splitting."""
    with patch.object(threshold_recommender.period_detector, "detect") as mock_detect:
        mock_detect.return_value = False  # No daily periodicity detected

        with patch.object(threshold_recommender, "threshold_recommendation_with_sliding_window") as mock_sliding_window:
            mock_sliding_window.return_value = (75.0, 5)

            result = threshold_recommender.recommend_threshold(
                timestamp_list=sample_timestamps[:100],  # Use subset for faster testing
                value_list=sample_values_periodic[:100],
                default_window_size=5,
                time_split=True,
                auto_window_adjust=False,
                min_value=0.0,
                max_value=100.0,
                normal_threshold=50.0,
                min_ts_length=50,
                direction="up",
            )

            assert len(result) == 1
            assert result[0]["start_hour"] == 0
            assert result[0]["end_hour"] == 24
            assert result[0]["upper_bound"] == 75.0
            assert result[0]["lower_bound"] is None
            assert result[0]["window_size"] == 5


def test_recommend_threshold_with_time_split(threshold_recommender, sample_timestamps, sample_values_periodic):
    """Test threshold recommendation with time splitting."""
    with patch.object(threshold_recommender.period_detector, "detect") as mock_detect:
        mock_detect.return_value = True  # Daily periodicity detected

        with patch.object(threshold_recommender, "threshold_recommendation_with_sliding_window") as mock_sliding_window:
            # Return different thresholds for different time periods
            mock_sliding_window.side_effect = [(60.0, 5), (70.0, 5), (80.0, 5), (65.0, 5)] * 2

            result = threshold_recommender.recommend_threshold(
                timestamp_list=sample_timestamps[:2000],  # Increased from 1000 to ensure all periods have data
                value_list=sample_values_periodic[:2000],
                default_window_size=5,
                time_split=True,
                auto_window_adjust=False,
                min_value=0.0,
                max_value=100.0,
                normal_threshold=50.0,
                min_ts_length=30,  # Reduced from 50 to ensure all periods have enough data
                direction="up",
            )

            # Should have 4 time periods
            assert len(result) == 4

            # Verify time ranges
            expected_ranges = [[0, 6], [6, 12], [12, 18], [18, 24]]
            for i, threshold_group in enumerate(result):
                # The order might be different due to sorting by ratio
                assert threshold_group["start_hour"] in [r[0] for r in expected_ranges]
                assert threshold_group["end_hour"] in [r[1] for r in expected_ranges]
                assert threshold_group["upper_bound"] is not None
                assert threshold_group["lower_bound"] is None
                assert threshold_group["window_size"] == 5


def test_recommend_threshold_direction_down(threshold_recommender, sample_timestamps, sample_values_periodic):
    """Test threshold recommendation with direction='down'."""
    with patch.object(threshold_recommender.period_detector, "detect") as mock_detect:
        mock_detect.return_value = False

        with patch.object(threshold_recommender, "threshold_recommendation_with_sliding_window") as mock_sliding_window:
            mock_sliding_window.return_value = (25.0, 5)

            result = threshold_recommender.recommend_threshold(
                timestamp_list=sample_timestamps[:100],
                value_list=sample_values_periodic[:100],
                default_window_size=5,
                time_split=False,
                auto_window_adjust=False,
                min_value=0.0,
                max_value=100.0,
                normal_threshold=30.0,
                min_ts_length=50,
                direction="down",
            )

            assert len(result) == 1
            assert result[0]["upper_bound"] is None
            assert result[0]["lower_bound"] == 25.0


def test_recommend_threshold_insufficient_data(threshold_recommender, sample_timestamps):
    """Test threshold recommendation with insufficient data for time splitting."""
    # Create very short time series
    short_timestamps = sample_timestamps[:10]
    short_values = [50.0] * 10

    with patch.object(threshold_recommender.period_detector, "detect") as mock_detect:
        mock_detect.return_value = True  # Daily periodicity detected

        with patch.object(threshold_recommender, "threshold_recommendation_with_sliding_window") as mock_sliding_window:
            mock_sliding_window.return_value = (60.0, 5)

            result = threshold_recommender.recommend_threshold(
                timestamp_list=short_timestamps,
                value_list=short_values,
                default_window_size=5,
                time_split=True,
                auto_window_adjust=False,
                min_value=0.0,
                max_value=100.0,
                normal_threshold=50.0,
                min_ts_length=1000,  # High minimum length
                direction="up",
            )

            # Should have 4 time periods, but with None thresholds due to insufficient data
            assert len(result) == 4
            for threshold_group in result:
                # Some periods might have None thresholds due to insufficient data
                # window_size could be None for insufficient data periods
                assert (
                    threshold_group["window_size"] in [1, 1.0, 5, 5.0, None] or threshold_group["window_size"] is None
                )


def test_threshold_recommendation_with_sliding_window_basic(threshold_recommender):
    """Test basic sliding window threshold recommendation."""
    timestamps = [1640995200.0 + i * 60 for i in range(100)]
    values = [50.0 + i * 0.1 for i in range(100)]  # Increasing values

    with patch.object(threshold_recommender, "recommend_general_threshold") as mock_recommend:
        mock_recommend.return_value = {"status": True, "threshold": 75.0}

        threshold, window_size = threshold_recommender.threshold_recommendation_with_sliding_window(
            timestamp_list=timestamps,
            value_list=values,
            default_window_size=5,
            auto_window_adjust=False,
            min_value=0.0,
            max_value=100.0,
            normal_threshold=50.0,
            ignore_count=1,
            direction="up",
        )

        assert threshold == 75.0
        assert window_size == 5
        mock_recommend.assert_called_once()


def test_threshold_recommendation_with_sliding_window_auto_adjust(threshold_recommender):
    """Test sliding window with auto window adjustment."""
    timestamps = [1640995200.0 + i * 60 for i in range(100)]
    values = [50.0] * 100

    with patch.object(threshold_recommender, "recommend_general_threshold") as mock_recommend:
        # Return values that exceed max_value for smaller windows, valid for larger window
        mock_recommend.side_effect = [
            {"status": True, "threshold": 150.0},
            {"status": True, "threshold": 120.0},
            {"status": True, "threshold": 110.0},
            {"status": True, "threshold": 80.0},
        ]  # Decreasing values

        threshold, window_size = threshold_recommender.threshold_recommendation_with_sliding_window(
            timestamp_list=timestamps,
            value_list=values,
            default_window_size=5,
            auto_window_adjust=True,
            min_value=0.0,
            max_value=100.0,
            normal_threshold=50.0,
            ignore_count=1,
            direction="up",
        )

        # Should use the first threshold that's below max_value
        assert threshold == 80.0
        assert window_size == 8  # 5 + 3


def test_threshold_recommendation_with_sliding_window_normal_threshold_up(threshold_recommender):
    """Test sliding window with normal threshold for direction='up'."""
    timestamps = [1640995200.0 + i * 60 for i in range(100)]
    values = [50.0] * 100

    with patch.object(threshold_recommender, "recommend_general_threshold") as mock_recommend:
        mock_recommend.return_value = {"status": True, "threshold": 40.0}  # Below normal threshold

        threshold, window_size = threshold_recommender.threshold_recommendation_with_sliding_window(
            timestamp_list=timestamps,
            value_list=values,
            default_window_size=5,
            auto_window_adjust=False,
            min_value=0.0,
            max_value=100.0,
            normal_threshold=60.0,
            ignore_count=1,
            direction="up",
        )

        # Should use normal threshold since it's higher
        assert threshold == 60.0
        assert window_size == 5


def test_threshold_recommendation_with_sliding_window_normal_threshold_down(threshold_recommender):
    """Test sliding window with normal threshold for direction='down'."""
    timestamps = [1640995200.0 + i * 60 for i in range(100)]
    values = [50.0] * 100

    with patch.object(threshold_recommender, "recommend_general_threshold") as mock_recommend:
        mock_recommend.return_value = {"status": True, "threshold": 40.0}  # Above normal threshold

        threshold, window_size = threshold_recommender.threshold_recommendation_with_sliding_window(
            timestamp_list=timestamps,
            value_list=values,
            default_window_size=5,
            auto_window_adjust=False,
            min_value=0.0,
            max_value=100.0,
            normal_threshold=30.0,
            ignore_count=1,
            direction="down",
        )

        # Should use normal threshold since it's lower
        assert threshold == 30.0
        assert window_size == 5


def test_check_and_consolidate_threshold_groups_consolidation_needed_up(threshold_recommender):
    """Test threshold consolidation when thresholds are close for up direction."""
    threshold_groups = [
        {"start_hour": 0, "end_hour": 6, "upper_bound": 95.0, "lower_bound": None, "window_size": 5},
        {"start_hour": 6, "end_hour": 12, "upper_bound": 98.0, "lower_bound": None, "window_size": 5},
        {"start_hour": 12, "end_hour": 18, "upper_bound": 100.0, "lower_bound": None, "window_size": 5},
        {"start_hour": 18, "end_hour": 24, "upper_bound": 97.0, "lower_bound": None, "window_size": 5},
    ]

    result = threshold_recommender._check_and_consolidate_threshold_groups(threshold_groups, "up")

    # Should consolidate since max-min=5, 5/100=5% < 10%, and all window_sizes are 5
    assert result is not None
    assert result["start_hour"] == 0
    assert result["end_hour"] == 24
    assert result["upper_bound"] == 100.0  # Max value for up direction
    assert result["lower_bound"] is None
    assert result["window_size"] == 5


def test_check_and_consolidate_threshold_groups_consolidation_needed_down(threshold_recommender):
    """Test threshold consolidation when thresholds are close for down direction."""
    threshold_groups = [
        {"start_hour": 0, "end_hour": 6, "upper_bound": None, "lower_bound": 25.0, "window_size": 3},
        {"start_hour": 6, "end_hour": 12, "upper_bound": None, "lower_bound": 23.0, "window_size": 3},
        {"start_hour": 12, "end_hour": 18, "upper_bound": None, "lower_bound": 24.0, "window_size": 3},
        {"start_hour": 18, "end_hour": 24, "upper_bound": None, "lower_bound": 22.5, "window_size": 3},
    ]

    result = threshold_recommender._check_and_consolidate_threshold_groups(threshold_groups, "down")

    # Should consolidate since max-min=2.5, 2.5/25=10% <= 10%, and all window_sizes are 3
    assert result is not None
    assert result["start_hour"] == 0
    assert result["end_hour"] == 24
    assert result["upper_bound"] is None
    assert result["lower_bound"] == 22.5  # Min value for down direction
    assert result["window_size"] == 3


def test_check_and_consolidate_threshold_groups_no_consolidation_different_window_sizes(threshold_recommender):
    """Test no consolidation when window_sizes are different."""
    threshold_groups = [
        {"start_hour": 0, "end_hour": 6, "upper_bound": 95.0, "lower_bound": None, "window_size": 5},
        {"start_hour": 6, "end_hour": 12, "upper_bound": 98.0, "lower_bound": None, "window_size": 7},
        {"start_hour": 12, "end_hour": 18, "upper_bound": 100.0, "lower_bound": None, "window_size": 5},
        {"start_hour": 18, "end_hour": 24, "upper_bound": 97.0, "lower_bound": None, "window_size": 5},
    ]

    result = threshold_recommender._check_and_consolidate_threshold_groups(threshold_groups, "up")

    # Should not consolidate since window_sizes are different
    assert result is None


def test_check_and_consolidate_threshold_groups_no_consolidation_large_difference(threshold_recommender):
    """Test no consolidation when threshold difference is too large."""
    threshold_groups = [
        {"start_hour": 0, "end_hour": 6, "upper_bound": 80.0, "lower_bound": None, "window_size": 5},
        {"start_hour": 6, "end_hour": 12, "upper_bound": 90.0, "lower_bound": None, "window_size": 5},
        {"start_hour": 12, "end_hour": 18, "upper_bound": 100.0, "lower_bound": None, "window_size": 5},
        {"start_hour": 18, "end_hour": 24, "upper_bound": 70.0, "lower_bound": None, "window_size": 5},
    ]

    result = threshold_recommender._check_and_consolidate_threshold_groups(threshold_groups, "up")

    # Should not consolidate since max-min=30, 30/100=30% > 10%
    assert result is None


def test_check_and_consolidate_threshold_groups_with_none_thresholds(threshold_recommender):
    """Test consolidation with some None thresholds (insufficient data)."""
    threshold_groups = [
        {"start_hour": 0, "end_hour": 6, "upper_bound": 95.0, "lower_bound": None, "window_size": 5},
        {
            "start_hour": 6,
            "end_hour": 12,
            "upper_bound": None,
            "lower_bound": None,
            "window_size": 5,
        },  # Insufficient data
        {"start_hour": 12, "end_hour": 18, "upper_bound": 100.0, "lower_bound": None, "window_size": 5},
        {"start_hour": 18, "end_hour": 24, "upper_bound": 97.0, "lower_bound": None, "window_size": 5},
    ]

    result = threshold_recommender._check_and_consolidate_threshold_groups(threshold_groups, "up")

    # Should consolidate using only valid thresholds: 95, 100, 97
    # max-min=5, 5/100=5% < 10%, and all valid window_sizes are 5
    assert result is not None
    assert result["start_hour"] == 0
    assert result["end_hour"] == 24
    assert result["upper_bound"] == 100.0
    assert result["lower_bound"] is None
    assert result["window_size"] == 5


def test_check_and_consolidate_threshold_groups_single_group(threshold_recommender):
    """Test consolidation with only one valid group."""
    threshold_groups = [
        {"start_hour": 0, "end_hour": 6, "upper_bound": 95.0, "lower_bound": None, "window_size": 5},
    ]

    result = threshold_recommender._check_and_consolidate_threshold_groups(threshold_groups, "up")

    # Should not consolidate with only one group
    assert result is None


def test_recommend_threshold_with_consolidation_up(threshold_recommender, sample_timestamps):
    """Test full threshold recommendation with consolidation for up direction."""
    # Create values that result in similar thresholds across time periods
    values = []
    for i in range(len(sample_timestamps)):
        # Create values that vary slightly but result in similar thresholds
        hour = (i // 60) % 24
        if hour < 6:
            values.append(45)  # Night: around 45
        elif hour < 12:
            values.append(48)  # Morning: around 48
        elif hour < 18:
            values.append(52)  # Afternoon: around 52
        else:
            values.append(47)  # Evening: around 47

    with patch.object(threshold_recommender.period_detector, "detect") as mock_detect:
        mock_detect.return_value = True  # Daily periodicity detected

        # Mock sliding window to return similar thresholds
        with patch.object(threshold_recommender, "threshold_recommendation_with_sliding_window") as mock_sliding_window:
            # Return very similar thresholds for all time periods (within 10%)
            mock_sliding_window.side_effect = [(49.0, 5), (50.0, 5), (51.0, 5), (50.5, 5)] * 2

            result = threshold_recommender.recommend_threshold(
                timestamp_list=sample_timestamps[:1000],  # Use subset
                value_list=values[:1000],
                default_window_size=5,
                time_split=True,
                auto_window_adjust=False,
                min_value=0.0,
                max_value=100.0,
                normal_threshold=None,
                min_ts_length=50,
                direction="up",
            )

            # Should consolidate to single group since thresholds are close (49-51, diff=2, 2/51=3.9% < 10%)
            assert len(result) == 1
            assert result[0]["start_hour"] == 0
            assert result[0]["end_hour"] == 24
            assert result[0]["upper_bound"] == 50.5  # Max value from the sorted thresholds
            assert result[0]["lower_bound"] is None
            assert result[0]["window_size"] == 5


def test_recommend_threshold_with_consolidation_down(threshold_recommender, sample_timestamps):
    """Test full threshold recommendation with consolidation for down direction."""
    # Create values that result in similar thresholds across time periods
    values = []
    for i in range(len(sample_timestamps)):
        hour = (i // 60) % 24
        if hour < 6:
            values.append(25)  # Night: around 25
        elif hour < 12:
            values.append(23)  # Morning: around 23
        elif hour < 18:
            values.append(27)  # Afternoon: around 27
        else:
            values.append(24)  # Evening: around 24

    with patch.object(threshold_recommender.period_detector, "detect") as mock_detect:
        mock_detect.return_value = True  # Daily periodicity detected

        with patch.object(threshold_recommender, "threshold_recommendation_with_sliding_window") as mock_sliding_window:
            # Return very similar thresholds for all time periods (within 10%)
            mock_sliding_window.side_effect = [(24.5, 3), (23.5, 3), (25.5, 3), (24.0, 3)] * 2

            result = threshold_recommender.recommend_threshold(
                timestamp_list=sample_timestamps[:1000],
                value_list=values[:1000],
                default_window_size=5,
                time_split=True,
                auto_window_adjust=False,
                min_value=0.0,
                max_value=100.0,
                normal_threshold=None,
                min_ts_length=50,
                direction="down",
            )

            # Should consolidate to single group since thresholds are close (23.5-25.5, diff=2, 2/25.5=7.8% < 10%)
            assert len(result) == 1
            assert result[0]["start_hour"] == 0
            assert result[0]["end_hour"] == 24
            assert result[0]["upper_bound"] is None
            assert result[0]["lower_bound"] == 23.5  # Min value for down direction
            assert result[0]["window_size"] == 3


def test_recommend_threshold_no_consolidation_different_thresholds(
    threshold_recommender, sample_timestamps, sample_values_periodic
):
    """Test full threshold recommendation without consolidation due to different thresholds."""
    with patch.object(threshold_recommender.period_detector, "detect") as mock_detect:
        mock_detect.return_value = True  # Daily periodicity detected

        with patch.object(threshold_recommender, "threshold_recommendation_with_sliding_window") as mock_sliding_window:
            # Return significantly different thresholds (more than 10% difference)
            mock_sliding_window.side_effect = [(60.0, 5), (80.0, 5), (100.0, 5), (70.0, 5)] * 2

            result = threshold_recommender.recommend_threshold(
                timestamp_list=sample_timestamps[:1000],
                value_list=sample_values_periodic[:1000],
                default_window_size=5,
                time_split=True,
                auto_window_adjust=False,
                min_value=0.0,
                max_value=100.0,
                normal_threshold=None,
                min_ts_length=50,
                direction="up",
            )

            # Should NOT consolidate since thresholds vary significantly (60-100, diff=40, 40/100=40% > 10%)
            assert len(result) == 4  # Should return all 4 time periods


def test_recommend_general_threshold_basic(threshold_recommender):
    """Test basic threshold recommendation."""
    timestamps = [1640995200.0 + i * 60 for i in range(100)]
    # Create values with some outliers
    values = [50.0] * 80 + [100.0] * 20  # 80 normal values, 20 outliers

    with patch("builtins.print"):  # Suppress print statements
        result = threshold_recommender.recommend_general_threshold(
            timestamp_list_original=timestamps,
            value_list_original=values,
            window_size=5,
            ignore_count=1,
            min_value=0.0,
            max_value=200.0,
            direction="up",
        )

        # Should return success status and a valid threshold
        assert result["status"] is True
        result["threshold"]
        assert isinstance(result["threshold"], (int, float))


def test_recommend_general_threshold_direction_down(threshold_recommender):
    """Test threshold recommendation for direction='down'."""
    timestamps = [1640995200.0 + i * 60 for i in range(100)]
    # Create values with some low outliers
    values = [50.0] * 80 + [10.0] * 20  # 80 normal values, 20 low outliers

    with patch("builtins.print"):  # Suppress print statements
        result = threshold_recommender.recommend_general_threshold(
            timestamp_list_original=timestamps,
            value_list_original=values,
            window_size=5,
            ignore_count=1,
            min_value=0.0,
            max_value=100.0,
            direction="down",
        )

        # Should return success status and a valid threshold
        assert result["status"] is True
        result["threshold"]
        assert isinstance(result["threshold"], (int, float))


def test_recommend_general_threshold_zero_interval(threshold_recommender):
    """Test threshold recommendation with zero time interval."""
    timestamps = [1640995200.0] * 100  # All same timestamp
    values = [50.0] * 100

    with patch("builtins.print"):  # Suppress print statements
        result = threshold_recommender.recommend_general_threshold(
            timestamp_list_original=timestamps,
            value_list_original=values,
            window_size=5,
            ignore_count=1,
            min_value=0.0,
            max_value=100.0,
            direction="up",
        )

        # Should return failure status for invalid interval
        assert result["status"] is False


def test_recommend_general_threshold_no_clusters(threshold_recommender):
    """Test threshold recommendation when DBSCAN finds no clusters."""
    timestamps = [1640995200.0 + i * 60 for i in range(10)]  # Very short series
    values = [float(i) for i in range(10)]  # All different values

    with patch("builtins.print"):  # Suppress print statements
        with patch(
            "veaiops.algorithm.intelligent_threshold.threshold_recommendation_algorithm.DBSCAN1D"
        ) as mock_dbscan:
            mock_clustering = MagicMock()
            mock_clustering.labels_ = None
            mock_dbscan.return_value.fit.return_value = mock_clustering

            result = threshold_recommender.recommend_general_threshold(
                timestamp_list_original=timestamps,
                value_list_original=values,
                window_size=5,
                ignore_count=1,
                min_value=0.0,
                max_value=100.0,
                direction="up",
            )

            # Should return failure status when no clusters found
            assert result["status"] is False


def test_recommend_general_threshold_with_abnormals(threshold_recommender):
    """Test threshold recommendation with abnormal periods."""
    timestamps = [1640995200.0 + i * 60 for i in range(200)]

    # Create a pattern with normal values and abnormal spikes
    values = []
    for i in range(200):
        if 50 <= i < 60:  # Abnormal period 1
            values.append(100.0)
        elif 150 <= i < 160:  # Abnormal period 2
            values.append(95.0)
        else:
            values.append(50.0)  # Normal values

    with patch("builtins.print"):  # Suppress print statements
        result = threshold_recommender.recommend_general_threshold(
            timestamp_list_original=timestamps,
            value_list_original=values,
            window_size=5,
            ignore_count=1,  # Ignore one abnormal period
            min_value=0.0,
            max_value=200.0,
            direction="up",
        )

        # Should return success and account for abnormal periods
        assert result["status"] is True
        threshold = result["threshold"]
        threshold = result["threshold"]
        assert threshold > 50.0
        assert threshold < 200.0


def test_recommend_general_threshold_empty_data(threshold_recommender):
    """Test threshold recommendation with empty data."""
    import warnings

    with patch("builtins.print"), warnings.catch_warnings():  # Suppress print statements and warnings
        warnings.simplefilter("ignore", RuntimeWarning)  # Ignore NumPy warnings
        try:
            result = threshold_recommender.recommend_general_threshold(
                timestamp_list_original=[],
                value_list_original=[],
                window_size=5,
                ignore_count=1,
                min_value=0.0,
                max_value=100.0,
                direction="up",
            )
            # Should handle empty data gracefully with failure status
            assert result["status"] is False
        except (ValueError, IndexError):
            # Empty data might raise exceptions, which is acceptable
            pass


def test_recommend_general_threshold_single_value(threshold_recommender):
    """Test threshold recommendation with single data point."""
    import warnings

    with patch("builtins.print"), warnings.catch_warnings():  # Suppress print statements and warnings
        warnings.simplefilter("ignore", RuntimeWarning)  # Ignore NumPy warnings
        try:
            result = threshold_recommender.recommend_general_threshold(
                timestamp_list_original=[1640995200],
                value_list_original=[50.0],
                window_size=5,
                ignore_count=1,
                min_value=0.0,
                max_value=100.0,
                direction="up",
            )
            # Should handle single value gracefully with failure status
            assert result["status"] is False
        except (ValueError, IndexError):
            # Single value might raise exceptions, which is acceptable
            pass


def test_recommend_general_threshold_no_valid_clusters_fallback(threshold_recommender):
    """Test threshold recommendation fallback when no valid clusters are found."""
    timestamps = [1640995200.0 + i * 60 for i in range(50)]
    # Create highly dispersed values that won't form valid clusters
    values = [float(i * 10) for i in range(50)]  # 0, 10, 20, ..., 490 - all different

    with patch("builtins.print"):  # Suppress print statements
        # Test up direction
        result = threshold_recommender.recommend_general_threshold(
            timestamp_list_original=timestamps,
            value_list_original=values,
            window_size=5,
            ignore_count=1,
            min_value=0.0,
            max_value=1000.0,
            direction="up",
        )

        # Should use fallback strategy and return success
        assert result["status"] is True
        threshold = result["threshold"]
        assert threshold > 0  # Should be positive
        # Should be around 95th percentile * 1.2
        expected_baseline = float(np.percentile(values, 95))
        expected_threshold = expected_baseline * 1.2
        assert abs(threshold - expected_threshold) < 1e-6

        # Test down direction
        result = threshold_recommender.recommend_general_threshold(
            timestamp_list_original=timestamps,
            value_list_original=values,
            window_size=5,
            ignore_count=1,
            min_value=0.0,
            max_value=1000.0,
            direction="down",
        )

        # Should use fallback strategy and return success
        assert result["status"] is True
        threshold = result["threshold"]
        assert threshold >= 0  # Should be non-negative
        # For down direction, the logic uses negated values, then takes 95th percentile of negated values
        # which corresponds to 5th percentile of original values, then converts back
        negated_values = [-v for v in values]
        baseline = float(np.percentile(negated_values, 95))  # Max of negated values
        final_threshold = 0 - baseline  # Convert back to positive (this will be negative of min original value)
        expected_threshold = final_threshold / 1.2
        assert abs(threshold - expected_threshold) < 1e-6


def test_recommend_general_threshold_constant_values_fallback(threshold_recommender):
    """Test threshold recommendation fallback with constant values."""
    timestamps = [1640995200.0 + i * 60 for i in range(100)]
    values = [50.0] * 100  # All same values

    with patch("builtins.print"):  # Suppress print statements
        # Test up direction
        result = threshold_recommender.recommend_general_threshold(
            timestamp_list_original=timestamps,
            value_list_original=values,
            window_size=5,
            ignore_count=1,
            min_value=0.0,
            max_value=200.0,
            direction="up",
        )

        # Should handle constant values gracefully
        assert result["status"] is True
        threshold = result["threshold"]
        assert threshold > 0
        # For constant values, 95th percentile should be the constant value
        expected_threshold = 50.0 * 1.2
        assert abs(threshold - expected_threshold) < 1e-6

        # Test down direction
        result = threshold_recommender.recommend_general_threshold(
            timestamp_list_original=timestamps,
            value_list_original=values,
            window_size=5,
            ignore_count=1,
            min_value=0.0,
            max_value=200.0,
            direction="down",
        )

        # Should handle constant values gracefully
        assert result["status"] is True
        threshold = result["threshold"]
        assert threshold >= 0
        # For constant values with down direction, negated values are all -50.0
        # 95th percentile of negated values is -50.0, convert back: 0 - (-50.0) = 50.0
        expected_threshold = 50.0 / 1.2
        assert abs(threshold - expected_threshold) < 1e-6
