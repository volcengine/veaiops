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
 * TableHelpers related type definitions
 * Migrated from hooks/internal/use-table-helpers.ts
 */

import type { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import type { BaseQuery } from './common';

/**
 * @name Helper method collection
 */
export interface TableHelpers<QueryType extends BaseQuery> {
  /** @name Handle query and filter changes */
  handleChange: {
    (key: string, value: unknown): void;
    (object: Record<string, unknown>): void;
  };
  /** @name Reset table state */
  reset: (options?: { resetEmptyData?: boolean }) => void;
  /** @name Set current page */
  setCurrent: (page: number) => void;
  /** @name Set page size */
  setPageSize: (size: number) => void;
  /** @name Set sorter */
  setSorter: (sorter: SorterInfo) => void;
  /** @name Set query parameters */
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  /** @name Set filter conditions */
  setFilters: (filters: Record<string, (string | number)[]>) => void;
  /** @name Set loading state */
  setLoading: (loading: boolean) => void;
  /** @name Set error state */
  setError: (error: Error | null) => void;
  /** @name Set reset empty data state */
  setResetEmptyData: (reset: boolean) => void;
  /** @name Set expanded row keys */
  setExpandedRowKeys: (keys: (string | number)[]) => void;
  /** @name Load more data */
  loadMoreData: () => void;
  /** @name Run query */
  run?: () => void;
}

/**
 * @name Helper configuration interface
 */
export interface TableHelpersConfig<QueryType extends BaseQuery> {
  /** @name Initial query parameters */
  initQuery: Partial<QueryType>;
  /** @name Filter reset preserve fields */
  filterResetKeys?: string[];
  /** @name Query sync related methods */
  querySync?: {
    resetQuery?: (resetEmptyData: boolean) => void;
  };
  /** @name Data source related methods */
  dataSourceMethods?: {
    setLoading?: (loading: boolean) => void;
    setError?: (error: Error | null) => void;
    setResetEmptyData?: (reset: boolean) => void;
    setExpandedRowKeys?: (keys: (string | number)[]) => void;
    loadMoreData?: () => void;
    run?: () => void;
  };
  /** @name Pagination related methods */
  paginationMethods?: {
    setCurrent?: (page: number) => void;
    setPageSize?: (size: number) => void;
  };
}

/**
 * Helper utility function type
 */
export type CreateTypedQuery = <QueryType extends BaseQuery>(
  query: Partial<QueryType> | Record<string, unknown>,
) => QueryType;
