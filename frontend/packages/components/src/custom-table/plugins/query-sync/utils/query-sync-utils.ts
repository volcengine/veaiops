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
import { delay } from 'lodash-es';
import {
  filterEmptyDataByKeys,
  formatQuery,
  formatQuerySync,
  getParamsObject,
} from './query-formatters';
import { resetQuery } from './reset-query';
import { syncQueryToUrl, updateSearchParams } from './sync-query-to-url';
import { syncUrlToQuery } from './sync-url-to-query';

/**
 * Query parameter synchronization utility class
 */
export class QuerySyncUtils<
  QueryType extends Record<string, unknown> = Record<string, unknown>,
> {
  config: QuerySyncConfig;
  context: QuerySyncContext<QueryType>;

  constructor(config: QuerySyncConfig, context: QuerySyncContext<QueryType>) {
    this.config = config;
    this.context = context;
  }

  /**
   * Sync query parameters to URL
   */
  syncQueryToUrl = (queryParam?: Record<string, unknown>) => {
    syncQueryToUrl(queryParam, this.config, this.context);
  };

  /**
   * Update React Router's searchParams
   */
  updateSearchParams = (searchParams: URLSearchParams) => {
    updateSearchParams(searchParams, this.context);
  };

  /**
   * Sync query parameters from URL search parameters
   */
  syncUrlToQuery = (): Record<string, unknown> => {
    return syncUrlToQuery(this.config, this.context);
  };

  /**
   * Format query parameters (synchronous version)
   */
  formatQuerySync = (
    query: Record<string, unknown>,
  ): Record<string, unknown> => {
    return formatQuerySync(query, this.config.queryFormat || {});
  };

  /**
   * Format query parameters (asynchronous version)
   */
  formatQuery = async (
    query: Record<string, unknown>,
  ): Promise<Record<string, unknown>> => {
    return formatQuery(query, this.config.queryFormat || {});
  };

  /**
   * Get parameter object, filter out empty values
   */
  getParamsObject = <T extends Record<string, unknown>>(params: T): T => {
    return getParamsObject(params);
  };

  /**
   * Filter empty data by specified keys
   */
  filterEmptyDataByKeys = <T extends Record<string, unknown>>({
    data,
    keys,
  }: {
    data: T;
    keys: string[];
  }): Partial<T> => {
    return filterEmptyDataByKeys({ data, keys });
  };

  /**
   * Convert parameter types
   */
  convertParamsTypes = (
    query: Record<string, unknown>,
  ): Record<string, unknown> => {
    // Use functions from query-formatters but maintain backward compatibility
    const result: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(query)) {
      if (typeof value === 'string') {
        // Try to convert to number
        if (/^\d+$/.test(value)) {
          result[key] = parseInt(value, 10);
        } else if (/^\d+\.\d+$/.test(value)) {
          result[key] = parseFloat(value);
        } else if (value === 'true') {
          result[key] = true;
        } else if (value === 'false') {
          result[key] = false;
        } else {
          result[key] = value;
        }
      } else {
        result[key] = value;
      }
    }

    return result;
  };

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
  resetQuery = (
    resetEmptyData = false,
    preservedFields?: Record<string, unknown>,
  ) => {
    resetQuery(this.config, this.context, resetEmptyData, preservedFields);
  };

  /**
   * Handle activeKey changes
   */
  handleActiveKeyChange = () => {
    const { useActiveKeyHook } = this.config;

    if (useActiveKeyHook && this.context.activeKeyChangeRef.current) {
      // Delay query parameter update to avoid race conditions
      delay(async () => {
        const urlQuery = this.syncUrlToQuery();
        this.context.setQuery(
          (prev: QueryType) => ({ ...prev, ...urlQuery }) as QueryType,
        );
      }, 500);
    }
  };

  /**
   * Validate query parameters
   */
  validateQuery = <T extends Record<string, unknown>>(query: T): boolean => {
    if (!query || typeof query !== 'object') {
      return false;
    }

    // Basic validation logic
    return Object.keys(query).length >= 0;
  };
}
