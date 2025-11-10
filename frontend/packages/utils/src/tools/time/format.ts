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

import { EMPTY_CONTENT, EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { isUndefined } from 'lodash-es';
import type { ReactElement } from 'react';

import type { FormatDurationProps } from './constants';
import { DEFAULT_TIME_FORMAT_TEMPLATE } from './constants';
import { isMillisecondTimestamp } from './utils';

// Apply Day.js plugins
dayjs.extend(duration);

/**
 * @description Format standard timestamp.
 *
 * In business, negative timestamps usually don't occur, so non-positive values return empty string.
 *
 * @param targetMoment Timestamp, unit is milliseconds or seconds
 * @param template Format template, defaults to 'YYYY-MM-DD HH:mm:ss'
 * @param compareMoment Compare timestamp, used for calculating time difference
 * @returns Formatted time string or time difference
 */
export function formatTimestamp(
  targetMoment?: number,
  template?: string,
  compareMoment?: number,
): string;

export function formatTimestamp(
  targetMoment?: number,
  template?: string,
  compareMoment?: number,
  asString?: boolean,
): string | JSX.Element;

export function formatTimestamp(
  targetMoment?: number,
  template = DEFAULT_TIME_FORMAT_TEMPLATE,
  compareMoment?: number,
  asString = true,
): string | ReactElement {
  if (
    !Number.isFinite(targetMoment) ||
    isUndefined(targetMoment) ||
    targetMoment <= 0
  ) {
    return asString ? EMPTY_CONTENT_TEXT : EMPTY_CONTENT;
  }

  // Validate targetMoment timestamp unit
  const normalizedTargetMoment = !isMillisecondTimestamp(targetMoment)
    ? targetMoment * 1000
    : targetMoment;

  if (compareMoment) {
    // Validate compareMoment timestamp unit
    const normalizedCompareMoment = !isMillisecondTimestamp(compareMoment)
      ? compareMoment * 1000
      : compareMoment;

    const diff = dayjs.duration(
      normalizedCompareMoment - normalizedTargetMoment,
    ); // Calculate time difference

    if (template === 'year') {
      return `${diff.years()} year${diff.years() !== 1 ? 's' : ''}`;
    } else if (template === 'month') {
      return `${diff.months()} month${diff.months() !== 1 ? 's' : ''}`;
    } else if (template === 'day') {
      return `${diff.days()} day${diff.days() !== 1 ? 's' : ''}`;
    } else if (template === 'hour') {
      const roundedDiff = Math.round(diff.asHours()); // Round to nearest integer hour
      return `${roundedDiff} hour${roundedDiff !== 1 ? 's' : ''}`;
    } else if (template === 'second') {
      const roundedDiff = Math.round(diff.asSeconds()); // Round to nearest integer second
      return `${roundedDiff} second${roundedDiff !== 1 ? 's' : ''}`;
    }
  }

  if (isMillisecondTimestamp(targetMoment)) {
    return dayjs(normalizedTargetMoment).format(template);
  }
  return dayjs.unix(targetMoment).format(template);
}

/**
 * @description Format unix timestamp in seconds.
 *
 * In business, negative timestamps usually don't occur, so non-positive values return empty string.
 *
 * @param n Unix timestamp (seconds)
 * @param template Format template, defaults to 'YYYY-MM-DD HH:mm:ss'
 */
export const formatUnixTimestamp = (
  n: number | string | undefined | null,
  template = DEFAULT_TIME_FORMAT_TEMPLATE,
) => {
  if (n === undefined || n === null) {
    return '';
  }
  const numValue = typeof n === 'string' ? Number(n) : n;
  if (!Number.isFinite(numValue) || numValue <= 0) {
    return '';
  }

  return dayjs.unix(numValue).format(template);
};

/**
 * Convert timestamp to format `${hours} hours ${minutes} minutes ${seconds} seconds`.
 * @param duration - Duration value, can be millisecond timestamp or second timestamp.
 * @param isMilliseconds - Whether the passed value is millisecond timestamp, defaults to true.
 * @param isReturnTypeObject - Return type is object or string, defaults to string
 * @returns Formatted time string, if duration is NaN, undefined or null, returns undefined.
 */
export const formatDuration = ({
  duration: durationValue,
  isMilliseconds = true,
  isReturnTypeObject = false,
}: FormatDurationProps):
  | string
  | { hours: number; minutes: number; seconds: number }
  | undefined => {
  if (
    Number.isNaN(durationValue) ||
    durationValue === undefined ||
    durationValue === null
  ) {
    return undefined;
  }

  let totalSeconds: number = isMilliseconds
    ? Math.floor(durationValue / 1000)
    : durationValue;

  const hours: number = Math.floor(totalSeconds / 3600);
  totalSeconds %= 3600;
  const minutes: number = Math.floor(totalSeconds / 60);
  const seconds: number = totalSeconds % 60;

  if (isReturnTypeObject) {
    return {
      hours,
      minutes,
      seconds,
    };
  }
  return `${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
};
