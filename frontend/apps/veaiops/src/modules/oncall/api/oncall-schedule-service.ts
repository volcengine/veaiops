// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { logger } from '@veaiops/utils';
import type {
  OncallSchedule,
  OncallScheduleCreateRequest,
  OncallScheduleUpdateRequest,
} from 'api-generate';

/**
 * Parameters type for getting oncall schedule list
 * TODO: Import from api-generate after backend API is implemented
 */
interface GetOncallSchedulesParams {
  channel?: string;
  bot_id?: string;
  skip?: number;
  limit?: number;
}

/**
 * Oncall schedule service wrapper
 * Corresponding API: /apis/v1/manager/rule-center/oncall/{channel}/{bot_id}/oncall_schedule/
 */
export const oncallScheduleService = {
  /**
   * Create oncall schedule
   * POST /apis/v1/manager/rule-center/oncall/{channel}/{bot_id}/oncall_schedule/
   */
  createSchedule: async (
    channel: string,
    botId: string,
    data: OncallScheduleCreateRequest,
  ): Promise<{ code: number; message: string; data?: OncallSchedule }> => {
    // TODO: Wait for backend API implementation
    logger.warn({
      message: 'createSchedule API not implemented yet',
      data: {
        channel,
        botId,
        data,
      },
      source: 'oncallScheduleService',
      component: 'createSchedule',
    });
    return {
      code: 0,
      message: '创建成功（模拟）',
      data: {
        id: `schedule-${Date.now()}`,
        rule_id: botId,
        ...data,
      },
    };
  },

  /**
   * Get oncall schedule list
   * GET /apis/v1/manager/rule-center/oncall/{channel}/{bot_id}/oncall_schedule/
   */
  getSchedules: async (
    params: GetOncallSchedulesParams,
  ): Promise<{
    code: number;
    message: string;
    data?: OncallSchedule[];
    total?: number;
    skip?: number;
    limit?: number;
  }> => {
    // TODO: Wait for backend API implementation
    logger.warn({
      message: 'getSchedules API not implemented yet',
      data: { params },
      source: 'oncallScheduleService',
      component: 'getSchedules',
    });
    return {
      code: 0,
      message: '获取成功（模拟）',
      data: [],
      total: 0,
      skip: params.skip || 0,
      limit: params.limit || 100,
    };
  },

  /**
   * Get single oncall schedule
   * GET /apis/v1/manager/rule-center/oncall/oncall_schedule/{schedule_id}
   */
  getScheduleById: async (
    scheduleId: string,
  ): Promise<{ code: number; message: string; data?: OncallSchedule }> => {
    // TODO: Wait for backend API implementation
    logger.warn({
      message: 'getScheduleById API not implemented yet',
      data: { scheduleId },
      source: 'oncallScheduleService',
      component: 'getScheduleById',
    });
    return {
      code: 0,
      message: '获取成功（模拟）',
      data: undefined,
    };
  },

  /**
   * Update oncall schedule
   * PUT /apis/v1/manager/rule-center/oncall/oncall_schedule/{schedule_id}
   */
  updateSchedule: async (
    scheduleId: string,
    data: OncallScheduleUpdateRequest,
  ): Promise<{ code: number; message: string; data?: OncallSchedule }> => {
    // TODO: Wait for backend API implementation
    logger.warn({
      message: 'updateSchedule API not implemented yet',
      data: {
        scheduleId,
        data,
      },
      source: 'oncallScheduleService',
      component: 'updateSchedule',
    });
    return {
      code: 0,
      message: '更新成功（模拟）',
      data: undefined,
    };
  },

  /**
   * Delete oncall schedule
   * DELETE /apis/v1/manager/rule-center/oncall/oncall_schedule/{schedule_id}
   */
  deleteSchedule: async (
    scheduleId: string,
  ): Promise<{ code: number; message: string; data?: boolean }> => {
    // TODO: Wait for backend API implementation
    logger.warn({
      message: 'deleteSchedule API not implemented yet',
      data: { scheduleId },
      source: 'oncallScheduleService',
      component: 'deleteSchedule',
    });
    return {
      code: 0,
      message: '删除成功（模拟）',
      data: true,
    };
  },
};
