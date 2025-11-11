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
 * Card template management table column configuration
 */

import { AGENT_TYPE_MAP } from '@/pages/event-center/card-template/types';
import {
  Button,
  Message,
  Popconfirm,
  Space,
  Tooltip,
} from '@arco-design/web-react';
import { IconCopy, IconDelete, IconEdit } from '@arco-design/web-react/icon';
import { CellRender } from '@veaiops/components';
// ✅ Fix: Directly use AgentTemplate type from api-generate (single source of truth principle)
import { CHANNEL_OPTIONS } from '@veaiops/constants';
import { safeCopyToClipboard } from '@veaiops/utils';
import type { AgentTemplate } from 'api-generate';

const { CustomOutlineTag, StampTime } = CellRender;

interface ColumnProps {
  onEdit?: (record: AgentTemplate) => Promise<boolean>;
  onDelete?: (id: string) => Promise<boolean>;
  onCopy?: (templateId: string) => void;
}

/**
 * Get channel type display text
 */
const getChannelTypeLabel = (value: string) => {
  const option = CHANNEL_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
};

/**
 * Get card template management table column configuration
 */
export const getCardTemplateColumns = (props: ColumnProps) => {
  const { onEdit, onDelete } = props;

  return [
    {
      title: '卡片模版ID',
      dataIndex: 'template_id',
      key: 'template_id',
      width: 200,
      render: (templateId: string) => {
        return (
          <Space>
            <Tooltip content={templateId}>
              <span
                style={{
                  maxWidth: 180,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {templateId}
              </span>
            </Tooltip>
            <Tooltip content="复制模版ID">
              <Button
                type="text"
                size="mini"
                icon={<IconCopy />}
                onClick={async () => {
                  const result = await safeCopyToClipboard(templateId);
                  if (result.success) {
                    Message.success('复制成功');
                  } else {
                    const errorMessage =
                      result.error?.message || '复制失败，请重试';
                    Message.error(errorMessage);
                  }
                }}
              />
            </Tooltip>
          </Space>
        );
      },
    },
    {
      title: '智能体',
      dataIndex: 'agent_type',
      key: 'agent_type',
      width: 150,
      render: (value: string) => (
        <CustomOutlineTag>{AGENT_TYPE_MAP[value]?.label}</CustomOutlineTag>
      ),
    },
    {
      title: '企业协同工具',
      dataIndex: 'channel',
      key: 'channel',
      width: 120,
      render: (value: string) => (
        <CustomOutlineTag>{getChannelTypeLabel(value)}</CustomOutlineTag>
      ),
    },

    {
      title: '状态',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (value: boolean) => (
        <CustomOutlineTag>{value ? '启用' : '禁用'}</CustomOutlineTag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      render: (text: string) => <StampTime time={text} />,
    },
    {
      title: '更新时间',
      dataIndex: 'updated_at',
      key: 'updated_at',
      width: 180,
      render: (text: string) => <StampTime time={text} />,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_: unknown, record: AgentTemplate) => (
        <Space>
          <Tooltip content="编辑模版">
            <Button
              type="text"
              size="small"
              icon={<IconEdit />}
              onClick={() => onEdit?.(record)}
            >
              编辑
            </Button>
          </Tooltip>
          <Popconfirm
            title="确定要删除这个模版吗？"
            content="删除后无法恢复，请谨慎操作。"
            onOk={() => onDelete?.(record?._id as string)}
            okText="确定"
            cancelText="取消"
          >
            <Tooltip content="删除模版">
              <Button
                type="text"
                size="small"
                status="danger"
                icon={<IconDelete />}
              >
                删除
              </Button>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];
};
