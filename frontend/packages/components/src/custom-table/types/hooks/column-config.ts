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
 * Column configuration management Hook related type definitions
 */
// Use relative paths to avoid cross-level imports (following .cursorrules standards)
import type { ColumnItem } from '../plugins/table-columns';

/**
 * useColumnConfig Hook Props
 */
export interface UseColumnsProps<RecordType = Record<string, unknown>> {
  baseColumns: ColumnItem<RecordType>[];
  defaultFilters?: Record<string, (string | number)[]>;
  config?: TableColumnsConfig;
}

/**
 * useColumnConfig Hook return value
 */
export interface UseColumnsResult<RecordType = Record<string, unknown>> {
  columns: ColumnItem<RecordType>[];
  originalColumns: ColumnItem<RecordType>[];
  columnSettings: Record<
    string,
    {
      visible: boolean;
      width?: number | string;
      fixed?: 'left' | 'right';
      order?: number;
    }
  >;
  filters: Record<string, (string | number)[]>;
  query: Record<string, unknown>;
  setFilters: (filters: Record<string, (string | number)[]>) => void;
  setQuery: (query: Record<string, unknown>) => void;
  setColumnVisible: (params: { key: string; visible: boolean }) => void;
  setColumnWidth: (params: { key: string; width: number | string }) => void;
  setColumnFixed: (params: {
    key: string;
    fixed: 'left' | 'right' | undefined;
  }) => void;
  setColumnOrder: (params: { key: string; order: number }) => void;
  resetColumns: () => void;
}

/**
 * Table column configuration
 */
export interface TableColumnsConfig {
  /** Whether to enable column visibility control */
  enableColumnVisibility?: boolean;
  /** Whether to enable column width drag */
  enableColumnResize?: boolean;
  /** Whether to enable column fixed */
  enableColumnFixed?: boolean;
  /** Whether to enable column ordering */
  enableColumnOrder?: boolean;
}
