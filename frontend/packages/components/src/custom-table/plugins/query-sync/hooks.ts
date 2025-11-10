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

import { useSearchParams } from '@modern-js/runtime/router';

import { useSubscription } from '@/custom-table/hooks/use-subscription';
import type {
  QuerySyncConfig,
  QuerySyncContext,
  QuerySyncUtils,
} from '@/custom-table/types';
import { resetLogCollector } from '@/custom-table/utils';
import type { BaseQuery } from '@veaiops/types';
import { useDeepCompareEffect, useMount } from 'ahooks';
import { delay, isEmpty } from 'lodash-es';
/**
 * Query parameter synchronization plugin Hooks
 */
import { useCallback, useEffect, useRef } from 'react';
import {
  createQuerySyncUtils,
  safeExecuteSync,
  shouldSyncQuery,
} from './utils/index';

/**
 * Query parameter synchronization Hook
 */
export const useQuerySync = <
  QueryType extends Record<string, unknown> = Record<string, unknown>,
>(
  config: QuerySyncConfig,
  query: QueryType,
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void,
  initQuery: QueryType = {} as QueryType,
) => {
  const [searchParams, setSearchParams] = useSearchParams();
  // Use real subscription mechanism
  const { channels, createChannel } = useSubscription();

  // Ensure activeKeyChange channel is created
  useEffect(() => {
    createChannel('activeKeyChange');
  }, [createChannel]);

  // State references
  const mountRef = useRef(false);
  const resetRef = useRef(false);
  const activeKeyChangeRef = useRef<Record<string, unknown>>({});
  const utilsRef = useRef<QuerySyncUtils<QueryType> | null>(null);

  // Create context
  const context: QuerySyncContext<QueryType> = {
    query,
    setQuery: setQuery as any,
    searchParams,
    setSearchParams,
    isMounted: mountRef.current,
    resetRef: resetRef as any,
    activeKeyChangeRef,
  };

  // Initialize utility instance
  if (!utilsRef.current) {
    utilsRef.current = createQuerySyncUtils({
      config,
      context,
    }) as QuerySyncUtils<QueryType>;
  }

  // Update instance: avoid directly writing private fields
  if (utilsRef.current) {
    utilsRef.current = createQuerySyncUtils({
      config,
      context,
    }) as QuerySyncUtils<QueryType>;
  }

  /**
   * Initialize query parameters
   */
  const initializeQuery = useCallback(() => {
    if (!config.syncQueryOnSearchParams) {
      return;
    }

    const urlQuery = utilsRef.current?.syncUrlToQuery() || {};

    if (!isEmpty(urlQuery) || !isEmpty(initQuery)) {
      setQuery((prev) => ({
        ...initQuery,
        ...prev,
        ...urlQuery,
      }));
    }
  }, [config.syncQueryOnSearchParams, initQuery, setQuery]);

  /**
   * Handle query parameter updates
   */
  const handleQueryUpdate = useCallback(() => {
    if (!shouldSyncQuery(config, context) || !utilsRef.current) {
      return;
    }

    // Ensure context.query is up to date
    utilsRef.current.context.query = query;

    safeExecuteSync(
      () => utilsRef.current?.syncQueryToUrl(query),
      'Failed to sync query to URL',
    );
  }, [config, query, context]);

  /**
   * Reset query parameters
   */
  const resetQuery = useCallback(
    (resetEmptyData = false) => {
      resetLogCollector.log({
        component: 'QuerySyncHooks',
        method: 'resetQuery',
        action: 'start',
        data: {
          resetEmptyData,
          hasUtils: Boolean(utilsRef.current),
          currentQuery: context.query,
          currentUrl: window.location.href,
        },
      });
      try {
        if (!utilsRef.current) {
          resetLogCollector.log({
            component: 'QuerySyncHooks',
            method: 'resetQuery',
            action: 'error',
            data: {
              error: 'utilsRef.current is null',
            },
          });
          return;
        }

        resetLogCollector.log({
          component: 'QuerySyncHooks',
          method: 'resetQuery',
          action: 'call',
          data: {
            method: 'utilsRef.current.resetQuery',
            resetEmptyData,
          },
        });

        utilsRef.current.resetQuery(resetEmptyData);

        resetLogCollector.log({
          component: 'QuerySyncHooks',
          method: 'resetQuery',
          action: 'end',
          data: {
            success: true,
            resetEmptyData,
            finalQuery: context.query,
            finalUrl: window.location.href,
          },
        });
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        const errorStack = error instanceof Error ? error.stack : undefined;
        resetLogCollector.log({
          component: 'QuerySyncHooks',
          method: 'resetQuery',
          action: 'error',
          data: {
            error: errorMessage,
            stack: errorStack,
          },
        });
        throw error;
      }
    },
    [context.query],
  );

  /**
   * Manually sync query parameters
   */
  const manualSync = useCallback(() => {
    if (!utilsRef.current) {
      return;
    }

    const urlQuery = utilsRef.current.syncUrlToQuery();
    setQuery((prev) => ({ ...prev, ...urlQuery }));
  }, [setQuery]);

  // Listen for activeKey changes
  useDeepCompareEffect(() => {
    if (!channels.activeKeyChange) {
      return undefined;
    }

    const subscription = channels.activeKeyChange.subscribe(
      (data: Record<string, unknown>) => {
        activeKeyChangeRef.current = data;
        if (
          config.useActiveKeyHook &&
          utilsRef.current &&
          'handleActiveKeyChange' in utilsRef.current
        ) {
          utilsRef.current.handleActiveKeyChange?.();
        }
      },
    ) as any;

    return () => {
      if (typeof subscription === 'function') {
        subscription();
      } else if (
        subscription &&
        typeof subscription.unsubscribe === 'function'
      ) {
        subscription.unsubscribe();
      }
    };
  }, [channels.activeKeyChange, config.useActiveKeyHook]);

  // Listen for query parameter changes
  useDeepCompareEffect(() => {
    handleQueryUpdate();
  }, [query, handleQueryUpdate]);

  // Initialize when component mounts
  useMount(() => {
    mountRef.current = true;

    if (config.useActiveKeyHook) {
      // Delay execution to wait for activeKey update
      delay(initializeQuery, 500);
    } else {
      initializeQuery();
    }
  });

  // Cleanup
  useEffect(
    () => () => {
      mountRef.current = false;
    },
    [],
  );

  return {
    resetQuery,
    manualSync,
    utils: utilsRef.current,
    context,
  };
};

/**
 * Query parameter formatting Hook
 */
export const useQueryFormat = <
  QueryType extends Record<string, unknown> = Record<string, unknown>,
>(
  config: QuerySyncConfig,
  query: QueryType,
): QueryType => {
  const formatQuery = useCallback(
    (q: QueryType): QueryType => {
      if (!config.queryFormat) {
        return q;
      }

      const utilsRef = createQuerySyncUtils<QueryType>({
        config,
        context: {} as QuerySyncContext<QueryType>,
      });
      return utilsRef.formatQuerySync(q) as QueryType;
    },
    [config],
  );

  return formatQuery(query);
};

/**
 * URL parameter synchronization state Hook
 */
export const useUrlSyncState = (config: QuerySyncConfig) => {
  const [searchParams] = useSearchParams();

  return {
    isEnabled: Boolean(config.syncQueryOnSearchParams),
    hasUrlParams: searchParams.toString().length > 0,
    paramCount: Array.from(searchParams.keys()).length,
  };
};
