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
import { useSearchParams } from '@modern-js/runtime/router';

/**
 * CustomTable State Management Hook
 * Responsible for handling basic state management of the table
 *
 * @date 2025-12-19
 */
import type { BaseQuery } from '@/custom-table/types';
import { logger } from '@veaiops/utils';
import type { Dispatch, SetStateAction } from 'react';
import { useCallback, useRef, useState } from 'react';

/**
 * @name Table state collection
 */
export interface TableState<QueryType extends BaseQuery> {
  // Pagination state
  current: number;
  setCurrent: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;

  // Query state
  query: QueryType;
  setQuery: Dispatch<SetStateAction<QueryType>>;

  // Sorter state
  sorter: SorterInfo;
  setSorter: (sorter: SorterInfo) => void;

  // URL parameter state
  searchParams: URLSearchParams;
  setSearchParams: (params: URLSearchParams) => void;

  // Other state
  resetEmptyData: boolean;
  setResetEmptyData: (reset: boolean) => void;
  expandedRowKeys: (string | number)[];
  setExpandedRowKeys: (keys: (string | number)[]) => void;

  // Marker state
  isQueryChangeRef: React.MutableRefObject<boolean>;
}

/**
 * @name State management configuration
 */
export interface TableStateConfig<QueryType extends BaseQuery> {
  /** @name Initial query parameters */
  initQuery?: Partial<QueryType>;
  /** @name Pagination configuration */
  pagination?: { pageSize?: number };
}

/**
 * @name Create table state management
 * @description Provide all basic state management required by the table
 */
export const useTableState = <QueryType extends BaseQuery = BaseQuery>(
  config: TableStateConfig<QueryType> = {},
): TableState<QueryType> => {
  const { initQuery = {}, pagination = {} } = config;

  // Basic state management
  const [current, setCurrent] = useState(1);
  const [pageSize, setPageSize] = useState(
    (typeof pagination === 'object' && pagination?.pageSize) || 10,
  );
  const [query, setQueryState] = useState(initQuery as QueryType);
  const [sorter, setSorterState] = useState<SorterInfo>({} as SorterInfo);
  const [searchParams, setSearchParams] = useSearchParams();
  const [resetEmptyData, setResetEmptyData] = useState(false);

  // Wrap setSorter to add logging
  const setSorter = useCallback(
    (newSorter: SorterInfo | ((prev: SorterInfo) => SorterInfo)) => {
      logger.log({
        message: 'setSorter called',
        data: {
          newSorter,
          currentSorter: sorter,
        },
        source: 'CustomTable',
        component: 'useTableState',
      });
      if (typeof newSorter === 'function') {
        setSorterState((prevSorter) => {
          const updatedSorter = newSorter(prevSorter);
          logger.log({
            message: 'setSorter updated',
            data: {
              prevSorter,
              updatedSorter,
            },
            source: 'CustomTable',
            component: 'useTableState',
          });
          return updatedSorter;
        });
      } else {
        setSorterState(newSorter);
        logger.log({
          message: 'setSorter updated (direct)',
          data: {
            newSorter,
          },
          source: 'CustomTable',
          component: 'useTableState',
        });
      }
    },
    [sorter],
  );

  // Wrap setQuery to add logging
  const setQuery = useCallback<Dispatch<SetStateAction<QueryType>>>(
    (newQuery) => {
      if (typeof newQuery === 'function') {
        setQueryState((prevQuery) => {
          const updatedQuery = newQuery(prevQuery);

          return updatedQuery;
        });
      } else {
        setQueryState(newQuery);
      }
    },
    [],
  );

  // Expanded row state management - reference pro-components design
  const [expandedRowKeys, setExpandedRowKeys] = useState<(string | number)[]>(
    [],
  );

  // Query change marker
  const isQueryChangeRef = useRef<boolean>(false);

  return {
    // Pagination state
    current,
    setCurrent,
    pageSize,
    setPageSize,

    // Query state
    query,
    setQuery,

    // Sorter state
    sorter,
    setSorter,

    // URL parameter state
    searchParams,
    setSearchParams,

    // Other state
    resetEmptyData,
    setResetEmptyData,
    expandedRowKeys,
    setExpandedRowKeys,

    // Marker state
    isQueryChangeRef,
  };
};
