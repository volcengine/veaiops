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
import { Button, Message } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import type { HistoryFilters } from '@ec/history';
import {
  type StandardApiResponse,
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import { type AgentType, type Event, EventLevel } from 'api-generate';
import { useMemo, useState } from 'react';

/**
 * History event management logic Hook
 * Provides state management and business logic for history events
 */
export const useHistoryManagementLogic = () => {
  const [filters, setFilters] = useState<HistoryFilters>({});
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Event | null>(null);

  const handleViewDetail = (record: Event) => {
    setSelectedRecord(record);
    setDrawerVisible(true);
  };

  const handleCloseDetail = () => {
    setDrawerVisible(false);
    setSelectedRecord(null);
  };

  const updateFilters = (newFilters: Partial<HistoryFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  return {
    filters,
    drawerVisible,
    selectedRecord,
    handleViewDetail,
    handleCloseDetail,
    updateFilters,
  };
};

/**
 * History event table configuration Hook
 * Provides data source configuration required by CustomTable
 */
export const useHistoryTableConfig = ({
  filters,
}: {
  filters: HistoryFilters;
}) => {
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({ skip, limit }) => {
          // Build API parameters - use generated API types to ensure complete type matching
          type ApiParams = Parameters<
            typeof apiClient.event.getApisV1ManagerEventCenterEvent
          >[0];
          // Note: API parameter type doesn't include status field (only showStatus), but historyService layer will handle status to event_status mapping
          const apiParams: Partial<ApiParams> & {
            skip: number;
            limit: number;
            status?: number[];
          } = {
            skip: skip ?? 0,
            limit: limit ?? 10,
          };

          // Handle agent type (API supports array)
          // ✅ Type safe: Use type assertion to ensure array element types match
          if (
            filters.agent_type &&
            Array.isArray(filters.agent_type) &&
            filters.agent_type.length > 0
          ) {
            apiParams.agentType = filters.agent_type as AgentType[];
          }

          // Handle event level
          // ✅ Type safe: Based on Python source code analysis (veaiops/handler/routers/apis/v1/event_center/event.py)
          // Python: event_level: Optional[List[EventLevel]] = None
          // Python EventLevel enum (veaiops/schema/types.py): P0, P1, P2
          // OpenAPI spec: Array<EventLevel>, where EventLevel enum is ["P0", "P1", "P2"]
          // Generated TypeScript: EventLevel enum contains P0, P1, P2
          // API service expects: Array<EventLevel> (consistent with Python backend)
          if (filters.event_level) {
            if (Array.isArray(filters.event_level)) {
              // Array type: filter valid EventLevel enum values
              const validLevels = filters.event_level.filter(
                (level): level is EventLevel =>
                  level === EventLevel.P0 ||
                  level === EventLevel.P1 ||
                  level === EventLevel.P2,
              );
              if (validLevels.length > 0) {
                // ✅ Type match: validLevels is EventLevel[], matches API expected Array<EventLevel>
                apiParams.eventLevel = validLevels;
              }
            } else if (
              typeof filters.event_level === 'string' &&
              (filters.event_level === EventLevel.P0 ||
                filters.event_level === EventLevel.P1 ||
                filters.event_level === EventLevel.P2)
            ) {
              // Single value: convert to array
              apiParams.eventLevel = [filters.event_level as EventLevel];
            }
          }

          // Handle status (Chinese)
          if (filters.show_status && filters.show_status.length > 0) {
            apiParams.showStatus = filters.show_status;
          }

          // Handle event status (use status parameter, corresponds to backend's event_status)
          // Note: HistoryFilters type includes status field
          if (filters.status && filters.status.length > 0) {
            apiParams.status = filters.status;
          }

          // Handle time range
          if (filters.start_time) {
            apiParams.startTime = filters.start_time;
          }
          if (filters.end_time) {
            apiParams.endTime = filters.end_time;
          }

          const response =
            await apiClient.event.getApisV1ManagerEventCenterEvent(apiParams);
          // Type conversion: PaginatedAPIResponseEventList is structurally compatible with StandardApiResponse<Event[]>
          return response as unknown as StandardApiResponse<Event[]>;
        },
        options: {
          errorMessagePrefix: '获取历史事件失败',
          defaultLimit: 10,
          onError: (error) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : '获取历史事件失败，请重试';
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
      }),
    [filters],
  );

  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 1400,
      }),
    [],
  );

  return {
    dataSource,
    tableProps,
  };
};

/**
 * History event action button configuration Hook
 */
export const useHistoryActionConfig = ({
  loading = false,
}: {
  loading?: boolean;
}) => {
  const actionButtons = [
    <Button key="refresh" icon={<IconRefresh />} loading={loading}>
      刷新
    </Button>,
  ];

  return {
    actionButtons,
  };
};
