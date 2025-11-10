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

import { Badge, Button } from '@arco-design/web-react';
import { IconEye } from '@arco-design/web-react/icon';
import type { Event, EventLevel } from '@veaiops/api-client';
import { AgentType, EventStatus } from '@veaiops/api-client';
import type React from 'react';
import { CellRender } from '../cell-render';
import type { ModernTableColumnProps } from '../custom-table/types/core/common';

const { CopyableText, CustomOutlineTag, CustomOutlineTagList, StampTime } =
  CellRender;

/**
 * Render event ID
 */
export const renderEventId = (value: string) => {
  return <CopyableText text={value || ''} />;
};

/**
 * Render agent type
 */
export const renderAgentType = (value: AgentType) => {
  const agentTypeMap: Record<AgentType, string> = {
    [AgentType.INTELLIGENT_THRESHOLD_AGENT]: 'Intelligent Threshold Agent',
    [AgentType.CHATOPS_INTEREST_AGENT]: 'Content Recognition Agent',
    [AgentType.CHATOPS_PROACTIVE_REPLY_AGENT]: 'Proactive Reply Agent',
    [AgentType.CHATOPS_REACTIVE_REPLY_AGENT]: 'Reactive Reply Agent',
  };

  return <CustomOutlineTag>{agentTypeMap[value] || value}</CustomOutlineTag>;
};

/**
 * Render status (EventStatus numeric value to Chinese display status)
 * Uses Badge component for display, reference origin/feat/web-v2 implementation
 *
 * Status mapping (corresponding to backend EventStatus enum):
 * - 0 (INITIAL): Initial state → Waiting to send
 * - 1 (SUBSCRIBED): Subscription matched → Waiting to send
 * - 2 (CARD_BUILT): Card constructed → Waiting to send
 * - 3 (DISPATCHED): Sent → Send success
 * - 4 (NONE_DISPATCH): No subscription match → Not subscribed
 * - 11 (CHATOPS_NOT_MATCHED): ChatOps not matched → Rule not matched
 * - 12 (CHATOPS_RULE_FILTERED): ChatOps rule filtered → Filter rule matched
 * - 13 (CHATOPS_RULE_RESTRAINED): ChatOps rule limited → Alert suppressed
 */
export const renderStatus = (value?: number | null) => {
  if (value === undefined || value === null) {
    return <span style={{ color: '#86909C' }}>-</span>;
  }

  // Status configuration mapping
  const statusConfigMap: Record<
    number,
    {
      text: string;
      status: 'success' | 'error' | 'processing' | 'warning' | 'default';
    }
  > = {
    // Waiting to send status (0, 1, 2)
    [EventStatus.INITIAL]: { text: 'Waiting to Send', status: 'processing' },
    [EventStatus.SUBSCRIBED]: { text: 'Waiting to Send', status: 'processing' },
    [EventStatus.CARD_BUILT]: { text: 'Waiting to Send', status: 'processing' },
    // Send success (3)
    [EventStatus.DISTRIBUTED]: { text: 'Send Success', status: 'success' },
    // Not subscribed (4)
    [EventStatus.NO_DISTRIBUTION]: {
      text: 'Not Subscribed',
      status: 'warning',
    },
    // ChatOps related status (11, 12, 13)
    [EventStatus.CHATOPS_NO_MATCH]: {
      text: 'Rule Not Matched',
      status: 'warning',
    },
    [EventStatus.CHATOPS_RULE_FILTERED]: {
      text: 'Filter Rule Matched',
      status: 'error',
    },
    [EventStatus.CHATOPS_RULE_LIMITED]: {
      text: 'Alert Suppressed',
      status: 'error',
    },
  };

  const config = statusConfigMap[value] || {
    text: `Unknown Status(${value})`,
    status: 'default' as const,
  };

  return <Badge status={config.status} text={config.text} />;
};

/**
 * Render event level
 */
export const renderEventLevel = (value: EventLevel) => {
  return <CustomOutlineTag>{value || 'Unknown'}</CustomOutlineTag>;
};

/**
 * Render project list
 */
export const renderProjectList = (value: string[]) => {
  if (!value || value.length === 0) {
    return <span style={{ color: '#86909C' }}>-</span>;
  }

  if (value.length === 1) {
    return <CustomOutlineTag>{value[0]}</CustomOutlineTag>;
  }

  return (
    <CustomOutlineTagList
      dataList={value.map((item) => ({ name: item }))}
      maxCount={3}
    />
  );
};

/**
 * Render timestamp
 */
export const renderTimestamp = (value: string) => {
  return <StampTime time={value} />;
};

/**
 * Render action column
 */
export const renderActions = ({
  record,
  onViewDetail,
  customActions,
}: {
  record: Event;
  onViewDetail?: (record: Event) => void;
  customActions?: (record: Event) => React.ReactNode;
}) => {
  return (
    <div className="flex items-center gap-2">
      {onViewDetail && (
        <Button
          type="text"
          size="small"
          icon={<IconEye />}
          onClick={() => onViewDetail(record)}
        >
          View Details
        </Button>
      )}
      {customActions?.(record)}
    </div>
  );
};

/**
 * Get unified event history column configuration
 */
export const getEventHistoryColumns = ({
  onViewDetail,
  customActions,
}: {
  onViewDetail?: (record: Event) => void;
  customActions?: (record: Event) => React.ReactNode;
}): ModernTableColumnProps<Event>[] => [
  {
    title: 'Event ID',
    dataIndex: '_id',
    key: 'event_id',
    width: 180,
    fixed: 'left',
    ellipsis: true,
    render: renderEventId,
  },
  {
    title: 'Agent',
    dataIndex: 'agent_type',
    key: 'agent_type',
    width: 120,
    render: renderAgentType,
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 120,
    render: renderStatus,
  },
  {
    title: 'Event Level',
    dataIndex: 'event_level',
    key: 'event_level',
    width: 80,
    render: renderEventLevel,
  },
  {
    title: 'Project',
    dataIndex: 'project',
    key: 'project',
    width: 140,
    ellipsis: true,
    render: renderProjectList,
  },
  {
    title: 'Created At',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 160,
    sorter: true,
    defaultSortOrder: 'descend',
    render: renderTimestamp,
  },
  {
    title: 'Updated At',
    dataIndex: 'updated_at',
    key: 'updated_at',
    width: 160,
    render: renderTimestamp,
  },
  {
    title: 'Actions',
    key: 'actions',
    width: 120,
    fixed: 'right',
    render: (_: unknown, record: Event) =>
      renderActions({ record, onViewDetail, customActions }),
  },
];
