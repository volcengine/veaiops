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

/**
 * Helper functions for syncing query parameters to URL
 */

/**
 * Update React Router's searchParams
 */
export function updateSearchParams<QueryType extends Record<string, unknown>>(
  searchParams: URLSearchParams,
  context: QuerySyncContext<QueryType>,
): void {
  if (!context.setSearchParams) {
    return;
  }

  // If resetEmptyData is set to false (indicating reset should not clear), preserve original URL parameters not covered by query mapping
  if (context && context.resetEmptyData === false) {
    // merge with existing context.searchParams to avoid dropping params
    const merged = new URLSearchParams(
      context.searchParams?.toString?.() || '',
    );
    for (const [k, v] of searchParams.entries()) {
      merged.set(k, v);
    }
    context.setSearchParams(merged);
  } else {
    context.setSearchParams(searchParams);
  }
}

/**
 * Sync query parameters to URL
 */
export function syncQueryToUrl<QueryType extends Record<string, unknown>>(
  queryParam: Record<string, unknown> | undefined,
  config: QuerySyncConfig,
  context: QuerySyncContext<QueryType>,
): void {
  const { href: _currentUrl } = window.location;
  const { href: _oldUrl } = window.location;

  // 🚨 Important debug: Record stack trace when syncQueryToUrl is called
  const { stack } = new Error();

  // Also output to console for immediate viewing

  if (!config.syncQueryOnSearchParams) {
    return;
  }

  if (context.resetRef.current) {
    return;
  }

  try {
    // Preserve existing URL params by default, so that on reset (non-empty reset) we don't drop initial params (e.g., datasource_type)
    const baseSearch =
      (typeof window !== 'undefined' && window.location?.search) ||
      context.searchParams?.toString?.() ||
      '';
    const searchParams = new URLSearchParams(baseSearch);
    const query = queryParam || context.query || {};

    // 🔧 Critical fix: If query is empty object but URL has parameters, preserve existing parameters
    const currentUrlParams = new URLSearchParams(window.location.search);
    const hasCurrentParams = currentUrlParams.toString() !== '';
    const isQueryEmpty = Object.keys(query).length === 0;

    // If query is empty but URL has parameters, keep existing parameters unchanged
    if (hasCurrentParams && isQueryEmpty) {
      return; // Return directly without any URL modification
    }

    // Process query parameters
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        const formatter = config.querySearchParamsFormat?.[key];
        let formattedValue: string;
        if (formatter) {
          formattedValue = formatter(value);
        } else if (typeof value === 'object' && value !== null) {
          formattedValue = JSON.stringify(value);
        } else if (typeof value === 'string') {
          formattedValue = value;
        } else if (typeof value === 'number' || typeof value === 'boolean') {
          formattedValue = String(value);
        } else {
          formattedValue = JSON.stringify(value);
        }

        searchParams.set(key, formattedValue);
      }
    });

    const newSearch = searchParams.toString();
    const {
      href: windowLocationHref,
      search: _windowLocationSearch,
      pathname: windowLocationPathname,
    } = window.location;
    const newUrl = `${window.location.origin}${windowLocationPathname}${
      newSearch ? `?${newSearch}` : ''
    }${window.location.hash}`;

    if (windowLocationHref !== newUrl) {
      // Use history.replaceState to update URL
      window.history.replaceState(window.history.state, '', newUrl);

      // Also update React Router's searchParams
      updateSearchParams(searchParams, context);
    }
  } catch (error: unknown) {
    // ✅ Correct: Use resetLogCollector to log errors and expose actual error information
    // Log errors but don't interrupt flow (URL sync failure should not affect main flow)
    const errorObj = error instanceof Error ? error : new Error(String(error));
    resetLogCollector.log({
      component: 'QuerySyncUtils',
      method: 'syncQueryToUrl',
      action: 'error',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
      },
    });
  }
}
