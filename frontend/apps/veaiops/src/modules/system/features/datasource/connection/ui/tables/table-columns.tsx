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
 */

import {
  Button,
  Popconfirm,
  Space,
  Tooltip,
  Typography,
} from '@arco-design/web-react';

import {
  IconDelete,
  IconEdit,
  IconExperiment,
} from '@arco-design/web-react/icon';
import {
  CellRender,
  CustomOutlineTag,
  type ModernTableColumnProps,
} from '@veaiops/components';
import type { Connect } from 'api-generate';
import {
  ACTION_TEXTS,
  COLUMN_WIDTHS,
  CONFIRM_TEXTS,
  type TableColumnsProps,
  formatConnectionTime,
} from '../../../connection/lib';
import { MaskedRenderer } from '../components/masked-renderer';

const { Text } = Typography;

/**
 * Get table column configuration
 */
export const getTableColumns = ({
  type,
  onEdit,
  onDelete,
  onTest,
}: TableColumnsProps): ModernTableColumnProps<Connect>[] => {
  const baseColumns: ModernTableColumnProps<Connect>[] = [
    {
      title: '连接名称',
      dataIndex: 'name',
      key: 'name',
      width: COLUMN_WIDTHS.NAME,
      render: (name: string, record: Connect) => (
        <div className="flex items-center gap-1">
          <CellRender.Ellipsis
            text={name}
            style={{ maxWidth: COLUMN_WIDTHS.NAME }}
          />
          {!record.is_active && (
            <CustomOutlineTag style={{ marginLeft: 8 }}>
              已禁用
            </CustomOutlineTag>
          )}
        </div>
      ),
    },
  ];

  // Add data source type column
  const dataSourceTypeColumn: ModernTableColumnProps<Connect> = {
    title: '数据源类型',
    dataIndex: 'type',
    key: 'type',
    width: COLUMN_WIDTHS.STATUS,
    align: 'center',
    render: (type: string) => <CustomOutlineTag>{type}</CustomOutlineTag>,
  };

  // Dynamically generate config columns based on data source type
  const getConfigColumns = (): ModernTableColumnProps<Connect> => {
    switch (type) {
      case 'Zabbix':
        return {
          title: '配置信息',
          align: 'center',
          children: [
            {
              title: 'API地址',
              dataIndex: 'zabbix_api_url',
              key: 'zabbix_api_url',
              width: 200,
              render: (url: string) => {
                if (!url) {
                  return <Text type="secondary">-</Text>;
                }
                return (
                  <CellRender.Ellipsis
                    text={url}
                    style={{ maxWidth: 180 }}
                    className="font-mono text-xs"
                  />
                );
              },
            },
            {
              title: '用户名',
              dataIndex: 'zabbix_api_user',
              key: 'zabbix_api_user',
              width: 120,
              align: 'center',
              render: (user: string) => {
                if (!user) {
                  return <Text type="secondary">-</Text>;
                }
                return (
                  <CellRender.Ellipsis
                    text={user}
                    style={{ maxWidth: 100 }}
                    className="font-mono text-xs"
                    center
                  />
                );
              },
            },
          ],
        };

      case 'Aliyun':
        return {
          title: '配置信息',
          align: 'center',
          children: [
            {
              title: 'Access Key ID',
              dataIndex: 'aliyun_access_key_id',
              key: 'aliyun_access_key_id',
              width: 280,
              render: (keyId: string) => {
                if (!keyId) {
                  return <Text type="secondary">-</Text>;
                }
                return (
                  <MaskedRenderer
                    value={keyId}
                    label="Access Key ID"
                    maskLength={8}
                    className="w-full"
                  />
                );
              },
            },
          ],
        };

      case 'Volcengine':
        return {
          title: '配置信息',
          align: 'center',
          children: [
            {
              title: 'Access Key ID',
              dataIndex: 'volcengine_access_key_id',
              key: 'volcengine_access_key_id',
              width: 280,
              render: (keyId: string) => {
                if (!keyId) {
                  return <Text type="secondary">-</Text>;
                }
                return (
                  <MaskedRenderer
                    value={keyId}
                    label="Access Key ID"
                    maskLength={8}
                    className="w-full"
                  />
                );
              },
            },
          ],
        };

      default:
        return {
          title: '配置信息',
          children: [],
        };
    }
  };

  const configColumns = getConfigColumns();

  const timeColumns: ModernTableColumnProps<Connect>[] = [
    {
      title: '创建用户',
      dataIndex: 'created_user',
      key: 'created_user',
      width: 120,
      align: 'center',
      render: (createdUser: string) => (
        <CellRender.Ellipsis text={createdUser || '-'} center />
      ),
    },
    {
      title: '更新用户',
      dataIndex: 'updated_user',
      key: 'updated_user',
      width: 120,
      align: 'center',
      render: (updatedUser: string) => (
        <CellRender.Ellipsis text={updatedUser || '-'} center />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'center',
      width: 150,
      render: (createdAt: string) => (
        <Tooltip content={new Date(createdAt).toLocaleString()}>
          <Text type="secondary">{formatConnectionTime(createdAt)}</Text>
        </Tooltip>
      ),
    },
  ];

  const actionColumn: ModernTableColumnProps<Connect> = {
    title: '操作',
    key: 'actions',
    width: COLUMN_WIDTHS.ACTIONS,
    fixed: 'right',
    render: (_: unknown, record: Connect) => (
      <Space size="small">
        <Tooltip content={ACTION_TEXTS.TEST}>
          <Button
            type="text"
            size="small"
            data-testid="test-connection-btn"
            icon={<IconExperiment />}
            onClick={() => onTest?.(record)}
          />
        </Tooltip>
        <Tooltip content={ACTION_TEXTS.EDIT}>
          <Button
            type="text"
            size="small"
            data-testid="edit-connection-btn"
            icon={<IconEdit />}
            onClick={() => {
              onEdit?.(record);
            }}
          />
        </Tooltip>
        <Popconfirm
          title={CONFIRM_TEXTS.DELETE_TITLE}
          content={CONFIRM_TEXTS.DELETE_CONTENT}
          onOk={() => onDelete?.(record)}
        >
          <Tooltip content={ACTION_TEXTS.DELETE}>
            <Button
              type="text"
              size="small"
              data-testid="delete-connection-btn"
              status="danger"
              icon={<IconDelete />}
            />
          </Tooltip>
        </Popconfirm>
      </Space>
    ),
  };

  return [
    ...baseColumns,
    dataSourceTypeColumn,
    configColumns,
    ...timeColumns,
    actionColumn,
  ];
};
