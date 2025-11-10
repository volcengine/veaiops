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

import { ResizableTableTitle as ResizableHeader } from '@/custom-table/components/resize-col';
import { PluginNames } from '@/custom-table/constants/enum';
/**
 * Table columns management plugin
 */
import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
  PluginFactory,
  TableColumnsConfig,
} from '@/custom-table/types';
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import { DEFAULT_TABLE_COLUMNS_CONFIG } from './config';
import type { TableColumnsPluginProps } from './types';

export const TableColumnsPlugin: PluginFactory<TableColumnsConfig> = (
  config: TableColumnsConfig = {},
) => {
  const finalConfig = { ...DEFAULT_TABLE_COLUMNS_CONFIG, ...config };

  return {
    name: PluginNames.TABLE_COLUMNS,
    version: '1.0.0',
    description: 'Table columns management plugin',
    priority: finalConfig.priority || PluginPriorityEnum.HIGH,
    enabled: finalConfig.enabled !== false,
    dependencies: [],
    conflicts: [],

    install(_context: PluginContext) {
      // Operations during installation
    },

    setup<
      TRecord extends BaseRecord = BaseRecord,
      TQuery extends BaseQuery = BaseQuery,
    >(
      context: PluginContext<
        TRecord,
        TQuery,
        TableColumnsPluginProps<TRecord, TQuery>
      >,
    ) {
      // Initialize column processing
      const {
        props,
        state: { query },
      } = context;

      const { handleColumns } = props;
      const handleColumnsProps = props.handleColumnsProps || {};
      const { initFilters } = props;

      // Generate base columns
      const baseColumns =
        typeof handleColumns === 'function'
          ? handleColumns({
              ...handleColumnsProps,
              query,
            })
          : [];

      // Plugin setup logic - do not call Hooks, only configure
      // Hook calls have been moved to component level
      // Directly use base column configuration
      Object.assign(context.state, {
        columns: baseColumns,
        originalColumns: baseColumns,
        columnSettings: {},
      });

      // Set initial filter state
      if (!context.state.filters) {
        Object.assign(context.state, {
          filters: initFilters || {},
        });
      }

      // Add column-related methods to context
      Object.assign(context.helpers, {
        setColumnVisible: (dataIndex: string, visible: boolean) => {
          // Implementation based on pro-components column visibility control
          const currentColumns =
            (context.state as { columns?: Record<string, unknown>[] })
              .columns || [];
          const updatedColumns = currentColumns.map(
            (col: Record<string, unknown>) =>
              col.dataIndex === dataIndex ? { ...col, hidden: !visible } : col,
          );
          Object.assign(context.state, { columns: updatedColumns });
        },
        setColumnWidth: (dataIndex: string, width: number) => {
          // Set width for specified column
          const currentColumns =
            (context.state as { columns?: Record<string, unknown>[] })
              .columns || [];
          const updatedColumns = currentColumns.map(
            (col: Record<string, unknown>) =>
              col.dataIndex === dataIndex ? { ...col, width } : col,
          );
          Object.assign(context.state, { columns: updatedColumns });
        },
        setColumnFixed: (
          dataIndex: string,
          fixed: 'left' | 'right' | false,
        ) => {
          // Set column fixed position
          const currentColumns =
            (context.state as { columns?: Record<string, unknown>[] })
              .columns || [];
          const updatedColumns = currentColumns.map(
            (col: Record<string, unknown>) =>
              col.dataIndex === dataIndex ? { ...col, fixed } : col,
          );
          Object.assign(context.state, { columns: updatedColumns });
        },
        setColumnOrder: (newOrder: string[]) => {
          // Reorder columns
          const currentColumns =
            (context.state as { columns?: Record<string, unknown>[] })
              .columns || [];
          const orderedColumns = newOrder
            .map((dataIndex) =>
              currentColumns.find(
                (col: Record<string, unknown>) => col.dataIndex === dataIndex,
              ),
            )
            .filter(Boolean);
          Object.assign(context.state, { columns: orderedColumns });
        },
        resetColumns: () => {
          // Reset column configuration to initial state
          Object.assign(context.state, {
            columns: baseColumns,
            originalColumns: baseColumns,
          });
        },
        setFilters: context.helpers.setFilters,
      });
    },

    update(_context: PluginContext) {
      // Operations when configuration or data is updated
    },

    uninstall(_context: PluginContext) {
      // Cleanup operations during uninstallation
    },

    // Column management hooks
    hooks: {
      // Get current column configuration
      getColumns(...args: unknown[]) {
        const context = args[0] as PluginContext;
        // Priority: get from state, if not available then from props.baseColumns
        return (
          (context.state as { columns?: unknown[] }).columns ||
          context.props.baseColumns ||
          []
        );
      },

      // Reset column configuration
      resetColumns(...args: unknown[]) {
        const context = args[0] as PluginContext;
        (context.helpers as { resetColumns?: () => void }).resetColumns?.();
      },

      // Filter columns
      filterColumns(...args: unknown[]) {
        const context = args[0] as PluginContext;
        const predicate = args[1] as (
          column: Record<string, unknown>,
        ) => boolean;
        return (
          (context.state as { columns?: Record<string, unknown>[] }).columns ||
          []
        ).filter(predicate);
      },
      // Column width dragging (backward compatibility): returns onHeaderCell configuration for Table
      getResizableHeaderProps(...args: unknown[]) {
        const context = args[0] as PluginContext;
        const dataIndex = args[1] as string;
        const width = args[2] as number | undefined;
        return {
          component: ResizableHeader,
          width,
          handleAxis: 'e',
          onResize: (data: { size?: { width?: number } }) => {
            const next = Math.max(60, data.size?.width || 60);
            (
              context.helpers as {
                setColumnWidth?: (dataIndex: string, width: number) => void;
              }
            ).setColumnWidth?.(dataIndex, next);
          },
        };
      },
    },
  };
};
