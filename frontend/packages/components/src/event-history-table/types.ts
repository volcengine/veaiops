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

import type { Event, EventLevel } from '@veaiops/api-client';
import { AgentType } from '@veaiops/api-client';
import type { TableDataResponse } from '@veaiops/utils';

/**
 * History event module type
 */
export enum HistoryModuleType {
  /** Intelligent threshold module */
  INTELLIGENT_THRESHOLD = 'intelligent_threshold',
  /** ChatOps module */
  CHATOPS = 'chatops',
  /** Event center module */
  EVENT_CENTER = 'event_center',
}

/**
 * History event filter parameters
 */
export interface EventHistoryFilters {
  /** Agent type (array) */
  agent_type?: AgentType[];
  /** Event level */
  event_level?: EventLevel | '';
  /** Display status (Chinese status array) */
  show_status?: string[];
  /** Project list */
  projects?: string[];
  /** Region list */
  region?: string[];
  /** Start time */
  start_time?: string;
  /** End time */
  end_time?: string;
}

/**
 * Event history table component properties
 */
export interface EventHistoryTableProps {
  /** Module type, used to determine agent filter scope */
  moduleType: HistoryModuleType;
  /** Table title */
  title?: string;
  /** Whether to show export button */
  showExport?: boolean;
  /** View detail callback */
  onViewDetail?: (record: Event) => void;
  /** Custom action column */
  customActions?: (record: Event) => React.ReactNode;
  /**
   * API request function
   * Passed from business layer to avoid component library directly depending on application layer API client
   * Created using createTableRequestWithResponseHandler from @veaiops/utils
   */
  request: (
    params: Record<string, unknown>,
  ) => Promise<TableDataResponse<Event>>;
}

/**
 * Get allowed agent types based on module type
 */
export function getAllowedAgentTypes(
  moduleType: HistoryModuleType,
): AgentType[] {
  switch (moduleType) {
    case HistoryModuleType.INTELLIGENT_THRESHOLD:
      return [AgentType.INTELLIGENT_THRESHOLD_AGENT];
    case HistoryModuleType.CHATOPS:
      return [
        AgentType.CHATOPS_INTEREST_AGENT,
        AgentType.CHATOPS_PROACTIVE_REPLY_AGENT,
        AgentType.CHATOPS_REACTIVE_REPLY_AGENT,
      ];
    case HistoryModuleType.EVENT_CENTER:
      // Event center supports all agent types
      return Object.values(AgentType);
    default:
      return Object.values(AgentType);
  }
}
