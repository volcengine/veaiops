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
import { isNumber, pick } from 'lodash-es';
import {
  type ConvertToUnixTimestampProps,
  DEFAULT_TIME_FORMAT_TEMPLATE,
} from './constants';
import {
  canConvertToNumber as canConvertToNumberFromCommon,
  isMillisecondTimestamp,
  isSecondTimestamp,
} from './utils';

/**
 * Convert string type time to Unix timestamp
 * @param time Time string
 * @param format Format template (optional)
 * @returns Corresponding Unix timestamp
 */
export const convertToUnixTimestamp = ({
  time,
  format = DEFAULT_TIME_FORMAT_TEMPLATE,
  isToSecondTimestamp = false,
  isToMillSecondTimestamp = false,
}: ConvertToUnixTimestampProps): number => {
  let unixTimestamp = time;
  if (typeof time === 'string') {
    if (format) {
      unixTimestamp = dayjs(time, format).valueOf();
    } else {
      unixTimestamp = dayjs(time).valueOf();
    }
  }
  if (
    isToSecondTimestamp &&
    typeof unixTimestamp === 'number' &&
    isMillisecondTimestamp(unixTimestamp)
  ) {
    unixTimestamp = Math.floor(unixTimestamp / 1000);
  }

  if (
    isToMillSecondTimestamp &&
    typeof unixTimestamp === 'number' &&
    isSecondTimestamp(unixTimestamp)
  ) {
    unixTimestamp *= 1000;
  }

  return unixTimestamp as number;
};

/**
 * Convert string type time range to Unix timestamp range
 * @param timeRange Time range array, containing start time and end time
 * @param format Format template (optional)
 * @param isToSecondTimestamp Whether to convert to second-level timestamp (optional, default false)
 * @param isToMillSecondTimestamp Whether to convert to millisecond-level timestamp (optional, default false)
 * @returns Corresponding Unix timestamp range
 */
export const convertTimeRangeToUnixTimestampRange = ({
  timeRange,
  format = DEFAULT_TIME_FORMAT_TEMPLATE,
  isToSecondTimestamp = false,
  isToMillSecondTimestamp = true,
}: {
  timeRange: string[] | number[] | undefined;
  format?: string;
  isToSecondTimestamp?: boolean;
  isToMillSecondTimestamp?: boolean;
}): number[] => {
  if (!timeRange || timeRange.length === 0) {
    return [];
  }
  const [startTime, endTime] = timeRange.map((value) =>
    canConvertToNumberFromCommon(value) ? Number(value) : value,
  );
  // If it's ['1640995200000', '1672531199999'], convert to number array and return directly
  if (isNumber(startTime) && isNumber(endTime)) {
    return [startTime, endTime];
  }
  const convertedStartTime = convertToUnixTimestamp({
    time: startTime,
    format,
    isToSecondTimestamp,
    isToMillSecondTimestamp,
  });
  const convertedEndTime = convertToUnixTimestamp({
    time: endTime,
    format,
    isToSecondTimestamp,
    isToMillSecondTimestamp,
  });
  return [convertedStartTime, convertedEndTime];
};

/**
 * Convert specified fields in object to timestamps and return the converted object
 * @param fields Object containing fields and their corresponding values
 * @returns Converted object
 */
export const convertFieldsToTimestamp = <T>({
  fields,
  target,
  convertProps = {},
}: {
  fields: Array<string>;
  target: any;
  convertProps?: Omit<ConvertToUnixTimestampProps, 'time'>;
}): T => {
  const convertedFields: Record<string, string | number> = pick(target, fields);

  fields.forEach((field) => {
    const value = convertedFields[field];
    convertedFields[field] = convertToUnixTimestamp({
      time: value,
      isToMillSecondTimestamp: true,
      ...convertProps,
    });
  });

  const result = { ...target, ...convertedFields } as T;
  return result;
};
