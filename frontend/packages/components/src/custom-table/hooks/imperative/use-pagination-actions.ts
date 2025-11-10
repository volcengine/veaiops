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
 * CustomTable pagination operations Hook
 * Responsible for handling all pagination-related operations
 *
 * @date 2025-12-19
 */
import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
} from '@/custom-table/types';

/**
 * @name Pagination information interface
 */
export interface PageInfo {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * @name Pagination operation related instance methods
 */
export interface PaginationActionMethods {
  /** @name Set current page number */
  setCurrentPage: (page: number) => void;
  /** @name Set page size */
  setPageSize: (size: number) => void;
  /** @name Set page number and page size */
  setPage: (page: number, pageWidth?: number) => void;
  /** @name Get current page number */
  getCurrentPage: () => number;
  /** @name Get page size */
  getPageSize: () => number;
  /** @name Get total count */
  getTotal: () => number;
  /** @name Reset pagination configuration */
  resetPagination: () => void;
  /** @name Get pagination information */
  getPage: () => PageInfo;
  /** @name Get page information (alias) */
  getPageInfo: () => { current: number; pageSize: number; total: number };
  /** @name Set page information */
  setPageInfo: (pageInfo: {
    current?: number;
    pageSize?: number;
    total?: number;
  }) => void;
}

/**
 * @name Create pagination operation methods
 * @description Based on pro-components pagination design pattern
 */
export const createPaginationActions = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  context: PluginContext<RecordType, QueryType>,
  state: {
    current: number;
    pageSize: number;
    tableTotal: number;
  },
): PaginationActionMethods => {
  const { current, pageSize, tableTotal } = state;

  return {
    /** @name Set current page number */
    setCurrentPage: (page: number) => context.helpers.setCurrent(page),

    /** @name Set page size */
    setPageSize: (size: number) => context.helpers.setPageSize(size),

    /** @name Set page number and page size */
    setPage: (page: number, pageWidth?: number) => {
      context.helpers.setCurrent(page);
      if (pageWidth) {
        context.helpers.setPageSize(pageWidth);
      }
    },

    /** @name Get current page number */
    getCurrentPage: () => current,

    /** @name Get page size */
    getPageSize: () => pageSize,

    /** @name Get total count */
    getTotal: () => tableTotal,

    /** @name Reset pagination configuration */
    resetPagination: () => {
      context.helpers.setCurrent(1);
      context.helpers.setPageSize(10);
    },

    /** @name Get pagination information */
    getPage: () => ({
      current,
      pageSize,
      total: tableTotal,
    }),

    /** @name Get page information (alias) */
    getPageInfo: () => ({
      current,
      pageSize,
      total: tableTotal,
    }),

    /** @name Set page information */
    setPageInfo: (pageInfo: {
      current?: number;
      pageSize?: number;
      total?: number;
    }) => {
      if (pageInfo.current !== undefined) {
        context.helpers.setCurrent(pageInfo.current);
      }
      if (pageInfo.pageSize !== undefined) {
        context.helpers.setPageSize(pageInfo.pageSize);
      }
      // total is usually set automatically through data loading, not handled here for now
    },
  };
};
