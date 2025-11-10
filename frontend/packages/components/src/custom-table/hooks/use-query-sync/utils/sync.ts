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

import type { QuerySyncConfig } from '@/custom-table/types/plugins/query-sync';
import { getSearchParamsObject } from '@veaiops/utils';
import { isEqual } from 'lodash-es';
import type React from 'react';
import { querySyncLogger } from '../internal/query-sync-logger';
import { normalizeQuery, normalizeUrlParams } from './normalize';

export interface CreateSyncFunctionsParams<QueryType> {
  config: QuerySyncConfig;
  searchParams: URLSearchParams;
  setSearchParams: (
    params: URLSearchParams,
    options?: { replace?: boolean },
  ) => void;
  lastNormalizedQueryRef: React.MutableRefObject<Record<string, any>>;
  lastNormalizedUrlRef: React.MutableRefObject<string>;
}

export function createSyncQueryToUrl<
  QueryType extends Record<string, any> = any,
>({
  config,
  searchParams,
  setSearchParams,
  lastNormalizedQueryRef,
  lastNormalizedUrlRef,
}: CreateSyncFunctionsParams<QueryType>) {
  return (query: QueryType) => {
    if (!config.syncQueryOnSearchParams) {
      querySyncLogger.debug({
        component: 'syncQueryToUrl',
        message: 'Skip - URL sync not enabled',
      });
      return;
    }

    // 🔧 Normalize query for comparison
    const normalizedQuery = normalizeQuery(query);

    // 🔧 Real change detection: use deep comparison
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

      // 🔧 Record normalized values
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
  };
}

export function createSyncUrlToQuery<
  QueryType extends Record<string, any> = any,
>({
  config,
  searchParams,
}: Pick<CreateSyncFunctionsParams<QueryType>, 'config' | 'searchParams'>) {
  return () => {
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

    // Use queryFormat to format URL parameters
    let urlQuery: Record<string, any> = {};

    if (config.queryFormat) {
      // 🔧 Add formatting function for all URL parameters (including undefined ones)
      const completeQueryFormat: Record<string, any> = {
        ...config.queryFormat,
      };

      for (const [key] of searchParams.entries()) {
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
        searchParams,
        queryFormat: completeQueryFormat,
      });
    } else {
      // Default parsing (all values as strings)
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

    // Filter authentication parameters
    if (config.authQueryPrefixOnSearchParams) {
      Object.keys(config.authQueryPrefixOnSearchParams).forEach((key) => {
        delete urlQuery[key];
      });
    }

    // 🔧 Normalize then return
    const normalizedUrlQuery = normalizeQuery(urlQuery);

    querySyncLogger.info({
      component: 'syncUrlToQuery',
      message: '📥 Returning normalized query',
      data: {
        urlQuery: normalizedUrlQuery,
      },
    });

    return normalizedUrlQuery;
  };
}
