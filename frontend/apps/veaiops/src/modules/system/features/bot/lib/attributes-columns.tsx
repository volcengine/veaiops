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

import type { TableColumnProps } from '@arco-design/web-react';
import { CellRender } from '@veaiops/components';
import { IconDelete } from '@arco-design/web-react/icon';
import { ButtonGroupRender, type ButtonConfiguration } from '@veaiops/components';
import type { BotAttribute } from 'api-generate';
import { ATTRIBUTE_NAME_MAP } from '../types/attributes';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

export interface BotAttributesColumnsProps {
  onDelete: (attribute: BotAttribute) => void | Promise<void>;
}

/**
 * Get Bot attributes table column definitions
 */
export const getBotAttributesColumns = ({
  onDelete,
}: BotAttributesColumnsProps): TableColumnProps<BotAttribute>[] => [
  {
    title: '类目',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    fixed: 'left' as const,
    render: (name: string) => {
      // Use mapping table to translate English category names to Chinese
      const displayName = ATTRIBUTE_NAME_MAP[name as keyof typeof ATTRIBUTE_NAME_MAP] || name;
      return (
        <CustomOutlineTag>
          {displayName}
        </CustomOutlineTag>
      );
    },
  },
  {
    title: '内容',
    dataIndex: 'value',
    key: 'value',
    width: 200,
    ellipsis: true,
    render: (value: string) => value || '-',
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 180,
    render: (createdAt: string) => {
      if (!createdAt) {
        return '-';
      }
      return new Date(createdAt).toLocaleString('zh-CN');
    },
  },
  {
    title: '更新时间',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 180,
    render: (updatedAt: string) => {
      if (!updatedAt) {
        return '-';
      }
      return new Date(updatedAt).toLocaleString('zh-CN');
    },
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right' as const,
    render: (_: unknown, record: BotAttribute) => {
      const buttonConfigurations: ButtonConfiguration[] = [
        {
          text: '删除',
          visible: true,
          disabled: false,
          supportPopConfirm: true,
          popConfirmTitle: '确认删除',
          popConfirmContent: '确定要删除这个属性吗？删除后无法恢复。',
          onClick: async () => await onDelete(record),
          buttonProps: {
            type: 'text',
            size: 'small',
            status: 'danger',
            icon: <IconDelete />,
          },
          popconfirmProps: {
            okText: '确定',
            cancelText: '取消',
          },
          tooltip: '删除属性',
        },
      ];

      return (
        <ButtonGroupRender
          buttonConfigurations={buttonConfigurations}
          className="flex-nowrap"
          style={{ gap: '8px' }}
        />
      );
    },
  },
];
