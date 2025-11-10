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
 * Timezone conversion utilities
 * Convert between UTC and local timezone
 */

import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { logger } from '../../logger/index';
import { DEFAULT_TIMEZONE } from './constants';
import { getUserTimezone } from './preference';
import { isValidTimezone } from './validator.tsx';

dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Convert UTC time to local time in specified timezone
 *
 * Supports multiple input formats:
 * - ISO 8601 string (with or without 'Z' suffix, e.g., '2025-01-15T10:00:00Z' or '2025-01-15T10:00:00+00:00')
 * - Date object
 * - Timestamp (milliseconds)
 *
 * Note: datetime fields returned by backend use UTC ISO 8601 format (may have 'Z' suffix or '+00:00')
 *
 * @param utcTime - UTC time (can be ISO string, Date object, or timestamp)
 * @param targetTimezone - Target timezone (optional, defaults to user's preferred timezone)
 * @returns dayjs object (converted to target timezone), returns invalid dayjs object if input is invalid
 */
export function convertUtcToLocal(
  utcTime: string | Date | number | null | undefined,
  targetTimezone?: string,
): dayjs.Dayjs {
  // Boundary check: handle null/undefined
  if (utcTime == null) {
    logger.debug({
      message: 'convertUtcToLocal received null/undefined input',
      data: {
        utcTime,
        targetTimezone,
      },
      source: 'TimezoneConverter',
      component: 'convertUtcToLocal',
    });
    return dayjs(null);
  }

  // Boundary check: handle empty string
  if (typeof utcTime === 'string' && utcTime.trim() === '') {
    logger.debug({
      message: 'convertUtcToLocal received empty string',
      data: {
        targetTimezone,
      },
      source: 'TimezoneConverter',
      component: 'convertUtcToLocal',
    });
    return dayjs(null);
  }

  // Boundary check: handle invalid number (NaN, Infinity, etc.)
  if (typeof utcTime === 'number' && !Number.isFinite(utcTime)) {
    logger.debug({
      message: 'convertUtcToLocal received invalid number',
      data: {
        utcTime,
        targetTimezone,
      },
      source: 'TimezoneConverter',
      component: 'convertUtcToLocal',
    });
    return dayjs(null);
  }

  const timezone = targetTimezone || getUserTimezone();

  logger.debug({
    message: 'Converting UTC to local timezone',
    data: {
      utcTime: typeof utcTime === 'object' ? utcTime?.toString() : utcTime,
      targetTimezone: timezone,
      inputType: typeof utcTime,
    },
    source: 'TimezoneConverter',
    component: 'convertUtcToLocal',
  });

  // Boundary check: validate timezone
  if (!isValidTimezone(timezone)) {
    logger.warn({
      message: 'Invalid timezone detected in convertUtcToLocal',
      data: {
        invalidTimezone: timezone,
        utcTime: typeof utcTime === 'object' ? utcTime?.toString() : utcTime,
      },
      source: 'TimezoneConverter',
      component: 'convertUtcToLocal',
    });

    // Fallback to default timezone (avoid recursion)
    if (timezone !== DEFAULT_TIMEZONE) {
      return convertUtcToLocal(utcTime, DEFAULT_TIMEZONE);
    }
    return dayjs(null);
  }

  // Parse UTC time
  let utcMoment: dayjs.Dayjs;
  try {
    if (typeof utcTime === 'string') {
      // ISO string: use dayjs.utc() to parse
      if (
        utcTime.endsWith('Z') ||
        utcTime.includes('+00:00') ||
        utcTime.includes('-00:00')
      ) {
        // String explicitly marked as UTC
        utcMoment = dayjs.utc(utcTime);
        logger.debug({
          message: 'Parsing UTC string with explicit timezone marker',
          data: {
            utcTime,
            parsedUtc: utcMoment.format('YYYY-MM-DD HH:mm:ss'),
            utcOffset: utcMoment.utcOffset(),
          },
          source: 'TimezoneConverter',
          component: 'convertUtcToLocal',
        });
      } else if (utcTime.includes('+') || utcTime.includes('-', 10)) {
        // String with timezone offset
        utcMoment = dayjs.utc(utcTime);
        logger.debug({
          message: 'Parsing UTC string with timezone offset',
          data: {
            utcTime,
            parsedUtc: utcMoment.format('YYYY-MM-DD HH:mm:ss'),
            utcOffset: utcMoment.utcOffset(),
          },
          source: 'TimezoneConverter',
          component: 'convertUtcToLocal',
        });
      } else {
        // String without timezone info, assume UTC
        utcMoment = dayjs.utc(utcTime);
        logger.debug({
          message: 'Parsing UTC string without timezone info (assuming UTC)',
          data: {
            utcTime,
            parsedUtc: utcMoment.format('YYYY-MM-DD HH:mm:ss'),
            utcOffset: utcMoment.utcOffset(),
          },
          source: 'TimezoneConverter',
          component: 'convertUtcToLocal',
        });
      }
    } else if (utcTime instanceof Date) {
      // Date object: convert to UTC
      if (Number.isNaN(utcTime.getTime())) {
        return dayjs(null);
      }
      utcMoment = dayjs.utc(utcTime);
      logger.debug({
        message: 'Converting Date object to UTC',
        data: {
          originalDate: utcTime.toISOString(),
          parsedUtc: utcMoment.format('YYYY-MM-DD HH:mm:ss'),
        },
        source: 'TimezoneConverter',
        component: 'convertUtcToLocal',
      });
    } else {
      // Timestamp: assume UTC timestamp (milliseconds)
      utcMoment = dayjs.utc(utcTime);
      logger.debug({
        message: 'Parsing timestamp as UTC',
        data: {
          timestamp: utcTime,
          parsedUtc: utcMoment.format('YYYY-MM-DD HH:mm:ss'),
        },
        source: 'TimezoneConverter',
        component: 'convertUtcToLocal',
      });
    }

    // Validate parsed time
    if (!utcMoment.isValid()) {
      logger.warn({
        message: 'Invalid UTC time input',
        data: {
          utcTime: typeof utcTime === 'object' ? utcTime?.toString() : utcTime,
          timezone,
        },
        source: 'TimezoneConverter',
        component: 'convertUtcToLocal',
      });
      return dayjs(null);
    }

    // Convert to target timezone
    const localMoment = utcMoment.tz(timezone);

    // Validate converted time
    if (!localMoment.isValid()) {
      logger.warn({
        message: 'Timezone conversion resulted in invalid time',
        data: { utcTime, timezone, utcMoment: utcMoment.toISOString() },
        source: 'TimezoneConverter',
        component: 'convertUtcToLocal',
      });
      return dayjs(null);
    }

    // ✅ 详细记录转换结果
    logger.info({
      message: 'UTC to local timezone conversion successful',
      data: {
        inputUtcTime:
          typeof utcTime === 'object' ? utcTime?.toString() : utcTime,
        parsedUtcTime: utcMoment.toISOString(),
        parsedUtcFormatted: utcMoment.format('YYYY-MM-DD HH:mm:ss'),
        targetTimezone: timezone,
        convertedLocalTime: localMoment.format('YYYY-MM-DD HH:mm:ss'),
        localUtcOffset: localMoment.utcOffset(),
        localUtcOffsetHours: localMoment.utcOffset() / 60,
        timeDifferenceHours:
          (localMoment.utcOffset() - utcMoment.utcOffset()) / 60,
      },
      source: 'TimezoneConverter',
      component: 'convertUtcToLocal',
    });

    return localMoment;
  } catch (error: unknown) {
    // Handle parsing errors
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.warn({
      message: 'Failed to convert UTC time to local timezone',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        utcTime,
        timezone,
      },
      source: 'TimezoneConverter',
      component: 'convertUtcToLocal',
    });
    return dayjs(null);
  }
}

/**
 * Format UTC time as string in specified timezone
 *
 * @param utcTime - UTC time (can be ISO string, Date object, or timestamp)
 * @param format - Format template (default 'YYYY-MM-DD HH:mm:ss')
 * @param targetTimezone - Target timezone (optional, defaults to user's preferred timezone)
 * @returns Formatted time string, returns empty string if input is invalid
 */
export function formatUtcToLocal(
  utcTime: string | Date | number | null | undefined,
  format = 'YYYY-MM-DD HH:mm:ss',
  targetTimezone?: string,
): string {
  const timezone = targetTimezone || getUserTimezone();

  logger.debug({
    message: 'formatUtcToLocal called',
    data: {
      utcTime: typeof utcTime === 'object' ? utcTime?.toString() : utcTime,
      format,
      timezone,
    },
    source: 'TimezoneConverter',
    component: 'formatUtcToLocal',
  });

  const localTime = convertUtcToLocal(utcTime, timezone);

  // Boundary check: validate converted time
  if (!localTime.isValid()) {
    logger.warn({
      message: 'Cannot format invalid time',
      data: {
        utcTime: typeof utcTime === 'object' ? utcTime?.toString() : utcTime,
        timezone,
        format,
      },
      source: 'TimezoneConverter',
      component: 'formatUtcToLocal',
    });
    return '';
  }

  try {
    const formatted = localTime.format(format);

    logger.info({
      message: 'Time formatted successfully',
      data: {
        inputUtcTime:
          typeof utcTime === 'object' ? utcTime?.toString() : utcTime,
        timezone,
        format,
        formatted,
        localTimeIso: localTime.toISOString(),
        localTimeFormatted: localTime.format('YYYY-MM-DD HH:mm:ss'),
        localUtcOffset: localTime.utcOffset(),
        localUtcOffsetHours: localTime.utcOffset() / 60,
      },
      source: 'TimezoneConverter',
      component: 'formatUtcToLocal',
    });

    return formatted;
  } catch (error: unknown) {
    // Handle formatting errors
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.warn({
      message: 'Failed to format time',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        utcTime,
        format,
        targetTimezone,
      },
      source: 'TimezoneConverter',
      component: 'formatUtcToLocal',
    });
    return '';
  }
}
