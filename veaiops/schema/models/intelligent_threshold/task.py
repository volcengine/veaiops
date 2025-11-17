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

from datetime import datetime
from typing import List, Optional

from beanie import PydanticObjectId
from pydantic import BaseModel, ConfigDict, Field

from veaiops.schema.base import MetricThresholdResult
from veaiops.schema.documents import IntelligentThresholdTaskVersion
from veaiops.schema.models.template import MetricTemplateValue
from veaiops.schema.types import (
    DataSourceType,
    IntelligentThresholdDirection,
    IntelligentThresholdTaskStatus,
    TaskPriority,
)


class CreateIntelligentThresholdTaskPayload(BaseModel):
    """API request model for creating an intelligent threshold task."""

    model_config = ConfigDict(populate_by_name=True)

    # Fields for IntelligentThresholdTask
    task_name: str = Field(..., description="Task name")
    datasource_id: PydanticObjectId = Field(..., description="Datasource ID")
    datasource_type: DataSourceType = Field(..., description="Datasource type")
    auto_update: bool = Field(default=False, description="Auto update")
    projects: List[str] = Field(default_factory=list, description="List of project names")
    direction: IntelligentThresholdDirection = Field(
        ..., description="Direction for threshold calculation: up, down, or both"
    )
    sensitivity: float = Field(..., ge=0, le=1, description="Sensitivity for threshold calculation")

    # Fields for IntelligentThresholdTaskVersion
    metric_template_value: MetricTemplateValue = Field(..., description="Metric template value")
    n_count: int = Field(..., description="NCount")


class IntelligentThresholdTaskDetail(BaseModel):
    """API response model for retrieving an intelligent threshold task with its latest version."""

    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)

    id: PydanticObjectId = Field(..., alias="_id")
    task_name: str
    datasource_id: PydanticObjectId
    datasource_type: DataSourceType
    auto_update: Optional[bool]
    projects: Optional[List[str]] = Field(default_factory=list)
    products: Optional[List[str]] = Field(default_factory=list)
    customers: Optional[List[str]] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime
    latest_version: Optional[IntelligentThresholdTaskVersion] = None


class BaseIntelligentThresholdTaskPayload(BaseModel):
    """Base API request model for intelligent threshold tasks."""

    model_config = ConfigDict(populate_by_name=True)

    task_id: PydanticObjectId = Field(..., description="Task ID")
    metric_template_value: MetricTemplateValue = Field(..., description="Metric template value")
    n_count: int = Field(..., ge=1, description="NCount")
    direction: IntelligentThresholdDirection = Field(
        ..., description="Direction for threshold calculation: up, down, or both"
    )
    sensitivity: float = Field(..., ge=0, le=1, description="Sensitivity for threshold calculation")
    task_priority: TaskPriority = Field(default=TaskPriority.NORMAL, description="Task priority level")


class RerunIntelligentThresholdTaskPayload(BaseIntelligentThresholdTaskPayload):
    """API request model for rerunning an intelligent threshold task."""


class IntelligentThresholdMCPPayload(BaseIntelligentThresholdTaskPayload):
    """API request model for calculating intelligent threshold task."""

    task_version: int = Field(..., ge=1, description="Task version")
    datasource_id: PydanticObjectId = Field(..., description="Datasource ID")


class UpdateTaskResultPayload(BaseModel):
    """Request model for updating task results."""

    task_id: PydanticObjectId = Field(..., description="Task ID")
    task_version: int = Field(..., description="Task version")
    status: IntelligentThresholdTaskStatus = Field(..., description="Task status")
    results: Optional[List[MetricThresholdResult]] = Field(None, description="Algorithm results")
    error_message: Optional[str] = Field(None, description="Error message if any")


class UpdateAutoRefreshSwitchPayload(BaseModel):
    """Payload model for updating auto_update field of tasks."""

    task_ids: List[PydanticObjectId] = Field(..., description="List of task IDs to update")
    auto_update: bool = Field(..., description="Auto update switch value")
