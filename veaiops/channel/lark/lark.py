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
import json
from datetime import datetime
from typing import Any, Dict, List, Literal, Optional

import json_repair
import pillow_heif
from beanie import SortDirection
from beanie.odm.operators.find.comparison import In
from fastapi import BackgroundTasks
from fastapi.responses import JSONResponse
from google.genai.types import Blob, Part
from lark_oapi.api.im.v1 import GetChatRequest, GetChatResponse
from pydantic import BaseModel
from starlette_context import context

from veaiops.cache import get_bot_client
from veaiops.schema.base import TemplateVariable
from veaiops.schema.documents import Bot, Chat, Event, EventNoticeDetail, EventNoticeFeedback, Message
from veaiops.schema.models.chatops import Mention
from veaiops.schema.types import (
    AgentType,
    ChannelType,
    ChannelWebhookResp,
    ChatType,
    FeedbackActionType,
    MsgSenderType,
    RespEvent,
)
from veaiops.utils.log import logger

from ..base import BaseChannel
from ..registry import register_channel
from .message import (
    Card,
    CardData,
    WebEventResp,
    WebEventToast,
    delete_ephemeral_message,
    forward_message,
    get_img_base64,
    get_lark_msg,
    reply_ephemeral_message,
    reply_message,
    send_message,
)

pillow_heif.register_heif_opener()


@register_channel()
class LarkChannel(BaseChannel):
    """Lark channel implementation."""

    channel = ChannelType.Lark

    async def msg_to_llm_compatible(
        self,
        content: str | Dict[str, Any],
        bot_id: str,
        msg_id: str,
        msg_type: Literal["text", "image", "post", "merge_forward", "interactive", "a", "code_block"],
    ) -> List[Part]:
        """Convert message to LLM-compatible input content format.

        Args:
            content (str | Dict[str, Any]): The incoming webhook payload from the provider.
            bot_id (str): The ID of the bot sending the message.
            msg_id (str): The ID of the message being processed.
            msg_type (Literal): The message type.

        Returns:
            List[Part]: The LLM-compatible message parts.
        """
        llm_msgs: List[Part] = []
        if isinstance(content, dict):
            struct_content = content
        else:
            struct_content = json_repair.loads(content)

        if not isinstance(struct_content, dict) and msg_type != "merge_forward":
            return llm_msgs
        match msg_type, struct_content:
            case "text" | "code_block", dict():
                _msg_text: Part = Part(
                    text=struct_content.get("text", ""),
                )
                llm_msgs.append(_msg_text)
            case "a", dict():
                _text = struct_content.get("text", "")
                _href = struct_content.get("href", "")
                _msg_a: Part = Part(text=f"[{_text}]({_href})")
                llm_msgs.append(_msg_a)
            case "image" | "img", dict():
                image_key = struct_content["image_key"]
                # Convert image_key to base64 image
                image64 = await get_img_base64(bot_id=bot_id, image_key=image_key, message_id=msg_id, file_type="image")
                _msg_image: Part = Part(
                    inline_data=Blob(data=image64, mime_type="image/jpeg", display_name=image_key),
                )
                llm_msgs.append(_msg_image)

            case "post", dict():
                for post in struct_content.get("content", []) or []:
                    for element in post:
                        element_type = element.get("tag")
                        if not element_type:
                            continue
                        element_compatible = await self.msg_to_llm_compatible(
                            content=element,
                            bot_id=bot_id,
                            msg_id=msg_id,
                            msg_type=element_type,
                        )
                        llm_msgs.extend(element_compatible)

            case "merge_forward", _:
                resp = await get_lark_msg(bot_id=bot_id, msg_id=msg_id)
                if resp:
                    for element in resp["items"]:
                        # _content = element["body"]["content"]
                        # _msg_type = element["msg_type"]
                        _msg_id = element["message_id"]
                        if _msg_id == msg_id:
                            continue

                        _resp = await get_lark_msg(bot_id=bot_id, msg_id=_msg_id)
                        if not _resp:
                            continue
                        for _element in _resp["items"]:
                            __content = _element["body"]["content"]
                            __msg_type = _element["msg_type"]
                            __msg_id = _element["message_id"]

                            __element_compatible = await self.msg_to_llm_compatible(
                                content=__content,
                                bot_id=bot_id,
                                msg_id=__msg_id,
                                msg_type=__msg_type,
                            )
                            llm_msgs.extend(__element_compatible)

        return llm_msgs

    async def payload_to_msg(self, payload: dict) -> Optional[Message]:
        """Convert Lark payload to Message object.

        Args:
            payload (dict): The incoming webhook payload from Lark.

        Returns:
            Optional[Message]: The constructed Message object.
        """
        payload_header = payload["header"]
        payload_event = payload["event"]
        payload_message = payload_event["message"]
        payload_sender = payload_event["sender"]

        bot_id = payload_header["app_id"]
        # Message idempotence
        # Extract msg_id for idempotence check
        msg_id = payload_message["message_id"]
        chat_id = payload_message["chat_id"]
        channel = self.channel
        # Set message context information for logging
        try:
            context["msg_id"] = msg_id
            context["bot_id"] = bot_id
            context["chat_id"] = chat_id
            context["channel"] = channel
        except Exception:
            # If we can't set context, continue processing
            logger.warning("Could not set message context for logging")

        # Check if this message has already been processed
        if await self.check_idempotence(document_class=Message, bot_id=bot_id, msg_id=msg_id):
            logger.info(f"Message with msg_id {msg_id} already processed, skipping")
            return None

        logger.info(f"Construct Msg {msg_id}from payload")

        # Convert timestamp from milliseconds to datetime
        msg_time_ms = int(payload_message["create_time"])
        msg_time = datetime.fromtimestamp(msg_time_ms / 1000)
        msg = payload_message["content"]

        msg_mentions = []
        is_mentioned = False
        if payload_message.get("mentions"):
            bot = await Bot.find_one(Bot.bot_id == bot_id, Bot.channel == self.channel)
            for mention in payload_message["mentions"]:
                _mention_id = mention["id"]["open_id"]
                _mention_name = mention["name"]
                _mention_key = mention["key"]
                msg_mentions.append(Mention(id=_mention_id, name=_mention_name))
                msg = msg.replace(f"{_mention_key}", f"@{_mention_name}")
                if bot and _mention_id == bot.open_id:
                    is_mentioned = True

        # Convert msg to LLM compatible format
        msg_llm_compatible = await self.msg_to_llm_compatible(
            content=msg,
            bot_id=bot_id,
            msg_id=msg_id,
            msg_type=payload_message["message_type"],
        )

        self.msg = Message(
            channel=channel,
            bot_id=bot_id,
            chat_id=payload_message["chat_id"],
            chat_type=(ChatType.Group if payload_message["chat_type"] == "group" else ChatType.P2P),
            msg=msg,
            msg_id=payload_message["message_id"],
            msg_time=msg_time,
            msg_sender_id=payload_sender["sender_id"]["open_id"],
            msg_sender_type=(MsgSenderType.USER if payload_sender["sender_type"] == "user" else MsgSenderType.BOT),
            mentions=msg_mentions if msg_mentions else None,
            is_mentioned=is_mentioned,
            msg_llm_compatible=msg_llm_compatible,
        )

        # Save message to database
        await self.msg.save()
        logger.info(f"Message saved with channel: {channel}, msg_id: {msg_id}")

        return self.msg

    async def payload_to_chat(self, payload: dict) -> Optional[Chat]:
        """Convert Lark payload to Chat object.

        Args:
            payload (dict): The incoming webhook payload from Lark.

        Returns:
            Optional[Chat]: The constructed Chat object.
        """
        payload_header = payload["header"]
        payload_event = payload["event"]
        bot_id = payload_header["app_id"]

        name = payload_event["name"]
        chat_id = payload_event["chat_id"]
        channel = self.channel
        # Set chat context information for logging
        try:
            context["bot_id"] = bot_id
            context["chat_id"] = chat_id
            context["channel"] = channel
        except Exception:
            # If we can't set context, continue processing
            logger.warning("Could not set chat context for logging")

        # Check if this chat has already been processed
        if await self.check_idempotence(document_class=Chat, bot_id=bot_id, chat_id=chat_id):
            logger.info(f"Chat with chat_id {chat_id} already processed, skipping")
            return None

        logger.info(f"Construct Chat {chat_id} from payload")

        # Convert timestamp from milliseconds to datetime
        create_time_ms = int(payload_header["create_time"])
        create_time = datetime.fromtimestamp(create_time_ms / 1000)

        self.chat = Chat(
            channel=channel,
            bot_id=bot_id,
            chat_id=chat_id,
            name=name,
            start_time=create_time,
        )

        # Save chat to database
        await self.chat.insert()
        logger.info(f"Chat saved with channel: {channel}, chat_id: {chat_id}")
        return self.chat

    async def recreate_chat_from_payload(self, payload: dict) -> None:
        """Recreate chat from msg payload.

        Args:
            payload (dict): Message Payload
        """
        payload_header = payload["header"]
        payload_event = payload["event"]
        payload_message = payload_event["message"]

        bot_id = payload_header["app_id"]
        chat_id = payload_message["chat_id"]

        cli = await get_bot_client(bot_id=bot_id, channel=ChannelType.Lark)
        if not cli:
            logger.error(f"bot_id: {bot_id} client for lark not exist, can not recreate chat")
            return

        request: GetChatRequest = GetChatRequest.builder().chat_id(chat_id=chat_id).build()
        response: GetChatResponse = cli.im.v1.chat.get(request)

        if not response.success():
            logger.error(f"client.im.v1.chat.get failed, code: {response.code}, msg: {response.msg}")
            return

        data_object = json.loads(response.raw.content).get("data", {})
        chat = Chat(
            channel=self.channel,
            bot_id=bot_id,
            chat_id=chat_id,
            name=data_object.get("name", ""),
        )
        if not await Chat.find_one(Chat.chat_id == chat_id, Chat.bot_id == bot_id, Chat.channel == self.channel):
            logger.info(
                f"Create chat record from msg payload chat_id={chat_id}, bot_id={bot_id}, channel={self.channel}"
            )
            await chat.insert()

    async def payload_response(self, payload: Dict[str, Any]) -> JSONResponse:
        """Handle the response for a Lark payload.

        Args:
            payload (Dict[str, Any]): The incoming webhook payload from Lark.

        Returns:
            JSONResponse: The response to be sent back to Lark.
        """
        background_tasks = BackgroundTasks()
        resp_content = ChannelWebhookResp(event=RespEvent.UnknownEvent)
        headers = {"x-request-id": context.get("X-Request-ID", "N/A")}
        match payload:
            case {"type": "url_verification"}:
                resp_content = ChannelWebhookResp(
                    event=RespEvent.OtherEvent,
                    challenge=payload["challenge"],  # type: ignore
                )
            case {"header": {"event_type": "im.message.receive_v1"}}:
                background_tasks.add_task(self.run_msg_payload, payload=payload)

                resp_content = ChannelWebhookResp(event=RespEvent.MsgReceived)

            case {"header": {"event_type": "im.chat.member.bot.added_v1"}}:
                background_tasks.add_task(self.payload_to_chat, payload=payload)
                resp_content = ChannelWebhookResp(event=RespEvent.ChatBotAdded)

            case _:
                logger.warning(f"Unknown payload type: {payload}")

        return JSONResponse(
            content=resp_content.model_dump(),
            headers=headers,
            background=background_tasks,
        )

    async def send_message(
        self,
        content: dict,
        agent_type: AgentType,
        target: str,
        template_id: str,
        bot_id: str,
        msg_id: str,
        chat_id: str,
        *args,
        **kwargs,
    ) -> List[str]:
        """Send a Lark message card by template card.

        Args:
            content (dict): The content of the template card.
            agent_type (AgentType): The type of agent sending the message.
            bot_id (str): The ID of bot.
            msg_id (str): The ID of the message to reply to.
            template_id (str): The ID of the template to fetch.
            target (str): The target of the message.
            chat_id (str): The chat ID to send the message to.
            *args: Additional positional arguments.
            **kwargs: Additional keyword arguments.

        Returns:
            List[str]: The output message id list.
        """
        logger.info(f"Send lark message to {kwargs} with template_id {template_id} and content {content}")
        cli = await get_bot_client(bot_id=bot_id, channel=ChannelType.Lark)
        if cli is None:
            logger.error(f"bot_id: {bot_id} client for lark not exist, can not send message")
            raise Exception(f"bot_id: {bot_id} client for lark not exist, can not send message")

        card = Card(data=CardData(template_id=template_id, template_variable=content), type="template")
        ret_msg_id: List[str] = []
        if agent_type == AgentType.CHATOPS_REACTIVE_REPLY:
            try:
                ret_msg_id = [await reply_message(cli=cli, card_content=card.model_dump_json(), msg_id=msg_id)]
            except Exception as e:
                logger.error(f"Reply message failed when reactive reply {e}. msg_id = {msg_id}, bot_id={bot_id}")

        elif agent_type == AgentType.CHATOPS_INTEREST:
            try:
                forwarded_msg_id = await forward_message(cli=cli, msg_id=msg_id, receive_id=target)
                ret_msg_id = [
                    await reply_message(cli=cli, card_content=card.model_dump_json(), msg_id=forwarded_msg_id)
                ]
            except Exception as e:
                logger.error(f"Reply message failed when interest reply {e}. msg_id = {msg_id}, bot_id={bot_id}")

        elif agent_type == AgentType.CHATOPS_PROACTIVE_REPLY:
            # Fetch latest users

            chat_messages = (
                await Message.find(
                    Message.chat_id == chat_id,
                    Message.channel == self.channel,
                )
                .sort([("msg_time", SortDirection.DESCENDING)])
                .limit(20)
                .to_list()
            )
            user_ids = [i for i in set([i.msg_sender_id for i in chat_messages])]
            tasks = []
            for user_id in user_ids:
                tasks.append(
                    reply_ephemeral_message(cli=cli, card_content=card.model_dump(), chat_id=chat_id, user_id=user_id)
                )

            rets = await asyncio.gather(*tasks, return_exceptions=True)
            ret_msg_ids: List[str] = []
            for ret in rets:
                if isinstance(ret, Exception):
                    logger.error(f"Failed to send ephemeral message to {chat_id} by bot_id={bot_id}, error: {ret}")
                elif ret is None:
                    logger.error(f"Failed to send ephemeral message to {chat_id} by bot_id={bot_id}, return None")
                elif isinstance(ret, str):
                    ret_msg_ids.append(ret)
            ret_msg_id = ret_msg_ids
        elif agent_type == AgentType.INTELLIGENT_THRESHOLD:
            ret_msg_id = [await send_message(cli=cli, card_content=card.model_dump_json(), chat_id=target)]
        return ret_msg_id

    async def callback_handle(self, payload: Dict[str, Any]) -> Any:
        """Handle provider event payload -> response.

        Args:
            payload (Dict[str, Any]): The incoming payload from the provider.

        Returns:
            The response object to be sent back to the provider.
        """
        resp_content = ChannelWebhookResp(event=RespEvent.UnknownEvent)
        match payload:
            case {"type": "url_verification"}:
                resp_content = ChannelWebhookResp(
                    event=RespEvent.OtherEvent,
                    challenge=payload["challenge"],  # type: ignore
                )
            case {"header": {"event_type": "card.action.trigger"}}:
                logger.info(f"card action trigger. {payload}")
                resp_content = WebEventResp(toast=WebEventToast(content="Callback handle success."), card=None)
                try:
                    action_card_event = ActionCardEvent(**payload)
                    message_id = action_card_event.event.context.open_message_id
                    operator = action_card_event.event.operator
                    bot_id = action_card_event.header.app_id
                    cli = await get_bot_client(bot_id=bot_id, channel=ChannelType.Lark)
                    if cli is None:
                        logger.error(f"bot_id: {bot_id} client for lark not exist, can not send message")
                        raise Exception(f"bot_id: {bot_id} client for lark not exist, can not send message")

                    event_notice_detail = await EventNoticeDetail.find_one(
                        In(EventNoticeDetail.out_message_ids, [message_id])
                    )
                    if not event_notice_detail:
                        logger.error(f"event notice detail not found: {message_id}")
                        raise ValueError(f"event notice detail not found: {message_id}")

                    if action_card_event.event.action.value.action not in FeedbackActionType:
                        logger.error(f"invalid action type: {action_card_event.event.action.value.action}")
                        raise ValueError(f"invalid action type: {action_card_event.event.action.value.action}")

                    event_notice_feedback = EventNoticeFeedback(
                        event_main_id=event_notice_detail.event_main_id,
                        notice_channel=ChannelType.Lark,
                        out_message_id=message_id,
                        action=action_card_event.event.action.value.action,
                        feedback=action_card_event.event.action.input_value,
                        operator=operator,
                    )
                    await event_notice_feedback.insert()
                    if action_card_event.event.action.value.action == FeedbackActionType.Public:
                        logger.info(f"delete all ephemeral_message: {event_notice_detail.out_message_ids}")
                        tasks = []
                        for ephemeral_message_id in event_notice_detail.out_message_ids:
                            tasks.append(delete_ephemeral_message(cli=cli, message_id=ephemeral_message_id))
                        tasks_rets = await asyncio.gather(*tasks, return_exceptions=True)
                        for out_message_id, ret_msg in zip(event_notice_detail.out_message_ids, tasks_rets):
                            if isinstance(ret_msg, Exception):
                                logger.error(f"Failed to delete_ephemeral_message for {out_message_id} {ret_msg}")
                            elif ret_msg is None:
                                logger.error(f"Failed to delete_ephemeral_message for {out_message_id} return None")
                            else:
                                logger.info(f"success to delete_ephemeral_message for {out_message_id} with {ret_msg}")

                    event = await Event.get(event_notice_detail.event_main_id)
                    if not event:
                        logger.error(f"event not found: {message_id}")
                        raise ValueError(f"event not found: {message_id}")
                    channel_msg = event.channel_msg.get(ChannelType.Lark)
                    if channel_msg:
                        if action_card_event.event.action.value.action == "public":
                            template_variables = channel_msg.template_variables
                            if isinstance(template_variables, TemplateVariable):
                                template_variables.button_disable = True
                            else:
                                logger.error(f"template_variables not exist: {template_variables}")
                                raise ValueError("template_variables must be TemplateVariable.")
                            card = Card(
                                data=CardData(
                                    template_id=channel_msg.template_id,
                                    template_variable=template_variables,
                                ),
                                type="template",
                            )
                            out_message_id = await send_message(
                                cli=cli,
                                card_content=card.model_dump_json(),
                                chat_id=action_card_event.event.context.open_chat_id,
                            )
                            new_out_message_ids = event_notice_detail.out_message_ids + [out_message_id]
                            await event_notice_detail.set({EventNoticeDetail.out_message_ids: new_out_message_ids})
                            event.channel_msg[ChannelType.Lark] = channel_msg
                            await event.set({Event.channel_msg: event.channel_msg})
                        else:
                            resp_content = WebEventResp(
                                toast=WebEventToast(content="Callback handle success and card refreshed."),
                                card=Card(
                                    data=CardData(
                                        template_id=channel_msg.template_id,
                                        template_variable=channel_msg.template_variables,
                                    )
                                ),
                            )
                except Exception as e:
                    logger.error(f"Failed to parse action card event: {e}")
                    resp_content = WebEventResp(
                        toast=WebEventToast(content="Callback handle occur error.", type="error"), card=None
                    )
            case _:
                logger.warning(f"Unknown payload type: {payload}")

        return JSONResponse(
            content=resp_content.model_dump(),
            headers={"x-request-id": context.get("X-Request-ID", "N/A")},
        )


class ActionCardOperator(BaseModel):
    """Lark Operator who triggered an action card."""

    tenant_key: str
    user_id: str
    open_id: str
    union_id: str


class ActionValue(BaseModel):
    """Lark ActionCard Action Values which build in card template."""

    event_id: Optional[str] = None
    chat_id: Optional[str] = None
    action: Optional[str] = None
    origin_feedback: Optional[str] = None


class ActionData(BaseModel):
    """Lark Action Data triggered an action. for active card callback."""

    tag: str
    value: ActionValue
    input_value: Optional[str] = None


class EventContext(BaseModel):
    """Lark ActionEvent context with message_id and chat_id."""

    open_message_id: str
    open_chat_id: str


class EventData(BaseModel):
    """Lark ActionEvent data triggered an action card callback event."""

    operator: ActionCardOperator
    token: str
    action: ActionData
    host: str
    context: EventContext


class Header(BaseModel):
    """Lark ActionEvent Action Header."""

    event_id: str
    create_time: str
    event_type: str
    tenant_key: str
    app_id: str


class ActionCardEvent(BaseModel):
    """Lark ActionEvent Action card event."""

    header: Header
    event: EventData
