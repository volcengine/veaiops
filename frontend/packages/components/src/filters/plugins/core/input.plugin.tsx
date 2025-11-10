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

import { CustomOutlineTag } from '@/cell-render/custom-outline-tag';
import { commonInputProps } from '@/constants';
import { Input, InputNumber, InputTag } from '@arco-design/web-react';
import type { FilterPlugin } from '@veaiops/types';
import React from 'react';

// Input plugin
export const InputPlugin: FilterPlugin = {
  type: 'Input',
  name: 'Text Input',
  description: 'Basic text input component',
  version: '1.0.0',
  render: ({ hijackedProps }: { hijackedProps?: Record<string, unknown> }) => {
    // Filter out props that should not be passed to DOM elements
    const { subType, ...filteredProps } = hijackedProps || {};
    return <Input {...commonInputProps} {...filteredProps} />;
  },
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    placeholder: 'Please enter...',
    allowClear: true,
  },
};

// InputNumber plugin
export const InputNumberPlugin: FilterPlugin = {
  type: 'InputNumber',
  name: 'Number Input',
  description: 'Number input component',
  version: '1.0.0',
  render: ({ hijackedProps }: { hijackedProps?: Record<string, unknown> }) => {
    // Filter out props that should not be passed to DOM elements
    const { subType, ...filteredProps } = hijackedProps || {};
    return <InputNumber {...commonInputProps} {...filteredProps} />;
  },
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    placeholder: 'Please enter a number...',
    precision: 0,
  },
};

// InputTag plugin
export const InputTagPlugin: FilterPlugin = {
  type: 'InputTag',
  name: 'Tag Input',
  description: 'Tag input component',
  version: '1.0.0',
  render: ({ hijackedProps }: { hijackedProps?: Record<string, unknown> }) => {
    // Filter out props that should not be passed to DOM elements
    const { subType, ...filteredProps } = hijackedProps || {};
    return <InputTag {...commonInputProps} {...filteredProps} />;
  },
  validateConfig: (config: Record<string, unknown>) =>
    typeof config === 'object',
  defaultConfig: {
    placeholder: 'Please enter tags...',
    allowClear: true,
  },
};
