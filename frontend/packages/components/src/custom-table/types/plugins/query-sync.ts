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
 * Query sync plugin related type definitions
 *
 * @date 2025-12-19
 */

import type { BaseQuery } from '@veaiops/types';
import type React from 'react';

// Formatter types
export type QuerySearchParamsFormatter = (value: unknown) => string;
export type QueryFormatter = (params: {
  pre: unknown;
  value: unknown;
}) => unknown;

/**
 * Query sync configuration
 */
export interface QuerySyncConfig<QueryType extends BaseQuery = BaseQuery> {
  enabled?: boolean;
  debug?: boolean;
  useActiveKeyHook?: boolean;
  querySearchParamsFormat?: Record<string, QuerySearchParamsFormatter>;
  queryFormat?: Record<string, QueryFormatter>;
  authQueryPrefixOnSearchParams?: Record<string, unknown>;
  syncQueryOnSearchParams?: boolean;
  /** Initial query parameters, restore to this value when resetting */
  initQuery?: QueryType;
  customReset?: (options: {
    resetEmptyData: boolean;
    setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
    /** Initial query parameters, reset target value */
    initQuery?: QueryType;
    /** Fields to preserve (merged with initQuery) */
    preservedFields?: Record<string, unknown>;
  }) => void;
}

/**
 * Query sync plugin configuration
 */
export interface QuerySyncPluginConfig<QueryType extends BaseQuery = BaseQuery>
  extends QuerySyncConfig<QueryType> {
  syncToUrl?: boolean;
  urlSyncKey?: string;
}

/**
 * Query sync context
 */
export interface QuerySyncContext<QueryType extends BaseQuery = BaseQuery> {
  query: QueryType;
  setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => void;
  searchParams: URLSearchParams;
  setSearchParams: (
    params: URLSearchParams | ((prev: URLSearchParams) => URLSearchParams),
  ) => void;
  isMounted: boolean;
  resetRef: React.MutableRefObject<boolean>;
  activeKeyChangeRef: React.MutableRefObject<Record<string, unknown>>;
  /** Whether to clear data when resetting */
  resetEmptyData?: boolean;
}

/**
 * Query sync utility class interface
 */
export interface QuerySyncUtils<QueryType extends BaseQuery = BaseQuery> {
  config: QuerySyncConfig<QueryType>;
  context: QuerySyncContext<QueryType>;

  /**
   * Sync URL to query parameters
   */
  syncUrlToQuery: () => Record<string, unknown>;

  /**
   * Sync query parameters to URL
   */
  syncQueryToUrl: (query?: Record<string, unknown>) => void;

  /**
   * Format query parameters (async)
   */
  formatQuery: (
    query: Record<string, unknown>,
  ) => Promise<Record<string, unknown>>;

  /**
   * Format query parameters (sync)
   */
  formatQuerySync: (query: Record<string, unknown>) => Record<string, unknown>;

  /**
   * Validate query parameters
   */
  validateQuery: (query: QueryType) => boolean;

  /**
   * Reset query parameters
   * @param resetEmptyData - Whether to clear data
   * @param preservedFields - Fields to preserve (merged with initQuery)
   */
  resetQuery: (
    resetEmptyData?: boolean,
    preservedFields?: Record<string, unknown>,
  ) => void;

  /**
   * Handle activeKey change
   */
  handleActiveKeyChange?: () => void;
}
