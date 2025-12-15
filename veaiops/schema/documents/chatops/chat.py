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
import json
from datetime import datetime
from typing import Annotated, Optional

from beanie import Document, Indexed, Insert, Replace, Update, before_event
from lark_oapi.api.im.v1 import LinkChatRequest, LinkChatRequestBody, LinkChatResponse
from pydantic import Field
from pymongo import IndexModel

from veaiops.cache import get_bot_client
from veaiops.schema.types import ChannelType
from veaiops.utils.log import logger


class Chat(Document):
    """Chat session data model."""

    # Message source channel
    channel: ChannelType = Field(..., description="Channel", exclude=True)
    # BotID
    bot_id: Annotated[str, Indexed()] = Field(..., description="BotID", exclude=True)
    # ChatID, aka. SessionID
    chat_id: Annotated[str, Indexed()] = Field(..., description="ChatID, aka. SessionID")
    # Chat name
    name: str = Field(..., description="Name of the chat session")
    # Chat start time
    start_time: Optional[datetime] = Field(default=None, description="The timestamp when the chat was start.")
    is_active: Annotated[bool, Indexed()] = Field(
        default=True, description="Indicates if the chat is active.", exclude=True
    )

    # Link to the chat, if available
    chat_link: Optional[str] = Field(default=None, description="The chat link.")

    # Whether to enable proactive replies from function calls
    enable_func_proactive_reply: bool = Field(
        default=True, description="Whether to enable proactive replies from function calls."
    )
    # Whether to enable interest detection
    enable_func_interest: bool = Field(default=True, description="Whether to enable interest detection.")

    class Settings:
        """Create compound index for idempotence using bot_id + chat_id."""

        name = "veaiops__chatops_chat"
        indexes = [IndexModel(["channel", "bot_id", "chat_id"], unique=True)]

    @before_event(Insert, Replace, Update)
    async def set_chat_link(self):
        """Set chat link before inserting or replacing the document."""
        if self.chat_link:
            return self.chat_link

        match self.channel:
            case ChannelType.Lark:
                cli = await get_bot_client(bot_id=self.bot_id, channel=ChannelType.Lark)
                if not cli:
                    logger.error(f"bot_id: {self.bot_id} client for lark not exist, can not generate chat link")
                    return

                request: LinkChatRequest = (
                    LinkChatRequest.builder()
                    .chat_id(self.chat_id)
                    .request_body(LinkChatRequestBody.builder().validity_period("permanently").build())
                    .build()
                )

                # Send the request
                response: LinkChatResponse = cli.im.v1.chat.link(request)

                # Handle failure response
                if not response.success():
                    logger.error(f"client.im.v1.chat.link failed, code: {response.code}, msg: {response.msg}")
                    return

                # Handle the business result
                data_object = json.loads(response.raw.content).get("data", {})
                self.chat_link = data_object.get("share_link")
            case _:
                raise NotImplementedError(f"Channel {self.channel} not supported for chat link generation.")
        return self.chat_link
