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
 * Check if object is empty
 */
function isEmpty(obj: any): boolean {
  if (obj == null) {
    return true;
  }
  if (Array.isArray(obj)) {
    return obj.length === 0;
  }
  if (typeof obj === 'object') {
    return Object.keys(obj).length === 0;
  }
  return false;
}

interface OmitParams<T extends Record<string, any>, K extends keyof T> {
  obj: T;
  keys: K[];
}

/**
 * Omit specified keys from object (internal helper function)
 */
function omit<T extends Record<string, any>, K extends keyof T>({
  obj,
  keys,
}: OmitParams<T, K>): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

/**
 * Get parameter object, filter empty values
 * @param params Original parameter object
 * @returns Filtered parameter object
 */
export function getParamsObject<T extends Record<string, any>>(
  params: T,
): Partial<T> {
  const result: Partial<T> = {};

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
 * FilterEmptyDataByKeys parameter interface
 */
export interface FilterEmptyDataByKeysParams<T extends Record<string, any>> {
  data: T;
  keys: (keyof T)[];
}

/**
 * Filter empty data by specified keys
 * @param params Parameter object containing data and keys
 * @returns Filtered data object
 */
export function filterEmptyDataByKeys<T extends Record<string, any>>({
  data,
  keys,
}: FilterEmptyDataByKeysParams<T>): Partial<T> {
  const result: Partial<T> = { ...data };

  keys.forEach((key) => {
    const value = data[key];
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && !Array.isArray(value) && isEmpty(value))
    ) {
      delete result[key];
    }
  });

  return result;
}

/**
 * OmitKeysFromObject parameter interface
 */
export interface OmitKeysFromObjectParams<
  T extends Record<string, any>,
  K extends keyof T,
> {
  obj: T;
  keys: K[];
}

/**
 * Omit specified keys from object
 * @param params Parameter object containing obj and keys
 * @returns New object with specified keys omitted
 */
export function omitKeysFromObject<
  T extends Record<string, any>,
  K extends keyof T,
>({ obj, keys }: OmitKeysFromObjectParams<T, K>): Omit<T, K> {
  return omit({ obj, keys });
}

/**
 * ConvertParamsTypes parameter interface
 */
export interface ConvertParamsTypesParams<T extends Record<string, any>> {
  params: T;
  typeMap?: Record<keyof T, 'string' | 'number' | 'boolean' | 'array'>;
}

/**
 * Convert parameter types
 * @param paramObj Parameter object containing params and typeMap
 * @returns Converted parameter object
 */
export function convertParamsTypes<T extends Record<string, any>>({
  params,
  typeMap,
}: ConvertParamsTypesParams<T>): T {
  if (!typeMap) {
    return params;
  }

  const result = { ...params } as any;

  Object.entries(typeMap).forEach(([key, targetType]) => {
    const value = result[key];

    if (value === null || value === undefined) {
      return;
    }

    switch (targetType) {
      case 'string': {
        result[key] = String(value);
        break;
      }
      case 'number': {
        const numValue = Number(value);
        if (!Number.isNaN(numValue)) {
          result[key] = numValue;
        }
        break;
      }
      case 'boolean': {
        if (typeof value === 'string') {
          result[key] = value === 'true' || value === '1';
        } else {
          result[key] = Boolean(value);
        }
        break;
      }
      case 'array': {
        if (!Array.isArray(value)) {
          result[key] = [value];
        }
        break;
      }
      default:
        break;
    }
  });

  return result;
}

/**
 * MergeQueryParams parameter interface
 */
export interface MergeQueryParamsParams<T extends Record<string, any>> {
  target: T;
  source: Partial<T>;
}

/**
 * Deep merge query parameters
 * @param paramObj Parameter object containing target and source
 * @returns Merged object
 */
export function mergeQueryParams<T extends Record<string, any>>({
  target,
  source,
}: MergeQueryParamsParams<T>): T {
  const result = { ...target };

  Object.entries(source).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      (result as any)[key] = value;
    }
  });

  return result;
}

/**
 * Normalize query parameters, ensure type consistency
 * @param params Query parameters
 * @returns Normalized parameters
 */
export function normalizeQueryParams<T extends Record<string, any>>(
  params: T,
): T {
  const result = { ...params } as any;

  Object.entries(result).forEach(([key, value]) => {
    // Handle stringified arrays
    if (
      typeof value === 'string' &&
      value.startsWith('[') &&
      value.endsWith(']')
    ) {
      try {
        result[key] = JSON.parse(value);
      } catch (error: unknown) {
        // ✅ Silently handle JSON.parse error (if parsing fails, keep original value)
        // No need to log warning, as this is normal error handling
        // If parsing fails, keep original value
      }
    }

    // Handle stringified boolean values
    if (value === 'true') {
      result[key] = true;
    } else if (value === 'false') {
      result[key] = false;
    }

    // Handle stringified numbers
    if (typeof value === 'string' && /^\d+$/.test(value)) {
      const numValue = Number(value);
      if (!Number.isNaN(numValue)) {
        result[key] = numValue;
      }
    }
  });

  return result;
}
