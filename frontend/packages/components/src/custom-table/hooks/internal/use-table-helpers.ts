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
import { logger } from '@veaiops/utils';

import type { BaseQuery } from '@/custom-table/types';
import { resetLogCollector } from '@/custom-table/utils/reset-log-collector';
/**
 * CustomTable Helper methods Hook
 * Responsible for handling various table operation methods
 *
 * @date 2025-12-19
 */
import { useCallback } from 'react';
import type { TableState } from './use-table-state';

// Type-safe query type creation function
const createTypedQuery = <QueryType extends BaseQuery>(
  query: Partial<QueryType> | Record<string, unknown>,
): QueryType => query as QueryType;

/**
 * Parameter interface for handling query and filter changes
 */
export interface HandleChangeSingleParams {
  key: string;
  value?: unknown;
}

/**
 * Parameter interface for handling query and filter changes (object mode)
 */
export interface HandleChangeObjectParams {
  updates: Record<string, unknown>;
}

/**
 * @name Helper methods collection
 * @deprecated Migrated to types/core/table-helpers.ts, please use the new import path
 */
export interface TableHelpers<QueryType extends BaseQuery> {
  /** @name Handle query and filter changes */
  handleChange: (
    params: HandleChangeSingleParams | HandleChangeObjectParams,
  ) => void;
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
  /** @name Filter reset preserved fields */
  filterResetKeys?: string[];
  /** @name Query sync related methods */
  querySync?: {
    resetQuery?: (
      resetEmptyData: boolean,
      preservedFields?: Record<string, unknown>,
    ) => void;
  };
  /** @name Data source related methods */
  dataSourceMethods?: {
    setLoading?: (loading: boolean) => void;
    setError?: (error: Error | null) => void;
    loadMoreData?: () => void;
  };
}

/**
 * @name useTableHelpers Hook parameter interface
 */
export interface UseTableHelpersParams<QueryType extends BaseQuery> {
  state: TableState<QueryType>;
  config: TableHelpersConfig<QueryType>;
  setFilters: (filters: Record<string, (string | number)[]>) => void;
}

/**
 * @name Create table Helper methods
 * @description Provides all helper methods needed for table operations
 */
export function useTableHelpers<QueryType extends BaseQuery = BaseQuery>({
  state,
  config,
  setFilters,
}: UseTableHelpersParams<QueryType>): TableHelpers<QueryType> {
  const {
    initQuery,
    filterResetKeys = [],
    querySync = {},
    dataSourceMethods = {},
  } = config;

  const {
    setCurrent,
    setPageSize,
    setSorter,
    setQuery,
    setSearchParams,
    setResetEmptyData,
    setExpandedRowKeys,
    query: finalQuery,
  } = state;

  // Handle query and filter changes - use object destructuring
  const handleChange = useCallback(
    (params: HandleChangeSingleParams | HandleChangeObjectParams) => {
      // Determine parameter type
      const isSingleParam = 'key' in params;
      const keyOrObject = isSingleParam ? params.key : params.updates;
      const value = isSingleParam ? params.value : undefined;

      // Record handleChange call
      logger.info({
        message: `[TableHelpers] handleChange - key=${JSON.stringify(keyOrObject)}, value=${JSON.stringify(value)}`,
        data: {
          valueType: typeof value,
          isArray: Array.isArray(value),
        },
        source: 'CustomTable',
        component: 'useTableHelpers/handleChange',
      });

      let newQuery: QueryType;

      if (isSingleParam && typeof keyOrObject === 'string') {
        // handleChange({ key: string, value?: unknown })
        // 🔧 Fix: If value is empty array or undefined, remove the field from query
        // This ensures empty filter parameters are not retained in URL
        const shouldRemoveField =
          value === undefined ||
          value === null ||
          (Array.isArray(value) && value.length === 0);

        // Note: newQuery here is calculated based on finalQuery in closure
        // May be old value, actual update will recalculate based on latest prevQuery in setQuery functional update
        newQuery = createTypedQuery<QueryType>(
          shouldRemoveField
            ? (() => {
                const { [keyOrObject]: _, ...rest } = finalQuery;
                return rest;
              })()
            : {
                ...finalQuery,
                [keyOrObject]: value,
              },
        );
      } else {
        // handleChange({ updates: Record<string, unknown> })
        // Note: newQuery here is calculated based on finalQuery in closure
        // May be old value, actual update will recalculate based on latest prevQuery in setQuery functional update
        const updates = !isSingleParam ? params.updates : {};
        newQuery = createTypedQuery<QueryType>({
          ...finalQuery,
          ...updates,
        });
      }

      // 🔧 Key fix: Use functional update to ensure based on latest query value
      // Avoid closure issue: finalQuery in handleChange may be old value
      // Solution: Reapply updates based on prevQuery (latest value) in setQuery
      setQuery((prevQuery) => {
        // Recalculate newQuery based on latest prevQuery
        let actualNewQuery: QueryType;

        if (isSingleParam && typeof keyOrObject === 'string') {
          // Single field update: based on prevQuery instead of finalQuery in closure
          const shouldRemoveField =
            value === undefined ||
            value === null ||
            (Array.isArray(value) && value.length === 0);

          actualNewQuery = createTypedQuery<QueryType>(
            shouldRemoveField
              ? (() => {
                  const { [keyOrObject]: _, ...rest } = prevQuery;
                  return rest;
                })()
              : {
                  ...prevQuery,
                  [keyOrObject]: value,
                },
          );
        } else {
          // Object update: merge into prevQuery
          const updates = !isSingleParam ? params.updates : {};
          actualNewQuery = createTypedQuery<QueryType>({
            ...prevQuery,
            ...updates,
          });
        }

        logger.info({
          message:
            '[TableHelpers] 🔍 setQuery functional update (from handleChange)',
          data: {
            prevQuery,
            prevQueryStringified: JSON.stringify(prevQuery),
            prevQueryKeys: Object.keys(prevQuery || {}),
            params,
            actualNewQuery,
            actualNewQueryStringified: JSON.stringify(actualNewQuery),
            actualNewQueryKeys: Object.keys(actualNewQuery || {}),
            preservedKeys: Object.keys(prevQuery || {}).filter(
              (key) => key in (actualNewQuery || {}),
            ),
            addedKeys: Object.keys(actualNewQuery || {}).filter(
              (key) => !(key in (prevQuery || {})),
            ),
            removedKeys: Object.keys(prevQuery || {}).filter(
              (key) => !(key in (actualNewQuery || {})),
            ),
          },
          source: 'CustomTable',
          component: 'useTableHelpers/setQuery',
        });
        return actualNewQuery;
      });
    },
    // 🔧 Fix: Remove finalQuery dependency to avoid recreating handleChange on every query change
    // handleChange internally uses functional update and will get latest prevQuery
    [setQuery],
  );

  // Reset method
  const reset = useCallback(
    ({ resetEmptyData: newResetEmptyData = false } = {}) => {
      // Start reset session
      resetLogCollector.startSession();

      resetLogCollector.log({
        component: 'TableHelpers',
        method: 'reset',
        action: 'start',
        data: {
          resetEmptyData: newResetEmptyData,
          currentQuery: finalQuery,
          filterResetKeys,
          initQuery,
          hasQuerySync: Boolean(querySync.resetQuery),
        },
      });

      try {
        // Preserve fields specified in filterResetKeys
        const preservedFields =
          filterResetKeys.reduce(
            (acc: Record<string, unknown>, key: string) => {
              if ((finalQuery as Record<string, unknown>)[key] !== undefined) {
                acc[key] = (finalQuery as Record<string, unknown>)[key];
              }
              return acc;
            },
            {} as Record<string, unknown>,
          ) || {};

        resetLogCollector.log({
          component: 'TableHelpers',
          method: 'reset',
          action: 'call',
          data: {
            preservedFields,
            preservedFieldsCount: Object.keys(preservedFields).length,
          },
        });

        // Use reset method of query parameter sync plugin
        if (querySync.resetQuery) {
          resetLogCollector.log({
            component: 'TableHelpers',
            method: 'reset',
            action: 'call',
            data: {
              method: 'querySync.resetQuery',
              resetEmptyData: newResetEmptyData,
              preservedFields,
              preservedFieldsCount: Object.keys(preservedFields).length,
            },
          });
          // 🔧 Pass preservedFields to reset method to ensure merge with initQuery
          querySync.resetQuery(newResetEmptyData, preservedFields);
        } else {
          resetLogCollector.log({
            component: 'TableHelpers',
            method: 'reset',
            action: 'call',
            data: {
              method: 'direct reset',
              newQuery: { ...initQuery, ...preservedFields },
            },
          });
          setQuery(
            createTypedQuery<QueryType>({ ...initQuery, ...preservedFields }),
          );
          setSearchParams(new URLSearchParams());
        }

        setResetEmptyData(newResetEmptyData);

        resetLogCollector.log({
          component: 'TableHelpers',
          method: 'reset',
          action: 'end',
          data: {
            success: true,
            resetEmptyData: newResetEmptyData,
          },
        });
      } catch (_error: any) {
        // ✅ Correct: Expose actual error information
        const errorMessage =
          _error instanceof Error ? _error.message : String(_error);
        const errorStack = _error instanceof Error ? _error.stack : undefined;
        resetLogCollector.log({
          component: 'TableHelpers',
          method: 'reset',
          action: 'error',
          data: {
            error: errorMessage,
            stack: errorStack,
          },
        });
        // ✅ Correct: Convert error to Error object before throwing (compliant with @typescript-eslint/only-throw-error rule)
        const errorObj =
          _error instanceof Error ? _error : new Error(String(_error));
        throw errorObj;
      } finally {
        // End reset session
        resetLogCollector.endSession();
      }
    },
    [
      filterResetKeys,
      finalQuery,
      initQuery,
      setSearchParams,
      querySync,
      setQuery,
      setResetEmptyData,
    ],
  );

  // Load more data
  const loadMoreData = useCallback(() => {
    if (dataSourceMethods.loadMoreData) {
      dataSourceMethods.loadMoreData();
    }
  }, [dataSourceMethods.loadMoreData]);

  // Set loading state
  const setLoading = useCallback(
    (loading: boolean) => {
      if (dataSourceMethods.setLoading) {
        dataSourceMethods.setLoading(loading);
      }
    },
    [dataSourceMethods],
  );

  // Set error state
  const setError = useCallback(
    (error: Error | null) => {
      if (dataSourceMethods.setError) {
        dataSourceMethods.setError(error);
      }
    },
    [dataSourceMethods],
  );

  return {
    handleChange,
    reset,
    setCurrent,
    setPageSize,
    setSorter,
    setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => {
      if (typeof query === 'function') {
        const currentQuery = finalQuery;
        const newQuery = query(currentQuery);
        setQuery(createTypedQuery<QueryType>(newQuery));
      } else {
        setQuery(query);
      }
    },
    setFilters,
    setLoading,
    setError,
    setResetEmptyData,
    setExpandedRowKeys,
    loadMoreData,
  };
}
