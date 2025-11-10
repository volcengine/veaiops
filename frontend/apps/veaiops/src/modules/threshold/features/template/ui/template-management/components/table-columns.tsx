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

import { Typography } from '@arco-design/web-react';
import { CustomOutlineTag } from '@veaiops/components';
import type { MetricTemplate, MetricType } from 'api-generate';
import type React from 'react';
import type { ColumnConfig } from '../types';

const { Text } = Typography;

/**
 * Create template table column configuration
 */
export const createTemplateColumns = (): ColumnConfig<MetricTemplate>[] => [
  {
    title: '模板名称',
    dataIndex: 'name',
    width: 200,
    render: (name: unknown, record: MetricTemplate) => (
      <div>
        <Text bold>{typeof name === 'string' ? name : record.name || '-'}</Text>
        <br />
        <Text style={{ fontSize: 12, color: '#86909c' }}>
          {record.metric_type}
        </Text>
      </div>
    ),
  },
  {
    title: '指标类型',
    dataIndex: 'metric_type',
    width: 180,
    render: (type: unknown, record: MetricTemplate) => (
      <CustomOutlineTag>
        {(type as MetricType) || record.metric_type}
      </CustomOutlineTag>
    ),
  },
  {
    title: '指标范围',
    width: 150,
    render: (_: unknown, record: MetricTemplate) => (
      <div>
        <CustomOutlineTag>最小值: {record.min_value}</CustomOutlineTag>
        <br />
        <CustomOutlineTag>最大值: {record.max_value}</CustomOutlineTag>
      </div>
    ),
  },
  {
    title: '正常范围',
    width: 150,
    render: (_: unknown, record: MetricTemplate) => (
      <span>
        {record.normal_range_start} - {record.normal_range_end}
      </span>
    ),
  },
  {
    title: '展示单位',
    dataIndex: 'display_unit',
    width: 100,
    render: (unit: unknown) => (
      <span>{typeof unit === 'string' ? unit : '-'}</span>
    ),
  },
  {
    title: '状态',
    dataIndex: 'is_active',
    width: 100,
    render: (isActive: unknown) => {
      let statusText = '-';
      if (typeof isActive === 'boolean') {
        statusText = isActive ? '启用' : '禁用';
      }
      return <CustomOutlineTag>{statusText}</CustomOutlineTag>;
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    width: 160,
    render: (time: unknown) => (
      <span>
        {typeof time === 'string' && time
          ? new Date(time).toLocaleString()
          : '-'}
      </span>
    ),
  },
];
