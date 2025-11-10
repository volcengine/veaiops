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

import { ensureArray } from '@veaiops/utils';
import type { StrategyIdItem } from './types';

/**
 * Extract string ID from strategy ID item
 *
 * Handles three types of input:
 * 1. Object type: { id: "xxx", collection: "xxx" }
 * 2. String type: "xxx"
 * 3. Number type: 123
 *
 * @param item - May be a string, number, or object containing id
 * @returns Extracted string ID, returns empty string if extraction fails
 *
 * @example
 * ```ts
 * extractStrategyId({ id: "123" }) // "123"
 * extractStrategyId("456") // "456"
 * extractStrategyId(789) // "789"
 * extractStrategyId(null) // ""
 * extractStrategyId({ id: "  123  " }) // "123" (auto trim)
 * ```
 */
export const extractStrategyId = (item: StrategyIdItem): string => {
  // Handle null and undefined
  if (item == null) {
    return '';
  }

  // Handle object type: { id: "xxx", collection: "xxx" }
  if (typeof item === 'object' && 'id' in item && item.id != null) {
    return String(item.id).trim();
  }

  // Handle string and number types
  if (typeof item === 'string' || typeof item === 'number') {
    return String(item).trim();
  }

  // Other types return empty string
  return '';
};

/**
 * Normalize strategy ID array
 *
 * Converts strategy ID arrays of various formats to string arrays, automatically handling:
 * - Object arrays: Extract id field
 * - Mixed type arrays: Convert to strings uniformly
 * - Single value: Convert to single-element array
 * - null/undefined: Return empty array
 * - Filter out empty strings and invalid values
 *
 * @param strategyIds - Original strategy ID data (may be array, single value, or null)
 * @returns Normalized string array
 *
 * @example
 * ```ts
 * // Handle object arrays
 * normalizeStrategyIds([{ id: "123" }, { id: "456" }])
 * // ["123", "456"]
 *
 * // Handle mixed types
 * normalizeStrategyIds(["123", 456, null, { id: "789" }])
 * // ["123", "456", "789"]
 *
 * // Handle empty values
 * normalizeStrategyIds(null) // []
 * normalizeStrategyIds([]) // []
 *
 * // Handle single value
 * normalizeStrategyIds("123") // ["123"]
 * ```
 */
export const normalizeStrategyIds = (strategyIds: unknown): string[] => {
  return ensureArray(strategyIds)
    .map((item) => extractStrategyId(item as StrategyIdItem))
    .filter((id) => id.length > 0);
};
