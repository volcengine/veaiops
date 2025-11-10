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
import { QuerySyncUtils } from './query-sync-utils';
import type { CreateQuerySyncUtilsParams } from './types';

/**
 * Create query parameter synchronization utility instance
 */
export const createQuerySyncUtils = <
  QueryType extends Record<string, unknown> = Record<string, unknown>,
>({
  config,
  context,
}: CreateQuerySyncUtilsParams<QueryType>): QuerySyncUtils<QueryType> =>
  new QuerySyncUtils(config, context);

/**
 * Check if query parameter synchronization is needed
 */
export const shouldSyncQuery = <QueryType extends Record<string, unknown>>(
  config: QuerySyncConfig,
  context: QuerySyncContext<QueryType>,
): boolean => Boolean(config.syncQueryOnSearchParams && context.isMounted);

/**
 * Safely execute query parameter synchronization
 *
 * @returns Returns result object in format { success: boolean; error?: Error }
 */
export const safeExecuteSync = async (
  syncFn: () => void | Promise<void>,
  _errorMessage = 'Query sync error',
): Promise<{ success: boolean; error?: Error }> => {
  try {
    await syncFn();
    return { success: true };
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    // Silently handle errors to avoid interrupting flow, but return error info for caller to judge
    return { success: false, error: errorObj };
  }
};
