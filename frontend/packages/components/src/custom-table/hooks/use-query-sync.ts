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
 * URL Query Parameters Synchronization Hook
 * Responsible for bidirectional synchronization between table query state and URL parameters
 */

import type {
  QuerySyncConfig,
  QuerySyncContext,
} from '@/custom-table/types/plugins/query-sync';
import { useSearchParams } from '@modern-js/runtime/router';
import { getSearchParamsObject, logger } from '@veaiops/utils';
import { useMount, useUpdateEffect } from 'ahooks';
import { isEmpty, isEqual } from 'lodash-es';
import { useCallback, useEffect, useRef } from 'react';

/**
 * Normalize query object for accurate comparison
 *
 * Edge case handling:
 * - Remove undefined/null/empty strings
 * - Sort arrays to ensure consistent order
 * - Recursively process nested objects
 */
const normalizeQuery = (query: Record<string, any>): Record<string, any> => {
  const normalized: Record<string, any> = {};

  Object.entries(query || {}).forEach(([key, value]) => {
    // Skip invalid values
    if (value === undefined || value === null || value === '') {
      return;
    }

    // Handle arrays: filter empty values and sort
    if (Array.isArray(value)) {
      const filtered = value.filter(
        (v) => v !== undefined && v !== null && v !== '',
      );
      if (filtered.length > 0) {
        // Sort to ensure consistent order (numbers and strings sorted separately)
        normalized[key] = [...filtered].sort((a, b) => {
          if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
          }
          return String(a).localeCompare(String(b));
        });
      }
      return;
    }

    // Handle objects: recursively normalize
    if (typeof value === 'object' && value !== null) {
      const nested = normalizeQuery(value);
      if (!isEmpty(nested)) {
        normalized[key] = nested;
      }
      return;
    }

    normalized[key] = value;
  });

  return normalized;
};

/**
 * Normalize URL parameter string for accurate comparison
 */
const normalizeUrlParams = (searchParams: URLSearchParams): string => {
  const params = new URLSearchParams();
  const entries = Array.from(searchParams.entries());

  // Filter empty values and sort
  const filtered = entries.filter(([_, value]) => value !== '');
  filtered.sort((a, b) => {
    if (a[0] !== b[0]) {
      return a[0].localeCompare(b[0]);
    }
    return String(a[1]).localeCompare(String(b[1]));
  });

  // Rebuild parameters
  filtered.forEach(([key, value]) => {
    params.append(key, value);
  });

  return params.toString();
};

/**
 * Query Parameters Synchronization Hook
 */
export const useQuerySync = <QueryType extends Record<string, any> = any>(
  config: QuerySyncConfig,
  context: QuerySyncContext<QueryType>,
): {
  query: QueryType;
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  syncQueryToUrl: (query: QueryType) => void;
  resetQuery: () => void;
} => {
  const [searchParams, setSearchParams] = useSearchParams();

  // State control flags
  const isInitializedRef = useRef(false); // Whether initialized
  const isResettingRef = useRef(false); // Whether resetting

  // Flags to prevent circular synchronization
  const isSyncingToUrlRef = useRef(false); // Syncing query→URL
  const isSyncingToQueryRef = useRef(false); // Syncing URL→query

  // Real change detection: record normalized values
  const lastNormalizedQueryRef = useRef<Record<string, any>>({});
  const lastNormalizedUrlRef = useRef<string>('');

  // Loop detection and automatic circuit breaker
  const syncCountRef = useRef({ queryToUrl: 0, urlToQuery: 0 });
  const lastResetTimeRef = useRef(Date.now());
  const SYNC_LIMIT = 5; // Consecutive sync limit: 5 times
  const RESET_INTERVAL = 1000; // Reset interval: 1 second
  /**
   * Synchronize query parameters to URL
   *
   * Edge case handling:
   * - Normalize query before comparison to avoid type conversion loops
   * - Filter empty values (undefined/null/"")
   * - Correctly serialize array parameters
   * - Preserve authentication parameters
   */
  const syncQueryToUrl = useCallback(
    (query: QueryType) => {
      if (!config.syncQueryOnSearchParams) {
        return;
      }

      // Normalize query for comparison
      const normalizedQuery = normalizeQuery(query);

      // Real change detection: use deep comparison
      if (isEqual(normalizedQuery, lastNormalizedQueryRef.current)) {
        return;
      }

      try {
        const newParams = new URLSearchParams();

        // Preserve authentication parameters
        if (config.authQueryPrefixOnSearchParams) {
          for (const [key, value] of searchParams.entries()) {
            if (key in config.authQueryPrefixOnSearchParams) {
              newParams.set(key, value);
            }
          }
        }

        // Add normalized query parameters
        Object.entries(normalizedQuery).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              newParams.append(key, String(item));
            });
          } else {
            // Use querySearchParamsFormat to format parameter values
            const formatter = config.querySearchParamsFormat?.[key];
            const formattedValue = formatter ? formatter(value) : String(value);

            newParams.set(key, formattedValue);
          }
        });

        const newUrlStr = normalizeUrlParams(newParams);

        setSearchParams(newParams, { replace: true });

        // Record normalized values
        lastNormalizedQueryRef.current = normalizedQuery;
        lastNormalizedUrlRef.current = newUrlStr;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'Failed to sync query to URL',
          data: {
            error: errorObj.message,
            errorObj,
          },
          source: 'useQuerySync',
          component: 'syncQueryToUrl',
        });
      }
    },
    // Key: only depend on config items, not searchParams (access latest value through closure)
    [
      config.syncQueryOnSearchParams,
      config.authQueryPrefixOnSearchParams,
      setSearchParams,
    ],
  );

  /**
   * Synchronize from URL to query parameters
   *
   * Edge case handling:
   * - queryFormat value type conversion
   * - Empty parameter filtering
   * - Authentication parameter exclusion
   * - Add default formatting function for undefined fields
   */
  const syncUrlToQuery = useCallback(() => {
    if (!config.syncQueryOnSearchParams) {
      return {};
    }

    // Fix: In useActiveKeyHook mode, directly get latest params from window.location.search
    const actualSearchParams = config.useActiveKeyHook
      ? (() => {
          const { search } = window.location;
          const windowParams = new URLSearchParams(search);

          // If window.location.search has parameters, use it
          if (search) {
            return windowParams;
          }

          // If window.location.search is empty but context.searchParams has parameters, use context
          const contextSearch = searchParams.toString();
          if (contextSearch) {
            return searchParams;
          }

          // Both empty, return empty URLSearchParams
          return new URLSearchParams();
        })()
      : searchParams;

    // Use queryFormat to format URL parameters
    let urlQuery: Record<string, any> = {};

    if (config.queryFormat) {
      // Add formatting function for all URL parameters (including undefined ones)
      const completeQueryFormat: Record<string, any> = {
        ...config.queryFormat,
      };

      for (const [key] of actualSearchParams.entries()) {
        // Skip authentication parameters
        if (
          config.authQueryPrefixOnSearchParams &&
          key in config.authQueryPrefixOnSearchParams
        ) {
          continue;
        }

        // Add default formatting for undefined fields
        if (!completeQueryFormat[key]) {
          completeQueryFormat[key] = ({ value }: any) => value;
        }
      }

      urlQuery = getSearchParamsObject({
        searchParams: actualSearchParams,
        queryFormat: completeQueryFormat,
      });
    } else {
      // Default parsing (all values as strings)
      for (const [key, value] of actualSearchParams.entries()) {
        if (
          config.authQueryPrefixOnSearchParams &&
          key in config.authQueryPrefixOnSearchParams
        ) {
          continue;
        }
        urlQuery[key] = value;
      }
    }

    // Filter authentication parameters
    if (config.authQueryPrefixOnSearchParams) {
      Object.keys(config.authQueryPrefixOnSearchParams).forEach((key) => {
        delete urlQuery[key];
      });
    }

    // Return after normalization
    const normalizedUrlQuery = normalizeQuery(urlQuery);

    return normalizedUrlQuery;
  }, [
    config.syncQueryOnSearchParams,
    config.queryFormat,
    config.authQueryPrefixOnSearchParams,
    config.useActiveKeyHook,
    searchParams,
  ]);

  /**
   * Reset query parameters
   * Fix: Use initQuery instead of empty object to ensure reset to initial state
   * Edge case handling:
   * - initQuery is empty object or undefined: reset to empty object
   * - preservedFields merged with initQuery: preservedFields has higher priority
   * - querySearchParamsFormat formats URL parameters
   * - URL synchronization of array parameters
   * - Preservation of authentication parameters
   * - Don't sync to URL when syncQueryOnSearchParams is false
   */
  const resetQuery = useCallback(
    (resetEmptyData = false, preservedFields?: Record<string, unknown>) => {
      isResettingRef.current = true;

      // Get initQuery (may be empty object or undefined)
      const baseInitQuery = config.initQuery || ({} as QueryType);

      // Merge preservedFields (preservedFields has higher priority)
      const resetTargetQuery = {
        ...baseInitQuery,
        ...(preservedFields || {}),
      } as QueryType;

      if (config.customReset) {
        // Pass initQuery and preservedFields to customReset
        config.customReset({
          resetEmptyData,
          setQuery: context.setQuery as any,
          initQuery: config.initQuery,
          preservedFields,
        });
      } else {
        // Fix: Reset to resetTargetQuery (initQuery + preservedFields)
        context.setQuery(resetTargetQuery);
      }

      // Sync URL parameters to resetTargetQuery (preserve authentication parameters)
      // Edge case: Don't sync to URL when syncQueryOnSearchParams is false
      let newParams: URLSearchParams | undefined;
      if (!config.syncQueryOnSearchParams) {
        // Edge case: When not syncing, newParams uses current searchParams
        newParams = searchParams;
      } else {
        newParams = new URLSearchParams();

        // Preserve authentication parameters
        if (config.authQueryPrefixOnSearchParams) {
          for (const [key, value] of searchParams.entries()) {
            if (key in config.authQueryPrefixOnSearchParams) {
              newParams.set(key, value);
            }
          }
        }

        // Sync non-empty values from resetTargetQuery to URL
        // Edge case: Consider querySearchParamsFormat formatting
        if (resetTargetQuery && typeof resetTargetQuery === 'object') {
          Object.entries(resetTargetQuery).forEach(([key, value]) => {
            // Skip authentication parameters
            if (
              config.authQueryPrefixOnSearchParams &&
              key in config.authQueryPrefixOnSearchParams
            ) {
              return;
            }

            // Edge case: Skip empty values (undefined, null, empty string)
            if (value === undefined || value === null || value === '') {
              return;
            }

            // Edge case: Use querySearchParamsFormat to format (if exists)
            let formattedValue: string;
            const formatter = config.querySearchParamsFormat?.[key];
            if (formatter) {
              formattedValue = formatter(value);
            } else if (Array.isArray(value)) {
              // Edge case: Array parameter, add each element individually
              if (newParams) {
                value.forEach((item) => {
                  newParams!.append(key, String(item));
                });
              }
              return; // Array already handled, skip subsequent single value setting
            } else if (typeof value === 'object' && value !== null) {
              // Edge case: Object value (but not array), serialize to JSON
              formattedValue = JSON.stringify(value);
            } else if (typeof value === 'string') {
              formattedValue = value;
            } else {
              // Edge case: Numbers, booleans, etc., convert to string
              formattedValue = String(value);
            }

            if (newParams) {
              newParams.set(key, formattedValue);
            }
          });
        }

        setSearchParams(newParams, { replace: true });
      }

      // Reset all state (regardless of whether syncing to URL)
      const normalizedResetQuery = normalizeQuery(resetTargetQuery);
      lastNormalizedQueryRef.current = normalizedResetQuery;
      // Edge case: Use newParams (new parameters if syncing to URL, otherwise current searchParams)
      lastNormalizedUrlRef.current = normalizeUrlParams(
        newParams || searchParams,
      );
      syncCountRef.current = { queryToUrl: 0, urlToQuery: 0 };

      setTimeout(() => {
        isResettingRef.current = false;
      }, 100);
    },
    [
      config.customReset,
      config.initQuery,
      config.authQueryPrefixOnSearchParams,
      config.syncQueryOnSearchParams,
      config.querySearchParamsFormat,
      context.setQuery,
      context.query,
      setSearchParams,
      searchParams,
    ],
  );

  /**
   * Initialization: Execute only once on mount
   */
  useMount(() => {
    if (isInitializedRef.current) {
      return;
    }

    if (!config.syncQueryOnSearchParams) {
      isInitializedRef.current = true;
      return;
    }

    // Initialize query from URL

    const urlQuery = syncUrlToQuery();
    const normalizedCurrentQuery = normalizeQuery(context.query);

    if (!isEmpty(urlQuery)) {
      // Use normalized values to merge
      context.setQuery((prev) => {
        const normalizedPrev = normalizeQuery(prev);
        const merged = {
          ...normalizedPrev,
          ...urlQuery,
        };

        return merged as QueryType;
      });

      // Record initial state
      lastNormalizedQueryRef.current = urlQuery;
      lastNormalizedUrlRef.current = normalizeUrlParams(searchParams);
    } else if (!isEmpty(normalizedCurrentQuery)) {
      syncQueryToUrl(normalizedCurrentQuery as QueryType);
    }

    isInitializedRef.current = true;
  });

  /**
   * Listen for query changes → sync to URL
   *
   * Use useUpdateEffect to avoid initial render trigger
   * Use normalized comparison to avoid type conversion loops
   */
  useUpdateEffect(() => {
    // Skip conditions
    if (isResettingRef.current || !isInitializedRef.current) {
      syncCountRef.current.queryToUrl = 0;
      return;
    }

    // Prevent reverse sync trigger
    if (isSyncingToQueryRef.current) {
      return;
    }

    if (!config.syncQueryOnSearchParams) {
      return;
    }

    // Normalize query
    const normalizedQuery = normalizeQuery(context.query);

    // Real change detection: deep comparison of normalized values
    if (isEqual(normalizedQuery, lastNormalizedQueryRef.current)) {
      syncCountRef.current.queryToUrl = 0;
      return;
    }

    // Loop detection: time window reset
    const now = Date.now();
    if (now - lastResetTimeRef.current > RESET_INTERVAL) {
      syncCountRef.current = { queryToUrl: 0, urlToQuery: 0 };
      lastResetTimeRef.current = now;
    }

    // Loop detection: circuit breaker for consecutive sync limit exceeded
    syncCountRef.current.queryToUrl++;
    if (syncCountRef.current.queryToUrl > SYNC_LIMIT) {
      logger.error({
        message:
          '[QuerySync] Infinite loop detected! query → URL has been circuit-broken. Check queryFormat configuration!',
        data: {
          syncCount: syncCountRef.current.queryToUrl,
          normalizedQuery,
          lastNormalizedQuery: lastNormalizedQueryRef.current,
        },
        source: 'CustomTable',
        component: 'QuerySync',
      });
      return;
    }

    // Sync to URL
    if (!isEmpty(normalizedQuery)) {
      isSyncingToUrlRef.current = true;

      try {
        syncQueryToUrl(normalizedQuery as QueryType);
        syncCountRef.current.urlToQuery = 0; // Reset reverse count
      } finally {
        setTimeout(() => {
          isSyncingToUrlRef.current = false;
        }, 0);
      }
    }
  }, [context.query]);

  /**
   * Listen for URL changes → sync to query
   *
   * Use useEffect (not useUpdateEffect) because it needs to respond to URL changes
   * Use normalized comparison to avoid type conversion loops
   */
  useEffect(() => {
    // Skip conditions
    if (isResettingRef.current || !isInitializedRef.current) {
      syncCountRef.current.urlToQuery = 0;
      return;
    }

    // Prevent reverse sync trigger
    if (isSyncingToUrlRef.current) {
      return;
    }

    if (!config.syncQueryOnSearchParams) {
      return;
    }

    // Normalize URL
    const normalizedUrl = normalizeUrlParams(searchParams);

    // Real change detection: string comparison
    if (normalizedUrl === lastNormalizedUrlRef.current) {
      syncCountRef.current.urlToQuery = 0;
      return;
    }

    // Loop detection: time window reset
    const now = Date.now();
    if (now - lastResetTimeRef.current > RESET_INTERVAL) {
      syncCountRef.current = { queryToUrl: 0, urlToQuery: 0 };
      lastResetTimeRef.current = now;
    }

    // Loop detection: circuit breaker for consecutive sync limit exceeded
    syncCountRef.current.urlToQuery++;
    if (syncCountRef.current.urlToQuery > SYNC_LIMIT) {
      logger.error({
        message:
          '[QuerySync] Infinite loop detected! URL → query has been circuit-broken. Check URL parameter format!',
        data: {
          syncCount: syncCountRef.current.urlToQuery,
          currentUrl: normalizedUrl,
          lastUrl: lastNormalizedUrlRef.current,
        },
        source: 'CustomTable',
        component: 'QuerySync',
      });
      return;
    }

    // Sync from URL
    const urlQuery = syncUrlToQuery();

    if (!isEmpty(urlQuery)) {
      isSyncingToQueryRef.current = true;

      try {
        context.setQuery((prev) => {
          const normalizedPrev = normalizeQuery(prev);
          const merged = {
            ...normalizedPrev,
            ...urlQuery,
          };

          return merged as QueryType;
        });

        // Record normalized values
        lastNormalizedUrlRef.current = normalizedUrl;
        lastNormalizedQueryRef.current = urlQuery;
        syncCountRef.current.queryToUrl = 0; // Reset reverse count
      } finally {
        setTimeout(() => {
          isSyncingToQueryRef.current = false;
        }, 0);
      }
    } else {
      lastNormalizedUrlRef.current = normalizedUrl;
      syncCountRef.current.urlToQuery = 0;
    }
  }, [searchParams]);

  return {
    query: context.query,
    setQuery: context.setQuery,
    syncQueryToUrl,
    resetQuery,
  };
};
