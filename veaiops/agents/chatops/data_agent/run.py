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

import asyncio
from datetime import datetime
from typing import Any, Dict, List, cast

from google.genai.types import Content
from veadk import Agent, Runner

from veaiops.agents.chatops.data_agent.data_query import COLLECTIONS, init_data_query_agent
from veaiops.agents.chatops.memory import STM_SESSION_SVC, init_stm
from veaiops.schema.documents import (
    AgentNotification,
    Bot,
    Message,
    VeKB,
)
from veaiops.schema.models.chatops import AgentReplyResp
from veaiops.schema.types import AgentType, CitationType
from veaiops.utils.crypto import decrypt_secret_value
from veaiops.utils.kb import EnhancedVikingKBService, convert_viking_to_citations
from veaiops.utils.log import logger
from veaiops.utils.webhook import send_bot_notification

DATA_AGENT_NAME = "DataAgent"


DATA_AGENT_INSTRUCTION = """
You are a smart Data Agent. Your goal is to answer user questions by retrieving information.

You have access to:
1. `DataQueryAgent` (Sub-agent): Delegate tasks to this agent to query the database. It will generate a structured query plan and execute it.
2. `search_knowledge_base` (Tool): Search the knowledge base.

Process:
1. Analyze the user's request.
2. Determine if you need structured data (Database) or unstructured info (Knowledge Base).
3. If Database: Delegate to `DataQueryAgent`.
4. If Knowledge Base: Use `search_knowledge_base`.
5. Synthesize the information and answer the user.
"""  # noqa: E501


async def run_data_agent(bot: Bot, msg: Message) -> None:
    """Run data agent for the given bot and message.

    Args:
        bot (Bot): The bot instance.
        msg (Message): The message to process.
    """
    user_id = msg.msg_sender_id
    session_id = msg.chat_id

    async def search_knowledge_base(query: str) -> str:
        """Search the knowledge base for relevant information.

        Args:
            query: The search query.

        Returns:
            A string containing the search results.
        """
        vekbs = await VeKB.find(VeKB.bot_id == bot.bot_id, VeKB.channel == msg.channel).to_list()
        if not vekbs:
            return "No knowledge base configured for this channel."

        VIKING_KB = EnhancedVikingKBService(
            ak=decrypt_secret_value(bot.volc_cfg.ak),
            sk=decrypt_secret_value(bot.volc_cfg.sk),
        )

        rag_tasks = []
        for vekb in vekbs:
            try:
                collection = VIKING_KB.get_collection(collection_name=vekb.collection_name, project=vekb.project)
                rag_tasks.append(
                    VIKING_KB.async_search_knowledge(
                        collection_name=collection.collection_name, query=query, project=collection.project
                    )
                )
            except Exception as e:
                logger.error(f"Error getting collection for vekb {vekb}: {e}")
                continue

        if not rag_tasks:
            return "No valid knowledge base collections found."

        tasks_results = await asyncio.gather(*rag_tasks, return_exceptions=True)
        rag_results = cast(List[Dict[str, Any]], [r for r in tasks_results if not isinstance(r, Exception)])

        citations = convert_viking_to_citations(viking_returns=rag_results)
        kb_format_list = []
        for i, doc in enumerate(citations):
            update_time = datetime.fromtimestamp(doc.update_ts_seconds)
            if doc.citation_type == CitationType.Document:
                kb_format_list.append(
                    f"<doc>{i + 1}</doc>\n# {doc.title}\nDoc update time: {update_time}\n{doc.content}\n"
                )
            else:
                kb_format_list.append(f"<doc>{i + 1}</doc>\nDoc update time: {update_time}\n{doc.content.strip()}\n")

        return "\n\n".join(kb_format_list) if kb_format_list else "No relevant information found in knowledge base."

    STM = await init_stm(
        app_name=DATA_AGENT_NAME,
        user_id=user_id,
        session_id=session_id,
        state={
            "VOLCENGINE_ACCESS_KEY": decrypt_secret_value(bot.volc_cfg.ak),
            "VOLCENGINE_SECRET_KEY": decrypt_secret_value(bot.volc_cfg.sk),
            "BOT_ID": bot.bot_id,
            "AGENT_API_KEY": decrypt_secret_value(bot.agent_cfg.api_key),
        },
    )

    schemas = {}

    for name, collection in COLLECTIONS.items():
        model_schema = collection.model_json_schema()
        db_map = {}
        title = model_schema.get("title")
        defs = model_schema.get("$defs")
        description = model_schema.get("description")
        properties = model_schema.get("properties")
        properties.pop("_id") if "_id" in properties else None
        defs.pop("PydanticObjectId") if "PydanticObjectId" in defs else None
        if title:
            db_map["title"] = title
        else:
            continue

        if defs:
            db_map["$defs"] = defs
        if description:
            db_map["description"] = description
        if properties:
            db_map["properties"] = properties

        schemas[title] = db_map

    db_agent = await init_data_query_agent(bot, schemas)

    agent = Agent(
        name=DATA_AGENT_NAME,
        description="A data agent that can query database and knowledge base.",
        instruction=DATA_AGENT_INSTRUCTION,
        tools=[search_knowledge_base],
        sub_agents=[db_agent],
        short_term_memory=STM,
        model_name=bot.agent_cfg.name,
        model_provider=bot.agent_cfg.provider,
        model_api_base=bot.agent_cfg.api_base,
        model_api_key=decrypt_secret_value(bot.agent_cfg.api_key),
    )

    runner = Runner(
        app_name=DATA_AGENT_NAME,
        user_id=user_id,
        agent=agent,
        session_service=STM_SESSION_SVC,
    )

    agents_resp = "Sorry, I couldn't process your request."
    message_content = Content(parts=msg.msg_llm_compatible, role="user")

    try:
        async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=message_content):
            logger.debug(event)
            if (
                event.is_final_response()
                and event.content
                and event.content.parts
                and event.content.parts[0]
                and event.content.parts[0].text
            ):
                agents_resp = event.content.parts[0].text.strip()
    except Exception as e:
        logger.error(f"Error running DataAgent: {e}")
        return

    data = AgentReplyResp(response=agents_resp)
    notification = AgentNotification(
        bot_id=bot.bot_id,
        channel=msg.channel,
        chat_id=msg.chat_id,
        agent_type=AgentType.CHATOPS_REACTIVE_REPLY,
        msg_id=msg.msg_id,
        data=data,
    )

    await notification.save()
    await send_bot_notification(bot=bot, data=notification)
