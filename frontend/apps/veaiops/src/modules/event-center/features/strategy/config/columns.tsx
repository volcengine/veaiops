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
// ✅ Optimization: Use shortest path, merge imports from same source
import { adaptStrategyForEdit, channelInfoMap } from '@ec/strategy';
import { CellRender, type ModernTableColumnProps } from '@veaiops/components';
import type { InformStrategy } from 'api-generate';

const { CustomOutlineTag, Ellipsis } = CellRender;

/**
 * Column configuration callback function type definition
 *
 * Type analysis (based on Python source code three-way comparison):
 * - Python InformStrategyVO (API response): bot: BotVO, group_chats: List[GroupChatVO]
 * - Python InformStrategyPayload (API request): bot_id: str, chat_ids: List[str]
 * - Frontend InformStrategy (api-generate) = InformStrategyVO (API response format)
 * - Edit form requires bot_id and chat_ids, converted via adaptStrategyForEdit adapter
 *
 * According to .cursorrules specification: prioritize using types from api-generate (single source of truth principle)
 */
interface StrategyColumnsProps {
  // ✅ Unified use of InformStrategy (from api-generate), conforms to single source of truth principle
  // Edit form will extract bot_id and chat_ids via adaptStrategyForEdit adapter
  onEdit?: (record: InformStrategy) => void;
  onDelete?: (id: string) => void;
}

/**
 * Strategy column configuration function
 * Follows CustomTable best practices, provides complete column configuration
 *
 * Return type explicitly ModernTableColumnProps<InformStrategy>[], avoids type assertions
 */
export const getStrategyColumns = (
  props: StrategyColumnsProps,
): ModernTableColumnProps<InformStrategy>[] => [
  {
    title: 'Strategy Name',
    dataIndex: 'name',
    key: 'name',
    width: 150,
    fixed: 'left' as const,
    ellipsis: true,
  },
  {
    title: 'Enterprise Collaboration Tool',
    dataIndex: 'channel',
    key: 'channel',
    width: 120,
    render: (channel: string) => {
      return (
        <CustomOutlineTag>
          <Ellipsis
            text={channelInfoMap[channel]?.label}
            style={{ maxWidth: 100 }}
          />
        </CustomOutlineTag>
      );
    },
  },
  {
    title: 'Notification Bot',
    dataIndex: 'bot_name',
    key: 'bot_name',
    width: 160,
    ellipsis: true,
    render: (_: string, record: InformStrategy) => {
      if (!record?.bot?.name) {
        return '-';
      }
      return (
        <CustomOutlineTag>
          <Ellipsis text={record?.bot?.name} style={{ maxWidth: 100 }} />
        </CustomOutlineTag>
      );
    },
  },
  {
    title: 'Notification Groups',
    dataIndex: 'chat_names',
    key: 'chat_names',
    width: 300,
    render: (_: string, record: InformStrategy) => {
      if (!record?.group_chats?.length) {
        return '-';
      }

      // Convert group_chats data to format required by CustomOutlineTagList
      const tagData = record.group_chats.map((item, index: number) => ({
        name: item.chat_name || item.open_chat_id,
        key: `chat-${item.id || index}`,
        // Notification groups use default white outline style, no colorTheme set
      }));

      return (
        <CellRender.TagEllipsis
          dataList={tagData}
          maxCount={1}
          ellipsisTextStyle={{ maxWidth: 250 }}
        />
      );
    },
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 160,
    render: (value: string) => {
      if (!value) {
        return '-';
      }
      return new Date(value).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    title: 'Updated At',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 160,
    // sorter: true,
    render: (value: string) => {
      if (!value) {
        return '-';
      }
      return new Date(value).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
    },
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    ellipsis: true,
    render: (value: string) => {
      if (!value) {
        return '--';
      }
      return value;
    },
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 150,
    fixed: 'right' as const,
    render: (_: unknown, record: InformStrategy) => (
      <Space>
        <Button
          size="small"
          type="text"
          onClick={() => {
            // ✅ Type safe: Use type adapter function to convert InformStrategy to format required by edit form
            //
            // Based on Python source code analysis (veaiops/schema/models/event/event.py):
            // - InformStrategyVO returns bot: BotVO and group_chats: List[GroupChatVO]
            // - Edit form requires flattened bot_id and chat_ids (conforms to EventStrategy interface requirements)
            // - adaptStrategyForEdit extracts these values from nested objects
            //
            // Type notes:
            // - record type: InformStrategy (from api-generate, corresponds to Python InformStrategyVO)
            // - adaptedStrategy type: AdaptedStrategyForEdit (InformStrategy & { bot_id: string; chat_ids: string[] })
            // - EventStrategy type: extends InformStrategy, contains optional bot_id and chat_ids
            // - Since AdaptedStrategyForEdit's bot_id and chat_ids are required, while EventStrategy has optional ones, types are compatible
            // ✅ Directly pass InformStrategy, edit form will handle via adaptStrategyForEdit adapter internally
            // According to .cursorrules specification: unified use of types from api-generate
            props.onEdit?.(record);
          }}
        >
          Edit
        </Button>
        <Popconfirm
          title="Are you sure you want to delete this strategy?"
          content="This action cannot be undone. Please proceed with caution."
          onOk={() => props.onDelete?.(record.id)}
          okText="Confirm"
          cancelText="Cancel"
        >
          <Button size="small" type="text" status="danger">
            Delete
          </Button>
        </Popconfirm>
      </Space>
    ),
  },
];
