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

from typing import List, Optional

from beanie import PydanticObjectId
from pydantic import Field
from pymongo import IndexModel

from veaiops.schema.base import MetricThresholdResult
from veaiops.schema.documents.config.base import BaseDocument
from veaiops.schema.models.template.metric import MetricTemplateValue
from veaiops.schema.types import IntelligentThresholdDirection, IntelligentThresholdTaskStatus


class IntelligentThresholdTaskVersion(BaseDocument):
    """Intelligent threshold task version document."""

    task_id: PydanticObjectId = Field(..., description="Task ID")
    metric_template_value: MetricTemplateValue = Field(..., description="Metric template value")
    n_count: int = Field(..., description="NCount")
    direction: IntelligentThresholdDirection = Field(
        ..., description="Direction for threshold calculation: up, down, or both"
    )
    sensitivity: float = Field(0.5, description="Sensitivity for threshold calculation")
    status: IntelligentThresholdTaskStatus = Field(..., description="Task status")
    error_message: Optional[str] = Field(None, description="Error message if any")
    version: int = Field(..., description="Version number")
    result: Optional[List[MetricThresholdResult]] = Field(None, description="Threshold results")

    class Settings:
        """Settings for the IntelligentThresholdTaskVersion document."""

        name = "veaiops__intelligent_threshold_task_version"
        populate_by_name = True
        indexes = [
            IndexModel(
                [("task_id", 1), ("version", 1)],
                name="task_version_unique_index",
                unique=True,
            ),
        ]
