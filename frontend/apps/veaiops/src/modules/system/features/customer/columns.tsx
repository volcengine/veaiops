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

import { Button, Popconfirm } from '@arco-design/web-react';
import { IconDelete } from '@arco-design/web-react/icon';
import type { Customer } from 'api-generate';
import React from 'react';

interface TableColumnsProps {
  onDelete: (customerId: string) => void;
}

/**
 * Get table column definitions
 */
export const getTableColumns = ({ onDelete }: TableColumnsProps) => [
  {
    title: 'Customer ID',
    dataIndex: 'customer_id',
    key: 'customer_id',
    width: 200,
  },
  {
    title: '客户名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
  },
  {
    title: '脱敏名称',
    dataIndex: 'desensitized_name',
    key: 'desensitized_name',
    width: 200,
    render: (name: string) => name || '-',
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    render: (_: unknown, record: Customer) => (
      <Popconfirm
        title="确定要删除这个客户吗？"
        onOk={() => onDelete(record.customer_id)}
        okText="确定"
        cancelText="取消"
      >
        <Button type="text" size="small" status="danger" icon={<IconDelete />}>
          删除
        </Button>
      </Popconfirm>
    ),
  },
];
