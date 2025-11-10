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
import { API_RESPONSE_CODE, PAGINATION } from '@veaiops/constants';
import {
  type StandardApiResponse,
  createServerPaginationDataSource,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import type { Chat } from 'api-generate';
import { useMemo } from 'react';

/**
 * API request configuration Hook
 *
 * ✅ Tools used:
 * - createTableRequestWithResponseHandler: Automatically handles pagination parameters and responses
 * - createServerPaginationDataSource: Creates server-side pagination data source
 */
export const useChatTableRequest = () => {
  /**
   * CustomTable request function
   * Uses utility functions to automatically handle pagination parameters, responses, and errors
   */
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({
          skip,
          limit,
          uid,
          force_refresh,
          is_active,
          name,
          enable_func_interest,
          enable_func_proactive_reply,
        }) => {
          // If no uid, return empty data
          if (
            !uid ||
            (typeof uid === 'object' && Object.keys(uid || {}).length === 0)
          ) {
            return {
              code: API_RESPONSE_CODE.SUCCESS,
              data: [],
              total: 0,
              message: '',
            } as StandardApiResponse<Chat[]>;
          }

          const response = await apiClient.chats.getApisV1ConfigChats({
            uid: typeof uid === 'string' ? uid : String(uid || ''),
            skip: skip || PAGINATION.DEFAULT_SKIP,
            limit: limit || PAGINATION.DEFAULT_LIMIT,
            forceUpdate:
              typeof force_refresh === 'boolean'
                ? force_refresh
                : Boolean(force_refresh),
            isActive: (() => {
              if (typeof is_active === 'boolean') {
                return is_active;
              }
              if (is_active !== undefined) {
                return Boolean(is_active);
              }
              // ✅ Default query is_active=true chats (already "deleted" ones are not shown by default)
              return true;
            })(),
            name:
              typeof name === 'string' && name.trim() ? name.trim() : undefined,
            enableFuncInterest: (() => {
              if (typeof enable_func_interest === 'boolean') {
                return enable_func_interest;
              }
              if (enable_func_interest !== undefined) {
                return Boolean(enable_func_interest);
              }
              return undefined;
            })(),
            enableFuncProactiveReply: (() => {
              if (typeof enable_func_proactive_reply === 'boolean') {
                return enable_func_proactive_reply;
              }
              if (enable_func_proactive_reply !== undefined) {
                return Boolean(enable_func_proactive_reply);
              }
              return undefined;
            })(),
          });
          // Type conversion: PaginatedAPIResponseChatList is compatible with StandardApiResponse<Chat[]> structure
          return response as unknown as StandardApiResponse<Chat[]>;
        },
        options: {
          errorMessagePrefix: '获取群列表失败',
          defaultLimit: 10,
        },
      }),
    [],
  );

  // ✅ Use utility function to create data source
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  return {
    request,
    dataSource,
  };
};
