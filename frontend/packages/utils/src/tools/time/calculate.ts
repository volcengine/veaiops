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

import dayjs from 'dayjs';
import { isUndefined } from 'lodash-es';

/**
 * Calculate timestamp based on time difference and time unit
 * @param diff Time difference, represents how many units back from current moment
 * @param unit Time unit, optional values: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
 * @param outputInSeconds Whether to output timestamp in seconds, defaults to false (output milliseconds)
 * @returns Calculated timestamp
 */
export const calculateTimestamp = (
  diff: number,
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
  outputInSeconds = false,
): number => {
  const now: dayjs.Dayjs = dayjs(); // Get current time

  // Adjust time based on unit parameter
  const adjustedTime: dayjs.Dayjs = now.subtract(diff, unit);

  // Get adjusted timestamp
  let timestamp: number = adjustedTime.valueOf();

  // Determine if timestamp should be output in seconds
  if (outputInSeconds) {
    timestamp = Math.floor(timestamp / 1000);
  }

  return timestamp;
};

/**
 * Calculate timestamp range based on time difference and time unit
 * @param diff Time difference, represents how many units back from current moment
 * @param unit Time unit, optional values: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
 * @param outputInSeconds Whether to output timestamp in seconds, defaults to false (output milliseconds)
 * @returns Calculated timestamp range array
 */
export const calculateTimestampRange = (
  diff: number,
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second',
  outputInSeconds = false,
): number[] => {
  if (isUndefined(diff)) {
    return [];
  }
  const now: dayjs.Dayjs = dayjs(); // Get current time

  // Calculate start time and end time based on unit parameter
  const endTime: dayjs.Dayjs = now;
  const startTime: dayjs.Dayjs = endTime.subtract(diff, unit);
  // Get timestamps of start time and end time
  let startTimestamp: number = startTime.valueOf();
  let endTimestamp: number = endTime.valueOf();

  // Determine if timestamp should be output in seconds
  if (outputInSeconds) {
    startTimestamp = Math.floor(startTimestamp / 1000);
    endTimestamp = Math.floor(endTimestamp / 1000);
  }

  // Generate timestamp range array
  const timestampRange: number[] = [startTimestamp, endTimestamp];
  return timestampRange;
};

/**
 * Generate time difference relative to specified time
 * @param {number} timestamp Timestamp of specified time
 * @param {string} unit Time unit, optional values: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second'
 * @param {number} diff Difference relative to current time
 * @param {boolean} isFuture Whether to calculate time forward, defaults to true
 * @param {boolean} inputInSeconds Whether to return time difference in seconds, defaults to false (returns milliseconds)
 * @returns {number} Calculated time difference
 */
export const calculateTimestampByDiffFromNow = ({
  unit,
  diff,
  isFuture = true,
}: {
  unit: 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second';
  diff: number;
  isFuture?: boolean;
}): number => {
  const now = dayjs(); // Get current time

  // Calculate time based on isFuture parameter
  const calculatedDate = isFuture
    ? now.add(diff, unit)
    : now.subtract(diff, unit);

  // Return as timestamp (milliseconds)
  return calculatedDate.valueOf();
};

/**
 * Calculate time based on start time, offset, and operation.
 * @param startTime Start time, format is "YYYY-MM-DD HH:mm:ss".
 * @param offset Offset time, format is "1h" or "1m".
 * @param operation Calculation operation: "add" (default), "subtract", "multiply", or "divide".
 * @returns Calculated time in ISO 8601 format.
 */
export const calculateTimeByOffset = (
  startTime: string,
  offset: string,
  operation = 'add',
): string => {
  // Convert startTime to Date object
  const startDate = new Date(startTime);

  // Extract value and unit from offset
  const amount = Number(offset.slice(0, -1));
  const unit = offset.slice(-1);

  // Calculate new date based on operation
  let newDate: Date;
  if (operation === 'add') {
    newDate = new Date(startDate.getTime());
    if (unit === 'h') {
      newDate.setHours(startDate.getHours() + amount);
    } else if (unit === 'm') {
      newDate.setMinutes(startDate.getMinutes() + amount);
    }
  } else if (operation === 'subtract') {
    newDate = new Date(startDate.getTime());
    if (unit === 'h') {
      newDate.setHours(startDate.getHours() - amount);
    } else if (unit === 'm') {
      newDate.setMinutes(startDate.getMinutes() - amount);
    }
  } else if (operation === 'multiply') {
    newDate = new Date(startDate.getTime());
    if (unit === 'h') {
      newDate.setHours(startDate.getHours() * amount);
    } else if (unit === 'm') {
      newDate.setMinutes(startDate.getMinutes() * amount);
    }
  } else if (operation === 'divide') {
    newDate = new Date(startDate.getTime());
    if (unit === 'h') {
      newDate.setHours(Math.floor(startDate.getHours() / amount));
    } else if (unit === 'm') {
      newDate.setMinutes(Math.floor(startDate.getMinutes() / amount));
    }
  } else {
    return 'Invalid operation';
  }

  return newDate.toISOString();
};

/**
 * Check if given startTime, endTime, and offset are within specified range.
 * @param params Object containing startTime, endTime, and offset
 * @returns Returns true if endTime - startTime is within offset range, otherwise returns false
 */
export const checkOffsetRange = ({
  startTime,
  endTime,
  offset,
}: {
  startTime: string;
  endTime: string;
  offset: string;
}): boolean => {
  // Convert startTime and endTime to Date objects
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  // Extract value and unit from offset
  const amount = Number(offset.slice(0, -1));
  const unit = offset.slice(-1);

  // Calculate time difference
  let timeDiff: number;
  if (unit === 'h') {
    timeDiff =
      Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 3600); // Convert milliseconds to hours
  } else if (unit === 'm') {
    timeDiff = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60); // Convert milliseconds to minutes
  } else {
    return false; // Unsupported unit
  }

  // Check if time difference is within offset range
  return timeDiff <= amount;
};
