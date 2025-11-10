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
 * Time range interface
 */
export interface TimeRange {
  time: number;
  unit: 'd' | 'D' | 'M' | 'y' | 'h' | 'm' | 's' | 'ms';
}

/**
 * Convert string type time to Unix timestamp parameter type
 */
export interface ConvertToUnixTimestampProps {
  time: string | number;
  format?: string;
  isToSecondTimestamp?: boolean;
  isToMillSecondTimestamp?: boolean;
}

/**
 * Format duration parameter
 */
export interface FormatDurationProps {
  duration: number;
  isMilliseconds?: boolean;
  isReturnTypeObject?: boolean;
}

/**
 * Default time format template
 */
export const DEFAULT_TIME_FORMAT_TEMPLATE = 'YYYY-MM-DD HH:mm:ss';

/**
 * Default date format template
 */
export const DEFAULT_TIME_DAY_FORMAT_TEMPLATE = 'YYYY-MM-DD';
