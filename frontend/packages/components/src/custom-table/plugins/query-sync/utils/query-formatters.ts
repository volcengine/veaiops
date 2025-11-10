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

import type { QueryFormatter } from '@/custom-table/types';
import type { FilterEmptyDataByKeysParams } from './types';

/**
 * Query parameter formatting helper functions
 */

/**
 * Convert parameter types
 */
export function convertParamsTypes(
  query: Record<string, unknown>,
): Record<string, unknown> {
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
}

/**
 * Format query parameters (synchronous version)
 */
export function formatQuerySync(
  query: Record<string, unknown>,
  queryFormat: Record<string, QueryFormatter> = {},
): Record<string, unknown> {
  // First perform basic type conversion
  const baseConverted = convertParamsTypes(query);

  // Then perform custom formatting according to queryFormat
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(baseConverted)) {
    const formatter: QueryFormatter | undefined = queryFormat[key];
    if (formatter) {
      result[key] = formatter({
        pre: query[key],
        value,
      });
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Format query parameters (asynchronous version)
 */
export async function formatQuery(
  query: Record<string, unknown>,
  queryFormat: Record<string, QueryFormatter> = {},
): Promise<Record<string, unknown>> {
  // First perform basic type conversion
  const baseConverted = convertParamsTypes(query);

  // Then perform custom formatting according to queryFormat
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(baseConverted)) {
    const formatter: QueryFormatter | undefined = queryFormat[key];
    if (formatter) {
      result[key] = formatter({
        pre: query[key],
        value,
      });
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Get parameter object, filter out empty values
 */
export function getParamsObject<T extends Record<string, unknown>>(
  params: T,
): T {
  const result = {} as T;

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      // For arrays, only keep non-empty arrays
      if (Array.isArray(value)) {
        if (value.length > 0) {
          (result as any)[key] = value;
        }
      } else {
        (result as any)[key] = value;
      }
    }
  }

  return result;
}

/**
 * Filter empty data by specified keys
 */
export function filterEmptyDataByKeys<T extends Record<string, unknown>>({
  data,
  keys,
}: FilterEmptyDataByKeysParams<T>): Partial<T> {
  const result = { ...data };

  keys.forEach((key) => {
    const value = data[key];
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' &&
        !Array.isArray(value) &&
        Object.keys(value).length === 0)
    ) {
      delete result[key];
    }
  });

  return result;
}
