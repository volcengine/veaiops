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

import type { SorterInfo } from '@arco-design/web-react/es/Table/interface';
/**
 * Table State Hook related type definitions
 */
import type React from 'react';
import type { BaseQuery, BaseRecord } from '../core';

/**
 * Table state interface
 */
export interface TableState<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  // Data state
  dataSource: RecordType[];
  formattedTableData: RecordType[];
  loading: boolean;
  error: Error | null;

  // Pagination state
  current: number;
  pageSize: number;
  total: number;
  tableTotal: number;

  // Query state
  query: QueryType;
  filters: Record<string, (string | number)[]>;
  sorter: SorterInfo;

  // Selection state
  selectedRowKeys: (string | number)[];
  expandedRowKeys: (string | number)[];

  // Other state
  resetEmptyData: boolean;
}

/**
 * Table state actions interface
 */
export interface TableStateActions<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  // Data operations
  setDataSource: (dataSource: RecordType[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: Error | null) => void;

  // Pagination operations
  setCurrent: (current: number) => void;
  setPageSize: (pageSize: number) => void;
  setTotal: (total: number) => void;
  setTableTotal: (tableTotal: number) => void;

  // Query operations
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  setFilters: (filters: Record<string, (string | number)[]>) => void;
  setSorter: (sorter: SorterInfo) => void;

  // Selection operations
  setSelectedRowKeys: (keys: (string | number)[]) => void;
  setExpandedRowKeys: (keys: (string | number)[]) => void;

  // Other operations
  setResetEmptyData: (reset: boolean) => void;

  // Combined operations
  reset: () => void;
  updatePagination: (pagination: {
    current?: number;
    pageSize?: number;
    total?: number;
  }) => void;
  updateQuery: (newQuery: Partial<QueryType>) => void;
}

/**
 * useTableState Hook Props
 */
export interface UseTableStateProps<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  // Initial state
  initialDataSource?: RecordType[];
  initialQuery?: QueryType;
  initialCurrent?: number;
  initialPageSize?: number;

  // Configuration options
  defaultQuery?: QueryType;
  defaultPageSize?: number;
  defaultCurrent?: number;

  onStateChange?: (state: TableState<RecordType, QueryType>) => void;
}

/**
 * useTableState Hook return value
 */
export interface UseTableStateReturn<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  state: TableState<RecordType, QueryType>;
  actions: TableStateActions<RecordType, QueryType>;
  stateRef: React.MutableRefObject<TableState<RecordType, QueryType>>;
}
