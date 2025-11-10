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

from typing import Any, Literal, Optional

from pydantic import BaseModel, Field

from veaiops.schema.types import ChannelType


class LarkUrl(BaseModel):
    """Lark url."""

    pc_url: str = Field(default="")
    ios_url: str = Field(default="")
    android_url: str = Field(default="")
    url: str = Field(default="")


class TemplateVariable(BaseModel):
    """Template card variable. if template card need more variables. should add it here."""

    background_color: Literal["blue", "wathet", "turquoise", "green", "yellow", "orange", "red", ""] = Field(default="")
    class_title: str = Field(default="")
    chat_id: str = Field(...)
    event_id: str = Field(...)
    feedback: str = Field(default="")
    button_name: str
    button_link: LarkUrl = Field(default_factory=LarkUrl)
    button_action: Literal["public", "redirect", "handle"]
    button_disable: bool = False
    analysis: str = Field(...)


class ChannelMsg(BaseModel):
    """Msg content."""

    channel: ChannelType = Field(..., description="The channel type for the message.")
    template_id: Optional[str] = Field(default=None, description="The template ID for the message.")
    template_variables: Optional[TemplateVariable | Any] = Field(
        None, description="The variables for the message template."
    )
