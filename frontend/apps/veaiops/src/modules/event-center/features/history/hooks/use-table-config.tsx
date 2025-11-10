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

/**
 * History event table configuration Hook
 *
 * Implements Hook aggregation pattern + automatic refresh mechanism following best practices
 */

import { Message } from '@arco-design/web-react';
// ✅ Optimization: Use shortest path, merge imports from same source
import {
  type HistoryFilters,
  getHistoryColumns,
  getHistoryFilters,
  historyService,
} from '@ec/history';
import {
  type BaseQuery,
  type CustomTableActionType,
  type FieldItem,
  type HandleFilterProps,
  type ModernTableColumnProps,
  useBusinessTable,
} from '@veaiops/components';
import type { FilterValue } from '@veaiops/types';
import {
  type StandardApiResponse,
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import type { Event } from 'api-generate';
import type React from 'react';
import { useCallback, useMemo } from 'react';

/**
 * History event query parameter type (extended for frontend table)
 */
export interface HistoryQueryParams {
  skip?: number;
  limit?: number;
  agentType?: string[];
  eventLevel?: string;
  status?: number[];
  region?: string[];
  projects?: string[];
  products?: string[];
  customers?: string[];
  dateRange?: [string, string];
  [key: string]: FilterValue;
}

/**
 * View detail parameter interface
 */
/**
 * History event table configuration Hook parameter type
 */
export interface UseHistoryTableConfigOptions {
  filters: HistoryFilters;
  // Note: Unified use of (record: Event) => void format, consistent with HistoryTableProps
  onViewDetail?: (record: Event) => void;
  onRefresh?: () => void;
  ref?: React.Ref<CustomTableActionType<Event, BaseQuery>>;
}

/**
 * History event table configuration Hook return value type
 */
export interface UseHistoryTableConfigReturn {
  customTableProps: ReturnType<typeof useBusinessTable>['customTableProps'];
  operations: ReturnType<typeof useBusinessTable>['operations'];
  handleColumns: (
    props: Record<string, unknown>,
  ) => ModernTableColumnProps<Event>[];
  handleFilters: (
    props: HandleFilterProps<Record<string, unknown>>,
  ) => FieldItem[];
  renderActions: (props?: Record<string, FilterValue>) => JSX.Element[];
}

/**
 * History event table configuration Hook
 *
 * Provides complete table configuration (integrated with useBusinessTable)
 */
export const useHistoryTableConfig = ({
  filters,
  onViewDetail,
  onRefresh: _onRefresh,
  ref,
}: UseHistoryTableConfigOptions): UseHistoryTableConfigReturn => {
  // 🎯 Request function - use utility function
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({ skip, limit }) => {
          // Map HistoryFilters (snake_case) to HistoryQueryParams (camelCase)
          const response = await historyService.getHistoryEvents({
            skip: skip || 0,
            limit: limit || 10,
            // filters.agent_type is string[], need to convert to API expected format
            // Type assertion: convert HistoryFilters.agent_type (string[]) to API expected string literal array
            agentType: filters.agent_type as unknown as
              | Array<
                  | 'CHATOPS_INTEREST'
                  | 'CHATOPS_REACTIVE_REPLY'
                  | 'CHATOPS_PROACTIVE_REPLY'
                  | 'INTELLIGENT_THRESHOLD'
                  | 'ONCALL'
                >
              | undefined,
            // filters.event_level is string, need to convert to API expected format
            // Type assertion: convert HistoryFilters.event_level (string) to API expected string literal
            eventLevel:
              (filters.event_level as unknown as
                | 'INFO'
                | 'WARNING'
                | 'ERROR'
                | 'CRITICAL'
                | undefined) || undefined,
            status: filters.status,
            startTime: filters.start_time,
            endTime: filters.end_time,
          });
          // PaginatedAPIResponseEventList is structurally compatible with StandardApiResponse<Event[]>
          // Note: Type assertion because PaginatedAPIResponseEventList is structurally compatible with StandardApiResponse
          return response as unknown as StandardApiResponse<Event[]>;
        },
        options: {
          errorMessagePrefix: 'Failed to load history events',
          defaultLimit: 10,
          onError: (error) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to load history events, please try again';
            Message.error(errorMessage);
          },
        },
      }),
    [filters],
  );

  // 🎯 Data source configuration - use utility function
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // 🎯 Table props configuration - use utility function
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 1600,
      }) as Record<string, unknown>,
    [],
  );

  // 🎯 Use useBusinessTable to integrate all logic
  // Note: ref type uses assertion adapter, because useBusinessTable's ref type is generic CustomTableActionType
  // ✅ Fix: useBusinessTable now supports generic parameters, types fully match
  const { customTableProps, operations } = useBusinessTable<
    HistoryQueryParams,
    Event,
    BaseQuery
  >({
    dataSource,
    tableProps,
    refreshConfig: {
      enableRefreshFeedback: false,
    },
    // ✅ Fix: ref type now supports generic parameters, no need to use as any
    ref,
  });

  // 🎯 Get column configuration
  const handleColumns = useCallback(
    (props: Record<string, unknown>): ModernTableColumnProps<Event>[] =>
      getHistoryColumns({
        // getHistoryColumns expects onViewDetail?: (record: Event) => void
        // useHistoryTableConfig interface also defines (record: Event) => void, can pass directly
        onViewDetail,
      }),
    [onViewDetail],
  );

  // 🎯 Get filter configuration
  // Note: HandleFilterProps<HistoryQueryParams> is compatible with HandleFilterProps<BaseQuery>
  const handleFilters = useCallback(
    (props: HandleFilterProps<Record<string, unknown>>): FieldItem[] =>
      getHistoryFilters(props as HandleFilterProps<HistoryQueryParams>),
    [],
  );

  // 🎯 Get action button configuration
  // Note: Refresh button is configured in history-table.tsx, renderActions not needed here
  const renderActions = useCallback(
    (_props?: Record<string, FilterValue>): JSX.Element[] => [],
    [],
  );

  return {
    customTableProps,
    operations,
    handleColumns,
    handleFilters,
    renderActions,
  };
};
