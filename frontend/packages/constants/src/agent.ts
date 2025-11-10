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
 * Agent type related constant definitions
 * Unified Agent type configuration for global use
 */

/**
 * ⚠️ Note: AgentType enum is defined in @veaiops/api-client
 *
 * ✅ Single source of truth principle:
 * - AgentType enum is imported from @veaiops/api-client (not re-exported here to avoid intermediary)
 * - Configuration constants like AGENT_TYPE_OPTIONS are defined here (UI display configuration)
 *
 * Usage:
 * ```typescript
 * // Import enum
 * import { AgentType } from '@veaiops/api-client';
 * // Import configuration constants
 * import { AGENT_TYPE_OPTIONS } from '@veaiops/constants';
 *
 * // Use enum value
 * const type = AgentType.CHATOPS_INTEREST_AGENT;
 * // Find configuration
 * const config = AGENT_TYPE_OPTIONS.find(opt => opt.value === AgentType.CHATOPS_INTEREST_AGENT);
 * ```
 */

// ✅ As a consumer, import AgentType for type definitions and value comparisons
import { AgentType } from '@veaiops/api-client';

/**
 * Agent type option configuration (with color and labels)
 *
 * Note: value uses AgentType enum
 */
export const AGENT_TYPE_OPTIONS = [
  {
    label: 'Content Recognition Agent',
    value: AgentType.CHATOPS_INTEREST_AGENT,
    color: 'blue',
  },
  {
    label: 'Proactive Reply Agent',
    value: AgentType.CHATOPS_PROACTIVE_REPLY_AGENT,
    color: 'green',
  },
  {
    label: 'Reactive Reply Agent',
    value: AgentType.CHATOPS_REACTIVE_REPLY_AGENT,
    color: 'orange',
  },
  {
    label: 'Intelligent Threshold Agent',
    value: AgentType.INTELLIGENT_THRESHOLD_AGENT,
    color: 'purple',
  },
] as const;

/**
 * Agent type mapping
 */
export const AGENT_TYPE_MAP = AGENT_TYPE_OPTIONS.reduce(
  (acc, cur) => {
    acc[cur.value] = cur;
    return acc;
  },
  {} as Record<AgentType, (typeof AGENT_TYPE_OPTIONS)[number]>,
);

/**
 * Agent filter options (excluding intelligent threshold)
 */
export const AGENT_OPTIONS_FILTER = AGENT_TYPE_OPTIONS.filter(
  (item) => item.value !== AgentType.INTELLIGENT_THRESHOLD_AGENT,
);

/**
 * Intelligent threshold filter options
 */
export const AGENT_OPTIONS_THRESHOLD_FILTER = AGENT_TYPE_OPTIONS.filter(
  (item) => item.value === AgentType.INTELLIGENT_THRESHOLD_AGENT,
);

/**
 * Event center subscription options
 */
export const AGENT_OPTIONS_EVENT_CENTER_SUBSCRIPTION =
  AGENT_TYPE_OPTIONS.filter(
    (item) =>
      item.value === AgentType.CHATOPS_INTEREST_AGENT ||
      item.value === AgentType.INTELLIGENT_THRESHOLD_AGENT,
  );

/**
 * Oncall subscription options
 */
export const AGENT_OPTIONS_ONCALL_SUBSCRIPTION = AGENT_TYPE_OPTIONS.filter(
  (item) => item.value === AgentType.CHATOPS_INTEREST_AGENT,
);

/**
 * Oncall history options
 */
export const AGENT_OPTIONS_ONCALL_HISTORY = AGENT_TYPE_OPTIONS.filter(
  (item) => item.value !== AgentType.INTELLIGENT_THRESHOLD_AGENT,
);

/**
 * Event center history options (all)
 */
export const AGENT_OPTIONS_EVENT_CENTER_HISTORY = AGENT_TYPE_OPTIONS;
