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
 * Time range conversion utilities
 *
 * Used for handling time format conversion between frontend time range picker (RangePicker) and backend API.
 *
 * Design principles:
 * - RangePicker returns date strings in user timezone
 * - Backend API requires UTC ISO 8601 format or Unix timestamp
 * - When displaying on frontend, UTC time returned by backend needs to be converted to user timezone
 */

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { logger } from '../logger/index';
import { getUserTimezone } from './timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Convert mixed type time range to UTC ISO 8601 format
 *
 * Handles both Date objects and string formats from RangePicker.
 * RangePicker may return Date[] or string[] depending on context.
 *
 * @param timeRange - Time range array (Date objects or strings in user timezone, or ISO strings)
 * @returns UTC ISO 8601 format string array, returns undefined if input is invalid
 *
 * @example
 * ```typescript
 * // RangePicker onChange callback
 * onChange: (v: Date[] | string[] | null) => {
 *   if (v && v.length === 2) {
 *     const utcRange = convertTimeRangeToUtc(v);
 *     if (utcRange) {
 *       handleChange({ key: 'start_time', value: utcRange[0] });
 *       handleChange({ key: 'end_time', value: utcRange[1] });
 *     }
 *   }
 * }
 * ```
 */
export function convertTimeRangeToUtc(
  timeRange: (Date | string)[] | null,
): [string, string] | undefined {
  if (!timeRange || timeRange.length !== 2) {
    return undefined;
  }

  const [startValue, endValue] = timeRange;

  // Check if values are Date objects
  if (startValue instanceof Date && endValue instanceof Date) {
    // Convert Date objects to local time string format, then process
    // ✅ Fix: Use local time string to avoid double UTC conversion with toISOString()
    const formatLocalDate = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      const seconds = String(date.getSeconds()).padStart(2, '0');
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    const dateStrings = [
      formatLocalDate(startValue),
      formatLocalDate(endValue),
    ];
    return convertLocalTimeRangeToUtc(dateStrings);
  }

  // Check if values are strings
  if (typeof startValue === 'string' && typeof endValue === 'string') {
    // If already in ISO format (contains 'T' or 'Z'), return directly
    if (
      (startValue.includes('T') || startValue.includes('Z')) &&
      (endValue.includes('T') || endValue.includes('Z'))
    ) {
      return [startValue, endValue];
    }
    // Otherwise, convert as local time strings
    return convertLocalTimeRangeToUtc([startValue, endValue]);
  }

  // Invalid type
  logger.warn({
    message: 'Invalid time range type',
    data: {
      startValue,
      endValue,
      startType: typeof startValue,
      endType: typeof endValue,
    },
    source: 'TimeRangeUtils',
    component: 'convertTimeRangeToUtc',
  });

  return undefined;
}

/**
 * Convert date string array returned by RangePicker to UTC ISO 8601 format
 *
 * ✅ Enhanced: Now handles both Date objects and strings from RangePicker
 * RangePicker may return Date[] or string[] depending on context.
 *
 * @param dateStrings - Date or string array returned by RangePicker (user timezone or ISO format)
 * @returns UTC ISO 8601 format string array, returns undefined if input is invalid
 *
 * @example
 * ```typescript
 * // RangePicker onChange callback (string array)
 * onChange: (dateStrings: string[] | null) => {
 *   if (dateStrings && dateStrings.length === 2) {
 *     const utcRange = convertLocalTimeRangeToUtc(dateStrings);
 *     if (utcRange) {
 *       handleChange({ key: 'start_time', value: utcRange[0] });
 *       handleChange({ key: 'end_time', value: utcRange[1] });
 *     }
 *   }
 * }
 *
 * // Also works with Date array
 * onChange: (dates: Date[] | null) => {
 *   const utcRange = convertLocalTimeRangeToUtc(dates);
 *   // ...
 * }
 * ```
 */
export function convertLocalTimeRangeToUtc(
  dateStrings: (string | Date)[] | null,
): [string, string] | undefined {
  // ✅ Fix: Handle both Date[] and string[] from RangePicker
  // Normalize input to string array first
  let normalizedStrings: string[] | null = null;

  if (dateStrings && dateStrings.length === 2) {
    const [startValue, endValue] = dateStrings;

    // If Date objects, convert to local time string format
    // ✅ Fix: Use local time string to avoid double UTC conversion with toISOString()
    if (startValue instanceof Date && endValue instanceof Date) {
      const formatLocalDate = (date: Date): string => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      normalizedStrings = [
        formatLocalDate(startValue),
        formatLocalDate(endValue),
      ];
    } else if (typeof startValue === 'string' && typeof endValue === 'string') {
      // If already ISO format strings (contains 'T' or 'Z'), return directly
      if (
        (startValue.includes('T') || startValue.includes('Z')) &&
        (endValue.includes('T') || endValue.includes('Z'))
      ) {
        return [startValue, endValue];
      }
      // Otherwise use as normalized strings
      normalizedStrings = [startValue, endValue];
    }
  }

  logger.debug({
    message: 'Converting local time range to UTC',
    data: {
      dateStrings,
      normalizedStrings,
      userTimezone: getUserTimezone(),
    },
    source: 'TimeRangeUtils',
    component: 'convertLocalTimeRangeToUtc',
  });

  // Boundary check: null or undefined
  if (!normalizedStrings || normalizedStrings.length !== 2) {
    logger.debug({
      message: 'Invalid input: dateStrings is null or wrong length',
      data: {
        dateStrings,
        normalizedStrings,
        length: normalizedStrings?.length,
      },
      source: 'TimeRangeUtils',
      component: 'convertLocalTimeRangeToUtc',
    });
    return undefined;
  }

  const [startStr, endStr] = normalizedStrings;

  // Boundary check: empty strings
  if (!startStr || !endStr) {
    logger.debug({
      message: 'Invalid input: empty start or end time',
      data: {
        startStr,
        endStr,
      },
      source: 'TimeRangeUtils',
      component: 'convertLocalTimeRangeToUtc',
    });
    return undefined;
  }

  // Boundary check: trim and check again (handle whitespace-only strings)
  const trimmedStart = startStr.trim();
  const trimmedEnd = endStr.trim();
  if (!trimmedStart || !trimmedEnd) {
    logger.debug({
      message: 'Invalid input: whitespace-only strings',
      data: {
        startStr,
        endStr,
      },
      source: 'TimeRangeUtils',
      component: 'convertLocalTimeRangeToUtc',
    });
    return undefined;
  }

  try {
    // Get user timezone
    const userTimezone = getUserTimezone();

    // Boundary check: validate timezone
    try {
      dayjs.tz.setDefault(userTimezone);
    } catch {
      logger.warn({
        message: 'Invalid user timezone, conversion may fail',
        data: { userTimezone, dateStrings },
        source: 'TimeRangeUtils',
        component: 'convertLocalTimeRangeToUtc',
      });
      // Continue with conversion attempt, but log warning
    }

    // Parse date strings in user timezone (RangePicker returns strings in user timezone)
    const startLocal = dayjs.tz(trimmedStart, userTimezone);
    const endLocal = dayjs.tz(trimmedEnd, userTimezone);

    // Boundary check: validate date validity
    if (!startLocal.isValid() || !endLocal.isValid()) {
      logger.warn({
        message: 'Invalid date strings in time range',
        data: { startStr: trimmedStart, endStr: trimmedEnd, userTimezone },
        source: 'TimeRangeUtils',
        component: 'convertLocalTimeRangeToUtc',
      });
      return undefined;
    }

    // Boundary check: start time should not be after end time (log warning if so)
    if (startLocal.isAfter(endLocal)) {
      logger.warn({
        message: 'Start time is after end time in time range',
        data: {
          startStr: trimmedStart,
          endStr: trimmedEnd,
          startLocal: startLocal.toISOString(),
          endLocal: endLocal.toISOString(),
        },
        source: 'TimeRangeUtils',
        component: 'convertLocalTimeRangeToUtc',
      });
      // Continue with conversion (may be valid use case, e.g., crossing midnight)
    }

    // Convert to UTC ISO 8601 format
    const startUtc = startLocal.utc().toISOString();
    const endUtc = endLocal.utc().toISOString();

    // Boundary check: validate converted UTC strings
    if (!startUtc || !endUtc) {
      logger.warn({
        message: 'Failed to generate UTC ISO strings',
        data: { startLocal, endLocal },
        source: 'TimeRangeUtils',
        component: 'convertLocalTimeRangeToUtc',
      });
      return undefined;
    }

    logger.info({
      message: 'Local time range converted to UTC successfully',
      data: {
        inputLocal: { start: trimmedStart, end: trimmedEnd },
        outputUtc: { start: startUtc, end: endUtc },
        userTimezone,
      },
      source: 'TimeRangeUtils',
      component: 'convertLocalTimeRangeToUtc',
    });

    return [startUtc, endUtc];
  } catch (error: unknown) {
    // Handle conversion errors
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.warn({
      message: 'Failed to convert time range to UTC',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        dateStrings,
      },
      source: 'TimeRangeUtils',
      component: 'convertLocalTimeRangeToUtc',
    });
    return undefined;
  }
}

/**
 * Convert UTC ISO 8601 format string array to dayjs object array in user timezone
 *
 * Used to convert UTC time returned by backend to format required by RangePicker.
 *
 * @param utcStrings - UTC ISO 8601 format string array
 * @param userTimezone - User timezone (optional, defaults to user's preferred timezone)
 * @returns dayjs object array, returns undefined if input is invalid
 *
 * @example
 * ```typescript
 * // RangePicker value property
 * value={
 *   query?.start_time && query?.end_time
 *     ? convertUtcTimeRangeToLocal([query.start_time, query.end_time])
 *     : undefined
 * }
 * ```
 */
export function convertUtcTimeRangeToLocal(
  utcStrings: [string, string] | undefined,
  userTimezone?: string,
): [dayjs.Dayjs, dayjs.Dayjs] | undefined {
  const timezone = userTimezone || getUserTimezone();

  logger.info({
    message: 'Converting UTC time range to local timezone',
    data: {
      utcStrings,
      timezone,
      timestamp: new Date().toISOString(),
    },
    source: 'TimeRangeUtils',
    component: 'convertUtcTimeRangeToLocal',
  });

  // Boundary check: null or undefined
  if (!utcStrings || utcStrings.length !== 2) {
    logger.debug({
      message: 'Invalid utcStrings input',
      data: { utcStrings },
      source: 'TimeRangeUtils',
      component: 'convertUtcTimeRangeToLocal',
    });
    return undefined;
  }

  const [startUtc, endUtc] = utcStrings;

  // Boundary check: empty strings
  if (!startUtc || !endUtc) {
    logger.debug({
      message: 'Empty start or end UTC string',
      data: { startUtc, endUtc },
      source: 'TimeRangeUtils',
      component: 'convertUtcTimeRangeToLocal',
    });
    return undefined;
  }

  // Boundary check: trim and check again (handle whitespace-only strings)
  const trimmedStart = startUtc.trim();
  const trimmedEnd = endUtc.trim();
  if (!trimmedStart || !trimmedEnd) {
    logger.debug({
      message: 'Whitespace-only UTC strings',
      data: { startUtc, endUtc },
      source: 'TimeRangeUtils',
      component: 'convertUtcTimeRangeToLocal',
    });
    return undefined;
  }

  try {
    // Parse UTC time
    const startUtcMoment = dayjs.utc(trimmedStart);
    const endUtcMoment = dayjs.utc(trimmedEnd);

    // Boundary check: validate date validity
    if (!startUtcMoment.isValid() || !endUtcMoment.isValid()) {
      logger.warn({
        message: 'Invalid UTC date strings in time range',
        data: { startUtc: trimmedStart, endUtc: trimmedEnd },
        source: 'TimeRangeUtils',
        component: 'convertUtcTimeRangeToLocal',
      });
      return undefined;
    }

    // Convert to user timezone
    const timezone = userTimezone || getUserTimezone();

    // Boundary check: validate timezone
    try {
      dayjs.tz.setDefault(timezone);
    } catch {
      logger.warn({
        message: 'Invalid timezone provided, conversion may fail',
        data: { timezone, utcStrings },
        source: 'TimeRangeUtils',
        component: 'convertUtcTimeRangeToLocal',
      });
      // Continue with conversion attempt, but log warning
    }

    const startLocal = startUtcMoment.tz(timezone);
    const endLocal = endUtcMoment.tz(timezone);

    // Boundary check: validate converted times
    if (!startLocal.isValid() || !endLocal.isValid()) {
      logger.warn({
        message: 'Timezone conversion resulted in invalid times',
        data: {
          startUtc: trimmedStart,
          endUtc: trimmedEnd,
          timezone,
          startUtcMoment: startUtcMoment.toISOString(),
          endUtcMoment: endUtcMoment.toISOString(),
        },
        source: 'TimeRangeUtils',
        component: 'convertUtcTimeRangeToLocal',
      });
      return undefined;
    }

    return [startLocal, endLocal];
  } catch (error: unknown) {
    // Handle conversion errors
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.warn({
      message: 'Failed to convert UTC time range to local timezone',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        utcStrings,
      },
      source: 'TimeRangeUtils',
      component: 'convertUtcTimeRangeToLocal',
    });
    return undefined;
  }
}
