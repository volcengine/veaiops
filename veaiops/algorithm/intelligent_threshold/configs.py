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

"""Configuration constants for intelligent threshold algorithms.

This module contains all configuration constants and parameters used across
the intelligent threshold algorithm components.
"""

import os

import tzlocal

# =============================================================================
# Time Constants
# =============================================================================

# Basic time units in seconds
SECONDS_PER_MINUTE = 60
SECONDS_PER_HOUR = 3600
SECONDS_PER_DAY = 86400

# =============================================================================
# Timestamp Precision Thresholds
# =============================================================================

# Thresholds for detecting timestamp precision
NANOSECOND_THRESHOLD = 10**18
MICROSECOND_THRESHOLD = 10**15
MILLISECOND_THRESHOLD = 10**12

# =============================================================================
# Default Configuration
# =============================================================================

# Default timezone for time-based operations
DEFAULT_TIMEZONE = tzlocal.get_localzone_name()

# Default number of time split (default = 4)
DEFAULT_NUMBER_OF_TIME_SPLIT = int(os.getenv("DEFAULT_NUMBER_OF_TIME_SPLIT", 4))

# Maximum number of threshold blocks after merging (default = 8)
DEFAULT_MAXIMUM_THRESHOLD_BLOCKS = int(os.getenv("DEFAULT_MAXIMUM_THRESHOLD_BLOCKS", 8))

# =============================================================================
# Algorithm Parameters
# =============================================================================

# Mathematical constants
NEGATIVE_INFINITY = float("-inf")

# Default coefficient for threshold calculation
DEFAULT_COEFFICIENT = 1.2

# Extreme value threshold for data validation
EXTREME_VALUE_THRESHOLD = 1e50

# =============================================================================
# Data Analysis Configuration
# =============================================================================

# Historical data analysis period
HISTORICAL_DAYS = 7

# Time series data interval in seconds
TIMESERIES_DATA_INTERVAL = 60

# Minimum days required for analysis
MIN_DAYS_FOR_ANALYSIS = 2

# Minimum analysis period in days
MIN_ANALYSIS_PERIOD_DAYS = 7

# =============================================================================
# Period Detection Parameters
# =============================================================================

# Default correlation threshold for period detection
DEFAULT_CORRELATION_THRESHOLD = float(os.getenv("DEFAULT_CORRELATION_THRESHOLD", 0.3))

# Minimum data points per day for analysis
DEFAULT_MIN_DATA_POINTS_PER_DAY = 720

# Minimum common points required for correlation analysis
DEFAULT_MIN_COMMON_POINTS = 720

# =============================================================================
# Timeout Configuration
# =============================================================================

# Data fetch timeout in seconds (60 minutes for production)

FETCH_DATA_TIMEOUT = int(os.getenv("FETCH_DATA_TIMEOUT", 3600))
