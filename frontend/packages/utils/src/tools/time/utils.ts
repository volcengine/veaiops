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
 * Check if a string can be converted to a number
 * @param str String to be checked
 * @return Returns true if string can be converted to number, otherwise returns false
 */
export const canConvertToNumber = (str: string | number | unknown): boolean => {
  if (!str) {
    return false;
  }
  const num = Number(str);
  const result = !Number.isNaN(num);
  return result;
};

/**
 * Check if a timestamp is a millisecond timestamp
 * @param timestamp Timestamp, can be in seconds or milliseconds
 * @returns Returns true if timestamp is in milliseconds, otherwise returns false
 */
export const isMillisecondTimestamp = (timestamp?: number | string): boolean =>
  timestamp?.toString().length === 13;

/**
 * Check if a timestamp is a second timestamp
 * @param timestamp Timestamp, can be in seconds or milliseconds
 * @returns Returns true if timestamp is in seconds, otherwise returns false
 */
export const isSecondTimestamp = (timestamp?: number | string): boolean =>
  timestamp?.toString().length === 10;

/**
 * Check if all elements in a time range array are millisecond timestamps
 * @param timeRange Time range array to be checked
 * @returns Returns true if all elements in time range array are millisecond timestamps, otherwise returns false
 */
export const isTimeRangeWithMillSecondTimestamps = (
  timeRange: string[] | number[],
): boolean =>
  Array.isArray(timeRange) &&
  timeRange?.every((time) => isMillisecondTimestamp(time));

/**
 * Convert millisecond timestamp array to second timestamp array
 * @param millisecondTimestamps Millisecond timestamp array
 * @returns Second timestamp array
 */
export const convertMillisecondsToSeconds = (
  millisecondTimestamps: number[],
): number[] => {
  return millisecondTimestamps.map((timestamp) => Math.floor(timestamp / 1000));
};

/**
 * Convert minutes to milliseconds
 * @param minutes Number of minutes
 * @returns Converted milliseconds, returns undefined if minutes does not exist
 */
export const convertMinutesToMilliseconds = (
  minutes: number | undefined,
): number | undefined => {
  if (
    typeof minutes !== 'number' ||
    Number.isNaN(minutes) ||
    !Number.isFinite(minutes)
  ) {
    return undefined;
  }

  return minutes * 60000;
};

/**
 * Parse time to result in seconds.
 * @param time - Time object, containing time values in hours, minutes, and seconds.
 * @param time.hours - Number of hours, defaults to 0.
 * @param time.minutes - Number of minutes, defaults to 0.
 * @param time.seconds - Number of seconds, defaults to 0.
 * @returns Parsed time value in seconds.
 */
export const parseTimeToSeconds = (
  props: { hours?: number; minutes?: number; seconds?: number } | undefined,
): number | undefined => {
  if (!props) {
    return undefined;
  }
  const { hours = 0, minutes = 0, seconds = 0 } = props;
  return hours * 3600 + minutes * 60 + seconds;
};
