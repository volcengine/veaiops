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
 * Table data fetching Hook related type definitions
 */
import type { BaseQuery, BaseRecord } from '../core';

/**
 * Table data fetching configuration
 */
export interface TableFetchOptions<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Request service */
  service?: (...args: unknown[]) => Promise<unknown>;
  /** Query parameters */
  params?: QueryType;
  /** Request configuration */
  options?: {
    manual?: boolean;
    ready?: boolean;
    refreshDeps?: unknown[];
    pollingInterval?: number;
    debounceWait?: number;
    throttleWait?: number;
    loadingDelay?: number;
    retryCount?: number;
    retryInterval?: number;
    cacheKey?: string;
    cacheTime?: number;
    staleTime?: number;
    formatResult?: <TResult = unknown>(data: TResult) => RecordType[];
    onBefore?: (params: QueryType) => void;
    onSuccess?: (data: RecordType[], params: QueryType) => void;
    onError?: (error: Error, params: QueryType) => void;
    onFinally?: (params: QueryType, data?: RecordType[], error?: Error) => void;
  };
  /** Whether to enable pagination */
  pagination?: boolean;
  /** Data formatting */
  formatResult?: <TResponse = unknown>(
    response: TResponse,
  ) => { data: RecordType[]; total: number };
}

/**
 * Table data fetching actions
 */
export interface TableFetchActions {
  // Request control
  run: (...args: unknown[]) => Promise<unknown>;
  runAsync: (...args: unknown[]) => Promise<unknown>;
  refresh: () => void;
  cancel: () => void;
  mutate: <TData = unknown>(data: TData) => void;

  // Pagination control
  reload: (resetCurrent?: boolean) => void;
  loadMore: () => void;

  // Cache control
  clearCache: () => void;
  refreshCache: () => void;

  // Polling control
  startPolling: () => void;
  stopPolling: () => void;
}

/**
 * Data source configuration
 */
export interface DataSourceConfig {
  /** Service instance */
  serviceInstance?: Record<string, unknown>;
  /** Service method name */
  serviceMethod?: string;
  /** Request function */
  request?: (...args: unknown[]) => Promise<unknown>;
  /** Response data formatting */
  formatPayload?: <TData = unknown, TResult = unknown>(data: TData) => TResult;
}

/**
 * useTableFetch Hook Props
 */
export interface UseTableFetchProps<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> extends TableFetchOptions<RecordType, QueryType> {
  /** Static data source */
  dataSource?: RecordType[] | DataSourceConfig;
  /** Manual trigger */
  manual?: boolean;
  /** Whether ready */
  ready?: boolean;
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
  /** Table state */
  tableState?: Record<string, unknown>;
}

/**
 * useTableFetch Hook return value
 */
export interface UseTableFetchReturn<TData = unknown, TParams = unknown> {
  actions: TableFetchActions;
  loading: boolean;
  error: Error | null;
  data: TData;
  params: TParams;
}
