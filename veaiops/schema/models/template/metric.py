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

from typing import Optional

from pydantic import BaseModel, Field

from veaiops.schema.types import MetricType


class MetricTemplateValue(BaseModel):
    """Metric Template value model for embedding."""

    name: str = Field(default="default_metric", description="Template Name")
    metric_type: MetricType = Field(default=MetricType.Count, description="Metric Type")
    min_step: float = Field(default=1.0, description="Minimum Step")
    max_value: Optional[float] = Field(default=100.0, description="Maximum Value")
    min_value: Optional[float] = Field(default=0.0, description="Minimum Value")
    min_violation: float = Field(default=1.0, description="Minimum Violation Value")
    min_violation_ratio: float = Field(default=0.01, description="Minimum Violation Ratio")
    normal_range_start: Optional[float] = Field(default=None, description="Normal Range Start")
    normal_range_end: Optional[float] = Field(default=None, description="Normal Range End")
    missing_value: Optional[str] = Field(default=None, description="Fill Value for Missing Data")
    failure_interval_expectation: int = Field(default=300, description="Single Anomaly Elimination Period")
    display_unit: str = Field(default="count", description="Display Unit")
    linear_scale: float = Field(default=1.0, description="Display Coefficient")
    max_time_gap: int = Field(default=3600, description="Maximum Time Gap with No Data")
    min_ts_length: int = Field(default=100, description="Minimum Time Series Length")
