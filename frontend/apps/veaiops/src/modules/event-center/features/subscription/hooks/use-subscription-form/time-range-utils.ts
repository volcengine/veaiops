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
 * Default subscription validity period: 100 years
 */
const DEFAULT_VALIDITY_YEARS = 100;

/**
 * Create default effective time range
 *
 * Returns time range from current time to 100 years later, used as default value when creating new subscription
 *
 * @returns [Current time, Time 100 years later]
 *
 * @example
 * ```ts
 * const [start, end] = createDefaultTimeRange();
 * // start: 2025-10-29T00:00:00.000Z
 * // end: 2125-10-29T00:00:00.000Z
 * ```
 */
export const createDefaultTimeRange = (): [Date, Date] => {
  const now = new Date();
  const futureDate = new Date();
  futureDate.setFullYear(futureDate.getFullYear() + DEFAULT_VALIDITY_YEARS);
  return [now, futureDate];
};

/**
 * Parse time range
 *
 * Converts ISO format time strings to Date object array, includes comprehensive error handling:
 * - Validates if input is empty
 * - Validates if date format is valid
 * - Catches parsing exceptions
 *
 * @param startTime - Start time (ISO string format)
 * @param endTime - End time (ISO string format)
 * @returns Time range array, returns undefined if time is invalid
 *
 * @example
 * ```ts
 * // Successful parsing
 * parseTimeRange('2025-01-01T00:00:00.000Z', '2025-12-31T23:59:59.999Z')
 * // [Date(2025-01-01), Date(2025-12-31)]
 *
 * // Handle empty values
 * parseTimeRange(null, null) // undefined
 * parseTimeRange('2025-01-01', null) // undefined
 *
 * // Handle invalid dates
 * parseTimeRange('invalid-date', '2025-12-31') // undefined
 * parseTimeRange('2025-13-32', '2025-12-31') // undefined
 * ```
 */
export const parseTimeRange = (
  startTime?: string | null,
  endTime?: string | null,
): [Date, Date] | undefined => {
  // Validate if input exists
  if (!startTime || !endTime) {
    return undefined;
  }

  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Validate date validity (NaN indicates invalid date)
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return undefined;
    }

    return [start, end];
  } catch (error) {
    // Catch any parsing exceptions
    return undefined;
  }
};

/**
 * Format time range to ISO string
 *
 * @param timeRange - Date object array
 * @returns ISO format time string array
 */
export const formatTimeRange = (
  timeRange?: [Date, Date],
): { startTime?: string; endTime?: string } => {
  if (!timeRange || timeRange.length !== 2) {
    return {};
  }

  const [start, end] = timeRange;

  return {
    startTime: start?.toISOString(),
    endTime: end?.toISOString(),
  };
};
