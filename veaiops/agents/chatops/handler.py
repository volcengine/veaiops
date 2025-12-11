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

from veaiops.schema.documents import Bot, Chat, Message
from veaiops.schema.types import ChatType
from veaiops.utils.log import logger

from .data_agent import run_data_agent
from .interest import run_interest_detect_agent
from .proactive import run_proactive_reply_agent
from .reactive import run_reactive_reply_agent
from .review import run_review_agent


async def chatops_agents_handler(msg: Message) -> None:
    """Handle chat operations for agents.

    Args:
        msg (Message): The incoming message object.
    """
    bot_id = msg.bot_id
    channel = msg.channel
    chat_id = msg.chat_id
    logger.info(f"Start initializing interest agent for bot_id={bot_id}, channel={channel}, chat_id={chat_id}")
    bot = await Bot.find_one(Bot.bot_id == bot_id, Bot.channel == channel)
    if not bot:
        logger.error(f"Bot with bot_id={bot_id} and channel={channel} not found. Skipping message handling.")
        return

    chat = await Chat.find_one(Chat.chat_id == chat_id, Chat.bot_id == bot_id, Chat.channel == channel)
    if not chat:
        logger.error(
            f"Chat with chat_id={chat_id}, bot_id={bot_id}, and channel={channel} not found. Skipping message handling."
        )
        return

    if msg.chat_type == ChatType.P2P:
        logger.info("Starting data agent with a p2p chat type...")
        data_agent_task = asyncio.create_task(run_data_agent(bot=bot, msg=msg))
        data_agent_task.set_name("DataAgentTask")
        data_agent_task.add_done_callback(lambda t: logger.info("Data agent task completed."))

    elif msg.chat_type == ChatType.Group:
        if chat.enable_func_interest:
            logger.info("Starting interest detection agent...")
            interest_detect_task = asyncio.create_task(run_interest_detect_agent(bot=bot, msg=msg))
            interest_detect_task.set_name("InterestDetectAgentTask")
            interest_detect_task.add_done_callback(lambda t: logger.info("Interest detection agent task completed."))

        if msg.is_mentioned:
            logger.info("Starting reactive reply agent...")
            reactive_reply_task = asyncio.create_task(run_reactive_reply_agent(bot=bot, msg=msg))
            reactive_reply_task.set_name("ReactiveReplyAgentTask")
            reactive_reply_task.add_done_callback(lambda t: logger.info("Reactive reply agent task completed."))

        elif chat.enable_func_proactive_reply:
            logger.info("Starting proactive reply agent...")
            proactive_reply_task = asyncio.create_task(run_proactive_reply_agent(bot=bot, msg=msg))
            proactive_reply_task.set_name("ProactiveReplyAgentTask")
            proactive_reply_task.add_done_callback(lambda t: logger.info("Proactive reply agent task completed."))

        logger.info("Starting review agent...")
        review_task = asyncio.create_task(run_review_agent(bot=bot, msg=msg))
        review_task.set_name("ReviewAgentTask")
        review_task.add_done_callback(lambda t: logger.info("Review agent task completed."))

    logger.info(f"Handling message: {msg.msg_id}")
