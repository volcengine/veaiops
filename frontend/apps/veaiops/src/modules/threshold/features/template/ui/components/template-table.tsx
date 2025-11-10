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

import { Button, Space, Table, Typography } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import {
  IconCopy,
  IconDelete,
  IconEdit,
  IconEye,
} from '@arco-design/web-react/icon';

import { CustomOutlineTag } from '@veaiops/components';
import type { ThresholdTemplate } from '../../types/template';

const { Text } = Typography;

export interface TemplateTableProps {
  templates: ThresholdTemplate[];
  loading: boolean;
  onView: (template: ThresholdTemplate) => void;
  onEdit: (template: ThresholdTemplate) => void;
  onClone: (template: ThresholdTemplate) => void;
  onDelete: (templateId: string) => void;
}

export const TemplateTable: React.FC<TemplateTableProps> = ({
  templates,
  loading,
  onView,
  onEdit,
  onClone,
  onDelete,
}) => {
  // Template table column definitions
  const templateColumns: ColumnProps[] = [
    {
      title: '模板名称',
      dataIndex: 'template_name',
      width: 200,
      render: (name, record: ThresholdTemplate) => (
        <div>
          <Text bold>{name}</Text>
          <br />
          <Text style={{ fontSize: 12, color: '#86909c' }}>
            {String(record.metric_type)}
          </Text>
        </div>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      width: 250,
      ellipsis: true,
    },
    {
      title: '数值范围',
      width: 150,
      render: (_, record: ThresholdTemplate) => (
        <div>
          <CustomOutlineTag>最小: {record.min_value}</CustomOutlineTag>
          <br />
          <CustomOutlineTag>最大: {record.max_value}</CustomOutlineTag>
        </div>
      ),
    },
    {
      title: '步长',
      width: 100,
      render: (_, record: ThresholdTemplate) => `${record.min_step}`,
    },
    {
      title: '显示单位',
      width: 100,
      render: (_, record: ThresholdTemplate) => (
        <CustomOutlineTag>{record.display_unit}</CustomOutlineTag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status) => {
        const textMap: Record<string, string> = {
          active: '活跃',
          inactive: '停用',
          draft: '草稿',
        };
        return <CustomOutlineTag>{textMap[status] || status}</CustomOutlineTag>;
      },
    },
    {
      title: '使用次数',
      dataIndex: 'usage_count',
      width: 100,
      render: (count) => <Text bold>{count}</Text>,
      sorter: (a, b) => a.usage_count - b.usage_count,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      width: 160,
      render: (time) => (time ? new Date(time).toLocaleString() : '-'),
    },
    {
      title: '操作',
      width: 200,
      render: (_, record: ThresholdTemplate) => (
        <Space>
          <Button
            type="text"
            size="small"
            icon={<IconEye />}
            onClick={() => onView(record)}
          >
            查看
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconEdit />}
            onClick={() => onEdit(record)}
          >
            编辑
          </Button>
          <Button
            type="text"
            size="small"
            icon={<IconCopy />}
            onClick={() => onClone(record)}
          >
            克隆
          </Button>
          <Button
            type="text"
            size="small"
            status="danger"
            icon={<IconDelete />}
            onClick={() => onDelete(record.template_id)}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      columns={templateColumns}
      data={templates}
      loading={loading}
      pagination={{
        pageSize: 10,
        showTotal: true,
        showJumper: true,
        sizeCanChange: true,
      }}
      scroll={{ x: 1400 }}
    />
  );
};
