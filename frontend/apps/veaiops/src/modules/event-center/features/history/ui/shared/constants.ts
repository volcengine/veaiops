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

import { AgentType, EventLevel } from 'api-generate';

/**
 * Event type mapping configuration - Based on backend AgentType enum, enhanced visual design
 */
export const EVENT_TYPE_MAP: Record<
  string,
  {
    color: string;
    text: string;
    icon: string;
    bgColor: string;
  }
> = {
  [AgentType.CHATOPS_INTEREST_AGENT]: {
    color: '#165DFF',
    text: '内容识别Agent',
    icon: '🔍',
    bgColor: '#E8F3FF',
  },
  [AgentType.CHATOPS_REACTIVE_REPLY_AGENT]: {
    color: '#00B42A',
    text: '被动回复Agent',
    icon: '⚡',
    bgColor: '#E8FFEA',
  },
  [AgentType.CHATOPS_PROACTIVE_REPLY_AGENT]: {
    color: '#722ED1',
    text: '主动回复Agent',
    icon: '🚀',
    bgColor: '#F2E8FF',
  },
  [AgentType.INTELLIGENT_THRESHOLD_AGENT]: {
    color: '#FF7D00',
    text: '智能阈值Agent',
    icon: '📊',
    bgColor: '#FFF7E8',
  },
};

/**
 * Event level visual mapping configuration
 */
export const EVENT_LEVEL_VISUAL_MAP: Record<
  string,
  {
    color: string;
    bgColor: string;
    borderColor: string;
    icon: string;
    priority: number;
  }
> = {
  [EventLevel.P0]: {
    color: '#F53F3F',
    bgColor: '#FFE8E8',
    borderColor: '#F53F3F',
    icon: '🔴',
    priority: 1,
  },
  [EventLevel.P1]: {
    color: '#FF7D00',
    bgColor: '#FFF7E8',
    borderColor: '#FF7D00',
    icon: '🟠',
    priority: 2,
  },
  [EventLevel.P2]: {
    color: '#165DFF',
    bgColor: '#E8F3FF',
    borderColor: '#165DFF',
    icon: '🔵',
    priority: 3,
  },
  // P3 level temporarily commented out, as EventLevel enum may not have P3
  // [EventLevel.P3]: {
  //   color: '#00B42A',
  //   bgColor: '#E8FFEA',
  //   borderColor: '#00B42A',
  //   icon: '🟢',
  //   priority: 4,
  // },
};

/**
 * Default expanded sections
 */
export const DEFAULT_EXPANDED_SECTIONS = new Set(['basic', 'time', 'rawData']);

/**
 * Raw data view format type
 */
export type RawDataFormat = 'json' | 'formatted';

/**
 * Style constants
 */
export const STYLES = {
  CARD_SHADOW: '0 2px 8px rgba(0, 0, 0, 0.06)',
  CARD_BORDER: '1px solid #E5E6EB',
  CARD_BORDER_RADIUS: '12px',
  SECTION_BORDER_RADIUS: '8px',
  INFO_BORDER_RADIUS: '6px',
  BACKGROUND_LIGHT: '#F7F8FA',
  BACKGROUND_PAGE: '#FAFBFC',
  TEXT_PRIMARY: '#1D2129',
  TEXT_SECONDARY: '#86909C',
  TEXT_DISABLED: '#C9CDD4',
} as const;
