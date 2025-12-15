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

import uuid
from datetime import timedelta
from typing import Annotated, Optional

from beanie import Indexed
from pydantic import Field, model_validator
from pymongo import IndexModel

from veaiops.schema.documents.config.base import BaseConfigDocument
from veaiops.schema.types import ChannelType, EventLevel, InterestActionType, InterestInspectType


class Interest(BaseConfigDocument):
    """Interest rule model."""

    name: str = Field(..., description="Name of the interest rule")
    description: str = Field(..., description="Description of the interest rule")
    uuid: str = Field(default_factory=lambda: str(uuid.uuid4()), exclude=True)
    examples_positive: Optional[list[str]] = Field(default=None, description="Examples of positive cases")
    examples_negative: Optional[list[str]] = Field(default=None, description="Examples of negative cases")
    action_category: InterestActionType = Field(..., description="Category of the action")
    inspect_category: InterestInspectType = Field(..., description="Category of the inspection")
    regular_expression: Optional[str] = Field(default=None, description="Regular expression rule for inspection")
    inspect_history: int = Field(default=1, ge=0, description="Number of records to inspect in history, 0 for all")
    # Metadata
    silence_delta: timedelta = Field(default=timedelta(hours=6), description="Time delta between two alarms")
    version: int = Field(default=1, description="Configuration version for tracking changes", exclude=True)
    level: Optional[EventLevel] = Field(default=None, description="Level of event")
    # Bot related attr.
    bot_id: Annotated[str, Indexed()] = Field(..., description="Bot ID", exclude=True)
    channel: ChannelType = Field(..., description="Channel", exclude=True)

    @model_validator(mode="after")
    def validate_regular_expression(self) -> "Interest":
        """Validate that regular_expression is provided when inspect_category is RE."""
        if self.inspect_category == InterestInspectType.RE and not self.regular_expression:
            raise ValueError("regular_expression must be provided when inspect_category is RE.")
        return self

    class Settings:
        """Create compound index for idempotence using bot_id + channel + interest name."""

        name = "veaiops__chatops_interest"
        indexes = [IndexModel(["bot_id", "channel", "name"], unique=True)]
