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

"""Intelligent threshold agent service."""

from typing import Any

from beanie import PydanticObjectId
from fastapi.encoders import jsonable_encoder

from veaiops.schema.types import TaskPriority
from veaiops.settings import WebhookSettings, get_settings
from veaiops.utils.client import AsyncClientWithCtx


async def call_threshold_agent(
    task_id: PydanticObjectId,
    task_version: int,
    datasource_id: str,
    metric_template_value: Any,
    n_count: int,
    direction: str,
    sensitivity: float = 0.5,
    task_priority: TaskPriority = TaskPriority.NORMAL,
) -> None:
    """Call the intelligent threshold mcp via HTTP.

    Args:
        task_id: The task ID
        task_version: The task version
        datasource_id: The datasource ID
        metric_template_value: The metric template value
        n_count: The n count
        direction: The direction
        sensitivity: The sensitivity
        task_priority: The task priority
    """
    async with AsyncClientWithCtx() as client:
        agent_url = get_settings(WebhookSettings).intelligent_threshold_agent_url
        payload = {
            "task_id": str(task_id),
            "task_version": task_version,
            "datasource_id": datasource_id,
            "metric_template_value": jsonable_encoder(metric_template_value),
            "n_count": n_count,
            "direction": direction,
            "sensitivity": sensitivity,
            "task_priority": task_priority,
        }
        response = await client.post(f"{agent_url}/apis/v1/intelligent-threshold/agent/", json=payload)
        response.raise_for_status()
