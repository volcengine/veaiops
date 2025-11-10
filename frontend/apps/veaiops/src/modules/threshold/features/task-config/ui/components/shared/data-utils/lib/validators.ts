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

import { logger } from '@veaiops/utils';

/**
 * Backend returned time series data item structure
 * Supports common format for multiple data sources (Volcengine, Aliyun, Zabbix)
 */
export interface TimeseriesBackendItem {
  timestamps: Array<string | number>;
  values: Array<number | string | null>;
  labels?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Validate time series item validity
 */
export const validateTimeseriesItem = (
  item: unknown,
): item is TimeseriesBackendItem => {
  if (!item || typeof item !== 'object' || Array.isArray(item)) {
    return false;
  }

  const typedItem = item as TimeseriesBackendItem;

  // timestamps and values must be arrays
  if (
    !Array.isArray(typedItem.timestamps) ||
    !Array.isArray(typedItem.values)
  ) {
    return false;
  }

  // Must have at least one data point
  if (typedItem.timestamps.length === 0 || typedItem.values.length === 0) {
    return false;
  }

  return true;
};

/**
 * Safe number parsing function
 */
export const parseToNumber = (value: unknown): number | undefined => {
  if (value === null || value === undefined) {
    return undefined;
  }

  // Boundary check: already a number
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  // Boundary check: string to number conversion
  if (typeof value === 'string') {
    const numericValue = Number(value);
    return Number.isFinite(numericValue) ? numericValue : undefined;
  }

  return undefined;
};

/**
 * Validate timestamp validity
 */
export const validateTimestamp = (rawTimestamp: unknown): boolean => {
  if (typeof rawTimestamp !== 'number' || !Number.isFinite(rawTimestamp)) {
    return false;
  }

  // Boundary check: timestamp range reasonableness (between 1970-2100)
  const MIN_TIMESTAMP = 0; // 1970-01-01
  const MAX_TIMESTAMP = 4102444800; // 2100-01-01
  if (rawTimestamp < MIN_TIMESTAMP || rawTimestamp > MAX_TIMESTAMP) {
    return false;
  }

  return true;
};

/**
 * Validate value reasonableness
 */
export const validateValueRange = (value: number): boolean => {
  const MAX_REASONABLE_VALUE = Number.MAX_SAFE_INTEGER;
  const MIN_REASONABLE_VALUE = -Number.MAX_SAFE_INTEGER;

  return (
    value >= MIN_REASONABLE_VALUE && value <= MAX_REASONABLE_VALUE
  );
};
