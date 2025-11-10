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

import { ModuleType, getModuleConfig } from '@/types/module';
import { Button, Popconfirm, Space } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { CellRender } from '@veaiops/components';
import { EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import { isEmpty } from 'lodash-es';
import { useMemo } from 'react';
// Destructure CellRender components to avoid repeated calls
const { CustomOutlineTag, StampTime, CopyableText } = CellRender;

export interface TableColumnsProps {
  showModuleTypeColumn?: boolean;
  customActions?: (record: SubscribeRelationWithAttributes) => React.ReactNode;
  onEdit: (record: SubscribeRelationWithAttributes) => void;
  onDelete: (recordId: string) => void;
}

/**
 * Get subscription relation table column configuration
 */
export const useTableColumns = ({
  showModuleTypeColumn,
  customActions,
  onEdit,
  onDelete,
}: TableColumnsProps): ColumnProps[] => {
  return useMemo(() => {
    const baseColumns: ColumnProps[] = [
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
        width: 200,
      },
    ];

    if (showModuleTypeColumn) {
      baseColumns.push({
        title: '模块类型',
        key: 'module_type',
        width: 120,
        render: (_: any, record: SubscribeRelationWithAttributes) => {
          const moduleAttr = record.attributes?.find(
            (attr) => attr.key === 'module_type',
          );
          const moduleValue = moduleAttr?.value || ModuleType.EVENT_CENTER;
          const config = getModuleConfig(moduleValue as ModuleType);
          return <CustomOutlineTag>{config?.displayName}</CustomOutlineTag>;
        },
      });
    }

    baseColumns.push(
      {
        title: '事件级别',
        dataIndex: 'event_level',
        key: 'event_level',
        width: 120,
        render: (value: string) => {
          if (isEmpty(value)) {
            return EMPTY_CONTENT_TEXT;
          }
          // CustomOutlineTag doesn't support color prop, display value directly
          return <CustomOutlineTag>{value}</CustomOutlineTag>;
        },
      },
      {
        title: 'Webhook状态',
        dataIndex: 'webhook_status',
        key: 'webhook_status',
        width: 120,
        render: (value: number) => (
          <CustomOutlineTag>{value === 1 ? '启用' : '禁用'}</CustomOutlineTag>
        ),
      },
      {
        title: '开始时间',
        dataIndex: 'start_time',
        key: 'start_time',
        width: 180,
        render: (value: string) => <StampTime time={value} />,
      },
      {
        title: '结束时间',
        dataIndex: 'end_time',
        key: 'end_time',
        width: 180,
        render: (value: string) => <StampTime time={value} />,
      },
      {
        title: '创建时间',
        dataIndex: 'created_at',
        key: 'created_at',
        width: 180,
        render: (value: string) => <StampTime time={value} />,
      },
      {
        title: '操作',
        key: 'actions',
        width: 150,
        render: (_: any, record: SubscribeRelationWithAttributes) => (
          <Space>
            {customActions ? (
              customActions(record)
            ) : (
              <>
                <Button type="text" size="small" onClick={() => onEdit(record)}>
                  编辑
                </Button>
                <Popconfirm
                  title="确定要删除这个订阅关系吗？"
                  onOk={() => onDelete(record.id)}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="text" size="small" status="danger">
                    删除
                  </Button>
                </Popconfirm>
              </>
            )}
          </Space>
        ),
      },
    );

    return baseColumns;
  }, [showModuleTypeColumn, customActions, onEdit, onDelete]);
};
