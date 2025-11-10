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

import type {
  QuerySyncConfig,
  QuerySyncContext,
} from '@/custom-table/types/plugins/query-sync';
import type React from 'react';
import { querySyncLogger } from '../internal/query-sync-logger';
import { normalizeQuery, normalizeUrlParams } from './normalize';

export interface CreateResetQueryParams<QueryType> {
  config: QuerySyncConfig;
  context: QuerySyncContext<QueryType>;
  searchParams: URLSearchParams;
  setSearchParams: (
    params: URLSearchParams,
    options?: { replace?: boolean },
  ) => void;
  isResettingRef: React.MutableRefObject<boolean>;
  lastNormalizedQueryRef: React.MutableRefObject<Record<string, any>>;
  lastNormalizedUrlRef: React.MutableRefObject<string>;
  syncCountRef: React.MutableRefObject<{
    queryToUrl: number;
    urlToQuery: number;
  }>;
}

export function createResetQuery<QueryType extends Record<string, any> = any>({
  config,
  context,
  searchParams,
  setSearchParams,
  isResettingRef,
  lastNormalizedQueryRef,
  lastNormalizedUrlRef,
  syncCountRef,
}: CreateResetQueryParams<QueryType>) {
  return (
    resetEmptyData = false,
    preservedFields?: Record<string, unknown>,
  ) => {
    isResettingRef.current = true;

    // 🔍 Get initQuery (may be empty object or undefined)
    const baseInitQuery = config.initQuery || ({} as QueryType);

    // 🔧 Merge preservedFields (preservedFields has higher priority)
    const resetTargetQuery = {
      ...baseInitQuery,
      ...(preservedFields || {}),
    } as QueryType;

    querySyncLogger.info({
      component: 'resetQuery',
      message: '🔄 Resetting query parameters',
      data: {
        hasInitQuery: Boolean(config.initQuery),
        initQuery: config.initQuery,
        preservedFields,
        resetTargetQuery,
        currentQuery: context.query,
        hasCustomReset: Boolean(config.customReset),
        resetEmptyData,
      },
    });

    if (config.customReset) {
      querySyncLogger.info({
        component: 'resetQuery',
        message: '🔄 Using customReset',
        data: {
          initQuery: config.initQuery,
          preservedFields,
          resetTargetQuery,
        },
      });

      // 🔧 Pass initQuery and preservedFields to customReset
      config.customReset({
        resetEmptyData,
        setQuery: context.setQuery as any,
        initQuery: config.initQuery,
        preservedFields,
      });
    } else {
      querySyncLogger.info({
        component: 'resetQuery',
        message: '🔄 Using default reset logic',
        data: {
          initQuery: config.initQuery,
          preservedFields,
          resetTargetQuery,
          currentQuery: context.query,
        },
      });

      // 🔧 Fix: Reset to resetTargetQuery (initQuery + preservedFields)
      context.setQuery(resetTargetQuery);
    }

    // 🔧 Sync URL parameters to resetTargetQuery (preserve authentication parameters)
    // 🎯 Edge case: If syncQueryOnSearchParams is false, don't sync to URL
    let newParams: URLSearchParams | undefined;
    if (!config.syncQueryOnSearchParams) {
      querySyncLogger.info({
        component: 'resetQuery',
        message: '⏭️ Skipping URL sync (syncQueryOnSearchParams is false)',
      });
      // 🎯 Edge case: When not syncing, newParams uses current searchParams
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

      // 🔧 Synchronize non-empty values from resetTargetQuery to URL
      // 🎯 Edge case: Consider querySearchParamsFormat formatting
      if (resetTargetQuery && typeof resetTargetQuery === 'object') {
        Object.entries(resetTargetQuery).forEach(([key, value]) => {
          // Skip authentication parameters
          if (
            config.authQueryPrefixOnSearchParams &&
            key in config.authQueryPrefixOnSearchParams
          ) {
            return;
          }

          // 🎯 Edge case: Skip empty values (undefined, null, empty string)
          if (value === undefined || value === null || value === '') {
            return;
          }

          // 🎯 Edge case: Use querySearchParamsFormat formatting (if exists)
          let formattedValue: string;
          const formatter = config.querySearchParamsFormat?.[key];
          if (formatter) {
            formattedValue = formatter(value);
          } else if (Array.isArray(value)) {
            // 🎯 Edge case: Array parameters, add each element separately
            if (newParams) {
              value.forEach((item) => {
                newParams!.append(key, String(item));
              });
            }
            return; // Array already processed, skip subsequent single value setting
          } else if (typeof value === 'object' && value !== null) {
            // 🎯 Edge case: Object value (but not array), serialize to JSON
            formattedValue = JSON.stringify(value);
          } else if (typeof value === 'string') {
            formattedValue = value;
          } else {
            // 🎯 Edge case: Numbers, booleans, etc., convert to string
            formattedValue = String(value);
          }

          if (newParams) {
            newParams.set(key, formattedValue);
          }
        });
      }

      querySyncLogger.info({
        component: 'resetQuery',
        message: '🔄 Updating URL parameters',
        data: {
          newParams: newParams.toString(),
          resetTargetQuery,
          hasQuerySearchParamsFormat: Boolean(config.querySearchParamsFormat),
        },
      });

      setSearchParams(newParams, { replace: true });
    }

    // 🔧 Reset all state (regardless of whether syncing to URL)
    const normalizedResetQuery = normalizeQuery(resetTargetQuery);
    lastNormalizedQueryRef.current = normalizedResetQuery;
    // 🎯 Edge case: Use newParams (if syncing to URL, use new params, otherwise use current searchParams)
    lastNormalizedUrlRef.current = normalizeUrlParams(
      newParams || searchParams,
    );
    syncCountRef.current = { queryToUrl: 0, urlToQuery: 0 };

    querySyncLogger.info({
      component: 'resetQuery',
      message: '🔄 Reset completed',
      data: {
        resetTargetQuery,
        normalizedResetQuery,
        finalQuery: context.query,
        finalUrl: window.location.href,
      },
    });

    setTimeout(() => {
      isResettingRef.current = false;
    }, 100);
  };
}
