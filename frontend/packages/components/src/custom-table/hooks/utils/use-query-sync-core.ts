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
import { getSearchParamsObject } from '@veaiops/utils';
import { isEqual } from 'lodash-es';
import type { MutableRefObject } from 'react';
import { useCallback } from 'react';
import { querySyncLogger } from '../internal/query-sync-logger';
import {
  normalizeQuery,
  normalizeUrlParams,
} from '../use-query-sync/utils/normalize';

interface UseQuerySyncCoreParams<QueryType> {
  config: QuerySyncConfig;
  context: QuerySyncContext<QueryType>;
  searchParams: URLSearchParams;
  setSearchParams: (
    params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
    options?: { replace?: boolean },
  ) => void;
  lastNormalizedQueryRef: MutableRefObject<Record<string, any>>;
  lastNormalizedUrlRef: MutableRefObject<string>;
}

export const useQuerySyncCore = <QueryType extends Record<string, any> = any>({
  config,
  context,
  searchParams,
  setSearchParams,
  lastNormalizedQueryRef,
  lastNormalizedUrlRef,
}: UseQuerySyncCoreParams<QueryType>) => {
  const syncQueryToUrl = useCallback(
    (query: QueryType) => {
      if (!config.syncQueryOnSearchParams) {
        querySyncLogger.debug({
          component: 'syncQueryToUrl',
          message: 'Skip - URL sync not enabled',
        });
        return;
      }

      const normalizedQuery = normalizeQuery(query);

      if (isEqual(normalizedQuery, lastNormalizedQueryRef.current)) {
        querySyncLogger.debug({
          component: 'syncQueryToUrl',
          message: '⏭️ Skip - query has not actually changed',
        });
        return;
      }

      querySyncLogger.info({
        component: 'syncQueryToUrl',
        message: '📤 Starting to sync query to URL',
        data: {
          normalizedQuery,
          lastQuery: lastNormalizedQueryRef.current,
        },
      });

      try {
        const newParams = new URLSearchParams();

        if (config.authQueryPrefixOnSearchParams) {
          for (const [key, value] of searchParams.entries()) {
            if (key in config.authQueryPrefixOnSearchParams) {
              newParams.set(key, value);
            }
          }
        }

        Object.entries(normalizedQuery).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            value.forEach((item) => {
              newParams.append(key, String(item));
            });
          } else {
            newParams.set(key, String(value));
          }
        });

        const newUrlStr = normalizeUrlParams(newParams);

        querySyncLogger.info({
          component: 'syncQueryToUrl',
          message: '📤 Setting URL parameters',
          data: {
            oldUrl: lastNormalizedUrlRef.current,
            newUrl: newUrlStr,
          },
        });

        setSearchParams(newParams, { replace: true });

        lastNormalizedQueryRef.current = normalizedQuery;
        lastNormalizedUrlRef.current = newUrlStr;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        querySyncLogger.error({
          component: 'syncQueryToUrl',
          message: 'Sync failed',
          data: {
            error: errorObj.message,
            errorObj,
          },
        });
      }
    },
    [
      config.syncQueryOnSearchParams,
      config.authQueryPrefixOnSearchParams,
      setSearchParams,
      lastNormalizedQueryRef,
      lastNormalizedUrlRef,
      searchParams,
    ],
  );

  const syncUrlToQuery = useCallback(() => {
    if (!config.syncQueryOnSearchParams) {
      querySyncLogger.debug({
        component: 'syncUrlToQuery',
        message: 'Skip - URL sync not enabled',
      });
      return {};
    }

    querySyncLogger.info({
      component: 'syncUrlToQuery',
      message: '📥 Starting to sync from URL to query',
      data: {
        hasQueryFormat: Boolean(config.queryFormat),
        searchParamsString: searchParams.toString(),
      },
    });

    let urlQuery: Record<string, any> = {};

    if (config.queryFormat) {
      const completeQueryFormat: Record<string, any> = {
        ...config.queryFormat,
      };

      for (const [key] of searchParams.entries()) {
        if (
          config.authQueryPrefixOnSearchParams &&
          key in config.authQueryPrefixOnSearchParams
        ) {
          continue;
        }

        if (!completeQueryFormat[key]) {
          completeQueryFormat[key] = ({ value }: any) => value;
        }
      }

      urlQuery = getSearchParamsObject({
        searchParams,
        queryFormat: completeQueryFormat,
      });
    } else {
      for (const [key, value] of searchParams.entries()) {
        if (
          config.authQueryPrefixOnSearchParams &&
          key in config.authQueryPrefixOnSearchParams
        ) {
          continue;
        }
        urlQuery[key] = value;
      }
    }

    if (config.authQueryPrefixOnSearchParams) {
      Object.keys(config.authQueryPrefixOnSearchParams).forEach((key) => {
        delete urlQuery[key];
      });
    }

    const normalizedUrlQuery = normalizeQuery(urlQuery);

    querySyncLogger.info({
      component: 'syncUrlToQuery',
      message: '📥 Returning normalized query',
      data: {
        urlQuery: normalizedUrlQuery,
      },
    });

    return normalizedUrlQuery;
  }, [
    config.syncQueryOnSearchParams,
    config.queryFormat,
    config.authQueryPrefixOnSearchParams,
    searchParams,
  ]);

  return {
    syncQueryToUrl,
    syncUrlToQuery,
  };
};
