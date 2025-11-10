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
 * Schema table basic usage example
 * @description Demonstrates how to quickly build tables through configuration + Schema approach

 * @date 2025-12-19
 */

import type { SchemaTableInstance, TableSchema } from '@/custom-table/types';
import { Message } from '@arco-design/web-react';
import { IconDelete, IconEdit, IconEye } from '@arco-design/web-react/icon';
import type { BaseRecord } from '@veaiops/types';
import type React from 'react';
import { useRef } from 'react';
import { TableSchemaBuilder } from '../utils';

import { SchemaTable } from '../schema-table';

// Example data type
interface UserRecord extends BaseRecord {
  id: string;
  name: string;
  email: string;
  age: number;
  status: 'active' | 'inactive' | 'pending';
  role: string;
  salary: number;
  joinDate: string;
  avatar: string;
  tags: string[];
}

// Mock data
const mockUsers: UserRecord[] = [
  {
    id: '1',
    name: '张三', // Keep Chinese for mock data
    email: 'zhangsan@example.com',
    age: 28,
    status: 'active',
    role: 'developer',
    salary: 15000,
    joinDate: '2023-01-15',
    avatar: 'https://via.placeholder.com/40',
    tags: ['前端', 'React'], // Keep Chinese for mock data
  },
  {
    id: '2',
    name: '李四', // Keep Chinese for mock data
    email: 'lisi@example.com',
    age: 32,
    status: 'active',
    role: 'designer',
    salary: 12000,
    joinDate: '2022-08-20',
    avatar: 'https://via.placeholder.com/40',
    tags: ['UI', '设计'], // Keep Chinese for mock data
  },
  {
    id: '3',
    name: '王五', // Keep Chinese for mock data
    email: 'wangwu@example.com',
    age: 25,
    status: 'pending',
    role: 'developer',
    salary: 10000,
    joinDate: '2024-03-10',
    avatar: 'https://via.placeholder.com/40',
    tags: ['后端', 'Node.js'], // Keep Chinese for mock data
  },
];

// Method 1: Use Schema Builder to build configuration
const buildSchemaWithBuilder = (): TableSchema<UserRecord> => {
  return (
    new TableSchemaBuilder<UserRecord>()
      .setTitle('User Management')
      .setDescription('System user information management')

      // Add column configuration
      .addColumn({
        key: 'avatar',
        title: 'Avatar',
        dataIndex: 'avatar',
        valueType: 'image',
        width: 80,
        hideInSearch: true,
      })
      .addColumn({
        key: 'name',
        title: 'Name',
        dataIndex: 'name',
        valueType: 'text',
        filterable: true,
        filterConfig: {
          type: 'input',
          placeholder: 'Please enter name',
        },
        copyable: true,
      })
      .addColumn({
        key: 'email',
        title: 'Email',
        dataIndex: 'email',
        valueType: 'text',
        filterable: true,
        filterConfig: {
          type: 'input',
          placeholder: 'Please enter email',
        },
        ellipsis: true,
        tooltip: true,
      })
      .addColumn({
        key: 'age',
        title: 'Age',
        dataIndex: 'age',
        valueType: 'number',
        width: 80,
        sortable: true,
        filterable: true,
        filterConfig: {
          type: 'numberRange',
        },
      })
      .addColumn({
        key: 'status',
        title: 'Status',
        dataIndex: 'status',
        valueType: 'select',
        width: 100,
        filterable: true,
        filterConfig: {
          type: 'select',
          options: [
            { label: 'Active', value: 'active' },
            { label: 'Inactive', value: 'inactive' },
            { label: 'Pending', value: 'pending' },
          ],
        },
        valueEnum: {
          active: { text: 'Active', status: 'success' },
          inactive: { text: 'Inactive', status: 'error' },
          pending: { text: 'Pending', status: 'warning' },
        },
      })
      .addColumn({
        key: 'role',
        title: 'Role',
        dataIndex: 'role',
        valueType: 'select',
        filterable: true,
        filterConfig: {
          type: 'select',
          options: [
            { label: 'Developer', value: 'developer' },
            { label: 'Designer', value: 'designer' },
            { label: 'Product Manager', value: 'pm' },
          ],
        },
      })
      .addColumn({
        key: 'salary',
        title: 'Salary',
        dataIndex: 'salary',
        valueType: 'money',
        width: 120,
        sortable: true,
        hideInSearch: true,
      })
      .addColumn({
        key: 'joinDate',
        title: 'Join Date',
        dataIndex: 'joinDate',
        valueType: 'date',
        width: 120,
        sortable: true,
        filterable: true,
        filterConfig: {
          type: 'dateRange',
        },
      })
      .addColumn({
        key: 'tags',
        title: 'Tags',
        dataIndex: 'tags',
        valueType: 'tag',
        hideInSearch: true,
      })

      // Configure features
      .enablePagination({
        pageSize: 10,
        showSizeChanger: true,
        showQuickJumper: true,
      })
      .enableSearch({
        layout: 'horizontal',
        collapsed: false,
      })
      .enableToolbar({
        title: 'User List',
        actions: [
          {
            key: 'add',
            label: 'Add User',
            type: 'primary',
            onClick: () => Message.info('Click to add user'),
          },
          {
            key: 'export',
            label: 'Export Data',
            onClick: () => Message.info('Click to export data'),
          },
        ],
        settings: {
          density: true,
          columnSetting: true,
          fullScreen: true,
          reload: true,
        },
      })
      .enableRowSelection({
        type: 'checkbox',
        onChange: (_keys: React.Key[], _rows: UserRecord[]) => {
          // Handle row selection change
        },
      })

      // Add actions
      .addAction({
        key: 'view',
        label: 'View',
        icon: <IconEye />,
        onClick: (record: BaseRecord, _index: number) => {
          const userRecord = record as UserRecord;
          const name: string = userRecord.name || '';
          Message.info(`View user: ${name}`);
        },
      })
      .addAction({
        key: 'edit',
        label: 'Edit',
        type: 'primary',
        icon: <IconEdit />,
        onClick: (record: BaseRecord, _index: number) => {
          const userRecord = record as UserRecord;
          const name: string = userRecord.name || '';
          Message.info(`Edit user: ${name}`);
        },
      })
      .addAction({
        key: 'delete',
        label: 'Delete',
        type: 'text',
        status: 'danger',
        icon: <IconDelete />,
        confirm: {
          title: 'Confirm Delete',
          content: 'Cannot be recovered after deletion, confirm to delete?',
        },
        onClick: (record: BaseRecord, _index: number) => {
          const userRecord = record as UserRecord;
          const name: string = userRecord.name || '';
          Message.success(`Delete user: ${name}`);
        },
      })

      // Set data source
      .setDataSource(mockUsers)

      .build()
  );
};

// Method 2: Directly use Schema configuration
const directSchema: TableSchema<UserRecord> = {
  title: 'User Management - Direct Configuration',
  description: 'Create table by directly configuring Schema',
  preset: 'advanced', // Use advanced preset

  columns: [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      valueType: 'text',
      filterable: true,
      filterConfig: {
        type: 'input',
        placeholder: 'Please enter name',
      },
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      valueType: 'text',
      ellipsis: true,
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      filterable: true,
      filterConfig: {
        type: 'select',
        options: [
          { label: 'Active', value: 'active' },
          { label: 'Inactive', value: 'inactive' },
          { label: 'Pending', value: 'pending' },
        ],
      },
      valueEnum: {
        active: { text: 'Active', status: 'success' },
        inactive: { text: 'Inactive', status: 'error' },
        pending: { text: 'Pending', status: 'warning' },
      },
    },
    {
      key: 'salary',
      title: 'Salary',
      dataIndex: 'salary',
      valueType: 'money',
      sortable: true,
    },
  ],

  dataSource: mockUsers,

  actions: {
    items: [
      {
        key: 'edit',
        label: 'Edit',
        type: 'primary',
        onClick: (record: BaseRecord, index: number) => {
          const userRecord = record as UserRecord;
          Message.info(`Edit: ${userRecord.name}`);
        },
      },
    ],
  },
};

// Method 3: Use request function in Schema
const requestSchema: TableSchema<UserRecord> = {
  title: 'User Management - Async Data',
  preset: 'basic',

  columns: [
    {
      key: 'name',
      title: 'Name',
      dataIndex: 'name',
      valueType: 'text',
    },
    {
      key: 'email',
      title: 'Email',
      dataIndex: 'email',
      valueType: 'text',
    },
    {
      key: 'status',
      title: 'Status',
      dataIndex: 'status',
      valueType: 'select',
      valueEnum: {
        active: { text: 'Active', status: 'success' },
        inactive: { text: 'Inactive', status: 'error' },
        pending: { text: 'Pending', status: 'warning' },
      },
    },
  ],

  // Simulate async request
  request: async <TParams = unknown>(params: TParams) => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Simulate paginated data
    const paramsObj = params as Record<string, unknown>;
    const current = (paramsObj.current as number) || 1;
    const pageSize = (paramsObj.pageSize as number) || 10;
    const start = (current - 1) * pageSize;
    const end = start + pageSize;

    return {
      data: mockUsers.slice(start, end),
      total: mockUsers.length,
      success: true,
    };
  },
};

/**
 * Basic example component
 */
export const BasicExample: React.FC = () => {
  const tableRef = useRef<SchemaTableInstance>(null);

  const handleTableReady = (instance: SchemaTableInstance) => {
    // Handle table ready
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Schema Table Usage Examples</h2>

      <div style={{ marginBottom: 32 }}>
        <h3>Method 1: Use Schema Builder</h3>
        <SchemaTable
          ref={tableRef}
          schema={
            buildSchemaWithBuilder() as unknown as TableSchema<BaseRecord>
          }
          onReady={handleTableReady}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3>Method 2: Direct Schema Configuration</h3>
        <SchemaTable
          schema={directSchema as unknown as TableSchema<BaseRecord>}
        />
      </div>

      <div style={{ marginBottom: 32 }}>
        <h3>Method 3: Async Data Request</h3>
        <SchemaTable
          schema={requestSchema as unknown as TableSchema<BaseRecord>}
        />
      </div>
    </div>
  );
};

export default BasicExample;
