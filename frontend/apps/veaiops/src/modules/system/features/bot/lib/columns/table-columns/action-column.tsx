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

import type { ColumnProps } from '@arco-design/web-react/es/Table';
import {
  IconDelete,
  IconEdit,
  IconEye,
} from '@arco-design/web-react/icon';
import {
  ButtonGroupRender,
  type ButtonConfiguration,
} from '@veaiops/components';
import type { Bot } from '@bot/types';

/**
 * Action column definition (edit, delete, special attention)
 */
export const getActionColumn = ({
  onEdit,
  onDelete,
  onViewAttributes,
}: {
  onEdit: (bot: Bot) => void;
  onDelete: (botId: string) => void | Promise<boolean>;
  onViewAttributes: (bot: Bot) => void;
}): ColumnProps<Bot> => ({
  title: '操作',
  key: 'actions',
  width: 120,
  fixed: 'right' as const,
  render: (_: unknown, record: Bot) => {
    const buttonConfigurations: ButtonConfiguration[] = [
      {
        text: '编辑',
        visible: true,
        disabled: false,
        onClick: () => onEdit(record),
        buttonProps: {
          type: 'text',
          size: 'small',
          icon: <IconEdit />,
          // Note: Using as any because Arco Design Button's BaseButtonProps type definition does not include data-testid
          // But data-testid is an HTML standard attribute and will be correctly passed at runtime
          // TODO: Check Arco Design source code to confirm if type definition needs to be extended
          'data-testid': 'edit-bot-btn',
        } as any,
        tooltip: '编辑Bot配置',
      },
      {
        text: '删除',
        visible: true,
        disabled: false,
        supportPopConfirm: true,
        popConfirmTitle: '确认删除',
        popConfirmContent: '确定要删除这个Bot吗？删除后无法恢复。',
        onClick: async () => {
          // Supports async operations, if onDelete returns Promise, ButtonGroupRender internally handles loading state
          if (record._id) {
            const result = onDelete(record._id);
            // If returns Promise, wait for completion
            if (result instanceof Promise) {
              await result;
            }
          }
        },
        buttonProps: {
          type: 'text',
          size: 'small',
          status: 'danger',
          icon: <IconDelete />,
          // Note: Using as any because Arco Design Button's BaseButtonProps type definition does not include data-testid
          // But data-testid is an HTML standard attribute and will be correctly passed at runtime
          // TODO: Check Arco Design source code to confirm if type definition needs to be extended
          'data-testid': 'delete-bot-btn',
        } as any,
        popconfirmProps: {
          okText: '确定',
          cancelText: '取消',
        },
        tooltip: '删除Bot',
      },
      {
        text: '特别关注',
        visible: true,
        disabled: false,
        onClick: () => {
          // Call onViewAttributes callback function
          onViewAttributes(record);
        },
        buttonProps: {
          type: 'text',
          size: 'small',
          icon: <IconEye />,
          // Note: Using as any because Arco Design Button's BaseButtonProps type definition does not include data-testid
          // But data-testid is an HTML standard attribute and will be correctly passed at runtime
          // TODO: Check Arco Design source code to confirm if type definition needs to be extended
          'data-testid': 'view-bot-attributes-btn',
        } as any,
        tooltip: '查看Bot详细属性',
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
});
