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
 * Data source connection table column configuration
 *
 * Abstract column configuration logic separately to improve code maintainability
 * Business side can customize column configuration by modifying this file
 */

import { Button, Popconfirm, Space, Tag } from '@arco-design/web-react';
import {
  IconDelete,
  IconEdit,
  IconPlayArrow,
  IconPlus,
} from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
import type { Connect } from 'api-generate';
import { useCallback } from 'react';

// Destructure CellRender component to avoid repeated calls
const { InfoWithCode, StampTime, CustomOutlineTag } = CellRender;

/**
 * Data source connection table column configuration parameters
 */
export interface ConnectionTableColumnsConfig {
  /** Data source type */
  type?: string;
  /** Edit handler */
  onEdit?: (connection: Connect) => void;
  /** Delete handler */
  onDelete?: (id: string) => void;
  /** Test connection handler */
  onTest?: (connection: Connect) => void;
  /** Create monitor handler */
  onCreateMonitor?: (connection: Connect) => void;
}

/**
 * Data source connection table column configuration Hook
 *
 * @param config Column configuration parameters
 * @returns Column configuration function
 */
export const useConnectionTableColumns = ({
  type,
  onEdit,
  onDelete,
  onTest,
  onCreateMonitor,
}: ConnectionTableColumnsConfig) => {
  return useCallback(
    (_props: Record<string, unknown>) => [
      {
        title: '连接名称',
        dataIndex: 'name',
        key: 'name',
        width: 200,
        ellipsis: true,
        render: (name: string, record: Connect) => (
          <InfoWithCode
            name={name}
            code={record._id || record._id}
            isCodeShow={true}
          />
        ),
      },
      {
        title: '连接类型',
        dataIndex: 'type',
        key: 'type',
        width: 120,
        render: (connectionType: string) => (
          <Tag color="blue">{connectionType || type || '未知'}</Tag>
        ),
      },
      {
        title: '状态',
        dataIndex: 'status',
        key: 'status',
        width: 100,
        render: (status: string) => {
          const statusMap: Record<string, { text: string; color: string }> = {
            active: { text: '正常', color: 'green' },
            inactive: { text: '未激活', color: 'orange' },
            error: { text: '错误', color: 'red' },
          };
          const statusInfo = statusMap[status] || {
            text: status || '未知',
            color: 'gray',
          };
          return (
            <CustomOutlineTag
              {...({ colorTheme: statusInfo.color } as Record<string, unknown>)}
            >
              {statusInfo.text}
            </CustomOutlineTag>
          );
        },
      },
      {
        title: '主机',
        dataIndex: 'host',
        key: 'host',
        width: 150,
        ellipsis: true,
        render: (host: string) => host || '-',
      },
      {
        title: '端口',
        dataIndex: 'port',
        key: 'port',
        width: 80,
        render: (port: number) => port || '-',
      },
      {
        title: '数据库',
        dataIndex: 'database',
        key: 'database',
        width: 120,
        ellipsis: true,
        render: (database: string) => database || '-',
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 150,
        render: (createdAt: string) => (
          <StampTime time={createdAt} template="YYYY-MM-DD HH:mm:ss" />
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 200,
        fixed: 'right',
        render: (_: any, record: Connect) => (
          <Space size="small">
            {onTest && (
              <Button
                type="text"
                size="small"
                icon={<IconPlayArrow />}
                onClick={() => onTest(record)}
              >
                测试
              </Button>
            )}
            {onCreateMonitor && (
              <Button
                type="text"
                size="small"
                icon={<IconPlus />}
                onClick={() => onCreateMonitor(record)}
              >
                创建监控
              </Button>
            )}
            {onEdit && (
              <Button
                type="text"
                size="small"
                icon={<IconEdit />}
                onClick={() => onEdit(record)}
              >
                编辑
              </Button>
            )}
            {onDelete && (
              <Popconfirm
                title="确定删除？"
                content={`确定要删除连接"${record.name}"吗？`}
                onOk={() => onDelete(record._id ?? '')}
                okText="确定"
                cancelText="取消"
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
            )}
          </Space>
        ),
      },
    ],
    [type, onEdit, onDelete, onTest, onCreateMonitor],
  );
};
