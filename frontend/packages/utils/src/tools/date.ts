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

import { EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import dayjs from 'dayjs';

export const formatDate = (
  date: string | Date,
  format = 'YYYY-MM-DD HH:mm:ss',
) => {
  return dayjs(date).format(format);
};

export const getRelativeTime = (date: string | Date) => {
  // Simple relative time calculation, avoid using plugins
  const now = dayjs();
  const target = dayjs(date);
  const diff = now.diff(target, 'minute');

  if (diff < 1) {
    return 'Just now';
  }
  if (diff < 60) {
    return `${diff} minute${diff !== 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(diff / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

/**
 * Format time display
 * @param dateInput Date input, supports string, Date object, timestamp, null or undefined
 * @param showSeconds Whether to show seconds, defaults to false
 * @returns Formatted time string, empty values return "-"
 */
export const formatDateTime = (
  dateInput: string | Date | number | undefined | null,
  showSeconds = false,
) => {
  // Handle empty value case
  if (dateInput == null || dateInput === '') {
    return EMPTY_CONTENT_TEXT;
  }

  try {
    let date: Date;

    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else {
      date = new Date(dateInput);
    }

    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    };

    if (showSeconds) {
      options.second = '2-digit';
    }

    return date.toLocaleString('en-US', options);
  } catch (error: unknown) {
    // ✅ Silently handle date formatting error (avoid blocking functionality), return string representation
    // Only log warning in development environment
    if (process.env.NODE_ENV === 'development') {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.warn('[DateUtils] Date formatting failed', errorObj.message, {
        dateInput,
      });
    }
    return String(dateInput);
  }
};

/**
 * Disable all dates after current date
 * Used for DatePicker/RangePicker component's disabledDate property
 * @param current Current date
 * @returns Returns true if date should be disabled
 */
export const disabledDate = (current: dayjs.Dayjs) => {
  return current?.isAfter(dayjs(), 'day');
};
