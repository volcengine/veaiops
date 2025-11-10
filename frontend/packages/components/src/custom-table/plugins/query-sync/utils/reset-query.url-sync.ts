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

function preserveAuthParams(
  authPrefixes: Record<string, unknown>,
): URLSearchParams {
  const newParams = new URLSearchParams();
  const currentParams = new URLSearchParams(window.location.search);

  for (const [key, value] of currentParams.entries()) {
    if (key in authPrefixes) {
      newParams.set(key, value);
    }
  }

  return newParams;
}

function formatQueryValue(
  value: unknown,
  formatter?: (value: unknown) => string,
): string | null {
  if (formatter) {
    return formatter(value);
  }

  if (Array.isArray(value)) {
    return null;
  }

  if (typeof value === 'object' && value !== null) {
    return JSON.stringify(value);
  }

  if (typeof value === 'string') {
    return value;
  }

  return String(value);
}

function syncArrayParam(
  key: string,
  value: unknown[],
  newParams: URLSearchParams,
): void {
  value.forEach((item) => {
    newParams.append(key, String(item));
  });
}

function syncQueryParamsToUrl(
  resetTargetQuery: Record<string, unknown>,
  config: QuerySyncConfig,
  newParams: URLSearchParams,
): void {
  Object.entries(resetTargetQuery).forEach(([key, value]) => {
    if (
      config.authQueryPrefixOnSearchParams &&
      key in config.authQueryPrefixOnSearchParams
    ) {
      return;
    }

    if (value === undefined || value === null || value === '') {
      return;
    }

    const formatter = config.querySearchParamsFormat?.[key];

    if (Array.isArray(value)) {
      syncArrayParam(key, value, newParams);
      return;
    }

    const formattedValue = formatQueryValue(value, formatter);
    if (formattedValue !== null) {
      newParams.set(key, formattedValue);
    }
  });
}

function buildNewUrl(newParams: URLSearchParams): string {
  const { origin, pathname, hash } = window.location;
  const newUrlParams = newParams.toString();

  if (newUrlParams) {
    return `${origin}${pathname}?${newUrlParams}${hash}`;
  }

  return `${origin}${pathname}${hash}`;
}

export function syncResetQueryToUrl<QueryType extends Record<string, unknown>>(
  resetTargetQuery: QueryType,
  config: QuerySyncConfig,
  context: QuerySyncContext<QueryType>,
): void {
  const newParams = config.authQueryPrefixOnSearchParams
    ? preserveAuthParams(config.authQueryPrefixOnSearchParams)
    : new URLSearchParams();

  syncQueryParamsToUrl(resetTargetQuery, config, newParams);

  const newUrl = buildNewUrl(newParams);

  resetLogCollector.log({
    component: 'QuerySyncUtils',
    method: 'resetQuery',
    action: 'call',
    data: {
      method: 'syncUrlParams',
      oldUrl: window.location.href,
      newUrl,
      newParams: newParams.toString(),
      resetTargetQuery,
      hasQuerySearchParamsFormat: Boolean(config.querySearchParamsFormat),
    },
  });

  window.history.replaceState(window.history.state, '', newUrl);

  if (context.setSearchParams) {
    context.setSearchParams(newParams);
  }
}

