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

// Note: AGENT_TYPE_MAP has been removed, using local definition
import { Button, Popconfirm, Space } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { IconDelete, IconEdit } from '@arco-design/web-react/icon';
import { EVENT_LEVEL_MAP } from '@ec/subscription';
import { CellRender } from '@veaiops/components';
import { EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import type { SubscribeRelationWithAttributes } from 'api-generate';

const AGENT_TYPE_MAP = {
  chatops_interest_agent: '兴趣代理',
  chatops_proactive_reply_agent: '主动回复代理',
  chatops_reactive_reply_agent: '被动回复代理',
  intelligent_threshold_agent: '智能阈值代理',
};

// Destructure CellRender components to avoid repeated calls
const { CustomOutlineTag, StampTime } = CellRender;

/**
 * Subscription relation table data type
 */
interface SubscriptionTableData extends SubscribeRelationWithAttributes {
  key: string;
}

/**
 * Subscription relation name column render component
 */
export const SubscriptionNameColumn: React.FC<{
  name: string;
  record: SubscriptionTableData;
}> = ({ name, record }) => (
  <CellRender.InfoWithCode
    name={name}
    code={record._id}
    direction="vertical"
    isCodeShow={true}
    codeLabel="ID"
    nameLabel=""
    copyable={true}
  />
);

/**
 * Agent type column render component
 */
export const AgentTypeColumn: React.FC<{
  agentType: string;
}> = ({ agentType }) => {
  const typeKey = agentType as keyof typeof AGENT_TYPE_MAP;
  const label = AGENT_TYPE_MAP[typeKey] || agentType;
  return <CustomOutlineTag>{label}</CustomOutlineTag>;
};

/**
 * Time column render component
 */
export const TimeColumn: React.FC<{
  time: string;
}> = ({ time }) => <StampTime time={time} />;

/**
 * Event level column render component
 */
export const EventLevelColumn: React.FC<{
  levels: string[];
}> = ({ levels }) => {
  if (!levels || levels.length === 0) {
    return <CustomOutlineTag>全部</CustomOutlineTag>;
  }

  return (
    <Space wrap>
      {levels?.map((level) => (
        <CustomOutlineTag key={level}>
          {EVENT_LEVEL_MAP[level]?.label || level || EMPTY_CONTENT_TEXT}
        </CustomOutlineTag>
      ))}
    </Space>
  );
};

/**
 * WEBHOOK status column render component
 */
export const WebhookStatusColumn: React.FC<{
  enabled: boolean;
}> = ({ enabled }) => (
  <CustomOutlineTag>{enabled ? '已开启' : '未开启'}</CustomOutlineTag>
);

/**
 * WEBHOOK endpoint column render component
 */
export const WebhookEndpointColumn: React.FC<{
  url: string;
}> = ({ url }) => <span>{url || EMPTY_CONTENT_TEXT}</span>;

/**
 * Projects column render component
 */
export const ProjectsColumn: React.FC<{
  projectIds: string[];
}> = ({ projectIds }) => {
  if (!projectIds || projectIds.length === 0) {
    return <CustomOutlineTag>全部</CustomOutlineTag>;
  }
  const data = projectIds.map((id) => ({ name: id, value: id }));
  return (
    <CellRender.TagEllipsis
      dataList={data}
      maxCount={3}
      showMode="text"
      editable={false}
    />
  );
};

/**
 * Subscription relation actions column render component
 */
export const SubscriptionActionsColumn: React.FC<{
  record: SubscriptionTableData;
  onEdit?: (subscription: SubscribeRelationWithAttributes) => void;
  onDelete?: (subscriptionId: string) => Promise<boolean>;
  onToggleStatus?: (
    subscriptionId: string,
    isActive: boolean,
  ) => Promise<boolean>;
}> = ({ record, onEdit, onDelete }) => (
  <Space>
    {onEdit && (
      <Button
        size="small"
        type="text"
        icon={<IconEdit />}
        onClick={() => onEdit(record)}
      >
        编辑
      </Button>
    )}
    {onDelete && (
      <Popconfirm
        title="确定要删除这个订阅吗？"
        content="删除后无法恢复，请谨慎操作。"
        onOk={async () => {
          if (onDelete) {
            await onDelete(record._id || '');
          }
        }}
        okText="确定"
        cancelText="取消"
      >
        <Button size="small" type="text" status="danger" icon={<IconDelete />}>
          删除
        </Button>
      </Popconfirm>
    )}
  </Space>
);

/**
 * Get subscription relation table column configuration
 *
 * Following best practices: functional column configuration + componentized column rendering
 */
export const getSubscriptionTableColumns = (
  onEdit?: (subscription: SubscribeRelationWithAttributes) => void,
  onDelete?: (subscriptionId: string) => Promise<boolean>,
  onToggleStatus?: (
    subscriptionId: string,
    isActive: boolean,
  ) => Promise<boolean>,
): ColumnProps<SubscriptionTableData>[] => [
  {
    title: '名称',
    dataIndex: 'name',
    key: 'name',
    width: 200,
    fixed: 'left' as const,
    ellipsis: true,
    render: (name: string, record: SubscriptionTableData) => (
      <SubscriptionNameColumn name={name} record={record} />
    ),
  },
  {
    title: '智能体',
    dataIndex: 'agent_type',
    key: 'agent_type',
    width: 140,
    render: (agentType: string) => <AgentTypeColumn agentType={agentType} />,
  },
  {
    title: '生效开始时间',
    dataIndex: 'start_time',
    key: 'start_time',
    width: 160,
    render: (value: string) => <TimeColumn time={value} />,
  },
  {
    title: '生效结束时间',
    dataIndex: 'end_time',
    key: 'end_time',
    width: 160,
    render: (value: string) => <TimeColumn time={value} />,
  },
  {
    title: '事件级别',
    dataIndex: 'event_level',
    key: 'event_level',
    width: 160,
    render: (levels: string[]) => <EventLevelColumn levels={levels} />,
  },
  {
    title: '是否开启WEBHOOK',
    dataIndex: 'enable_webhook',
    key: 'enable_webhook',
    width: 140,
    render: (enabled: boolean) => <WebhookStatusColumn enabled={enabled} />,
  },
  {
    title: 'WEBHOOK地址',
    dataIndex: 'webhook_endpoint',
    key: 'webhook_endpoint',
    width: 200,
    ellipsis: true,
    render: (url: string) => <WebhookEndpointColumn url={url} />,
  },
  {
    title: '关注项目',
    dataIndex: 'interest_projects',
    key: 'interest_projects',
    width: 250,
    render: (projectIds: string[]) => (
      <ProjectsColumn projectIds={projectIds} />
    ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 180,
    fixed: 'right' as const,
    render: (_: unknown, record: SubscriptionTableData) => (
      <SubscriptionActionsColumn
        record={record}
        onEdit={onEdit}
        onDelete={onDelete}
        onToggleStatus={onToggleStatus}
      />
    ),
  },
];
