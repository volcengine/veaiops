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

from datetime import datetime, timezone
from typing import Any, List

from beanie.odm.operators.find.comparison import Eq
from beanie.operators import GTE, LTE, In, Or

from veaiops.schema.documents import (
    AgentNotification,
    Event,
    EventNoticeDetail,
    Subscribe,
)
from veaiops.schema.types import AgentType, ChannelType, EventStatus
from veaiops.utils.log import logger


async def find_subscriptions(event: Event) -> List[Subscribe]:
    """Find subscriptions for current event.

    Args:
        event (Event): Event object

    Returns:
        List[Subscribe]: List of subscriptions
    """
    logger.info(f"start find subscriptions. event_id={event.id} agent_type={event.agent_type}")

    now = datetime.now(timezone.utc)
    # Base query conditions
    conditions: List[Any] = [
        Subscribe.agent_type == event.agent_type,
        LTE(Subscribe.start_time, now),
        GTE(Subscribe.end_time, now),
        Eq(Subscribe.is_active, True),
    ]

    # Add product filter if products exist
    if event.product:
        conditions.append(
            Or(
                In(Subscribe.interest_products, event.product),
                Subscribe.interest_products == [],
                Eq(Subscribe.interest_products, None),
            )
        )

    # Add project filter if projects exist
    if event.project:
        conditions.append(
            Or(
                In(Subscribe.interest_projects, event.project),
                Subscribe.interest_projects == [],
                Eq(Subscribe.interest_projects, None),
            )
        )

    # Add customer filter if customers exist
    if event.customer:
        conditions.append(
            Or(
                In(Subscribe.interest_customers, event.customer),
                Subscribe.interest_customers == [],
                Eq(Subscribe.interest_customers, None),
            )
        )

    subscribes = await Subscribe.find(*conditions, fetch_links=True).to_list()

    logger.info(f"found {len(subscribes)} subscriptions for event_id={event.id}")
    return subscribes


async def create_notice_details(event: Event, subscribes: List[Subscribe]) -> List[EventNoticeDetail]:
    """Create notice details for the current Event.

    Args:
        event (Event): Target event
        subscribes (List[Subscribe]): List of matched subscriptions
    """
    logger.info(f"start create notice details. event_id={event.id} matched_subscribes={subscribes}")
    notice_details = []
    seen_notifications = set()
    for subscribe in subscribes:
        # 2.1 Webhook notification
        if subscribe.enable_webhook is True and subscribe.webhook_endpoint:
            key = (event.id, ChannelType.Webhook, subscribe.webhook_endpoint)
            if key not in seen_notifications:
                logger.info(f"create notice detail with webhook endpoint {subscribe.webhook_endpoint} meet")
                notice_details.append(
                    EventNoticeDetail(
                        event_main_id=event.id,
                        notice_channel=ChannelType.Webhook,
                        target=subscribe.webhook_endpoint,
                        extra={"headers": subscribe.webhook_headers},
                        status=EventStatus.INITIAL,
                    )
                )
                seen_notifications.add(key)

        # 2.2 Channel notifications
        for strategy in subscribe.inform_strategy_ids:
            logger.info(f"create notice detail with channel strategy {strategy}")
            for chat_id in strategy.chat_ids:
                key = (event.id, ChannelType(strategy.channel), chat_id)
                if key not in seen_notifications:
                    logger.info(
                        f"create notice detail with channel strategy {strategy} "
                        f"channel {strategy.channel} chat_id {chat_id}"
                    )
                    notice_details.append(
                        EventNoticeDetail(
                            event_main_id=event.id,
                            notice_channel=ChannelType(strategy.channel),
                            target=chat_id,
                            extra={
                                "bot_id": strategy.bot_id,
                                "msg_id": event.raw_data.msg_id
                                if isinstance(event.raw_data, AgentNotification)
                                else "",
                                "chat_id": chat_id,
                            },
                            status=EventStatus.INITIAL,
                        )
                    )
                    seen_notifications.add(key)

    return notice_details


async def subscription_matching(event: Event):
    """Phase one: Subscription matching.

    Args: event (Event): event object
    """
    logger.info(f"Start subscription matching. event_id={event.id}")

    notice_details = []
    if event.agent_type in [AgentType.CHATOPS_REACTIVE_REPLY, AgentType.CHATOPS_PROACTIVE_REPLY] and isinstance(
        event.raw_data, AgentNotification
    ):
        # 1. Register default event notice detail
        logger.info("Event is chatops reply type, creating default notice detail, only reply in origin group chat.")
        notice_details = [
            EventNoticeDetail(
                event_main_id=event.id,
                notice_channel=event.raw_data.channel,
                target=event.raw_data.chat_id,
                extra={
                    "bot_id": event.raw_data.bot_id,
                    "msg_id": event.raw_data.msg_id,
                    "chat_id": event.raw_data.chat_id,
                },
                status=EventStatus.INITIAL,
            )
        ]
    elif event.agent_type not in [AgentType.CHATOPS_REACTIVE_REPLY, AgentType.CHATOPS_PROACTIVE_REPLY]:
        logger.info("Event is not chatops reply type, should create notice details by subscriptions.")
        # 1. Find matching subscription
        subscribes = await find_subscriptions(event=event)
        # 2. Create event notice details
        notice_details = await create_notice_details(event=event, subscribes=subscribes)

    if notice_details:
        await EventNoticeDetail.insert_many(notice_details)
        logger.info(f"Created {len(notice_details)} notice details for event {event.id}")
        await event.set({Event.status: EventStatus.SUBSCRIBED})
    else:
        logger.info(f"No notice details created for event {event.id}")
        await event.set({Event.status: EventStatus.NONE_DISPATCH})
