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

import { AGENT_OPTIONS_FILTER } from '@/pages/event-center/card-template/types';
import { ModuleType } from '@/types/module';
import apiClient from '@/utils/api-client';
import { Button, Message } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import { useManagementRefresh } from '@veaiops/hooks';
import {
  type ApiPaginationParams,
  convertTableSortToApi,
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import type { Event } from 'api-generate';
import { AgentType, EventShowStatus } from 'api-generate';
import { useMemo } from 'react';

/**
 * Historical event management logic Hook
 * Provides all business logic for the historical event management page
 */
export const usePushHistoryManagementLogic = (
  moduleType: ModuleType,
  refreshTable?: () => Promise<boolean>,
) => {
  // Use management refresh Hook
  useManagementRefresh(refreshTable);

  return {
    moduleType,
  };
};

/**
 * Table request parameter type
 * Contains pagination, sorting, and filter parameters
 *
 * Note: CustomTable uses sort_columns format (not sorter)
 * sort_columns: [{ column: "created_at", desc: false }]
 * Sort parameter conversion uses convertTableSortToApi utility function
 *
 * Field naming convention:
 * - Use snake_case (agent_type, show_status, start_time, end_time)
 * - Keep consistent with backend API parameter naming
 */
interface PushHistoryRequestParams {
  skip?: number;
  limit?: number;
  agent_type?: string[];
  sort_columns?: unknown; // Use convertTableSortToApi to process
  show_status?: EventShowStatus[];
  start_time?: string;
  end_time?: string;
  [key: string]: unknown;
}

/**
 * Type guard: Check if value is a valid AgentType
 *
 * Reference Modern.js type guard pattern (packages/toolkit/utils/src/cli/is/type.ts)
 * Use type guards instead of type assertions to provide type safety
 */
function isAgentType(value: unknown): value is AgentType {
  if (typeof value !== 'string') {
    return false;
  }
  // Use Object.values to get all enum values, avoid using type assertions
  const validAgentTypes: string[] = Object.values(AgentType);
  return validAgentTypes.includes(value);
}

/**
 * Type guard: Check if value is a valid AgentType array
 */
function isAgentTypeArray(value: unknown): value is AgentType[] {
  return Array.isArray(value) && value.length > 0 && value.every(isAgentType);
}

/**
 * Type guard: Check if value is a valid EventShowStatus
 *
 * EventShowStatus is a string enum with Chinese values:
 * PENDING = '等待发送' (Waiting to send), SUCCESS = '发送成功' (Send success), NOT_SUBSCRIBED = '未订阅' (Not subscribed), etc.
 * Note: The enum values are Chinese UI text and should remain in Chinese (not translated)
 */
function isEventShowStatus(value: unknown): value is EventShowStatus {
  if (typeof value !== 'string') {
    return false;
  }
  // Use Object.values to get all enum values, avoid using type assertions
  const validStatuses: string[] = Object.values(EventShowStatus);
  return validStatuses.includes(value);
}

/**
 * Type guard: Check if value is a valid EventShowStatus array
 */
function isEventShowStatusArray(value: unknown): value is EventShowStatus[] {
  return (
    Array.isArray(value) && value.length > 0 && value.every(isEventShowStatus)
  );
}

/**
 * Historical event table configuration Hook
 */
export const usePushHistoryTableConfig = ({
  moduleType,
  showModuleTypeColumn = true,
}: {
  moduleType: ModuleType;
  showModuleTypeColumn?: boolean;
}) => {
  // 🎯 Request function - Use utility functions
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({
          skip,
          limit,
          agent_type: paramAgentType,
          sort_columns,
          ...otherParams
        }: ApiPaginationParams & PushHistoryRequestParams) => {
          // Use existing get rules API
          // Note: agent_type is passed from filter or URL parameters (snake_case)
          // Use type guards for type validation, replacing type assertions (following Modern.js best practices)
          let agentType: AgentType[] | undefined = isAgentTypeArray(
            paramAgentType,
          )
            ? paramAgentType
            : undefined;

          // Oncall module: If no agent is selected, default to all Oncall-related Agents
          if (
            moduleType === ModuleType.ONCALL &&
            (!agentType || agentType.length === 0)
          ) {
            // Use type guards to filter valid AgentTypes, avoid using type assertions
            const filteredAgentTypes = AGENT_OPTIONS_FILTER.map(
              (item) => item.value,
            ).filter(isAgentType);
            agentType =
              filteredAgentTypes.length > 0 ? filteredAgentTypes : undefined;
          }

          // Intelligent threshold module: If no agent is selected, default to intelligent threshold Agent
          if (
            moduleType === ModuleType.INTELLIGENT_THRESHOLD &&
            (!agentType || agentType.length === 0)
          ) {
            agentType = [AgentType.INTELLIGENT_THRESHOLD_AGENT];
          }

          // Handle sort parameters - Use unified utility function to convert sort_columns
          // Only allow sorting by created_at field
          const sortOrder = convertTableSortToApi({
            sortColumns: sort_columns,
            allowedFields: ['created_at'],
          });

          // Handle filter parameters - Edge case: Filter invalid values
          // Python API only supports show_status, not status parameter
          // status is an internal field, mapped from show_status
          // Use type guards for type validation, replacing type assertions (following Modern.js best practices)
          const showStatus: EventShowStatus[] | undefined =
            isEventShowStatusArray(otherParams.show_status)
              ? otherParams.show_status
              : undefined;

          // Build API parameters - Use generated API types (already includes sortOrder)
          const apiParams: Parameters<
            typeof apiClient.event.getApisV1ManagerEventCenterEvent
          >[0] = {
            skip: skip ?? 0,
            limit: limit ?? 100,
            // agentType has been validated as AgentType[] type through type guard
            agentType:
              agentType && agentType.length > 0 ? agentType : undefined,
            showStatus,
            // Add sort parameters (generated API types already include sortOrder)
            sortOrder,
          };

          // Add optional time range parameters
          if (
            otherParams.start_time &&
            typeof otherParams.start_time === 'string'
          ) {
            apiParams.startTime = otherParams.start_time;
          }
          if (
            otherParams.end_time &&
            typeof otherParams.end_time === 'string'
          ) {
            apiParams.endTime = otherParams.end_time;
          }

          return await apiClient.event.getApisV1ManagerEventCenterEvent(
            apiParams,
          );
        },
        options: {
          errorMessagePrefix: 'Failed to fetch historical events',
          defaultLimit: 100,
          onError: (error: unknown) => {
            // Edge case: Improve error handling
            const errorObj =
              error instanceof Error ? error : new Error(String(error));
            const errorMessage = errorObj.message || 'Unknown error';

            // Only show error message for non-cancelled requests
            if (
              !errorMessage.includes('cancel') &&
              !errorMessage.includes('abort')
            ) {
              Message.error(
                `Failed to fetch historical events: ${errorMessage}`,
              );
            }
          },
          transformData<T = Event>(data: unknown): T[] {
            // Transform data format, ensure each record has a unique _id
            // Use type-safe conversion: Event[] -> T[] (generic constraint ensures type safety)
            if (Array.isArray(data)) {
              const transformed = data.map((item: Event) => ({
                ...item,
                _id:
                  item._id ??
                  `push_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
              }));
              // Type conversion: Event[] is a concrete implementation of T[], use as unknown as T[] to avoid direct assertion
              return transformed as unknown as T[];
            }
            return [] as unknown as T[];
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
      pageSize: 100,
      scrollX: showModuleTypeColumn ? 1200 : 1000,
    });
    return {
      ...baseProps,
      pagination: {
        ...baseProps.pagination,
        showTotal: (total: number, range: number[]) =>
          `共 ${total} 条记录，当前显示第 ${range[0]}-${range[1]} 条`,
      },
    };
  }, [showModuleTypeColumn]);

  return {
    dataSource,
    tableProps,
  };
};

/**
 * Historical event action button configuration Hook
 */
export const usePushHistoryActionConfig = ({
  loading = false,
  onRefresh,
}: {
  loading?: boolean;
  onRefresh?: () => Promise<boolean>;
}) => {
  const actionButtons = useMemo(
    () => [
      <Button
        key="refresh"
        icon={<IconRefresh />}
        onClick={async () => {
          if (onRefresh) {
            await onRefresh();
          }
        }}
        loading={loading}
      >
        Refresh
      </Button>,
    ],
    [loading, onRefresh],
  );

  return {
    actionButtons,
  };
};
