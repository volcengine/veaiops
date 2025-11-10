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
import type { Event } from '@veaiops/api-client';
import {
  type HistoryModuleType,
  getAllowedAgentTypes,
} from '@veaiops/components';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import {
  type StandardApiResponse,
  createTableRequestWithResponseHandler,
  logger,
} from '@veaiops/utils';
import { useMemo } from 'react';

/**
 * Create request function for event history table
 * Automatically filter agent options based on module type
 */
export const useEventHistoryRequest = ({
  moduleType,
}: {
  moduleType: HistoryModuleType;
}) => {
  const request = useMemo(() => {
    return createTableRequestWithResponseHandler<Event>({
      apiCall: async ({
        skip,
        limit,
        agent_type,
        event_level,
        show_status,
        start_time,
        end_time,
        sort_columns,
      }) => {
        const allowedAgentTypes = getAllowedAgentTypes(moduleType);

        // Build API parameters
        const apiParams: Parameters<
          typeof apiClient.event.getApisV1ManagerEventCenterEvent
        >[0] = {
          skip: skip ?? 0,
          limit: limit ?? 10,
        };

        // Agent type filtering (filter based on module type)
        if (agent_type && (agent_type as string[]).length > 0) {
          const selectedTypes = agent_type as string[];
          const filteredTypes = selectedTypes.filter((type) =>
            allowedAgentTypes.includes(type as any),
          );
          if (filteredTypes.length > 0) {
            apiParams.agentType = filteredTypes as any;
          }
        } else {
          // If not selected, default to module-allowed types
          apiParams.agentType = allowedAgentTypes as any;
        }

        // Event level
        if (event_level && event_level !== '') {
          apiParams.eventLevel = event_level as any;
        }

        // Status
        if (show_status && (show_status as string[]).length > 0) {
          apiParams.showStatus = show_status as string[];
        }

        // Time range
        if (start_time) {
          apiParams.startTime = start_time as string;
        }
        if (end_time) {
          apiParams.endTime = end_time as string;
        }

        // Sort parameter processing
        // Backend only supports sort_order parameter ("asc" or "desc"), fixed sorting by created_at
        // CustomTable passes sort_columns format, need to convert to sort_order
        if (
          sort_columns &&
          Array.isArray(sort_columns) &&
          sort_columns.length > 0
        ) {
          const sortColumn = sort_columns[0];
          // Backend fixed sorting by created_at, only need to pass sort_order
          apiParams.sortOrder = sortColumn.desc ? 'desc' : 'asc';

          // Add log: sort parameter conversion
          logger.info({
            message: '事件历史表格排序参数转换',
            data: {
              receivedSortColumns: sort_columns,
              convertedSortOrder: apiParams.sortOrder,
              sortColumnField: sortColumn.column,
              sortColumnDesc: sortColumn.desc,
            },
            source: 'useEventHistoryRequest',
            component: 'apiCall',
          });
        }

        // Add log: complete API request parameters
        logger.info({
          message: '事件历史表格 API 请求参数',
          data: {
            apiParams,
            moduleType,
            hasAgentType: Boolean(apiParams.agentType),
            hasSortOrder: Boolean(apiParams.sortOrder),
          },
          source: 'useEventHistoryRequest',
          component: 'apiCall',
        });

        const response =
          await apiClient.event.getApisV1ManagerEventCenterEvent(apiParams);

        // Add log: API response result
        logger.info({
          message: '事件历史表格 API 响应结果',
          data: {
            responseCode: response.code,
            dataLength: Array.isArray(response.data) ? response.data.length : 0,
            total: response.total,
          },
          source: 'useEventHistoryRequest',
          component: 'apiCall',
        });

        return response as unknown as StandardApiResponse<Event[]>;
      },
      options: {
        errorMessagePrefix: '获取历史事件失败',
        defaultLimit: 10,
        onError: (error) => {
          const errorMessage =
            error instanceof Error ? error.message : '获取历史事件失败，请重试';
          Message.error(errorMessage);
        },
        transformData: <T = Event>(data: unknown): T[] => {
          if (Array.isArray(data)) {
            return data.map((item: Event) => ({
              ...item,
              key: item._id || Math.random().toString(),
            })) as T[];
          }
          return [];
        },
      },
    });
  }, [moduleType]);

  return request;
};
