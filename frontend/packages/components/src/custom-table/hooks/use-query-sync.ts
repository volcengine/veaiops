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
 * URL query parameter synchronization Hook
 * Responsible for synchronizing table query state with URL parameters (bidirectional sync)
 */

import type {
  QuerySyncConfig,
  QuerySyncContext,
} from '@/custom-table/types/plugins/query-sync';
import { useSearchParams } from '@modern-js/runtime/router';
import { logger } from '@veaiops/utils';
import { useMount, useUpdateEffect } from 'ahooks';
import { isEmpty, isEqual } from 'lodash-es';
import { useCallback, useEffect, useRef } from 'react';
import { querySyncLogger } from './internal/query-sync-logger';
import {
  normalizeQuery,
  normalizeUrlParams,
} from './use-query-sync/utils/normalize';
import { useQuerySyncCore } from './utils/use-query-sync-core';
import { useQuerySyncListeners } from './utils/use-query-sync-listeners';
import { useQuerySyncReset } from './utils/use-query-sync-reset';

let hookCallCount = 0;

/**
 * Enable log collection (must be called in component)
 */
const enableLogging = () => {
  // Caller needs to execute in component:
  // const { startCollection } = useAutoLogExport({ autoStart: true });
  // startCollection();
};

/**
 * Export logs (must be called after useAutoLogExport in component)
 */
const exportLogs = () => {
  // Caller needs to integrate useAutoLogExport and call its exportLogs
};

/**
 * Query parameter synchronization Hook
 */
export const useQuerySync = <QueryType extends Record<string, any> = any>(
  config: QuerySyncConfig,
  context: QuerySyncContext<QueryType>,
): {
  query: QueryType;
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  syncQueryToUrl: (query: QueryType) => void;
  resetQuery: () => void;
  enableLogging: () => void;
  exportLogs: () => void;
} => {
  // 🎯 Record hook call (for debugging and log tracking)
  hookCallCount++;
  const currentCallId = hookCallCount;

  const [searchParams, setSearchParams] = useSearchParams();

  // 🔧 State control flags
  const isInitializedRef = useRef(false); // Whether initialized
  const isResettingRef = useRef(false); // Whether resetting

  // 🔧 Flags to prevent circular synchronization
  const isSyncingToUrlRef = useRef(false); // Syncing query→URL
  const isSyncingToQueryRef = useRef(false); // Syncing URL→query

  // 🔧 Real change detection: record normalized values
  const lastNormalizedQueryRef = useRef<Record<string, any>>({});
  const lastNormalizedUrlRef = useRef<string>('');

  const syncCountRef = useRef({ queryToUrl: 0, urlToQuery: 0 });
  const lastResetTimeRef = useRef(Date.now());
  const SYNC_LIMIT = 5;
  const RESET_INTERVAL = 1000;

  const {
    syncQueryToUrl: syncQueryToUrlCore,
    syncUrlToQuery: syncUrlToQueryCore,
  } = useQuerySyncCore({
    config,
    context,
    searchParams,
    setSearchParams,
    lastNormalizedQueryRef,
    lastNormalizedUrlRef,
  });

  const syncQueryToUrl = useCallback(
    (query: QueryType) => {
      const normalizedQuery = normalizeQuery(query);
      if (normalizedQuery && Object.keys(normalizedQuery).length > 0) {
        lastNormalizedQueryRef.current = normalizedQuery;
      }
      syncQueryToUrlCore(query);
    },
    [syncQueryToUrlCore],
  );

  const syncUrlToQuery = useCallback(() => {
    return syncUrlToQueryCore();
  }, [syncUrlToQueryCore]);

  const { resetQuery } = useQuerySyncReset({
    config,
    context,
    searchParams,
    setSearchParams,
    isResettingRef,
    lastNormalizedQueryRef,
    lastNormalizedUrlRef,
    syncCountRef,
  });

  /**
   * Initialization: Execute only once on mount
   */
  useMount(() => {
    if (isInitializedRef.current) {
      return;
    }

    querySyncLogger.info({
      component: 'useMount',
      message: '🔄 Initialization started',
      data: {
        callId: currentCallId,
        syncEnabled: config.syncQueryOnSearchParams,
      },
    });

    if (!config.syncQueryOnSearchParams) {
      isInitializedRef.current = true;
      return;
    }

    // Initialize query from URL
    const urlQuery = syncUrlToQuery();
    const normalizedCurrentQuery = normalizeQuery(context.query);

    if (!isEmpty(urlQuery)) {
      querySyncLogger.info({
        component: 'useMount',
        message: '📥 Initializing query from URL',
        data: {
          urlQuery,
          currentQuery: normalizedCurrentQuery,
        },
      });

      // 🔧 Merge using normalized values
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
      querySyncLogger.info({
        component: 'useMount',
        message: '📤 Initializing URL from query',
        data: {
          query: normalizedCurrentQuery,
        },
      });
      syncQueryToUrl(normalizedCurrentQuery as QueryType);
    }

    isInitializedRef.current = true;
  });

  useQuerySyncListeners({
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
  });

  return {
    query: context.query,
    setQuery: context.setQuery,
    syncQueryToUrl,
    resetQuery,
    enableLogging, // New: Call in component to enable log collection
    exportLogs, // New: Call in component to export logs (must enable first)
  };
};
