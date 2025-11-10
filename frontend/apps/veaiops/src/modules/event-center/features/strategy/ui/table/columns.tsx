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
import type { ColumnProps } from '@arco-design/web-react/es/Table';
// ✅ Optimization: Use unified export
import { channelInfoMap } from '@ec/strategy';
import { CellRender } from '@veaiops/components';
import { EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import type { InformStrategy } from 'api-generate';
import type React from 'react';

const { CustomOutlineTag, Ellipsis } = CellRender;

/**
 * Strategy name column render component
 */
export const StrategyNameColumn: React.FC<{
  name: string;
  record: InformStrategy;
}> = ({ name, record }) => (
  <CellRender.InfoWithCode
    name={name}
    code={record.id}
    direction="vertical"
    isCodeShow={true}
    codeLabel="ID"
    nameLabel=""
    copyable={true}
    navigate={undefined}
  />
);

/**
 * Enterprise collaboration tool column render component
 */
export const ChannelColumn: React.FC<{
  channel: string;
}> = ({ channel }) => (
  <CustomOutlineTag>
    <Ellipsis text={channelInfoMap[channel]?.label} style={{ maxWidth: 100 }} />
  </CustomOutlineTag>
);

/**
 * Notification bot column render component
 */
export const BotColumn: React.FC<{
  record: InformStrategy;
}> = ({ record }) => {
  if (!record?.bot?.name) {
    return <span>{EMPTY_CONTENT_TEXT}</span>;
  }
  return (
    <CustomOutlineTag>
      <Ellipsis text={record?.bot?.name} style={{ maxWidth: 100 }} />
    </CustomOutlineTag>
  );
};

/**
 * Notification group column render component
 */
export const ChatColumn: React.FC<{
  record: InformStrategy;
}> = ({ record }) => {
  if (!record?.group_chats?.length) {
    return <span>{EMPTY_CONTENT_TEXT}</span>;
  }

  // Convert group_chats data to format required by TagEllipsis
  const tagData = record.group_chats.map((item, index: number) => ({
    name: item.chat_name || item.id,
    key: `chat-${item.id || index}`,
  }));

  return <CellRender.TagEllipsis dataList={tagData} maxCount={2} />;
};

/**
 * Status column render component
 */
export const StatusColumn: React.FC<{
  isActive: boolean;
}> = ({ isActive }) => (
  <CustomOutlineTag>{isActive ? '启用' : '禁用'}</CustomOutlineTag>
);

/**
 * Create time column render component
 */
export const CreateTimeColumn: React.FC<{
  createdAt: string;
}> = ({ createdAt }) => <span>{new Date(createdAt).toLocaleString()}</span>;

/**
 * Strategy actions column render component
 */
export const StrategyActionsColumn: React.FC<{
  record: InformStrategy;
  onEdit?: (strategy: InformStrategy) => void;
  onDelete?: (strategyId: string) => Promise<boolean>;
  onToggleStatus?: (strategyId: string, isActive: boolean) => Promise<boolean>;
}> = ({ record, onEdit, onDelete, onToggleStatus: _onToggleStatus }) => (
  <Space>
    {onEdit && (
      <Button size="small" type="text" onClick={() => onEdit(record)}>
        编辑
      </Button>
    )}
    {onDelete && (
      <Popconfirm
        title="确定要删除这个策略吗？"
        content="删除后无法恢复，请谨慎操作。"
        onOk={async () => {
          if (onDelete) {
            await onDelete(record.id);
          }
        }}
        okText="确定"
        cancelText="取消"
      >
        <Button size="small" type="text" status="danger">
          删除
        </Button>
      </Popconfirm>
    )}
  </Space>
);

/**
 * Create strategy table column configuration
 */
export const getStrategyTableColumns = (
  onEdit?: (strategy: InformStrategy) => void,
  onDelete?: (strategyId: string) => Promise<boolean>,
  onToggleStatus?: (strategyId: string, isActive: boolean) => Promise<boolean>,
): ColumnProps<InformStrategy>[] => [
  {
    title: '策略名称',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    fixed: 'left' as const,
    ellipsis: true,
    render: (name: string, record: InformStrategy) => (
      <StrategyNameColumn name={name} record={record} />
    ),
  },
  {
    title: '企业协同工具',
    dataIndex: 'channel',
    key: 'channel',
    width: 120,
    render: (channel: string) => <ChannelColumn channel={channel} />,
  },
  {
    title: '通知机器人',
    dataIndex: 'bot',
    key: 'bot',
    width: 160,
    ellipsis: true,
    render: (_: string, record: InformStrategy) => (
      <BotColumn record={record} />
    ),
  },
  {
    title: '通知群',
    dataIndex: 'group_chats',
    key: 'chat_names',
    width: 300,
    render: (_: string, record: InformStrategy) => (
      <ChatColumn record={record} />
    ),
  },
  {
    title: '描述',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    ellipsis: true,
    render: (description: string) => <Ellipsis text={description} />,
  },
  {
    title: '操作',
    key: 'actions',
    width: 150,
    fixed: 'right' as const,
    render: (_: unknown, record: InformStrategy) => (
      <StrategyActionsColumn
        record={record}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    ),
  },
];
