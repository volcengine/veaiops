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

from typing import Literal, cast

from fastapi import APIRouter

from veaiops.algorithm.intelligent_threshold.manager import get_global_threshold_recommender
from veaiops.schema.models.base import APIResponse
from veaiops.schema.models.intelligent_threshold.task import (
    IntelligentThresholdMCPPayload,
)
from veaiops.utils.log import logger

intelligent_threshold_agent_router = APIRouter(
    prefix="/apis/v1/intelligent-threshold/agent", tags=["IntelligentThresholdAgent"]
)


@intelligent_threshold_agent_router.post("/", response_model=APIResponse[dict])
async def calculate(body: IntelligentThresholdMCPPayload) -> APIResponse[dict]:
    """Calculate intelligent thresholds for a task with priority scheduling."""
    # Get the global instance of threshold recommender
    threshold_recommender = get_global_threshold_recommender()
    logger.info("-"*100)
    logger.info(body.sensitivity)
    logger.info("-"*100)
    logger.info(body.metric_template_value)
    logger.info("-"*100)

    # Convert IntelligentThresholdDirection to Literal type
    direction = cast(Literal["up", "down", "both"], body.direction.value)

    # Call handle_task method with required parameters including priority
    await threshold_recommender.handle_task(
        task_id=body.task_id,
        task_version=body.task_version,
        datasource_id=str(body.datasource_id),
        metric_template_value=body.metric_template_value,
        window_size=body.n_count,
        direction=direction,
        sensitivity=body.sensitivity,
        task_priority=body.task_priority,
    )

    return APIResponse(
        message="Threshold calculation task queued successfully",
        data={"task_id": str(body.task_id), "priority": body.task_priority.name},
    )


@intelligent_threshold_agent_router.get("/status", response_model=APIResponse[dict])
async def get_queue_status() -> APIResponse[dict]:
    """Get current queue and task execution status."""
    threshold_recommender = get_global_threshold_recommender()
    status = await threshold_recommender.get_queue_status()

    return APIResponse(message="Queue status retrieved successfully", data=status)
