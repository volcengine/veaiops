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
import { logger } from '@veaiops/utils';
import { useUpdateEffect } from 'ahooks';
import { isEmpty, isEqual } from 'lodash-es';
import { useEffect } from 'react';
import type { MutableRefObject } from 'react';
import { querySyncLogger } from '../internal/query-sync-logger';
import { normalizeQuery, normalizeUrlParams } from './query-sync-utils';

interface UseQuerySyncListenersParams<QueryType> {
  config: QuerySyncConfig;
  context: QuerySyncContext<QueryType>;
  searchParams: URLSearchParams;
  isInitializedRef: MutableRefObject<boolean>;
  isResettingRef: MutableRefObject<boolean>;
  isSyncingToUrlRef: MutableRefObject<boolean>;
  isSyncingToQueryRef: MutableRefObject<boolean>;
  lastNormalizedQueryRef: MutableRefObject<Record<string, any>>;
  lastNormalizedUrlRef: MutableRefObject<string>;
  syncCountRef: MutableRefObject<{ queryToUrl: number; urlToQuery: number }>;
  lastResetTimeRef: MutableRefObject<number>;
  SYNC_LIMIT: number;
  RESET_INTERVAL: number;
  syncQueryToUrl: (query: QueryType) => void;
  syncUrlToQuery: () => Record<string, any>;
}

export const useQuerySyncListeners = <
  QueryType extends Record<string, any> = any,
>({
  config,
  context,
  searchParams,
  isInitializedRef,
  isResettingRef,
  isSyncingToUrlRef,
  isSyncingToQueryRef,
  lastNormalizedQueryRef,
  lastNormalizedUrlRef,
  syncCountRef,
  lastResetTimeRef,
  SYNC_LIMIT,
  RESET_INTERVAL,
  syncQueryToUrl,
  syncUrlToQuery,
}: UseQuerySyncListenersParams<QueryType>) => {
  useUpdateEffect(() => {
    if (isResettingRef.current || !isInitializedRef.current) {
      querySyncLogger.debug({
        component: 'QueryListener',
        message: '⏭️ Skipping',
        data: {
          resetting: isResettingRef.current,
          initialized: isInitializedRef.current,
        },
      });
      syncCountRef.current.queryToUrl = 0;
      return;
    }

    if (isSyncingToQueryRef.current) {
      querySyncLogger.warn({
        component: 'QueryListener',
        message: '⚠️ Skipping - syncing from URL',
      });
      return;
    }

    if (!config.syncQueryOnSearchParams) {
      return;
    }

    const normalizedQuery = normalizeQuery(context.query);

    if (isEqual(normalizedQuery, lastNormalizedQueryRef.current)) {
      querySyncLogger.debug({
        component: 'QueryListener',
        message: '⏭️ Skipping - query unchanged (deep comparison)',
      });
      syncCountRef.current.queryToUrl = 0;
      return;
    }

    const now = Date.now();
    if (now - lastResetTimeRef.current > RESET_INTERVAL) {
      syncCountRef.current = { queryToUrl: 0, urlToQuery: 0 };
      lastResetTimeRef.current = now;
      querySyncLogger.debug({
        component: 'QueryListener',
        message: '⏱️ Time window reset counter',
      });
    }

    syncCountRef.current.queryToUrl++;
    if (syncCountRef.current.queryToUrl > SYNC_LIMIT) {
      querySyncLogger.error({
        component: 'QueryListener',
        message: '🚨 Infinite loop circuit break! query → URL',
        data: {
          syncCount: syncCountRef.current.queryToUrl,
          limit: SYNC_LIMIT,
          currentQuery: normalizedQuery,
          lastQuery: lastNormalizedQueryRef.current,
          diff: Object.keys(normalizedQuery).filter(
            (key) =>
              normalizedQuery[key] !== lastNormalizedQueryRef.current[key],
          ),
        },
      });
      logger.error({
        message:
          '[QuerySync] 🚨 Infinite loop! query → URL circuit break. Check queryFormat configuration!',
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

    if (!isEmpty(normalizedQuery)) {
      querySyncLogger.info({
        component: 'QueryListener',
        message: '📤 Query changed, syncing to URL',
        data: {
          query: normalizedQuery,
          syncCount: syncCountRef.current.queryToUrl,
        },
      });

      isSyncingToUrlRef.current = true;

      try {
        syncQueryToUrl(normalizedQuery as QueryType);
        syncCountRef.current.urlToQuery = 0;
      } finally {
        setTimeout(() => {
          isSyncingToUrlRef.current = false;
        }, 0);
      }
    }
  }, [context.query]);

  useEffect(() => {
    if (isResettingRef.current || !isInitializedRef.current) {
      querySyncLogger.debug({
        component: 'URLListener',
        message: '⏭️ Skipping',
        data: {
          resetting: isResettingRef.current,
          initialized: isInitializedRef.current,
        },
      });
      syncCountRef.current.urlToQuery = 0;
      return;
    }

    if (isSyncingToUrlRef.current) {
      querySyncLogger.warn({
        component: 'URLListener',
        message: '⚠️ Skipping - syncing from query',
      });
      return;
    }

    if (!config.syncQueryOnSearchParams) {
      return;
    }

    const normalizedUrl = normalizeUrlParams(searchParams);

    if (normalizedUrl === lastNormalizedUrlRef.current) {
      querySyncLogger.debug({
        component: 'URLListener',
        message: '⏭️ Skipping - URL unchanged',
      });
      syncCountRef.current.urlToQuery = 0;
      return;
    }

    const now = Date.now();
    if (now - lastResetTimeRef.current > RESET_INTERVAL) {
      syncCountRef.current = { queryToUrl: 0, urlToQuery: 0 };
      lastResetTimeRef.current = now;
      querySyncLogger.debug({
        component: 'URLListener',
        message: '⏱️ Time window reset counter',
      });
    }

    syncCountRef.current.urlToQuery++;
    if (syncCountRef.current.urlToQuery > SYNC_LIMIT) {
      querySyncLogger.error({
        component: 'URLListener',
        message: '🚨 Infinite loop circuit break! URL → query',
        data: {
          syncCount: syncCountRef.current.urlToQuery,
          limit: SYNC_LIMIT,
          currentUrl: normalizedUrl,
          lastUrl: lastNormalizedUrlRef.current,
        },
      });
      logger.error({
        message:
          '[QuerySync] 🚨 Infinite loop! URL → query circuit break. Check URL parameter format!',
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

    const urlQuery = syncUrlToQuery();

    if (!isEmpty(urlQuery)) {
      querySyncLogger.info({
        component: 'URLListener',
        message: '📥 URL changed, syncing to query',
        data: {
          urlQuery,
          syncCount: syncCountRef.current.urlToQuery,
        },
      });

      isSyncingToQueryRef.current = true;

      try {
        context.setQuery((prev) => {
          const normalizedPrev = normalizeQuery(prev);
          const merged = {
            ...normalizedPrev,
            ...urlQuery,
          };

          querySyncLogger.debug({
            component: 'URLListener',
            message: 'setQuery executed',
            data: {
              prev: normalizedPrev,
              urlQuery,
              merged,
            },
          });

          return merged as QueryType;
        });

        lastNormalizedUrlRef.current = normalizedUrl;
        lastNormalizedQueryRef.current = urlQuery;
        syncCountRef.current.queryToUrl = 0;
      } finally {
        setTimeout(() => {
          isSyncingToQueryRef.current = false;
        }, 0);
      }
    } else {
      querySyncLogger.debug({
        component: 'URLListener',
        message: '📥 URL is empty',
      });
      lastNormalizedUrlRef.current = normalizedUrl;
      syncCountRef.current.urlToQuery = 0;
    }
  }, [searchParams]);
};
