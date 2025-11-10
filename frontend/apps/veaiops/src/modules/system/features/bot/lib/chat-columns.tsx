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

import { Modal, Switch } from '@arco-design/web-react';
import { IconRobot } from '@arco-design/web-react/icon';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { CellRender } from '@veaiops/components';
import type { Chat } from 'api-generate';

interface ChatTableColumnsProps {
  onUpdateConfig: (params: {
    chatId: string;
    field: 'enable_func_interest' | 'enable_func_proactive_reply';
    value: boolean;
    currentRecord: Chat;
  }) => Promise<boolean>;
}

/**
 * Get chat management table column definitions
 *
 * Corresponds to origin/feat/web-v2 branch implementation, ensuring functional consistency
 */
export const getChatTableColumns = ({
  onUpdateConfig,
}: ChatTableColumnsProps): ColumnProps<Chat>[] => [
  {
    title: '群信息',
    dataIndex: 'name',
    key: 'name',
    width: 300,
    fixed: 'left' as const,
    render: (name: string, record: Chat) => (
      <div>
        <CellRender.Ellipsis text={name || '-'} />
        {record?.chat_id && (
          <div className="text-xs text-[#86909c] mt-0.5">
            ID: {record.chat_id}
          </div>
        )}
      </div>
    ),
  },
  {
    title: '机器人ID',
    dataIndex: 'bot_id',
    key: 'bot_id',
    width: 200,
    render: (botId: string) => <CellRender.Ellipsis text={botId || '-'} />,
  },
  {
    title: '已入群',
    dataIndex: 'is_active',
    key: 'is_active',
    width: 100,
    render: (isActive: boolean | undefined) => (
      <CellRender.Boolean data={isActive} />
    ),
  },
  {
    title: '内容识别Agent',
    dataIndex: 'enable_func_interest',
    key: 'enable_func_interest',
    width: 150,
    render: (enableFuncInterest: boolean | undefined, record: Chat) => {
      const handleChange = async (checked: boolean) => {
        Modal.confirm({
          title: '确认操作',
          content: (
            <span>
              确定要{checked ? '开启' : '关闭'}
              <IconRobot className="mx-2 inline-block align-middle" />
              <strong className="font-semibold text-gray-600">
                内容识别Agent
              </strong>
              {' '}功能吗？
            </span>
          ),
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {
            await onUpdateConfig({
              chatId: record._id || '',
              field: 'enable_func_interest',
              value: checked,
              currentRecord: record,
            });
          },
        });
      };

      return (
        <Switch
          checked={Boolean(enableFuncInterest)}
          onChange={handleChange}
          checkedText="开启"
          uncheckedText="关闭"
        />
      );
    },
  },
  {
    title: '主动回复Agent',
    dataIndex: 'enable_func_proactive_reply',
    key: 'enable_func_proactive_reply',
    width: 150,
    render: (enableFuncProactiveReply: boolean | undefined, record: Chat) => {
      const handleChange = async (checked: boolean) => {
        Modal.confirm({
          title: '确认操作',
          content: (
            <span>
              确定要{checked ? '开启' : '关闭'}
              <IconRobot className="mx-2 inline-block align-middle" />
              <strong className="font-semibold text-gray-600">
                主动回复Agent
              </strong>
              {' '}功能吗？
            </span>
          ),
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {
            await onUpdateConfig({
              chatId: record._id || '',
              field: 'enable_func_proactive_reply',
              value: checked,
              currentRecord: record,
            });
          },
        });
      };

      return (
        <Switch
          checked={Boolean(enableFuncProactiveReply)}
          onChange={handleChange}
          checkedText="开启"
          uncheckedText="关闭"
        />
      );
    },
  },
];

/**
 * Get chat management table column configuration - CustomTable approach
 * @param props - Props object passed by CustomTable, containing operation callbacks
 * @returns Table column configuration array
 */
export const getChatColumns = (
  props: Record<string, unknown>,
): ColumnProps<Chat>[] => {
  // Extract onUpdateConfig callback function from props
  const { onUpdateConfig } = props as {
    onUpdateConfig: (params: {
      chatId: string;
      field: 'enable_func_interest' | 'enable_func_proactive_reply';
      value: boolean;
      currentRecord: Chat;
    }) => Promise<boolean>;
  };

  return getChatTableColumns({ onUpdateConfig });
};
