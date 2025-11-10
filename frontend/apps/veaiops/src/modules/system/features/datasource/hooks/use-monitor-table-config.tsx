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

import {
  type BaseQuery,
  type CustomTableActionType,
  type FieldItem,
  type HandleFilterProps,
  useBusinessTable,
} from '@veaiops/components';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
} from '@veaiops/utils';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import {
  createMonitorTableColumns,
  createMonitorTableFilters,
  createMonitorTableRequest,
} from '../lib';
import type {
  UseMonitorTableConfigOptions,
  UseMonitorTableConfigReturn,
} from '../lib/monitor-table-types';

// Export type definitions (backward compatibility)
export type {
  UseMonitorTableConfigOptions,
  UseMonitorTableConfigReturn,
} from '../lib/monitor-table-types';

/**
 * Monitor configuration table configuration aggregation Hook
 *
 * 🎯 Hook aggregation pattern + auto refresh mechanism
 * - Use useBusinessTable to uniformly manage table logic
 * - Achieve auto refresh through operationWrapper
 * - Replace original useManagementRefresh pattern
 *
 * Architecture optimization:
 * - Data request logic extracted to `lib/monitor-table-request.ts`
 * - Table configuration constants extracted to `lib/monitor-table-config.ts`
 * - Column configuration logic extracted to `lib/monitor-columns.tsx`
 * - Filter configuration extracted to `lib/monitor-filters.ts`
 * - Helper functions extracted to `lib/config-data-utils.ts`
 *
 * @param options - Hook configuration options
 * @returns Table configuration and handlers
 */
export const useMonitorTableConfig = ({
  onEdit: _onEdit,
  onDelete: _onDelete,
  dataSourceType,
  ref,
}: UseMonitorTableConfigOptions & {
  ref?: React.Ref<CustomTableActionType>;
}): UseMonitorTableConfigReturn => {
  // 🎯 Data request logic
  const request = useMemo(
    () => createMonitorTableRequest(dataSourceType),
    [dataSourceType],
  );

  // 🎯 Data source configuration - use utility function
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // 🎯 Table configuration - use utility function, preserve border configuration
  const tableProps = useMemo(
    () => ({
      ...createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 'max-content',
      }),
      border: {
        wrapper: true,
        cell: true,
      },
    }),
    [],
  );

  // 🎯 Business operation wrapping - auto refresh
  const { customTableProps, customOperations, operations, wrappedHandlers } =
    useBusinessTable({
      dataSource,
      tableProps,
      handlers: _onDelete
        ? {
            delete: async (monitorId: string) => {
              return await _onDelete(monitorId);
            },
          }
        : undefined,
      refreshConfig: {
        enableRefreshFeedback: true,
        successMessage: '操作成功',
        errorMessage: '操作失败，请重试',
      },
      ref,
    });

  // 🎯 Column configuration - use extracted column configuration function
  const handleColumns = useCallback(
    (_props: Record<string, unknown>) => {
      return createMonitorTableColumns(dataSourceType);
    },
    [dataSourceType],
  );

  // 🎯 Filter configuration - use extracted filter configuration function
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      return createMonitorTableFilters(props);
    },
    [],
  );

  return {
    customTableProps,
    customOperations,
    operations,
    wrappedHandlers,
    handleColumns,
    handleFilters,
  };
};
