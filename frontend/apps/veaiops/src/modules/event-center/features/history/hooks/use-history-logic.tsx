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
import {
  type StandardApiResponse,
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import type { Event, EventShowStatus } from 'api-generate';
import { useMemo, useState } from 'react';

/**
 * History event filter type
 * Uses underscore naming, corresponds to frontend UI layer
 * One-to-one correspondence with filters defined in filter.tsx
 */
export interface HistoryFilters {
  /** Agent type */
  agent_type?: string[];
  /** Event level */
  event_level?: string;
  /** Status (Chinese) */
  show_status?: EventShowStatus[];
  /** Event status (enum value) */
  status?: number[];
  /** Start time */
  start_time?: string;
  /** End time */
  end_time?: string;
}

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
 *
 * ✅ Already using utility functions:
 * - createTableRequestWithResponseHandler: Automatically handles pagination parameters and responses
 * - createServerPaginationDataSource: Creates server-side pagination data source
 * - createStandardTableProps: Creates standard table properties
 */
export const useHistoryTableConfig = ({
  filters,
}: {
  filters: HistoryFilters;
}) => {
  // 🎯 Request function - use utility function
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({ skip, limit }) => {
          const apiParams: Parameters<
            typeof apiClient.event.getApisV1ManagerEventCenterEvent
          >[0] = {
            skip: skip ?? 0,
            limit: limit ?? 10,
          };

          // Handle agent type (API supports array)
          if (filters.agent_type && filters.agent_type.length > 0) {
            apiParams.agentType = filters.agent_type as any;
          }

          // Handle event level
          if (filters.event_level && filters.event_level !== '') {
            apiParams.eventLevel = filters.event_level as any;
          }

          // Handle status (Chinese)
          if (filters.show_status && filters.show_status.length > 0) {
            apiParams.showStatus = filters.show_status;
          }

          // Handle event status (use status parameter, corresponds to backend's event_status)
          // Note: API parameters don't have status field, may not be implemented in backend yet, temporarily removed
          // if (filters.status && filters.status.length > 0) {
          //   apiParams.status = filters.status;
          // }

          // Handle time range
          if (filters.start_time) {
            apiParams.startTime = filters.start_time;
          }
          if (filters.end_time) {
            apiParams.endTime = filters.end_time;
          }

          const response =
            await apiClient.event.getApisV1ManagerEventCenterEvent(apiParams);
          // PaginatedAPIResponseEventList is compatible with StandardApiResponse<Event[]>
          return response as unknown as StandardApiResponse<Event[]>;
        },
        options: {
          errorMessagePrefix: 'Failed to fetch history events',
          defaultLimit: 10,
          onError: (error) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to fetch history events, please try again';
            Message.error(errorMessage);
          },
          transformData: <T = Event>(data: unknown): T[] => {
            // Transform data format, add key field
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

  // 🎯 Use utility function to create data source
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // 🎯 Use utility function to create table properties
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 1600,
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
 * Provides table toolbar action button configuration
 */
export const useHistoryActionConfig = (
  onRefresh: () => void,
  _onExport?: () => void,
) => {
  const actions = [
    <Button
      key="refresh"
      type="secondary"
      icon={<IconRefresh />}
      onClick={onRefresh}
    >
      Refresh
    </Button>,
  ];

  return { actions };
};
