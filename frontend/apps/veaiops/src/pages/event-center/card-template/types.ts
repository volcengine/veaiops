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
 * Card template management related type definitions
 */

// Import generated API types
import type { AgentTemplate, ChannelType } from 'api-generate';

/**
 * Agent type enumeration - based on generated API types
 */
export type AgentType = 'CHATOPS' | 'INTELLIGENT_THRESHOLD' | 'ONCALL';

export const AGENT_TYPE_OPTIONS = [
  {
    label: '内容识别Agent',
    value: 'chatops_interest_agent',
    color: 'blue',
  },
  {
    label: '主动回复Agent',
    value: 'chatops_proactive_reply_agent',
    color: 'green',
  },
  {
    label: '被动回复Agent',
    value: 'chatops_reactive_reply_agent',
    color: 'orange',
  },
  {
    label: '智能阈值Agent',
    value: 'intelligent_threshold_agent',
    color: 'purple',
  },
];

// Original filter options (excluding intelligent threshold Agent) - used in certain scenarios
export const AGENT_OPTIONS_FILTER = AGENT_TYPE_OPTIONS.filter(
  (item) => item.value !== 'intelligent_threshold_agent',
);

// Only intelligent threshold Agent options - used in intelligent threshold module
export const AGENT_OPTIONS_THRESHOLD_FILTER = AGENT_TYPE_OPTIONS.filter(
  (item) => item.value === 'intelligent_threshold_agent',
);

// Event center subscription management: only content recognition Agent and intelligent threshold Agent
export const AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION =
  AGENT_TYPE_OPTIONS.filter(
    (item) =>
      item.value === 'chatops_interest_agent' ||
      item.value === 'intelligent_threshold_agent',
  );

// Oncall subscription management: only content recognition Agent
export const AGENT_OPTIONS_ONCALL_SUBSCRIPTION = AGENT_TYPE_OPTIONS.filter(
  (item) => item.value === 'chatops_interest_agent',
);

// Oncall history events: content recognition, passive reply, active reply Agents (excluding intelligent threshold)
export const AGENT_OPTIONS_ONCALL_HISTORY = AGENT_TYPE_OPTIONS.filter(
  (item) => item.value !== 'intelligent_threshold_agent',
);

// Event center history events: all Agent types
export const AGENT_OPTIONS_EVENT_CENTER_HISTORY = AGENT_TYPE_OPTIONS;

export const AGENT_TYPE_MAP = AGENT_TYPE_OPTIONS.reduce(
  (acc, cur) => {
    acc[cur.value] = cur;
    return acc;
  },
  {} as Record<string, { label: string; value: string; color: string }>,
);

/**
 * Agent template record interface - extends generated API types
 */
export interface AgentTemplateRecord extends AgentTemplate {
  [key: string]: unknown; // Add index signature to satisfy BaseRecord constraint
}

/**
 * Agent template query parameters
 */
export interface AgentTemplateQuery {
  /** Agent type filter */
  agents?: string[];
  /** Channel type filter */
  channels?: ChannelType[];
  /** Template ID search */
  templateId?: string;
  /** Template name search */
  name?: string;
  /** Whether enabled */
  is_active?: boolean;
  /** Creation time range */
  createTimeRanges?: number[];
  /** Pagination parameters */
  skip?: number;
  /** Page size */
  limit?: number;
}

/**
 * Guide step type
 */
export interface GuideStep {
  /** Step title */
  title: string;
  /** Step description */
  description: string;
  /** Step icon */
  icon?: React.ReactNode;
  /** Whether completed */
  completed?: boolean;
  /** Action button */
  action?: {
    text: string;
    onClick: () => void;
  };
}
