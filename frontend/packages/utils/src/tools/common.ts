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
 * Common utility function collection
 * Provides common data processing and transformation functionality
 *

 * @date 2025-12-19
 */

// URLSearchParams is a browser native API, no need to import
import {
  entries,
  fromPairs,
  isNull,
  isUndefined,
  isNaN as lodashIsNaN,
} from 'lodash-es';

/**
 * Ensure input value is an array.
 * If value is undefined, return an empty array.
 * If value is not an array, return an array containing that value.
 * If value is already an array, return it directly.
 */
export const ensureArray = <T>(value: unknown): T[] => {
  if (value === undefined || value === null) {
    return [];
  }
  return Array.isArray(value)
    ? value.filter(Boolean)
    : [value as T].filter(Boolean);
};

/**
 * Filter out empty values, empty arrays, and empty strings from parameter object (compatible version)
 */
export const filterEmptyQueryParams = (
  queryRequestParams?: Record<string, unknown>,
): Record<string, unknown> => {
  // Use entries function to convert object to [key, value] array format, and use filter method to filter out empty values, empty arrays, and empty strings
  const filteredQueries = entries(queryRequestParams)?.filter(
    ([, val]: [string, unknown]) => {
      // Check if value is defined
      const isValueUndefined = isUndefined(val);
      // Check if value is null
      const isValueNull = isNull(val);
      // Check if value is NaN
      const isValueNan = lodashIsNaN(val);
      if (isValueUndefined) {
        return false;
      }

      if (isValueNull) {
        return false;
      }

      if (isValueNan) {
        return false;
      }

      if (!isValueUndefined && !isValueNull && !isValueNan) {
        // Check if value is non-empty array
        if (Array.isArray(val)) {
          const isNonEmptyArray = val.length > 0;
          return isNonEmptyArray;
        }
        if (typeof val === 'string') {
          const isNonEmptyString = val.trim() !== '';
          return isNonEmptyString;
        }
      }

      return true;
    },
  );

  // Use fromPairs function to convert filtered array to a new object
  return fromPairs(filteredQueries);
};

/**
 * OmitObjectKeys parameter interface (compatible version)
 */
export interface OmitObjectKeysParams<T extends Record<string, any>> {
  obj: T;
  keys: string[];
}

/**
 * Remove specified keys from object (compatible version)
 */
export const omitObjectKeys = <T extends Record<string, any>>({
  obj,
  keys,
}: OmitObjectKeysParams<T>): Partial<T> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key)),
  ) as Partial<T>;
};

/**
 * Convert parameter types (compatible version)
 */
export const convertQueryParamsTypes = (
  params: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];

      // Convert numeric string to number
      if (
        typeof value === 'string' &&
        !Number.isNaN(Number(value)) &&
        value !== ''
      ) {
        result[key] = Number(value);
      } else if (Array.isArray(value)) {
        // Recursively process array
        result[key] = value.map((item) =>
          typeof item === 'string' && !Number.isNaN(Number(item)) && item !== ''
            ? Number(item)
            : item,
        );
      } else {
        result[key] = value;
      }
    }
  }

  return result;
};

/**
 * Check if value can be converted to number
 */
export const canConvertToNumber = (value: any): boolean => {
  return (
    !Number.isNaN(Number(value)) &&
    value !== '' &&
    value !== null &&
    value !== undefined
  );
};

/**
 * Convert to number
 */
export const toNumber = (value: any): number => {
  return canConvertToNumber(value) ? Number(value) : value;
};

/**
 * Convert URLSearchParams to object containing all query parameters (compatible version)
 */
export const parseURLSearchParams = ({
  searchParams,
  querySearchParamsFormat = {},
}: {
  searchParams: globalThis.URLSearchParams | string;
  querySearchParamsFormat?: Record<
    string,
    (params: { value: string }) => unknown
  >;
}): Record<string, unknown> => {
  const params =
    typeof searchParams === 'string'
      ? new URLSearchParams(searchParams)
      : searchParams;

  const paramsObject: Record<string, any> = {};

  for (const [key, value] of params.entries()) {
    const formatFunc = querySearchParamsFormat[key];
    if (paramsObject[key] !== undefined) {
      const previousValues = ensureArray(paramsObject[key]);
      const newValue = formatFunc ? formatFunc({ value }) : value;
      paramsObject[key] = Array.isArray(newValue)
        ? newValue
        : [...previousValues, newValue];
    } else {
      paramsObject[key] = formatFunc ? formatFunc({ value }) : value;
    }
  }

  return paramsObject;
};

export interface SafeJSONParseParams {
  valueString: undefined | string;
  empty?: unknown;
  shouldThrow?: boolean;
}

/**
 * Safely parse JSON string
 */
export const safeJSONParse = ({
  valueString,
  empty = undefined,
  shouldThrow = false,
}: SafeJSONParseParams): unknown => {
  try {
    if (valueString !== undefined) {
      return JSON.parse(valueString);
    }
    return empty;
  } catch (error) {
    if (shouldThrow) {
      throw error;
    }
    return empty;
  }
};

/**
 * Get parameter object, filter empty values (imported from query.ts)
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

// Note: The following alias functions are unused and have been removed
// If needed, use the original functions directly: convertQueryParamsTypes or omitObjectKeys

// /**
//  * Alias function for converting parameter types
//  */
// export const convertParamsTypes = convertQueryParamsTypes;

// /**
//  * Remove specified keys from object (alias function)
//  */
// export const omitKeysFromObject = omitObjectKeys;

/**
 * Form data property type
 */
export interface FormTableDataProps<
  RecordType = unknown,
  FormatRecordType = RecordType,
> {
  sourceData?: RecordType[];
  formattedData?: FormatRecordType[];
  [key: string]: unknown;
}

/**
 * Safe copy to clipboard utility
 * - Prioritize using navigator.clipboard.writeText
 * - Fallback to textarea + document.execCommand('copy') when Clipboard API is unavailable
 *
 * Note: This utility does not depend on UI layer (e.g., Message), returns result object on error, caller decides how to prompt user
 *
 * @param text Text to copy
 * @returns Returns result object in { success: boolean; error?: Error } format
 */
export const safeCopyToClipboard = async (
  text: string,
): Promise<{ success: boolean; error?: Error }> => {
  try {
    if (
      typeof navigator !== 'undefined' &&
      (navigator as any).clipboard &&
      typeof (navigator as any).clipboard.writeText === 'function'
    ) {
      await (navigator as any).clipboard.writeText(text);
      return { success: true };
    }

    // Fallback implementation for older browsers / limited environments
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    document.body.appendChild(textarea);
    textarea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (!successful) {
      throw new Error('Browser does not support clipboard copy');
    }

    return { success: true };
  } catch (err: unknown) {
    // ✅ Correct: expose actual error information
    const error = err instanceof Error ? err : new Error(String(err));
    // Utility layer does not directly depend on logger library, use console.error for minimal logging here
    console.error('[safeCopyToClipboard] Copy failed:', {
      error: error.message,
      timestamp: Date.now(),
    });
    return { success: false, error };
  }
};
