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
 * Table instance Hook related type definitions
 */
import type { PaginationProps } from '@arco-design/web-react/es/Pagination/pagination';
import type { TableProps as ArcoTableProps } from '@arco-design/web-react/es/Table/interface';
import type { CustomTableActionType } from '../api/action-type';
import type { BaseQuery, BaseRecord } from '../core';

/**
 * useTableInstance Hook Props
 */
export interface UseTableInstanceProps<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  // State related
  /** Initial data source */
  initialDataSource?: RecordType[];
  /** Initial query parameters */
  initialQuery?: QueryType;
  /** Initial page number */
  initialCurrent?: number;
  /** Initial page size */
  initialPageSize?: number;

  // Data fetching related
  /** Data source */
  dataSource?: RecordType[];
  /** Manual mode */
  manual?: boolean;
  /** Whether ready */
  ready?: boolean;
  /** Enable fetching */
  enableFetch?: boolean;
  /** Polling interval */
  pollingInterval?: number;
  /** Debounce time */
  debounceTime?: number;
  /** Success callback */
  onSuccess?: (data: RecordType[], params: QueryType) => void;
  /** Error callback */
  onError?: (error: Error, params: QueryType) => void;
  /** Finally callback */
  onFinally?: (params: QueryType, data?: RecordType[], error?: Error) => void;
  /** Dependencies */
  effects?: unknown[];

  // Table configuration
  /** Query parameters */
  query?: QueryType;
  /** Pagination configuration */
  pagination?: PaginationProps | boolean;
  /** Table configuration */
  tableProps?: Partial<Omit<ArcoTableProps<RecordType>, 'columns' | 'data'>>;
  /** Enabled features */
  features?: string[];

  /** Other configuration */
  [key: string]: unknown;
}

/**
 * useTableInstance Hook return value
 */
export interface UseTableInstanceReturn<
  RecordType extends BaseRecord = BaseRecord,
> {
  // Table operation API (similar to pro-components ActionType)
  tableRef: React.MutableRefObject<
    CustomTableActionType<RecordType> | undefined
  >;

  // State and data
  dataSource: RecordType[];
  loading: boolean;
  error: Error | null;

  // Pagination information
  pagination: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, size?: number) => void;
  };

  // Selection information
  rowSelection: {
    selectedRowKeys: (string | number)[];
    onSelectionChange: (keys: (string | number)[]) => void;
    clearSelection: () => void;
  };

  // Operation methods
  actions: {
    reload: (resetPageIndex?: boolean) => Promise<void>;
    reset: () => void;
    refresh: () => Promise<void>;
    loadMore: () => Promise<void>;
    search: (query: Record<string, unknown>) => void;
  };
}
