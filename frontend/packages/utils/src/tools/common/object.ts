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
 * Object utilities
 */

import type { OmitObjectKeysParams } from './types';

/**
 * 从对象中移除指定的键
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
 * Get params object and filter empty values
 * @param params Original params object
 * @returns Filtered params object
 */
export function getParamsObject<T extends Record<string, any>>(
  params: T,
): Partial<T> {
  const result: Partial<T> = {};

  for (const [key, value] of Object.entries(params)) {
    if (value !== null && value !== undefined && value !== '') {
      // For arrays, keep only non-empty arrays
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
