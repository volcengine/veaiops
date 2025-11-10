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
  Badge,
  Button,
  Popconfirm,
  Space,
  Table,
  Typography,
} from '@arco-design/web-react';
import { IconDelete, IconEdit, IconRefresh } from '@arco-design/web-react/icon';
import {
  type DataSource,
  sourceTypeOptions,
  statusLabels,
} from '@datasource/lib';
import { CellRender } from '@veaiops/components';
import type React from 'react';

const { Text } = Typography;
const { CustomOutlineTag } = CellRender;

interface DataSourceTableProps {
  dataSources: DataSource[];
  loading: boolean;
  onEdit: (source: DataSource) => void;
  onDelete: (sourceId: string) => void;
  onTestConnection: (sourceId: string) => void;
  onRefresh: () => void;
}

// ✅ Fix: Badge's status type is 'default' | 'processing' | 'success' | 'warning' | 'error'
// While color type is string, which can accept any string value
// Use color property instead of status property for more flexibility and type safety
const renderStatus = (status: string) => {
  const statusConfig = statusLabels[status as keyof typeof statusLabels] || {
    text: status,
    color: 'gray',
  };
  // ✅ Fix: Use color property instead of status, color accepts string type
  // Map color to Badge's status (if matched) or use color directly
  let badgeStatus: 'success' | 'warning' | 'error' | 'default' | undefined;
  if (statusConfig.color === 'green') {
    badgeStatus = 'success';
  } else if (statusConfig.color === 'orange') {
    badgeStatus = 'warning';
  } else if (statusConfig.color === 'red') {
    badgeStatus = 'error';
  } else if (statusConfig.color === 'gray') {
    badgeStatus = 'default';
  } else {
    badgeStatus = undefined;
  }

  return badgeStatus ? (
    <Badge status={badgeStatus} text={statusConfig.text} />
  ) : (
    <Badge color={statusConfig.color} text={statusConfig.text} />
  );
};

/**
 * Data source table component
 */
export const DataSourceTable: React.FC<DataSourceTableProps> = ({
  dataSources,
  loading,
  onEdit,
  onDelete,
  onTestConnection,
  onRefresh: _onRefresh,
}) => {
  const columns = [
    {
      title: '数据源名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string) => <Text copyable>{name}</Text>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const option = sourceTypeOptions.find((opt) => opt.value === type);
        return <CustomOutlineTag>{option?.label || type}</CustomOutlineTag>;
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      ellipsis: true,
    },
    {
      title: '端点',
      dataIndex: 'endpoint',
      key: 'endpoint',
      width: 250,
      ellipsis: true,
      render: (endpoint: string) => <Text copyable>{endpoint}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => renderStatus(status),
    },
    {
      title: '指标数量',
      dataIndex: 'metrics_count',
      key: 'metrics_count',
      width: 100,
      render: (count: number) => count.toLocaleString(),
    },
    {
      title: '最后同步',
      dataIndex: 'last_sync_time',
      key: 'last_sync_time',
      width: 160,
      render: (time?: string) => (time ? new Date(time).toLocaleString() : '-'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: unknown, record: DataSource) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<IconRefresh />}
            onClick={() => onTestConnection(record.id)}
          >
            测试
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个数据源吗？"
            onOk={() => onDelete(record.id)}
          >
            <Button
              type="text"
              size="small"
              status="danger"
              icon={<IconDelete />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={dataSources}
      loading={loading}
      pagination={{
        pageSize: 10,
        showTotal: true,
        showJumper: true,
        sizeCanChange: true,
      }}
      scroll={{ x: 1200 }}
      rowKey="id"
    />
  );
};
