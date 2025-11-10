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

import { oncallRuleService } from '@oncall/api';
import {
  type CustomTableActionType,
  useBusinessTable,
} from '@veaiops/components';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import {
  type StandardApiResponse,
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
  logger,
} from '@veaiops/utils';
import type { Bot, Interest } from 'api-generate';
import type React from 'react';
import { useMemo } from 'react';

export interface UseRulesDataProps {
  bots: Bot[];
  ref?: React.Ref<CustomTableActionType<Interest>>;
}

/**
 * Cohesive Hook - rule data logic
 * Responsible for business logic: data source configuration, API calls
 * Uses CustomTable's automatic refresh mechanism
 */
export const useRulesData = ({ bots, ref }: UseRulesDataProps) => {
  // 🎯 Data request function - uses utility functions
  // Note: Extract complex object parameters as variables to avoid TypeScript parsing errors (TS1136)
  // Reason: options object contains nested onError callback, may cause parser to fail to correctly identify object boundaries
  const requestOptions = useMemo(
    () => ({
      errorMessagePrefix: '获取Oncall规则失败',
      defaultLimit: 10,
      onError: (error: unknown) => {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '获取Oncall规则失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'useRulesData',
          component: 'request',
        });
      },
    }),
    [],
  );

  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({ botId, ...otherParams }) => {
          if (!botId || typeof botId !== 'string') {
            return {
              code: API_RESPONSE_CODE.SUCCESS,
              data: [],
              total: 0,
              message: '',
            };
          }

          const selectedBot = bots.find((bot) => bot.bot_id === botId);
          if (!selectedBot) {
            return {
              code: API_RESPONSE_CODE.SUCCESS,
              data: [],
              total: 0,
              message: '',
            };
          }

          // ✅ Fix: Bot.channel is an enum type, enum values are strings (e.g., 'Lark', 'DingTalk')
          // API expects string type, need to convert enum value to string
          // Use type guard to ensure type safety
          let channelValue = '';
          if (selectedBot.channel != null) {
            if (typeof selectedBot.channel === 'string') {
              channelValue = selectedBot.channel;
            } else {
              channelValue = String(selectedBot.channel);
            }
          }
          const response = await oncallRuleService.getOncallRulesByAppId(
            channelValue,
            botId,
            otherParams,
          );
          // Type conversion: APIResponseInterestList is compatible with StandardApiResponse<Interest[]> structure
          return response as unknown as StandardApiResponse<Interest[]>;
        },
        options: requestOptions,
      }),
    [bots, requestOptions],
  );

  // 🎯 Data source configuration - uses utility functions
  const dataSource = useMemo(
    () =>
      createServerPaginationDataSource({
        request,
        ready: bots.length > 0,
      }),
    [request, bots.length],
  );

  // 🎯 Table configuration - uses utility functions
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: 'uuid',
        pageSize: 10,
      }) as Record<string, unknown>,
    [],
  );

  // Use useBusinessTable
  // Note: ref type uses assertion adaptation, because useBusinessTable's ref type is generic CustomTableActionType
  const { customTableProps, operations } = useBusinessTable({
    dataSource,
    tableProps,
    refreshConfig: {
      enableRefreshFeedback: true,
      successMessage: '刷新成功',
      errorMessage: '刷新失败，请重试',
    },
    // ✅ Fix: useBusinessTable now supports generic parameters, no need to use as any
    ref,
  });

  return {
    customTableProps,
    operations,
  };
};
