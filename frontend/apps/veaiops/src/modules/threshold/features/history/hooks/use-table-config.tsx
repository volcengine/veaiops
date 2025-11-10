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
 * Push history table configuration Hook
 *
 * Integrates useBusinessTable and various configuration hooks
 */

import { ModuleType } from '@/types/module';
import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import {
  getPushHistoryFilters,
  usePushHistoryActionConfig,
  useTableColumns,
} from '@threshold/shared';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@utils/table';
import {
  type BaseQuery,
  type CustomTableActionType,
  useBusinessTable,
} from '@veaiops/components';
import { AGENT_OPTIONS_FILTER } from '@veaiops/constants';
import {
  type AgentType,
  type Event,
  EventLevel,
  type EventShowStatus,
} from 'api-generate';
import { useCallback, useMemo } from 'react';

/**
 * Push history table configuration Hook
 * Provides complete table configuration (already integrated useBusinessTable)
 */
export const usePushHistoryTableConfig = ({
  moduleType,
  showModuleTypeColumn: _showModuleTypeColumn = true,
  onRetry,
  onRefresh: _onRefresh,
  onViewDetail,
  customActions,
  ref,
}: {
  moduleType: ModuleType;
  showModuleTypeColumn?: boolean;
  onRetry?: (
    recordId: string,
  ) => void | Promise<boolean> | Promise<{ success: boolean; error?: Error }>;
  onRefresh?: () =>
    | void
    | Promise<boolean>
    | Promise<{ success: boolean; error?: Error }>;
  onViewDetail?: (record: Event) => void;
  customActions?: (record: Event) => React.ReactNode;
  // Use generic types for type safety
  ref?: React.Ref<CustomTableActionType<Event, BaseQuery>>;
}) => {
  // 🎯 Request function - Use utility functions
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({
          skip,
          limit,
          agent_type: paramAgentType,
          event_level: eventLevel,
          show_status: showStatus,
          ...otherParams
        }) => {
          // Use existing get rules API
          let agentType: AgentType[] | undefined = Array.isArray(paramAgentType)
            ? (paramAgentType as AgentType[])
            : undefined;
          if (moduleType === ModuleType.ONCALL && !agentType) {
            agentType = AGENT_OPTIONS_FILTER.map(
              (item) => item.value,
            ) as AgentType[];
          }
          // 🔧 Fix: API service uses camelCase parameters, but automatically converts to snake_case URL parameters
          // So pass camelCase here, API will internally convert to agent_type, event_level, show_status
          // ✅ Type safety: From Python source code analysis, eventLevel should be EventLevel enum array (P0, P1, P2)
          // Python: event_level: Optional[List[EventLevel]] = None (EventLevel enum: P0, P1, P2)
          // OpenAPI: Array<EventLevel> (P0, P1, P2)
          // Use type guard to verify if value is valid EventLevel array
          let typedEventLevel: EventLevel[] | undefined;
          if (eventLevel) {
            if (Array.isArray(eventLevel)) {
              // Filter valid EventLevel values
              typedEventLevel = eventLevel.filter(
                (level): level is EventLevel =>
                  level === EventLevel.P0 ||
                  level === EventLevel.P1 ||
                  level === EventLevel.P2,
              );
              if (typedEventLevel.length === 0) {
                typedEventLevel = undefined;
              }
            } else if (
              eventLevel === EventLevel.P0 ||
              eventLevel === EventLevel.P1 ||
              eventLevel === EventLevel.P2
            ) {
              // Single value: Convert to array
              typedEventLevel = [eventLevel];
            }
          }
          const typedShowStatus: EventShowStatus[] | undefined = Array.isArray(
            showStatus,
          )
            ? (showStatus as EventShowStatus[])
            : undefined;
          return await apiClient.event.getApisV1ManagerEventCenterEvent({
            skip: skip || 0,
            limit: limit || 10,
            agentType,
            eventLevel: typedEventLevel,
            showStatus: typedShowStatus,
            ...otherParams,
          });
        },
        options: {
          errorMessagePrefix: 'Failed to fetch push history',
          defaultLimit: 10,
          onError: (error) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to load push history, please retry';
            Message.error(errorMessage);
          },
        },
      }),
    [moduleType],
  );

  // 🎯 Use utility function to create data source
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // 🎯 Use utility function to create table props, customize showTotal
  const tableProps = useMemo(() => {
    const baseProps = createStandardTableProps({
      rowKey: '_id',
      pageSize: 10,
      scrollX: 1200,
    });
    return {
      ...baseProps,
      pagination: {
        ...baseProps.pagination,
        showTotal: (total: number, range: number[]) =>
          `共 ${total} 条记录，当前显示第 ${range[0]}-${range[1]} 条`,
      },
    };
  }, []);

  // 🎯 Get various configurations
  // Use standardized column configuration function to ensure consistency and maintainability
  const tableColumns = useTableColumns({
    moduleType,
    onViewDetail,
    onRetry,
    customActions,
  });

  const handleColumns = useCallback(
    (_props: Record<string, unknown>) => tableColumns,
    [tableColumns],
  );

  // 🎯 Use useBusinessTable to integrate all logic
  // ✅ Type safety: Explicitly pass generic parameters to ensure ref type matching
  const { customTableProps } = useBusinessTable<
    Record<string, unknown>,
    Event,
    BaseQuery
  >({
    dataSource,
    tableProps,
    handleColumns,
    ref,
    refreshConfig: {
      enableRefreshFeedback: true,
      successMessage: '操作成功',
      errorMessage: '操作失败，请重试',
    },
    // 🎯 Push history table doesn't need delete/update wrapper operations
    operationWrapper: () => ({}),
  });

  const handleFilters = useCallback(
    (props: any) =>
      getPushHistoryFilters({
        ...props,
        handleFiltersProps: { moduleType },
      }),
    [moduleType],
  );

  const { actionButtons: renderActions } = usePushHistoryActionConfig({
    loading: false, // Can be passed from outside
  });

  return {
    customTableProps,
    handleColumns,
    handleFilters,
    renderActions,
  };
};
