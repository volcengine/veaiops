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

import { isEmpty } from 'lodash-es';

export const normalizeQuery = (
  query: Record<string, any>,
): Record<string, any> => {
  const normalized: Record<string, any> = {};

  Object.entries(query || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      const filtered = value.filter(
        (v) => v !== undefined && v !== null && v !== '',
      );
      if (filtered.length > 0) {
        normalized[key] = [...filtered].sort((a, b) => {
          if (typeof a === 'number' && typeof b === 'number') {
            return a - b;
          }
          return String(a).localeCompare(String(b));
        });
      }
      return;
    }

    if (typeof value === 'object' && value !== null) {
      const nested = normalizeQuery(value);
      if (!isEmpty(nested)) {
        normalized[key] = nested;
      }
      return;
    }

    normalized[key] = value;
  });

  return normalized;
};

export const normalizeUrlParams = (searchParams: URLSearchParams): string => {
  const params = new URLSearchParams();
  const entries = Array.from(searchParams.entries());

  const filtered = entries.filter(([_, value]) => value !== '');
  filtered.sort((a, b) => {
    if (a[0] !== b[0]) {
      return a[0].localeCompare(b[0]);
    }
    return String(a[1]).localeCompare(String(b[1]));
  });

  filtered.forEach(([key, value]) => {
    params.append(key, value);
  });

  return params.toString();
};

