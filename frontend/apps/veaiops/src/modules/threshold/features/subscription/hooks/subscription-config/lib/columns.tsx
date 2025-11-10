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

import { Button, Popconfirm, Space } from '@arco-design/web-react';
import { CellRender, type ModernTableColumnProps } from '@veaiops/components';
import { getModuleConfig, ModuleType } from '@/types/module';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import { isEmpty } from 'lodash-es';
import type React from 'react';

const { CustomOutlineTag, StampTime, CopyableText } = CellRender;

/**
 * Get subscribe relation table column configuration
 */
export const getSubscribeRelationColumns = ({
  showModuleTypeColumn,
  onEdit,
  onDelete,
  customActions,
}: {
  showModuleTypeColumn: boolean;
  onEdit?: (record: SubscribeRelationWithAttributes) => void;
  onDelete?: (id: string) => Promise<boolean>;
  customActions?: (record: SubscribeRelationWithAttributes) => React.ReactNode;
}): ModernTableColumnProps<SubscribeRelationWithAttributes>[] => {
  const baseColumns: ModernTableColumnProps<SubscribeRelationWithAttributes>[] =
    [
      {
        title: 'ID',
        dataIndex: '_id',
        key: '_id',
        width: 200,
        render: (value: string) => <CopyableText text={value || ''} />,
      },
      {
        title: '订阅关系名称',
        dataIndex: 'name',
        key: 'name',
        width: 150,
      },
    ];

  if (showModuleTypeColumn) {
    baseColumns.push({
      title: '模块类型',
      key: 'module_type',
      width: 120,
      render: (_: unknown, record: SubscribeRelationWithAttributes) => {
        const moduleAttr = record.attributes?.find(
          (attr) => attr.key === 'module_type',
        );
        const moduleValue = moduleAttr?.value || ModuleType.EVENT_CENTER;
        const config = getModuleConfig(moduleValue as ModuleType);
        return <CustomOutlineTag>{config?.displayName}</CustomOutlineTag>;
      },
    });
  }

  const additionalColumns: ModernTableColumnProps<SubscribeRelationWithAttributes>[] =
    [
      {
        title: '事件级别',
        dataIndex: 'event_level',
        key: 'event_level',
        width: 120,
        render: (value: string) => {
          if (isEmpty(value)) {
            return '暂无';
          }
          return <CustomOutlineTag>{value}</CustomOutlineTag>;
        },
      },
      {
        title: 'Webhook状态',
        dataIndex: 'webhook_status',
        key: 'webhook_status',
        width: 120,
        render: (value: number) => (
          <CustomOutlineTag>
            {value === 1 ? '启用' : '禁用'}
          </CustomOutlineTag>
        ),
      },
      {
        title: '开始时间',
        dataIndex: 'start_time',
        key: 'start_time',
        width: 180,
        render: (value: string) => (
          <StampTime time={value ? new Date(value).getTime() : undefined} />
        ),
      },
      {
        title: '结束时间',
        dataIndex: 'end_time',
        key: 'end_time',
        width: 180,
        render: (value: string) => (
          <StampTime time={value ? new Date(value).getTime() : undefined} />
        ),
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 180,
        render: (value: string) => (
          <StampTime time={value ? new Date(value).getTime() : undefined} />
        ),
      },
      {
        title: '操作',
        key: 'actions',
        width: 150,
        render: (_: unknown, record: SubscribeRelationWithAttributes) => (
          <Space>
            {customActions ? (
              customActions(record)
            ) : (
              <>
                {onEdit && (
                  <Button
                    type="text"
                    size="small"
                    onClick={() => onEdit(record)}
                  >
                    编辑
                  </Button>
                )}
                {onDelete && (
                  <Popconfirm
                    title="确定要删除这个订阅关系吗？"
                    onOk={() => onDelete(record._id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="text" size="small" status="danger">
                      删除
                    </Button>
                  </Popconfirm>
                )}
              </>
            )}
          </Space>
        ),
      },
    ];

  return [...baseColumns, ...additionalColumns];
};
