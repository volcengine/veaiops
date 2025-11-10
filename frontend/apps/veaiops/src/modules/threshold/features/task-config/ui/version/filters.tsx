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

import type { FieldItem, HandleFilterProps } from '@veaiops/components';
import {
  convertLocalTimeRangeToUtc,
  convertUtcTimeRangeToLocal,
  disabledDate,
  ensureArray,
} from '@veaiops/utils';
import {
  IntelligentThresholdTaskStatus,
  type IntelligentThresholdTaskStatus as IntelligentThresholdTaskStatusType,
} from 'api-generate';
import './filters.module.less';

/**
 * Task version filter query parameter type
 * Aligned with getApisV1IntelligentThresholdTaskVersions API parameters
 */
export interface TaskVersionFiltersQuery {
  status?: IntelligentThresholdTaskStatusType;
  createdAtStart?: string;
  createdAtEnd?: string;
  updatedAtStart?: string;
  updatedAtEnd?: string;
}

/**
 * Default filter configuration
 */
export const DEFAULT_TASK_VERSION_FILTERS: TaskVersionFiltersQuery = {
  status: undefined,
  createdAtStart: undefined,
  createdAtEnd: undefined,
  updatedAtStart: undefined,
  updatedAtEnd: undefined,
};

export const taskStatusOptions = [
  { label: '启动中', value: IntelligentThresholdTaskStatus.LAUNCHING },
  { label: '运行中', value: IntelligentThresholdTaskStatus.RUNNING },
  { label: '已停止', value: IntelligentThresholdTaskStatus.STOPPED },
  { label: '成功', value: IntelligentThresholdTaskStatus.SUCCESS },
  { label: '失败', value: IntelligentThresholdTaskStatus.FAILED },
];

/**
 * Task version filter configuration - CustomTable standard format
 * Aligned with getApisV1IntelligentThresholdTaskVersions API parameters
 */
export const getTaskVersionFilters = ({
  query,
  handleChange,
}: {
  query: TaskVersionFiltersQuery;
  handleChange: HandleFilterProps<TaskVersionFiltersQuery>['handleChange'];
}): FieldItem[] => {
  return [
    {
      field: 'status',
      label: '任务状态',
      type: 'Select',
      componentProps: {
        placeholder: '请选择任务状态',
        value: query?.status,
        allowClear: true,
        options: taskStatusOptions,
        onChange: (v: IntelligentThresholdTaskStatusType) => {
          handleChange({ key: 'status', value: v });
        },
      },
    },
    {
      field: 'create_time_range',
      label: '创建时间',
      type: 'RangePicker',
      componentProps: {
        placeholder: ['开始时间', '结束时间'],
        // Display: UTC → Local Time
        value:
          query?.createdAtStart && query?.createdAtEnd
            ? convertUtcTimeRangeToLocal([
                query.createdAtStart,
                query.createdAtEnd,
              ])
            : undefined,
        'data-custom-width': '400px',
        style: {
          width: '400px',
        },
        showTime: true,
        disabledDate,
        // Note: RangePicker returns date strings in user timezone, need to convert to UTC
        onChange: (v: [string, string] | null) => {
          if (v && v.length === 2) {
            // Send: Local Time → UTC
            const utcRange = convertLocalTimeRangeToUtc(v);
            if (utcRange) {
              handleChange({
                updates: {
                  createdAtStart: utcRange[0],
                  createdAtEnd: utcRange[1],
                },
              });
            }
          } else {
            handleChange({
              updates: {
                createdAtStart: undefined,
                createdAtEnd: undefined,
              },
            });
          }
        },
      },
    },
    {
      field: 'update_time_range',
      label: '更新时间',
      type: 'RangePicker',
      componentProps: {
        placeholder: ['开始时间', '结束时间'],
        // Display: UTC → Local Time
        value:
          query?.updatedAtStart && query?.updatedAtEnd
            ? convertUtcTimeRangeToLocal([
                query.updatedAtStart,
                query.updatedAtEnd,
              ])
            : undefined,
        'data-custom-width': '400px',
        style: {
          width: '400px',
        },
        showTime: true,
        disabledDate,
        // Note: RangePicker returns date strings in user timezone, need to convert to UTC
        onChange: (v: [string, string] | null) => {
          if (v && v.length === 2) {
            // Send: Local Time → UTC
            const utcRange = convertLocalTimeRangeToUtc(v);
            if (utcRange) {
              handleChange({
                updates: {
                  updatedAtStart: utcRange[0],
                  updatedAtEnd: utcRange[1],
                },
              });
            }
          } else {
            handleChange({
              updates: {
                updatedAtStart: undefined,
                updatedAtEnd: undefined,
              },
            });
          }
        },
      },
    },
  ];
};
