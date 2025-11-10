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
 * CustomTable Imperative Actions type definitions
 * Migrated from files in hooks/imperative/ directory
 */

import type { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import type { BaseQuery, BaseRecord } from '@veaiops/types';

// ==================== Data Operations ====================

/**
 * @name Data operation related instance methods
 */
export interface DataActionMethods<RecordType extends BaseRecord> {
  /** @name Reload data */
  reload: (resetPageIndex?: boolean) => Promise<void>;
  /** @name Refresh data (reset page number and clear selection) */
  refresh: () => Promise<void>;
  /** @name Cancel current ongoing request */
  cancel: () => void;
  /** @name Get current table data */
  getData: () => RecordType[];
  /** @name Get formatted table data */
  getFormattedData: () => RecordType[];
  /** @name Set table data */
  setData: (data: RecordType[]) => void;
  /** @name Get filtered data */
  getFilteredData: () => RecordType[];
  /** @name Get selected data */
  getSelectedData: () => RecordType[];
}

// ==================== Filter Operations ====================

/**
 * @name Filter operation related instance methods
 */
export interface FilterActionMethods<QueryType extends BaseQuery> {
  /** @name Set query parameters */
  setQueryParams: (
    params: QueryType | ((prev: QueryType) => QueryType),
  ) => void;
  /** @name Get current query parameters */
  getQueryParams: () => QueryType;
  /** @name Reset query parameters */
  resetQueryParams: (keys?: string[]) => void;
  /** @name Set filter conditions */
  setFilters: (filters: Record<string, (string | number)[]>) => void;
  /** @name Get current filter conditions */
  getFilters: () => Record<string, (string | number)[]>;
  /** @name Reset filter conditions */
  resetFilters: () => void;
  /** @name Set sorter */
  setSorter: (sorter: SorterInfo) => void;
  /** @name Get current sorter */
  getSorter: () => SorterInfo | undefined;
  /** @name Reset sorter */
  resetSorter: () => void;
  /** @name Submit filters */
  submitFilters: () => void;
  /** @name Reset all filters and query */
  resetAll: () => void;
}

// ==================== Pagination Operations ====================

/**
 * @name Page information interface
 */
export interface PageInfo {
  /** @name Current page number */
  current: number;
  /** @name Items per page */
  pageSize: number;
  /** @name Total items */
  total: number;
}

/**
 * @name Pagination operation related instance methods
 */
export interface PaginationActionMethods {
  /** @name Go to specified page */
  goToPage: (page: number) => void;
  /** @name Go to first page */
  goToFirst: () => void;
  /** @name Go to last page */
  goToLast: () => void;
  /** @name Previous page */
  goToPrev: () => void;
  /** @name Next page */
  goToNext: () => void;
  /** @name Set page size */
  setPageSize: (size: number) => void;
  /** @name Get current pagination information */
  getPageInfo: () => PageInfo;
  /** @name Reset pagination */
  resetPagination: () => void;
}

// ==================== Selection Operations ====================

/**
 * @name Selection operation related instance methods
 */
export interface SelectionActionMethods<RecordType extends BaseRecord> {
  /** @name Select all */
  selectAll: () => void;
  /** @name Unselect all */
  unselectAll: () => void;
  /** @name Invert selection */
  invertSelection: () => void;
  /** @name Select specified rows */
  selectRows: (keys: (string | number)[]) => void;
  /** @name Unselect specified rows */
  unselectRows: (keys: (string | number)[]) => void;
  /** @name Get selected row keys */
  getSelectedRowKeys: () => (string | number)[];
  /** @name Get selected row data */
  getSelectedRows: () => RecordType[];
  /** @name Check if specified row is selected */
  isRowSelected: (key: string | number) => boolean;
  /** @name Get selection status statistics */
  getSelectionInfo: () => {
    selectedCount: number;
    totalCount: number;
    isAllSelected: boolean;
    isPartialSelected: boolean;
  };
}

// ==================== Expand Operations ====================

/**
 * @name Expand operation related instance methods
 */
export interface ExpandActionMethods {
  /** @name Expand all rows */
  expandAll: () => void;
  /** @name Collapse all rows */
  collapseAll: () => void;
  /** @name Expand specified rows */
  expandRows: (keys: (string | number)[]) => void;
  /** @name Collapse specified rows */
  collapseRows: (keys: (string | number)[]) => void;
  /** @name Get expanded row keys */
  getExpandedRowKeys: () => (string | number)[];
  /** @name Check if specified row is expanded */
  isRowExpanded: (key: string | number) => boolean;
}

// ==================== Utility Operations ====================

/**
 * @name Reset options interface
 */
export interface ResetOptions {
  /** @name Whether to reset query parameters */
  resetQuery?: boolean;
  /** @name Whether to reset filter conditions */
  resetFilters?: boolean;
  /** @name Whether to reset pagination */
  resetPagination?: boolean;
  /** @name Whether to reset selection */
  resetSelection?: boolean;
  /** @name Whether to reset expanded state */
  resetExpanded?: boolean;
  /** @name Whether to reset sorter */
  resetSorter?: boolean;
}

/**
 * @name Utility operation related instance methods
 */
export interface UtilityActionMethods<RecordType extends BaseRecord> {
  /** @name Export data */
  exportData: (format?: 'excel' | 'csv' | 'json') => RecordType[];
  /** @name Refresh table */
  refresh: () => Promise<void>;
  /** @name Reset table state */
  reset: (options?: ResetOptions) => void;
  /** @name Get table current state */
  getTableState: () => Record<string, unknown>;
  /** @name Set table state */
  setTableState: (state: Record<string, unknown>) => void;
  /** @name Reload data */
  reload: (resetPageIndex?: boolean) => Promise<void>;
}

// ==================== State Operations ====================

/**
 * @name State operation related instance methods
 */
export interface StateActionMethods {
  /** @name Set loading state */
  setLoading: (loading: boolean) => void;
  /** @name Get loading state */
  getLoading: () => boolean;
  /** @name Set error state */
  setError: (error: Error | string | null) => void;
  /** @name Get error state */
  getError: () => Error | string | null;
  /** @name Clear error state */
  clearError: () => void;
  /** @name Get table ready state */
  isReady: () => boolean;
}
