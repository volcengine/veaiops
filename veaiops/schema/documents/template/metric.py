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

from typing import Annotated, Any, Dict, Optional

from beanie import Indexed
from pydantic import Field
from pymongo import IndexModel

from veaiops.schema.documents.config.base import BaseConfigDocument
from veaiops.schema.types import MetricType


class MetricTemplate(BaseConfigDocument):
    """Metric Template."""

    name: Annotated[str, Indexed()] = Field(..., description="Template Name")
    metric_type: MetricType = Field(..., description="Metric Type")
    min_step: float = Field(..., description="Minimum Step")
    max_value: Optional[float] = Field(None, description="Maximum Value")
    min_value: Optional[float] = Field(None, description="Minimum Value")
    min_violation: float = Field(..., description="Minimum Violation Value")
    min_violation_ratio: float = Field(..., description="Minimum Violation Ratio")
    normal_range_start: Optional[float] = Field(None, description="Normal Range Start")
    normal_range_end: Optional[float] = Field(None, description="Normal Range End")
    missing_value: Optional[str] = Field(None, description="Fill Value for Missing Data")
    failure_interval_expectation: int = Field(..., description="Single Anomaly Elimination Period")
    display_unit: str = Field(..., description="Display Unit")
    linear_scale: float = Field(..., description="Display Coefficient")
    max_time_gap: int = Field(..., description="Maximum Time Gap with No Data")
    min_ts_length: int = Field(..., description="Minimum Time Series Length")

    @classmethod
    def validate_update_fields(cls, update_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate fields and remove unallowed fields."""
        allowed_fields = {
            "name",
            "metric_type",
            "min_step",
            "max_value",
            "min_value",
            "min_violation",
            "min_violation_ratio",
            "normal_range_start",
            "normal_range_end",
            "missing_value",
            "failure_interval_expectation",
            "display_unit",
            "linear_scale",
            "max_time_gap",
            "min_ts_length",
        }
        filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields and v is not None}
        return filtered_data

    class Settings:
        """Create unique index for name and metric_type for active documents."""

        name = "veaiops__config_metric_template"
        indexes = [
            IndexModel(
                [("name", 1), ("metric_type", 1)],
                unique=True,
            ),
        ]
