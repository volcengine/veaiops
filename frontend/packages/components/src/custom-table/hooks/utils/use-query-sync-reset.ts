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
import type { MutableRefObject } from 'react';
import { useCallback } from 'react';
import { querySyncLogger } from '../internal/query-sync-logger';
import {
  normalizeQuery,
  normalizeUrlParams,
} from '../use-query-sync/utils/normalize';

interface UseQuerySyncResetParams<QueryType> {
  config: QuerySyncConfig;
  context: QuerySyncContext<QueryType>;
  searchParams: URLSearchParams;
  setSearchParams: (
    params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean },
  ) => void;
  isResettingRef: MutableRefObject<boolean>;
  lastNormalizedQueryRef: MutableRefObject<Record<string, any>>;
  lastNormalizedUrlRef: MutableRefObject<string>;
  syncCountRef: MutableRefObject<{ queryToUrl: number; urlToQuery: number }>;
}

export const useQuerySyncReset = <QueryType extends Record<string, any> = any>({
  config,
  context,
  searchParams,
  setSearchParams,
  isResettingRef,
  lastNormalizedQueryRef,
  lastNormalizedUrlRef,
  syncCountRef,
}: UseQuerySyncResetParams<QueryType>) => {
  const resetQuery = useCallback(
    (resetEmptyData = false, preservedFields?: Record<string, unknown>) => {
      isResettingRef.current = true;

      const baseInitQuery = config.initQuery || ({} as QueryType);

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

        context.setQuery(resetTargetQuery);
      }

      let newParams: URLSearchParams | undefined;
      if (!config.syncQueryOnSearchParams) {
        querySyncLogger.info({
          component: 'resetQuery',
          message: '⏭️ Skipping URL sync (syncQueryOnSearchParams is false)',
        });
        newParams = searchParams;
      } else {
        newParams = new URLSearchParams();

        if (config.authQueryPrefixOnSearchParams) {
          for (const [key, value] of searchParams.entries()) {
            if (key in config.authQueryPrefixOnSearchParams) {
              newParams.set(key, value);
            }
          }
        }

        if (resetTargetQuery && typeof resetTargetQuery === 'object') {
          Object.entries(resetTargetQuery).forEach(([key, value]) => {
            if (
              config.authQueryPrefixOnSearchParams &&
              key in config.authQueryPrefixOnSearchParams
            ) {
              return;
            }

            if (value === undefined || value === null || value === '') {
              return;
            }

            let formattedValue: string;
            const formatter = config.querySearchParamsFormat?.[key];
            if (formatter) {
              formattedValue = formatter(value);
            } else if (Array.isArray(value)) {
              if (newParams) {
                value.forEach((item) => {
                  newParams!.append(key, String(item));
                });
              }
              return;
            } else if (typeof value === 'object' && value !== null) {
              formattedValue = JSON.stringify(value);
            } else if (typeof value === 'string') {
              formattedValue = value;
            } else {
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

      const normalizedResetQuery = normalizeQuery(resetTargetQuery);
      lastNormalizedQueryRef.current = normalizedResetQuery;
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
      isResettingRef,
      lastNormalizedQueryRef,
      lastNormalizedUrlRef,
      syncCountRef,
    ],
  );

  return { resetQuery };
};
