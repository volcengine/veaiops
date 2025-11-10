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

import { Button } from '@arco-design/web-react';
import { IconPlus } from '@arco-design/web-react/icon';
import type { FieldItem, ModernTableColumnProps } from '@veaiops/components';
import { useBusinessTable } from '@veaiops/components';
import type { HandleFilterProps } from '@veaiops/components/src/custom-table/types';
import {
  createLocalDataSource,
  createStandardTableProps,
} from '@veaiops/utils';
import type { MetricTemplate } from 'api-generate';
import { useMemo } from 'react';
import { getMetricTemplateColumns } from '../lib/columns';
import { getMetricTemplateFilters } from '../lib/filters';
import { createMetricTemplateTableRequestWrapper } from '../lib/metric-template-request';

/**
 * Metric template table operation callback types
 */
export interface MetricTemplateTableActions {
  onEdit?: (record: MetricTemplate) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  onCreate?: () => Promise<boolean>;
  onToggleStatus?: (id: string, isActive: boolean) => Promise<boolean>;
}

/**
 * Return type for metric template table configuration Hook
 *
 * Uses standard types to avoid custom types
 */
export interface UseMetricTemplateTableConfigReturn {
  // Table configuration
  customTableProps: ReturnType<typeof useBusinessTable>['customTableProps'];
  handleColumns: (
    props: Record<string, unknown>,
  ) => ModernTableColumnProps<MetricTemplate>[];
  handleFilters: (props: HandleFilterProps) => FieldItem[];
  actionButtons: JSX.Element[];
}

/**
 * Metric template table configuration Hook
 *
 * 🎯 Fully implemented according to CUSTOM_TABLE_REFACTOR_TASKS.md specifications:
 * - Hook aggregation pattern: Cohesive all table-related logic
 * - Auto-refresh mechanism: Integrated useBusinessTable to implement auto-refresh after operations
 * - Props fully cohesive: Returns all table props uniformly, reducing component code lines
 * - Standardized types: Uses standard types from @veaiops/components and api-generate
 * - Standardized architecture: Unified configuration structure and return interface
 *
 * 🏗️ Cohesive content:
 * - Data request logic and data source configuration
 * - Table configuration (pagination, styles, etc.)
 * - Column configuration and filter configuration
 * - Operation configuration and business operation wrapping
 * - Unified return of all UI props
 *
 * @param tableActions - Table operation callback configuration
 * @returns Table configuration and handlers
 */
export const useMetricTemplateTableConfig = (
  tableActions: MetricTemplateTableActions,
): UseMetricTemplateTableConfigReturn => {
  // 🎯 Data request logic
  const request = useMemo(() => createMetricTemplateTableRequestWrapper(), []);

  // 🎯 Data source configuration - Enable auto-refresh
  // Note: metric-template uses frontend pagination, but still uses server-side pagination mode to support auto-refresh
  const dataSource = useMemo(
    () => ({
      request,
      ready: true,
      isServerPagination: true, // ⚠️ Important: Enable auto-refresh
    }),
    [request],
  );

  // 🎯 Table configuration - Use utility functions
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 20,
        scrollX: 1200,
      }),
    [],
  );

  // 🎯 Business operation wrapping - Auto-refresh
  const { customTableProps } = useBusinessTable({
    dataSource,
    tableProps,
    refreshConfig: {
      enableRefreshFeedback: true,
      successMessage: '操作成功',
      errorMessage: '操作失败，请重试',
    },
    operationWrapper: ({ wrapDelete }) => {
      const ops: Record<string, (...args: unknown[]) => unknown> = {};
      if (tableActions.onDelete) {
        ops.handleDelete = wrapDelete(tableActions.onDelete) as (
          ...args: unknown[]
        ) => unknown;
      }
      return ops;
    },
  });

  // 🎯 Column configuration - Use standard types
  const handleColumns = useMemo(
    () =>
      (
        _props: Record<string, unknown>,
      ): ModernTableColumnProps<MetricTemplate>[] =>
        getMetricTemplateColumns({
          onEdit:
            tableActions.onEdit || (async (_template: MetricTemplate) => false),
          onDelete: tableActions.onDelete || (async () => false),
        }),
    [tableActions.onEdit, tableActions.onDelete], // ✅ Only depend on specific functions
  );

  // 🎯 Filter configuration - Use useMemo to stabilize returned array and onChange function
  // Since Filters component does deep comparison of config, need to ensure onChange function reference is stable
  const handleFilters = useMemo(
    () =>
      (props: HandleFilterProps): FieldItem[] => {
        // Directly call original function, Filters component has been optimized to ignore onChange reference comparison
        return getMetricTemplateFilters({
          query: props.query,
          handleChange: props.handleChange,
        });
      },
    [],
  );

  // 🎯 Action button configuration - Cohesive action button logic
  const actionButtons = useMemo(() => {
    const buttons: JSX.Element[] = [];
    if (tableActions.onCreate) {
      buttons.push(
        <Button
          key="create"
          type="primary"
          icon={<IconPlus />}
          onClick={tableActions.onCreate}
          data-testid="new-metric-template-btn"
        >
          新建模板
        </Button>,
      );
    }
    return buttons;
  }, [tableActions.onCreate]);

  return {
    customTableProps,
    handleColumns,
    handleFilters,
    actionButtons,
  };
};
