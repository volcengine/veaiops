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
from typing import Any, List, Optional

from beanie import PydanticObjectId
from beanie.operators import Eq, In, Or, RegEx
from fastapi import APIRouter, Depends, Query, status

from veaiops.handler.errors import RecordNotFoundError
from veaiops.handler.services import config
from veaiops.handler.services.user import get_current_user
from veaiops.schema.documents import (
    InformStrategy,
    Subscribe,
)
from veaiops.schema.documents.meta.user import User
from veaiops.schema.models.base import APIResponse, PaginatedAPIResponse, ToggleActiveRequest
from veaiops.schema.models.config import (
    SubscribePayload,
)
from veaiops.schema.types import AgentType

router = APIRouter(prefix="/subscribe")


@router.post("/", response_model=APIResponse[Subscribe], status_code=status.HTTP_201_CREATED)
async def create_subscribe(
    payload: SubscribePayload,
    current_user: User = Depends(get_current_user),
) -> APIResponse[Subscribe]:
    """Create a subscribe relation.

    Args:
        payload (SubscribePayload): The subscribe item to create.
        current_user (User, optional): The current user. Defaults to Depends(get_current_user).

    Returns:
        APIResponse[Subscribe]: The created subscribe relation.
    """
    data = payload.model_dump(exclude_unset=True)
    ids = data.pop("inform_strategy_ids", None)
    if ids:
        strategies = await InformStrategy.find({"_id": {"$in": ids}}).to_list()
        data["inform_strategy_ids"] = strategies
    subscribe = Subscribe(
        **data,
        created_user=current_user.username,
        updated_user=current_user.username,
    )
    await subscribe.insert()
    return APIResponse(data=subscribe)


@router.get("/{uid}", response_model=APIResponse[Subscribe])
async def get_subscribe(
    uid: PydanticObjectId,
) -> APIResponse[Subscribe]:
    """Get a subscribe relation.

    Args:
        uid (PydanticObjectId): The ID of the subscribe to read.

    Returns:
        APIResponse[Subscribe]: The subscribe item.
    """
    subscribe = await Subscribe.get(uid)
    if not subscribe:
        raise RecordNotFoundError(message="SubscribeRelation not found")

    return APIResponse(data=subscribe)


@router.get("/", response_model=PaginatedAPIResponse[List[Subscribe]])
async def get_subscribes(
    name: Optional[str] = Query(default=None, description="Subscribe name"),
    agents: Optional[List[AgentType]] = Query(default=None, description="Subscribe agents"),
    event_levels: Optional[List[str]] = Query(default=None, description="Event levels"),
    enable_webhook: Optional[bool] = Query(default=None, description="If Enable webhook"),
    products: Optional[List[str]] = Query(default=None, description="Interest products"),
    projects: Optional[List[str]] = Query(default=None, description="Interest projects"),
    customers: Optional[List[str]] = Query(default=None, description="Interest customers"),
    show_all: Optional[bool] = Query(None, description="Whether Show disabled items."),
    skip: int = 0,
    limit: int = 100,
) -> PaginatedAPIResponse[List[Subscribe]]:
    """Retrieve a list of subscription relations.

    Args:
        name (str, optional): Subscribe relation name. Defaults to None.:
        agents (List[AgentType], optional): The agents to retrieve subscription relations from.
        event_levels (List[str], optional): Available event levels. Defaults to None.
        enable_webhook (bool, optional): Defaults to None.:
        products (List[str], optional): Interest products. Defaults to None.
        projects (List[str], optional): Interest projects. Defaults to None.
        customers (List[str], optional): Interest customers. Defaults to None.
        show_all (bool, optional): Defaults to None, not show disabled items.
        skip: The number of items to skip.
        limit: The maximum number of items to return.

    Returns:
        A list of subscription relations with their attributes.
    """
    conditions: List[Any] = []
    if name:
        conditions.append(RegEx(Subscribe.name, name, "i"))
    if agents:
        conditions.append(In(Subscribe.agent_type, agents))
    if event_levels:
        conditions.append(In(Subscribe.event_level, event_levels))
    if enable_webhook is False:
        conditions.append(
            Or(
                Eq(Subscribe.enable_webhook, False),
                Eq(Subscribe.enable_webhook, None),
            )
        )
    if enable_webhook:
        conditions.append(Eq(Subscribe.enable_webhook, True))
    if not show_all:
        conditions.append(Eq(Subscribe.is_active, True))
    if projects:
        conditions.append(
            Or(
                In(Subscribe.interest_projects, projects),
                Subscribe.interest_projects == [],
                Eq(Subscribe.interest_projects, None),
            )
        )

    query = Subscribe.find(*conditions)
    total = await query.count()
    subscribes = await query.skip(skip).limit(limit).to_list()
    return PaginatedAPIResponse(data=subscribes, total=total, skip=skip, limit=limit)


@router.put("/{uid}", response_model=APIResponse[Subscribe])
async def update_subscribe(
    uid: PydanticObjectId,
    payload: SubscribePayload,
    current_user: User = Depends(get_current_user),
) -> APIResponse[Subscribe]:
    """Update a subscribe relation.

    Args:
        uid (PydanticObjectId): The ID of the subscribe relation to update.
        payload (SubscribePayload): The subscribe relation update data.
        current_user (User, optional): The current user. Defaults to Depends(get_current_user).

    Returns:
        APIResponse[Subscribe]: The updated subscribe relation.
    """
    item = await Subscribe.get(uid)
    if not item:
        raise RecordNotFoundError(message="subscribe not found")
    update_data = payload.model_dump(exclude_unset=True)
    # Handle inform_strategy_ids specially to convert to Link objects
    ids = update_data.pop("inform_strategy_ids", None)
    if ids is not None:
        if ids:
            strategies = await InformStrategy.find({"_id": {"$in": ids}}).to_list()
            item.inform_strategy_ids = strategies
        else:
            item.inform_strategy_ids = []
    # Update other fields
    for key, value in update_data.items():
        setattr(item, key, value)
    item.updated_at = datetime.now(timezone.utc)
    item.updated_user = current_user.username
    await item.save()
    return APIResponse(data=item)


@router.put("/{uid}/toggle", response_model=APIResponse)
async def toggle_subscribe(uid: PydanticObjectId, request: ToggleActiveRequest) -> APIResponse:
    """Active or Disable a subscribe relation."""
    return await config.toggle_active(Subscribe, uid, request.active)


@router.delete("/{uid}", response_model=APIResponse)
async def delete_subscribe(uid: PydanticObjectId) -> APIResponse:
    """Delete a subscribe relation."""
    return await config.delete(Subscribe, uid)
