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

import {
  CellRender,
  type ModernTableColumnProps,
} from '@veaiops/components';
import { EMPTY_CONTENT } from '@veaiops/constants';
import type { DataSource } from 'api-generate';
import type React from 'react';

/**
 * Create common columns (data source name, type, status, time)
 */
export const createCommonColumns = (): ModernTableColumnProps<DataSource>[] => {
  const { CustomOutlineTag, StampTime, InfoWithCode } =
    CellRender;

  return [
    {
      title: '数据源名称/ID',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left' as const,
      render: (name: string, record: DataSource) => (
        <InfoWithCode name={name || ''} code={record._id || ''} />
      ),
    },
    {
      title: '数据源类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      align: 'center' as const,
      render: (type: string) => {
        if (!type) {
          return EMPTY_CONTENT;
        }
        return <CustomOutlineTag>{type}</CustomOutlineTag>;
      },
    },
    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      align: 'center' as const,
      render: (isActive: boolean) => (
        <CustomOutlineTag>{isActive ? '已启动' : '未启动'}</CustomOutlineTag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (createdAt: string) => (
        <StampTime time={createdAt} />
      ),
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (updatedAt: string) => (
        <StampTime time={updatedAt} />
      ),
    },
  ];
};
