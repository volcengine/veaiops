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
 * CustomTable filter and sort operations Hook
 * Responsible for handling all operations related to filtering, sorting, and querying
 *
 * @date 2025-12-19
 */
import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
} from '@/custom-table/types';
import type { SorterInfo } from '@arco-design/web-react/es/Table/interface';

/**
 * @name Filter and sort operation related instance methods
 */
export interface FilterActionMethods<QueryType extends BaseQuery> {
  // Filter operations
  /** @name Set filter conditions */
  setFilters: (newFilters: Record<string, (string | number)[]>) => void;
  /** @name Clear filter conditions */
  clearFilters: () => void;
  /** @name Get filter conditions */
  getFilters: () => Record<string, (string | number)[]>;
  /** @name Reset filter conditions */
  resetFilters: () => void;
  /** @name Apply filter conditions */
  applyFilters: (filters: Record<string, (string | number)[]>) => void;

  // Sort operations
  /** @name Set sort conditions */
  setSorter: (newSorter: SorterInfo) => void;
  /** @name Clear sort conditions */
  clearSorter: () => void;
  /** @name Reset sort conditions */
  resetSorter: () => void;
  /** @name Get sort conditions */
  getSorter: () => SorterInfo;

  // Query operations
  /** @name Set query parameters */
  setQuery: (query: Partial<BaseQuery>) => void;
  /** @name Get query parameters */
  getQuery: () => QueryType;
  /** @name Reset query parameters */
  resetQuery: () => void;
  /** @name Merge query parameters */
  mergeQuery: (query: Partial<BaseQuery>) => void;
}

/**
 * @name Create filter and sort operation methods
 * @description Based on pro-components filter and sort design pattern
 */
export const createFilterActions = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  context: PluginContext<RecordType, QueryType>,
  state: {
    filters: Record<string, (string | number)[]>;
    sorter: SorterInfo;
  },
): FilterActionMethods<QueryType> => {
  const { filters, sorter } = state;

  return {
    // Filter operations
    /** @name Set filter conditions */
    setFilters: (newFilters: Record<string, (string | number)[]>) =>
      context.helpers.setFilters(newFilters),

    /** @name Clear filter conditions */
    clearFilters: () => context.helpers.setFilters({}),

    /** @name Get filter conditions */
    getFilters: () => filters,

    /** @name Reset filter conditions */
    resetFilters: () => context.helpers.setFilters({}),

    /** @name Apply filter conditions */
    applyFilters: (filters: Record<string, (string | number)[]>) =>
      context.helpers.setFilters(filters),

    // Sort operations
    /** @name Set sort conditions */
    setSorter: (newSorter: SorterInfo) =>
      context.helpers.setSorter?.(newSorter),

    /** @name Clear sort conditions */
    clearSorter: () => context.helpers.setSorter?.({}),

    /** @name Reset sort conditions */
    resetSorter: () => context.helpers.setSorter?.({}),

    /** @name Get sort conditions */
    getSorter: () => sorter,

    // Query operations
    /** @name Set query parameters */
    setQuery: (query: Partial<BaseQuery>) =>
      context.helpers.setQuery(query as QueryType),

    /** @name Get query parameters */
    getQuery: () => context.state.query,

    /** @name Reset query parameters */
    resetQuery: () => context.helpers.setQuery({} as QueryType),

    /** @name Merge query parameters */
    mergeQuery: (query: Partial<BaseQuery>) => {
      const currentQuery = context.state.query;
      context.helpers.setQuery({ ...currentQuery, ...query });
    },
  };
};
