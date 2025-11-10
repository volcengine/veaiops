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

import { commonDateRangePickerProps } from '@/constants';
import { DatePicker } from '@arco-design/web-react';
import type { FilterPlugin } from '@veaiops/types';
import React from 'react';

const { RangePicker } = DatePicker;

// DatePicker plugin
export const DatePickerPlugin: FilterPlugin = {
  type: 'DatePicker',
  name: 'Date Picker',
  description: 'Single date selection component',
  version: '1.0.0',
  render: ({ hijackedProps }: { hijackedProps?: Record<string, unknown> }) => {
    // Filter out properties that should not be passed to DOM elements, including addBefore
    const { subType, addBefore, ...filteredProps } = hijackedProps || {};

    // If addBefore property exists, convert it to prefix
    const finalProps = addBefore
      ? { ...filteredProps, prefix: addBefore }
      : filteredProps;

    return <DatePicker {...commonDateRangePickerProps} {...finalProps} />;
  },
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    placeholder: 'Please select date...',
    allowClear: true,
  },
};

// RangePicker plugin
export const RangePickerPlugin: FilterPlugin = {
  type: 'RangePicker',
  name: 'Date Range Picker',
  description: 'Date range selection component',
  version: '1.0.0',
  render: ({ hijackedProps }: { hijackedProps?: Record<string, unknown> }) => {
    // Filter out properties that should not be passed to DOM elements, including addBefore
    const { subType, addBefore, ...filteredProps } = hijackedProps || {};

    // If addBefore property exists, convert it to prefix
    const finalProps = addBefore
      ? { ...filteredProps, prefix: addBefore }
      : filteredProps;

    return <RangePicker {...commonDateRangePickerProps} {...finalProps} />;
  },
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    placeholder: ['Start date', 'End date'],
    allowClear: true,
  },
};

// DateRangePicker plugin (compatible with old configuration, equivalent to RangePicker)
export const DateRangePickerPlugin: FilterPlugin = {
  type: 'DateRangePicker',
  name: 'Date Range Picker (Compatible)',
  description:
    'Equivalent to RangePicker, used for compatibility with old configuration items',
  version: '1.0.0',
  render: ({ hijackedProps }: { hijackedProps?: Record<string, unknown> }) => {
    // Filter out properties that should not be passed to DOM elements, including addBefore
    const { subType, addBefore, ...filteredProps } = hijackedProps || {};

    // If addBefore property exists, convert it to prefix
    const finalProps = addBefore
      ? { ...filteredProps, prefix: addBefore }
      : filteredProps;

    return <RangePicker {...commonDateRangePickerProps} {...finalProps} />;
  },
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    placeholder: ['Start date', 'End date'],
    allowClear: true,
  },
};
