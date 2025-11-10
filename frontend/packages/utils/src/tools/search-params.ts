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

import { has, isString } from 'lodash-es';

import { canConvertToNumber, ensureArray, toNumber } from './common';

/**
 * Query format value properties interface
 */
export interface QueryFormatValueProps {
  pre: unknown;
  value: unknown;
}

/**
 * Convert URLSearchParams to object containing all query parameters
 * @param searchParams URLSearchParams instance
 * @returns Object containing all query parameters, if there are same keys with different values, values are stored as arrays
 */
export const getSearchParamsObject = ({
  searchParams,
  queryFormat = {},
}: {
  searchParams: URLSearchParams;
  queryFormat?: Record<
    string,
    (v: {
      pre: unknown;
      value: unknown;
    }) => number | number[] | string | string[]
  >;
}): Record<string, number | number[] | string | string[]> => {
  const paramsObject: Record<string, number | number[] | string | string[]> =
    {};
  for (const [key, value] of Array.from(searchParams.entries())) {
    const formatFunc = queryFormat[key];
    if (has(paramsObject, key)) {
      const previousValues = ensureArray<any>(paramsObject[key]);
      const newValue = formatFunc
        ? formatFunc?.({ pre: previousValues, value })
        : value;
      paramsObject[key] = newValue;
    } else {
      paramsObject[key] = formatFunc
        ? formatFunc?.({ pre: paramsObject[key], value })
        : value;
    }
  }
  return paramsObject;
};

/**
 * Default query array format function
 * @param pre Previous value
 * @param value Current value
 */
export const queryArrayFormat = <T>({ pre, value }: QueryFormatValueProps) => {
  if (pre === undefined) {
    return ensureArray<T>(value);
  } else if (Array.isArray(pre)) {
    return [...pre, value];
  }
  return [...ensureArray<T>(pre), value];
};

/**
 * Default query single-select cascader array format function
 * @param pre Previous value
 * @param value Current value
 */
export const queryArrayCascaderFormat = ({
  pre,
  value,
}: QueryFormatValueProps) => {
  if (pre === undefined && isString(value)) {
    return value?.split(',');
  }
  return pre;
};

/**
 * Default query multi-select cascader array format function
 * @param pre Previous value
 * @param value Current value
 */
export const queryArrayMultiCascaderFormat = <T>({
  pre,
  value,
}: QueryFormatValueProps) => {
  if (pre === undefined) {
    if (isString(value)) {
      return [value.split(',')];
    }
    return ensureArray<T>(value);
  } else if (Array.isArray(pre)) {
    let currentValue;
    if (isString(value)) {
      currentValue = value.split(',');
    } else if (Array.isArray(value)) {
      currentValue = value;
    }
    return [...pre, currentValue].filter(Boolean);
  }
  return [...ensureArray<T>(pre), value];
};

/**
 * Default query number array format function
 * @param pre - Previous array
 * @param value - Value to merge
 * @returns {Array} - Merged array
 */
export const queryNumberArrayFormat = ({
  pre,
  value,
}: QueryFormatValueProps): Array<number> => {
  // Convert value to number (if possible)
  const current = toNumber(value);

  // If previous array is undefined, return array containing current value
  if (pre === undefined) {
    const arr = Array.isArray(current) ? current : [current];
    return ensureArray(arr);
  }
  // If previous array is an array, use spread operator to add current value to previous array and return
  else if (Array.isArray(pre)) {
    return [...pre, current];
  }
  // If previous array is not an array, use concat method to concatenate previous array and current value into a new array and return
  return ensureArray<number>(pre).concat(current);
};

/**
 * Default query number format function
 * @param value Value to format
 */
export const queryNumberFormat = ({ value }: QueryFormatValueProps) =>
  canConvertToNumber(value) ? Number(value) : value;

/**
 * Default query boolean format function
 * @param value Value to format
 */
export const queryBooleanFormat = <T>({ value }: { value: T }) => {
  switch (value) {
    case 'true':
      return true;
    case 'false':
      return false;
    default:
      return false;
  }
};
