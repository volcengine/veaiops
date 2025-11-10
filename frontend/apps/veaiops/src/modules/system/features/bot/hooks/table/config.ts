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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import type { Bot } from '@bot/lib';
import {
  type StandardApiResponse,
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import type { ChannelType } from 'api-generate';
import { useMemo } from 'react';

/**
 * Bot table configuration Hook
 * Provides data source configuration, etc. (column configuration has been moved to component handling)
 *
 * ✅ Utility functions used:
 * - createTableRequestWithResponseHandler: Automatically handles pagination parameters and responses
 * - createServerPaginationDataSource: Creates server-side pagination data source
 * - createStandardTableProps: Creates standard table properties
 */
export const useBotTableConfig = ({
  handleDelete: _handleDelete,
}: {
  handleDelete: (botId: string) => Promise<boolean>;
}) => {
  /**
   * CustomTable request function
   * Uses utility functions to automatically handle pagination parameters, responses, and errors
   */
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({ skip, limit, name, channel }) => {
          const response =
            await apiClient.bots.getApisV1ManagerSystemConfigBots({
              skip,
              limit,
              name: name as string | undefined,
              channel: channel as ChannelType | undefined,
            });
          // Type conversion: APIResponseBotList is compatible with StandardApiResponse<Bot[]> structure
          return response as unknown as StandardApiResponse<Bot[]>;
        },
        options: {
          errorMessagePrefix: '获取机器人列表失败',
          defaultLimit: 10,
          onError: (error) => {
            // ✅ Correct: Handle UI error prompts through onError callback
            const errorMessage =
              error instanceof Error
                ? error.message
                : '加载机器人列表失败，请重试';
            Message.error(errorMessage);
          },
        },
      }),
    [],
  );

  // ✅ Use utility function to create data source - use useMemo to stabilize reference
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // ✅ Use utility function to create table properties - use useMemo to stabilize reference
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: 'bot_id',
        pageSize: 10,
        scrollX: 1000,
      }),
    [],
  );

  return {
    dataSource,
    tableProps,
  };
};
