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
 * CustomTable instance API type definition
 */
import type {
  BaseQuery,
  BaseRecord,
  ExtendedSorterInfo,
  FiltersProps,
} from '../core/common';
// Use relative path to avoid circular dependency (Cannot use @/custom-table/types, because types/index.ts will export this file)
import type {
  CustomTableHelpers,
  CustomTableState,
} from '../plugins/core/state';

/**
 * CustomTable instance API type
 */
export interface CustomTableActionType<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  // Data operation
  /** Reload data */
  reload: () => Promise<void>;
  /** Reload and reset */
  reloadAndReset?: () => Promise<void>;
  /** Refresh data */
  refresh: () => Promise<void>;
  /** Cancel current request */
  cancel: () => void;
  /** Get current data */
  getData: () => RecordType[];
  /** Fetch data source */
  getDataSource: () => RecordType[];
  /** Get formatted data */
  getFormattedData: () => RecordType[];
  /** Export data */
  exportData: () => RecordType[];
  /** Set data */
  setData: (data: RecordType[]) => void;

  // Pagination operation
  /** Set current page */
  setCurrentPage: (page: number) => void;
  /** Set page size */
  setPageSize: (size: number) => void;
  /** Get current page */
  getCurrentPage: () => number;
  /** Get page size */
  getPageSize: () => number;
  /** Get total */
  getTotal: () => number;
  /** Get pagination info */
  getPageInfo: () => { current: number; pageSize: number; total: number };
  /** Set pagination info */
  setPageInfo: (pageInfo: {
    current?: number;
    pageSize?: number;
    total?: number;
  }) => void;
  /** Reset pagination */
  resetPagination: () => void;

  // Filter operation
  /** Set filters */
  setFilters: (filters: FiltersProps) => void;
  /** Get filters */
  getFilters: () => FiltersProps;
  /** Reset filters */
  resetFilters: () => void;
  /** Clear filters */
  clearFilters: () => void;
  /** Apply filters */
  applyFilters: (filters: FiltersProps) => void;

  // Sort operation
  /** Set sorter */
  setSorter: (sorter: ExtendedSorterInfo) => void;
  /** Get sorter */
  getSorter: () => ExtendedSorterInfo;
  /** Reset sorter */
  resetSorter: () => void;
  /** Clear sorter */
  clearSorter: () => void;

  // Query operation
  /** Set query parameters */
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  /** Get query parameters */
  getQuery: () => QueryType;
  /** Reset query parameters */
  resetQuery: () => void;
  /** Merge query parameters */
  mergeQuery: (query: Partial<QueryType>) => void;

  // Select operation
  /** Set selected rows */
  setSelectedRows: (keys: (string | number)[]) => void;
  /** Get selected row keys */
  getSelectedRowKeys: () => (string | number)[];
  /** Get selected row data */
  getSelectedRows: () => RecordType[];
  /** Get selected data */
  getSelectedData: () => RecordType[];
  /** Clear selection */
  clearSelection: () => void;
  /** Select all */
  selectAll: () => void;
  /** Invert selection */
  invertSelection: () => void;

  // Expand operation
  /** Set expanded rows */
  setExpandedRows: (keys: (string | number)[]) => void;
  /** Set expanded row keys */
  setExpandedRowKeys: (keys: (string | number)[]) => void;
  /** Get expanded row keys */
  getExpandedRowKeys: () => (string | number)[];
  /** Expand all rows */
  expandAll: () => void;
  /** Collapse all rows */
  collapseAll: () => void;

  // State operation
  /** Get loading state */
  getLoading: () => boolean;
  /** Set loading state */
  setLoading: (loading: boolean) => void;
  /** Get error info */
  getError: () => Error | null;
  /** Reset state */
  reset: (options?: {
    resetData?: boolean;
    resetQuery?: boolean;
    resetFilters?: boolean;
  }) => void;

  // Scroll operation
  /** Scroll to top */
  scrollToTop: () => void;
  /** Scroll to bottom */
  scrollToBottom: () => void;
  /** Scroll to specified row */
  scrollToRow: (index: number) => void;

  // Plugin operation
  /** Execute plugin method */
  executePlugin: (
    { pluginName, methodName }: { pluginName: string; methodName: string },
    ...args: unknown[]
  ) => unknown;
  /** Render plugin content */
  renderPlugin: (
    { pluginName, renderer }: { pluginName: string; renderer: string },
    ...args: unknown[]
  ) => React.ReactNode;

  // State access
  /** Get current state */
  state: CustomTableState<RecordType, QueryType>;
  /** Get auxiliary methods */
  helpers: CustomTableHelpers<RecordType, QueryType>;

  // Data snapshot access
  /** Formatted table data */
  formattedTableData: RecordType[];
  /** Loading state */
  loading: boolean;
  /** Current page */
  current: number;
  /** Page size */
  pageSize: number;
  /** Total */
  total: number;
  /** Filter state */
  filters: Record<string, (string | number)[]>;
  /** Sort state */
  sorter: ExtendedSorterInfo;

  // Utility methods
  /** Validate data */
  validate: () => Promise<boolean>;
  /** Get table instance */
  getTableInstance: () => unknown;
  /** Get plugin manager */
  getPluginManager: () => unknown;
  /** Export reset logs */
  exportResetLogs: () => void;
  /** Get reset log statistics */
  getResetLogStats: () => Record<string, unknown>;
}

/**
 * CustomTable instance state
 */
export interface CustomTableInstanceState<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Current data */
  data: RecordType[];
  /** Current page */
  current: number;
  /** Page size */
  pageSize: number;
  /** Total */
  total: number;
  /** Query parameters */
  query: QueryType;
  /** Filters */
  filters: FiltersProps;
  /** Sort */
  sorter: ExtendedSorterInfo;
  /** Selected row keys */
  selectedRowKeys: (string | number)[];
  /** Expanded row keys */
  expandedRowKeys: (string | number)[];
  /** Loading state */
  loading: boolean;
  /** Error info */
  error: Error | null;
}

/**
 * CustomTable instance configuration
 */
export interface CustomTableInstanceConfig<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Default query parameters */
  defaultQuery?: Partial<QueryType>;
  /** Default filters */
  defaultFilters?: FiltersProps;
  /** Default sorter */
  defaultSorter?: ExtendedSorterInfo;
  /** Whether auto load */
  autoLoad?: boolean;
  /** Cache configuration */
  cache?: {
    enabled: boolean;
    key?: string;
    ttl?: number;
  };
  /** Validation configuration */
  validation?: {
    enabled: boolean;
    rules?: Record<string, ValidationRule[]>;
  };
}

/**
 * Validation rules
 */
export interface ValidationRule {
  required?: boolean;
  message?: string;
  validator?: (
    value: unknown,
    record: BaseRecord,
  ) => boolean | Promise<boolean>;
}

/**
 * Instance event types
 */
export interface CustomTableInstanceEvents<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Data change */
  onDataChange?: (data: RecordType[]) => void;
  /** Query change */
  onQueryChange?: (query: QueryType) => void;
  /** Filters change */
  onFiltersChange?: (filters: FiltersProps) => void;
  /** Sort change */
  onSorterChange?: (sorter: ExtendedSorterInfo) => void;
  /** Selection change */
  onSelectionChange?: (
    selectedRowKeys: (string | number)[],
    selectedRows: RecordType[],
  ) => void;
  /** Expand change */
  onExpandChange?: (expandedRowKeys: (string | number)[]) => void;
  /** Loading state change */
  onLoadingChange?: (loading: boolean) => void;
  /** Error occurred */
  onError?: (error: Error) => void;
}

/**
 * Instance operation result
 */
export interface OperationResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: Error;
  message?: string;
}

/**
 * Batch operation configuration
 */
export interface BatchOperationConfig {
  /** Concurrency */
  concurrency?: number;
  /** Whether stop on error */
  stopOnError?: boolean;
  /** Progress callback */
  onProgress?: (completed: number, total: number) => void;
}

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Export format */
  format?: 'json' | 'csv' | 'xlsx';
  /** Export filename */
  filename?: string;
  /** Whether includes header */
  includeHeader?: boolean;
  /** Custom columns */
  columns?: string[];
  /** Data transform */
  transform?: (data: BaseRecord[]) => unknown[];
}
