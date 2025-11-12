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

from datetime import timedelta
from typing import Optional

from pydantic import BaseModel, Field

from veaiops.schema.types import EventLevel, InterestActionType, InterestInspectType


class InterestPayload(BaseModel):
    """Interest rule Update payload."""

    is_active: Optional[bool] = Field(default=None, description="Active status of interest rule.")
    level: Optional[EventLevel] = Field(None, description="Level of event")
    silence_delta: Optional[timedelta] = Field(None, description="time delta between two alarms")
    name: Optional[str] = Field(None, description="Name of interest rule")
    description: Optional[str] = Field(None, description="Description of interest rule")
    examples_positive: Optional[list[str]] = Field(
        None, description="Examples of positive for Semantic InterestInspectType rule"
    )
    examples_negative: Optional[list[str]] = Field(
        None, description="Examples of negative for Semantic InterestInspectType rule"
    )
    regular_expression: Optional[str] = Field(None, description="Regular expression for RE InterestInspectType rule")
    inspect_history: int = Field(
        default=1, ge=0, description="History messages need to detect, 0 means all history messages"
    )


class CreateInterestPayload(InterestPayload):
    """Interest rule created payload."""

    action_category: InterestActionType
    inspect_category: InterestInspectType
