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

from typing import Dict

from pydantic import BaseModel, Field
from veadk import Agent

from veaiops.agents.chatops.instructions.text2query import load_text2query_instruction
from veaiops.schema.documents import Bot
from veaiops.utils.crypto import decrypt_secret_value


class StructuredRequest(BaseModel):
    """Structured request schema for database queries."""

    collection: str = Field(..., description="The name of the collection to query")
    query: str = Field(..., description="text string to compare to document contents")
    filter: str = Field(..., description="logical condition statement for filtering documents")


async def init_text2query_agent(bot: Bot, schemas: Dict[str, str], user_query: str) -> Agent:
    """Initialize the text to query agent.

    Args:
        bot (Bot): The bot instance.
        schemas (Dict[str, str]): The schemas of the data sources.
        user_query (str): The user's query.

    Returns:
        Agent: The initialized text to query agent.
    """
    instruction = load_text2query_instruction(schemas, user_query)
    return Agent(
        name="TextToQueryAgent",
        description=instruction.description,
        instruction=instruction.instruction,
        output_schema=StructuredRequest,
        model_name=bot.agent_cfg.name,
        model_provider=bot.agent_cfg.provider,
        model_api_base=bot.agent_cfg.api_base,
        model_api_key=decrypt_secret_value(bot.agent_cfg.api_key),
    )
