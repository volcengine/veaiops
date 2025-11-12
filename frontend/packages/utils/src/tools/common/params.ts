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
 * Parameter processing utilities
 */

import {
  entries,
  fromPairs,
  isNull,
  isUndefined,
  isNaN as lodashIsNaN,
} from 'lodash-es';
import { ensureArray } from './array';

/**
 * 过滤掉参数对象中的空值、空数组和空字符串
 */
export const filterEmptyQueryParams = (
  queryRequestParams?: Record<string, unknown>,
): Record<string, unknown> => {
  // Use entries to convert the object to [key, value] tuples and filter out empty values, empty arrays, and empty strings
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
        // Check if value is a non-empty array
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

  // Use fromPairs to convert filtered entries back to an object
  return fromPairs(filteredQueries);
};

/**
 * 转换参数类型
 */
export const convertQueryParamsTypes = (
  params: Record<string, unknown>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  for (const key in params) {
    if (Object.prototype.hasOwnProperty.call(params, key)) {
      const value = params[key];

      // Convert numeric strings to numbers
      if (
        typeof value === 'string' &&
        !Number.isNaN(Number(value)) &&
        value !== ''
      ) {
        result[key] = Number(value);
      } else if (Array.isArray(value)) {
        // Recursively handle arrays
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
 * Convert URLSearchParams to an object containing all query parameters
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
