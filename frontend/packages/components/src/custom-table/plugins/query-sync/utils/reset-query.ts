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

import type { QuerySyncConfig, QuerySyncContext } from '@/custom-table/types';
import { resetLogCollector } from '@/custom-table/utils';
import type { BaseQuery } from '@veaiops/types';
import { syncResetQueryToUrl } from './reset-query.url-sync';

/**
 * Helper functions for resetting query parameters
 */

/**
 * Reset query parameters
 * 🔧 Fix: Use initQuery instead of empty object to ensure reset to initial state
 * 🎯 Edge case handling:
 * - initQuery is empty object or undefined: reset to empty object
 * - Merge preservedFields with initQuery: preservedFields has higher priority
 * - querySearchParamsFormat formats URL parameters
 * - URL synchronization for array parameters
 * - Authentication parameter preservation
 * - Don't sync to URL when syncQueryOnSearchParams is false
 */
export function resetQuery<QueryType extends Record<string, unknown>>(
  config: QuerySyncConfig,
  context: QuerySyncContext<QueryType>,
  resetEmptyData = false,
  preservedFields?: Record<string, unknown>,
): void {
  // 🔍 Get initQuery (may be empty object or undefined)
  const baseInitQuery = config.initQuery || ({} as QueryType);

  // 🔧 Merge preservedFields (preservedFields has higher priority)
  const resetTargetQuery = {
    ...baseInitQuery,
    ...(preservedFields || {}),
  } as QueryType;

  resetLogCollector.log({
    component: 'QuerySyncUtils',
    method: 'resetQuery',
    action: 'start',
    data: {
      resetEmptyData,
      customReset: Boolean(config.customReset),
      hasInitQuery: Boolean(config.initQuery),
      initQuery: config.initQuery,
      preservedFields,
      resetTargetQuery,
      currentQuery: context.query,
      currentUrl: window.location.href,
    },
  });

  try {
    const { customReset } = config;

    context.resetRef.current = true;

    if (customReset) {
      resetLogCollector.log({
        component: 'QuerySyncUtils',
        method: 'resetQuery',
        action: 'call',
        data: {
          method: 'customReset',
          resetEmptyData,
          initQuery: config.initQuery,
          preservedFields,
          resetTargetQuery,
        },
      });
      customReset({
        resetEmptyData,
        setQuery: (
          query: QueryType | ((prev: QueryType) => QueryType),
        ): void => {
          // QueryType extends BaseQuery, so we can safely cast
          context.setQuery(
            query as BaseQuery | ((prev: BaseQuery) => BaseQuery) as any,
          );
        },
        initQuery: config.initQuery,
        preservedFields,
      } as any);
    } else {
      resetLogCollector.log({
        component: 'QuerySyncUtils',
        method: 'resetQuery',
        action: 'call',
        data: {
          method: 'default reset',
          initQuery: config.initQuery,
          resetTargetQuery,
          currentQuery: context.query,
        },
      });
      // 🔧 Fix: Reset to initQuery instead of empty object
      context.setQuery(resetTargetQuery);
    }

    // 🔧 Sync URL parameters to resetTargetQuery (preserve authentication parameters)
    // 🎯 Edge case: If syncQueryOnSearchParams is false, don't sync to URL
    if (!config.syncQueryOnSearchParams) {
      resetLogCollector.log({
        component: 'QuerySyncUtils',
        method: 'resetQuery',
        action: 'call',
        data: {
          method: 'skipUrlSync',
          reason: 'syncQueryOnSearchParams is false',
        },
      });
    } else {
      try {
        syncResetQueryToUrl(resetTargetQuery, config, context);
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        resetLogCollector.log({
          component: 'QuerySyncUtils',
          method: 'resetQuery',
          action: 'error',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            context: 'clearUrlParams',
          },
        });
      }
    }

    // Delay reset flag
    setTimeout(() => {
      context.resetRef.current = false;
      resetLogCollector.log({
        component: 'QuerySyncUtils',
        method: 'resetQuery',
        action: 'call',
        data: {
          method: 'resetFlag',
          resetRef: false,
        },
      });
    }, 100);

    resetLogCollector.log({
      component: 'QuerySyncUtils',
      method: 'resetQuery',
      action: 'end',
      data: {
        success: true,
        resetEmptyData,
        initQuery: config.initQuery,
        resetTargetQuery,
        finalQuery: context.query,
        finalUrl: window.location.href,
      },
    });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message;
    const errorStack = errorObj.stack;
    resetLogCollector.log({
      component: 'QuerySyncUtils',
      method: 'resetQuery',
      action: 'error',
      data: {
        error: errorMessage,
        stack: errorStack,
      },
    });
    throw errorObj;
  }
}
