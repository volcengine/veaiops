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


from typing import List

from beanie.operators import NE
from google.genai.types import Content, Part
from veadk import Runner

from veaiops.agents.chatops.memory.short_term_memory import STM_SESSION_SVC
from veaiops.schema.documents import AgentNotification, Bot, Message
from veaiops.schema.models.chatops import AgentReplyResp, Citation, ProactiveReply
from veaiops.schema.types import AgentType
from veaiops.utils.crypto import decrypt_secret_value
from veaiops.utils.embedding import embedding_create
from veaiops.utils.log import logger
from veaiops.utils.message import get_backward_chat_messages, get_latest_user_message
from veaiops.utils.webhook import send_bot_notification

from .analysis_agent import ANALYSIS_AGENT_NAME, AnalysisResult
from .proactive_agent import KB_AGENT_NAME, PROACTIVE_AGENT_NAME, init_proactive_agent
from .rewrite_agent import REWRITE_AGENT_NAME, RewriteResult

SIM_THRESHOLD = 0.7
INSPECT_HISTORY_THRESHOLD = 20


async def calc_embs_similarity(embedding: List[float], target_embs: List[List[float]]) -> float:
    """Calculate the similarity between the given embedding and the message.

    Args:
        embedding (List[float]): Embedding vector of the target answer.
        target_embs (List[List[float]]): List of embedding vectors to compare against.

    Returns:
        float: Similarity score.
    """
    max_sim = 0.0
    for target_emb in target_embs:
        if not target_emb:
            continue
        # compute cosine similarity
        from numpy import dot
        from numpy.linalg import norm

        num = dot(embedding, target_emb)
        den = norm(embedding) * norm(target_emb)
        if den == 0:
            continue

        cos_sim = num / den
        if cos_sim > max_sim:
            max_sim = cos_sim

    return float(max_sim)


async def run_proactive_reply_agent(bot: Bot, msg: Message) -> None:
    """Run proactive reply agent for the given bot and message.

    Args:
        bot (Bot): The bot instance.
        msg (Message): The message to process.
    """
    app_name = PROACTIVE_AGENT_NAME
    user_id = bot.bot_id
    session_id = msg.msg_id
    bot_id = bot.bot_id

    logger.info(f"Start initializing proactive reply agent for bot_id={bot_id}, chat_id={msg.chat_id}")

    reorged_msgs = await get_backward_chat_messages(inspect_history=INSPECT_HISTORY_THRESHOLD, msg=msg)

    # Edit new user message
    latest_msgs_tag = [Part(text="最新消息内容：\n")]
    hist_msgs_tag = [Part(text="\n\n历史消息内容：\n\n")]
    last_user_msgs = await get_latest_user_message(msg=msg)

    _message = hist_msgs_tag + reorged_msgs + latest_msgs_tag + last_user_msgs
    message = Content(parts=_message, role="user")
    ProactiveAgent = await init_proactive_agent(bot=bot, name=app_name, msg=msg)
    runner = Runner(app_name=app_name, user_id=user_id, agent=ProactiveAgent, session_service=STM_SESSION_SVC)

    citations = []
    analysis_result = None
    rewrite_query = None
    try:
        async for event in runner.run_async(user_id=user_id, session_id=session_id, new_message=message):
            logger.debug(event)
            if (
                event.is_final_response()
                and event.content
                and event.content.parts
                and event.content.parts[0]
                and event.content.parts[0].text
            ):
                event_content = event.content.parts[0].text.strip()
                logger.debug(event_content)
                if event.author == KB_AGENT_NAME:
                    citations = [Citation.model_validate_json(i.text) for i in event.content.parts]

                elif event.author == ANALYSIS_AGENT_NAME:
                    analysis_result = AnalysisResult.model_validate_json(event.content.parts[0].text.strip())

                elif event.author == REWRITE_AGENT_NAME:
                    rewrite_query = RewriteResult.model_validate_json(event.content.parts[0].text.strip())
    except ExceptionGroup as e:
        e_str = "\n".join(
            [
                f"ErrCode {getattr(i, 'status_code', 'N/A')}: ErrMsg {getattr(i, 'message', str(i))}"
                for i in e.exceptions
            ]
        )
        logger.error(f"ExceptionGroup running proactive reply agent: {e_str}")

    except Exception as e:
        logger.error(f"Error running proactive reply agent: {e}")
        return

    # embedding
    answer_embedding = None
    query_embedding = None
    answer_sim = 0.0
    is_first_answer = False
    if analysis_result and analysis_result.is_answerable is True and analysis_result.answer:
        embeddings = await embedding_create(
            api_key=decrypt_secret_value(bot.agent_cfg.api_key),
            base_url=bot.agent_cfg.api_base,
            model=bot.agent_cfg.embedding_name,
            raw_input=[analysis_result.answer],
        )
        answer_embedding = embeddings[0].embedding

        similar_msgs = await Message.find(
            Message.chat_id == msg.chat_id,
            NE(Message.msg_id, msg.msg_id),
            NE(Message.proactive_reply.answer_embedding, None),
        ).to_list()

        _embeddings = [sim_msg.proactive_reply.answer_embedding for sim_msg in similar_msgs if sim_msg.proactive_reply]
        _embeddings = [emb for emb in _embeddings if emb]
        answer_sim = await calc_embs_similarity(embedding=answer_embedding, target_embs=_embeddings)
        if answer_sim < SIM_THRESHOLD:
            is_first_answer = True

    if is_first_answer and analysis_result and isinstance(analysis_result.answer, str):
        logger.info(f"Proactive reply agent completed and sent for bot_id={bot_id}, chat_id={msg.chat_id}")
        # Construct Agent notification
        notification = AgentNotification(
            bot_id=bot_id,
            channel=msg.channel,
            chat_id=msg.chat_id,
            agent_type=AgentType.CHATOPS_PROACTIVE_REPLY,
            msg_id=msg.msg_id,
            data=AgentReplyResp(response=analysis_result.answer, citations=citations),
        )

        # Send webhook notification
        await notification.save()
        await send_bot_notification(bot=bot, data=notification)

    if rewrite_query and rewrite_query.overall_query:
        # Check if overall query is similar to historical questions

        embeddings = await embedding_create(
            api_key=decrypt_secret_value(bot.agent_cfg.api_key),
            base_url=bot.agent_cfg.api_base,
            model=bot.agent_cfg.embedding_name,
            raw_input=[rewrite_query.overall_query],
        )
        query_embedding = embeddings[0].embedding

        similar_msgs = await Message.find(
            Message.chat_id == msg.chat_id,
            NE(Message.msg_id, msg.msg_id),
            NE(Message.proactive_reply.query_embedding, None),
        ).to_list()

        _embeddings = [sim_msg.proactive_reply.query_embedding for sim_msg in similar_msgs if sim_msg.proactive_reply]
        _embeddings = [emb for emb in _embeddings if emb]
        query_sim = await calc_embs_similarity(embedding=query_embedding, target_embs=_embeddings)
        if query_sim < SIM_THRESHOLD:
            is_first_query = True  # This query is the first time asked
        else:
            is_first_query = False

        proactive_reply = ProactiveReply(
            answer=analysis_result.answer if analysis_result else None,
            rewrite_query=rewrite_query.overall_query,
            rewrite_sub_queries=rewrite_query.sub_queries,
            citations=citations,
            answer_embedding=answer_embedding,
            query_embedding=query_embedding,
            answer_similarity=answer_sim,
            query_similarity=query_sim,
            is_first_answer=is_first_answer,
            is_first_query=is_first_query,
            review_status="pending",
        )
        await msg.set({Message.proactive_reply: proactive_reply})
        logger.info("Proactive reply data saved to message database.")
