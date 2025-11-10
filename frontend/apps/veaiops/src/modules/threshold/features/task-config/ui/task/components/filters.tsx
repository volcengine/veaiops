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
 * Task configuration table filter configuration
 *
 * Abstract the filter configuration logic separately to improve code maintainability
 */

import type { FieldItem, HandleFilterProps } from '@veaiops/components';
import { useCallback } from 'react';

/**
 * Task configuration table filter configuration Hook
 * Responsible for defining all filter conditions and forms
 */
export const useTaskTableFilters = () => {
  return useCallback(
    (props: HandleFilterProps<Record<string, unknown>>): FieldItem[] => [
      {
        field: 'name',
        label: '任务名称',
        type: 'Input',
        componentProps: {
          placeholder: '请输入任务名称',
          value: props.query?.name as string | undefined,
          allowClear: true,
          onChange: (value: string) => {
            props.handleChange({ key: 'name', value });
          },
        },
      },
      {
        field: 'status',
        label: '状态',
        type: 'Select',
        componentProps: {
          placeholder: '请选择状态',
          value: props.query?.status as string | undefined,
          allowClear: true,
          options: [
            { label: '运行中', value: 'running' },
            { label: '已停止', value: 'stopped' },
            { label: '待运行', value: 'pending' },
          ],
          onChange: (value: string) => {
            props.handleChange({ key: 'status', value });
          },
        },
      },
    ],
    [],
  );
};
