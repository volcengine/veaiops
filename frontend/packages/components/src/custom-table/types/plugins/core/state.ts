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
 * State and helper method type definition
 */

import type {
  ColumnProps,
  SorterInfo,
} from '@arco-design/web-react/es/Table/interface';
import type { BaseQuery, BaseRecord } from '@veaiops/types';
import type { ReactNode } from 'react';
import type { PluginLifecycle } from './base';

/**
 * CustomTable state type
 */
export interface CustomTableState<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  current: number;
  pageSize: number;
  query: QueryType;
  sorter: SorterInfo;
  filters: Record<string, (string | number)[]>;
  formattedTableData: RecordType[];
  loading: boolean;
  error?: Error | null;
  tableTotal: number;
  resetEmptyData: boolean;
  selectedRowKeys?: (string | number)[];
  expandedRowKeys?: (string | number)[];

  // Alert related state
  isAlertShow?: boolean;
  alertType?: 'info' | 'success' | 'warning' | 'error';
  alertContent?: ReactNode;
  customAlertNode?: ReactNode;

  // Plugin related state
  enableCustomFields?: boolean;
  customFieldsProps?: Record<string, unknown>;
  baseColumns?: ColumnProps<RecordType>[];
  enableFilterSetting?: boolean;
  filterSettingProps?: Record<string, unknown>;
  // Row selection plugin state
  rowSelection?: unknown;
  // Smart cell plugin state
  smartCell?: Record<string, unknown>;
}

/**
 * CustomTable helper method types
 */
export interface CustomTableHelpers<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  setCurrent: (page: number) => void;
  setPageSize: (size: number) => void;
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  updateQuery: (newQuery: Partial<QueryType>) => void;
  setFormattedTableData?: (data: RecordType[]) => void;
  setFilters: (filters: Record<string, (string | number)[]>) => void;
  setLoading: (loading: boolean) => void;
  setResetEmptyData: (reset: boolean) => void;
  setError: (error: Error | null) => void;
  reset: (options?: { resetEmptyData?: boolean }) => void;
  handleChange?: {
    (key: string, value: unknown): void;
    (object: Record<string, unknown>): void;
  };
  loadMoreData?: () => void;
  // Row selection related methods
  setSelectedRowKeys?: (keys: (string | number)[]) => void;
  // Row expand related methods
  setExpandedRowKeys?: (keys: (string | number)[]) => void;
  // Data request related methods
  run?: () => void;
  reload?: () => void;
  // Query sync related methods
  querySync?: unknown;
  manualSyncQuery?: () => void;
  resetQuery?: (resetEmptyData?: boolean) => void;
  // Lifecycle related methods
  lifecycle?: {
    trigger: ({
      phase,
      pluginName,
    }: {
      phase: PluginLifecycle;
      pluginName: string;
    }) => Promise<void>;
    addListener?: <TListener extends (...args: unknown[]) => void>(
      listener: TListener,
    ) => void;
    removeListener?: <TListener extends (...args: unknown[]) => void>(
      listener: TListener,
    ) => void;
    getMetrics?: () => Record<string, unknown>;
  };
  // Sorting related methods
  getSorterParam?: () => Record<string, unknown>;
  resetSorter?: () => void;
  setSorter?: (sorter: SorterInfo) => void;
  // Filter related methods
  resetFilterValues?: () => void;

  // Refresh integration related methods (business semantic)
  /** Refresh after create operation */
  afterCreate?: () => Promise<boolean>;
  /** Refresh after update operation */
  afterUpdate?: () => Promise<boolean>;
  /** Refresh after delete operation */
  afterDelete?: () => Promise<boolean>;
  /** Refresh after import operation */
  afterImport?: () => Promise<boolean>;
  /** Refresh after batch operation */
  afterBatchOperation?: () => Promise<boolean>;
  /** Refresh with feedback */
  refreshWithFeedback?: () => Promise<boolean>;
  /** Silent refresh */
  refreshSilently?: () => Promise<boolean>;
}
