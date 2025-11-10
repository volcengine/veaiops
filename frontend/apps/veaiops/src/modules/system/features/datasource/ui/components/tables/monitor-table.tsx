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

import type { DeleteHandler } from '@datasource/types/column-types';
import type { BaseQuery, CustomTableActionType } from '@veaiops/components';
import { CustomTable } from '@veaiops/components';
import type { BaseRecord } from '@veaiops/types';
import { logger } from '@veaiops/utils';
import type { DataSource, DataSourceType } from 'api-generate';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';
import { useMonitorTableConfig } from '../../../hooks/use-monitor-table-config';
import { getCommonColumns } from './columns';

/**
 * Monitor configuration table component properties interface
 */
interface MonitorTableProps {
  onEdit?: (monitor: DataSource) => void;
  onDelete: (
    monitorId: string,
    dataSourceType?: DataSourceType,
  ) => Promise<boolean>;
  dataSourceType: DataSourceType;
}

/**
 * Monitor configuration table component ref interface
 */
export interface MonitorTableRef {
  refresh: () => Promise<{ success: boolean; error?: Error }>;
}

// Filter configuration
const getMonitorFilters = () => [];

/**
 * Monitor configuration table component
 * Encapsulates table rendering logic, provides clear interface
 */
export const MonitorTable = forwardRef<MonitorTableRef, MonitorTableProps>(
  ({ onEdit, onDelete, dataSourceType }, ref) => {
    // Internal ref, passed to useBusinessTable
    // Note: CustomTable requires generic parameters, but useBusinessTable's ref type is CustomTableActionType (no generics)
    // Use type assertion to bridge these two types
    const tableActionRef =
      useRef<CustomTableActionType<DataSource, BaseQuery>>(null);

    // Table configuration (already uses useBusinessTable to auto handle refresh)
    const {
      customTableProps,
      handleColumns: configHandleColumns,
      operations,
      wrappedHandlers,
    } = useMonitorTableConfig({
      onEdit,
      onDelete: (monitorId: string) => onDelete(monitorId, dataSourceType),
      dataSourceType,
      // Why use type assertion:
      // - tableActionRef is generic CustomTableActionType<DataSource, BaseQuery>
      // - useMonitorTableConfig expects ref type CustomTableActionType<BaseRecord, BaseQuery>
      // - This is because CustomTableActionType's generic parameters don't affect ref usage at runtime
      // - DataSource extends BaseRecord, type compatibility is guaranteed at runtime
      // - Type safety is guaranteed by CustomTable component internally
      ref: tableActionRef as unknown as React.Ref<
        CustomTableActionType<BaseRecord, BaseQuery>
      >,
    });

    useImperativeHandle(
      ref,
      () => ({
        // Expose result-based refresh, complying with .cursorrules async method contract
        refresh: async (): Promise<{ success: boolean; error?: Error }> => {
          try {
            // Prefer operations.refresh which returns { success, error? }
            if (operations?.refresh) {
              return await operations.refresh();
            }
            // Fallback: call CustomTable action's refresh (void), then adapt to success format
            await tableActionRef.current?.refresh();
            return { success: true };
          } catch (error: unknown) {
            const errorObj =
              error instanceof Error ? error : new Error(String(error));
            // Log warning per logger object-arg spec
            logger.warn({
              message: 'MonitorTable 外部 refresh 失败',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
              },
              source: 'MonitorTable',
              component: 'useImperativeHandle.refresh',
            });
            return { success: false, error: errorObj };
          }
        },
      }),
      [operations],
    );

    // Create handleColumns function, pass operation callbacks to column configuration
    const handleColumns = useCallback(
      (_props: Record<string, unknown>) => {
        // First use handleColumns from configuration
        const baseColumns = configHandleColumns(_props);

        // Adapt onDelete function, use useBusinessTable auto-wrapped delete operation
        // ✅ Delete operation will auto refresh table
        const adaptedOnDelete: DeleteHandler = async (id: string) => {
          try {
            // ✅ Prefer useBusinessTable wrapped delete operation (auto refresh)
            if (wrappedHandlers?.delete) {
              const success = await wrappedHandlers.delete(id);
              // ✅ Return result object, comply with async method error handling specification
              return success
                ? { success: true }
                : { success: false, error: new Error('删除操作失败') };
            }

            // Compatibility: if no wrapped handler, use original handler
            const success = await onDelete(id, dataSourceType);
            // ✅ Return result object, comply with async method error handling specification
            return success
              ? { success: true }
              : { success: false, error: new Error('删除操作失败') };
          } catch (error: unknown) {
            // ✅ Correct: expose actual error information
            const errorObj =
              error instanceof Error ? error : new Error(String(error));
            logger.error({
              message: '删除操作异常',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
              },
              source: 'MonitorTable',
              component: 'adaptedOnDelete',
            });
            // ✅ Return result object, comply with async method error handling specification
            return { success: false, error: errorObj };
          }
        };

        // Pass refresh handling after edit, delete, activate/deactivate
        // ✅ Need to refresh after status toggle (use useBusinessTable's refresh method)
        const customColumns = getCommonColumns(
          dataSourceType,
          adaptedOnDelete,
          onEdit,
          async () => {
            // ✅ Use useBusinessTable's refresh method
            if (operations?.refresh) {
              const refreshResult = await operations.refresh();
              if (!refreshResult.success && refreshResult.error) {
                // ✅ Correct: use logger to record warning, pass complete error information
                const errorObj = refreshResult.error;
                logger.warn({
                  message: '切换状态后刷新表格失败',
                  data: {
                    error: errorObj.message,
                    stack: errorObj.stack,
                    errorObj,
                  },
                  source: 'MonitorTable',
                  component: 'onToggleStatus',
                });
              }
            }
          },
        );

        // Merge column configuration (override action columns and duplicate columns)
        // Get all keys from customColumns for deduplication
        const customColumnKeys = new Set(
          customColumns.map((col) => col.key).filter(Boolean),
        );

        // Filter out columns from baseColumns that already exist in customColumns (including 'actions', 'type', etc.)
        // Also filter out "Configuration Info" grouped column, because getBaseColumns in customColumns also contains it
        const filteredBaseColumns = baseColumns.filter((col) => {
          const colKey = col.key || '';
          // If column has children (grouped column), check if it's "Configuration Info"
          if (col.children && col.title === '配置信息') {
            return false; // Filter out "Configuration Info" column from baseColumns, keep the one in customColumns
          }
          // Filter out duplicate keys
          return !customColumnKeys.has(colKey);
        });

        return [...filteredBaseColumns, ...customColumns];
      },
      [
        configHandleColumns,
        onDelete,
        onEdit,
        dataSourceType,
        operations,
        wrappedHandlers,
      ],
    );

    return (
      <CustomTable
        {...customTableProps}
        handleColumns={handleColumns}
        handleFilters={getMonitorFilters}
        syncQueryOnSearchParams
        useActiveKeyHook
        authQueryPrefixOnSearchParams={{
          connectDrawerShow: 'true',
          dataSourceWizardShow: 'true',
        }}
        // Note: tableActionRef's type is RefObject<CustomTableActionType<DataSource, BaseQuery>>
        // CustomTable expects ref type Ref<CustomTableActionType<FormatRecordType, QueryType>>
        // Use unknown as intermediate type to ensure type conversion safety (runtime types are consistent)
        ref={
          tableActionRef as unknown as React.Ref<
            CustomTableActionType<DataSource, BaseQuery>
          >
        }
      />
    );
  },
);

MonitorTable.displayName = 'MonitorTable';

export default MonitorTable;
