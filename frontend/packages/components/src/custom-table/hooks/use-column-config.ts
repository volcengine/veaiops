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

// ✅ Optimization: Merge imports from same source
import { DEFAULT_TABLE_COLUMNS_CONFIG } from '@/custom-table/plugins/table-columns/config';
import type {
  ColumnItem,
  UseColumnsProps,
  UseColumnsResult,
} from '@/custom-table/types';
/**
 * Table Column Configuration Management Hook
 * Dedicated to managing basic column configuration such as visibility, width, fixed position, etc.
 * Suitable for plugin-based table system
 */
import { useCallback, useMemo, useState } from 'react';

// Types have been migrated to ../types/hooks/column-config.ts

/**
 * Table Column Configuration Management Hook
 *
 * @description Dedicated to managing basic table column configuration, including:
 * - Column visibility control
 * - Dynamic column width adjustment
 * - Column fixed position settings
 * - Column display order management
 *
 * @example
 * ```tsx
 * const { columns, setColumnVisible, setColumnWidth } = useColumnConfig({
 *   baseColumns: myColumns,
 *   config: { enableColumnVisibility: true }
 * });
 * ```
 */
export const useColumns = <RecordType = Record<string, unknown>>({
  baseColumns = [],
  defaultFilters = {},
  config = {},
}: UseColumnsProps<RecordType>): UseColumnsResult<RecordType> => {
  const { enableColumnVisibility = true } = {
    ...DEFAULT_TABLE_COLUMNS_CONFIG,
    ...config,
  };

  // Column configuration and visibility state
  const [columnSettings, setColumnSettings] = useState<
    Record<
      string,
      {
        visible: boolean;
        width?: number | string;
        fixed?: 'left' | 'right';
        order?: number;
      }
    >
  >({});

  // Filter state
  const [filters, setFilters] = useState<Record<string, (string | number)[]>>(
    defaultFilters || {},
  );

  // Query parameters
  const [query, setQuery] = useState<Record<string, unknown>>({});

  // Apply column configuration
  const columns = useMemo(() => {
    if (!baseColumns || baseColumns.length === 0) {
      return [];
    }

    return baseColumns.map((column: any) => {
      const key = column.dataIndex;
      const setting = columnSettings[key];

      if (setting) {
        return {
          ...column,
          visible: setting.visible !== undefined ? setting.visible : true,
          width: setting.width || column.width,
          fixed: setting.fixed || column.fixed,
        };
      }

      return {
        ...column,
        visible: true,
      };
    });
  }, [baseColumns, columnSettings]);

  // Filter visible columns
  const visibleColumns = useMemo(() => {
    if (!enableColumnVisibility) {
      return columns;
    }
    return columns.filter((column: any) => column.visible !== false);
  }, [columns, enableColumnVisibility]);

  /**
   * Parameter interface for setting column visibility
   */
  interface SetColumnVisibleParams {
    key: string;
    visible: boolean;
  }

  // Set column visibility
  const setColumnVisible = useCallback(
    ({ key, visible }: SetColumnVisibleParams) => {
      setColumnSettings((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          visible,
        },
      }));
    },
    [],
  );

  /**
   * Parameter interface for setting column width
   */
  interface SetColumnWidthParams {
    key: string;
    width: number | string;
  }

  // Set column width
  const setColumnWidth = useCallback(({ key, width }: SetColumnWidthParams) => {
    setColumnSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        width,
      },
    }));
  }, []);

  /**
   * Parameter interface for setting column fixed position
   */
  interface SetColumnFixedParams {
    key: string;
    fixed: 'left' | 'right' | undefined;
  }

  // Set column fixed position
  const setColumnFixed = useCallback(({ key, fixed }: SetColumnFixedParams) => {
    setColumnSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        fixed,
      },
    }));
  }, []);

  // Set column order
  interface SetColumnOrderParams {
    key: string;
    order: number;
  }

  const setColumnOrder = useCallback(({ key, order }: SetColumnOrderParams) => {
    setColumnSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        order,
      },
    }));
  }, []);

  // Reset column settings
  const resetColumns = useCallback(() => {
    setColumnSettings({});
  }, []);

  return {
    columns: visibleColumns as ColumnItem<RecordType>[],
    originalColumns: columns as ColumnItem<RecordType>[],
    columnSettings,
    filters,
    query,
    setFilters,
    setQuery,
    setColumnVisible,
    setColumnWidth,
    setColumnFixed,
    setColumnOrder,
    resetColumns,
  };
};

export { useColumns as useColumnConfig };
