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

import type { HistoryQueryParams } from './types';
import { AgentType, EventStatus, EventLevel } from "api-generate";
import apiClient from "@/utils/api-client";

/**
 * History event service
 *
 * Encapsulates history event-related API calls, provides unified API interface
 *
 * @example
 * ```typescript
 * const historyService = new HistoryService();
 * const events = await historyService.getHistoryEvents({ skip: 0, limit: 10 });
 * ```
 */
export class HistoryService {
  /**
   * Get history event list
   */
  async getHistoryEvents(params?: HistoryQueryParams | {
    skip?: number;
    limit?: number;
    agentType?: string[] | AgentType | AgentType[];
    eventLevel?: string | EventLevel;
    status?: number[];
    region?: string[];
    projects?: string[];
    products?: string[];
    customers?: string[];
    startTime?: string;
    endTime?: string;
  }) {
    const response = await apiClient.event.getApisV1ManagerEventCenterEvent({
      skip: params?.skip || 0,
      limit: params?.limit || 10,
      // Type conversion: agentType in EventQueryParams may be AgentType | AgentType[] or string[]
      // API expects Array<'CHATOPS_INTEREST' | ...>, but AgentType enum values are 'chatops_interest_agent' etc.
      // Need to map enum values to string literals expected by API
      // TODO: Check backend's actual accepted agentType format, fix OpenAPI spec to match actual types
      agentType: params?.agentType
        ? ((Array.isArray(params.agentType)
            ? params.agentType
            : [params.agentType]
          ).map((type) => {
            // If it's an AgentType enum value, map to API expected format
            if (typeof type === 'string' && type in AgentType) {
              const typeMap: Record<AgentType, string> = {
                [AgentType.CHATOPS_INTEREST_AGENT]: 'CHATOPS_INTEREST',
                [AgentType.CHATOPS_REACTIVE_REPLY_AGENT]:
                  'CHATOPS_REACTIVE_REPLY',
                [AgentType.CHATOPS_PROACTIVE_REPLY_AGENT]:
                  'CHATOPS_PROACTIVE_REPLY',
                [AgentType.INTELLIGENT_THRESHOLD_AGENT]: 'INTELLIGENT_THRESHOLD',
              };
              return typeMap[type as AgentType] || type;
            }
            // If already in API expected format, return directly
            return type;
          }) as unknown) as Array<
            | 'CHATOPS_INTEREST'
            | 'CHATOPS_REACTIVE_REPLY'
            | 'CHATOPS_PROACTIVE_REPLY'
            | 'INTELLIGENT_THRESHOLD'
            | 'ONCALL'
          > as unknown as AgentType[]
        : undefined,
      // ✅ Type safe: Based on Python source code analysis, eventLevel should be EventLevel enum array (P0, P1, P2)
      // Python: event_level: Optional[List[EventLevel]] = None (EventLevel enum: P0, P1, P2)
      // OpenAPI: Array<EventLevel> (P0, P1, P2)
      // Use type guard to verify if value is valid EventLevel array
      eventLevel: (() => {
        if (!params?.eventLevel) {
          return undefined;
        }
        if (Array.isArray(params.eventLevel)) {
          // Filter valid EventLevel values
          const validLevels = params.eventLevel.filter(
            (level): level is EventLevel =>
              level === EventLevel.P0 ||
              level === EventLevel.P1 ||
              level === EventLevel.P2,
          );
          return validLevels.length > 0 ? validLevels : undefined;
        }
        // Single value: convert to array
        if (
          params.eventLevel === EventLevel.P0 ||
          params.eventLevel === EventLevel.P1 ||
          params.eventLevel === EventLevel.P2
        ) {
          return [params.eventLevel];
        }
        return undefined;
      })(),
      region: params?.region,
      projects: params?.projects,
      products: params?.products,
      customers: params?.customers,
      startTime: params?.startTime,
      endTime: params?.endTime,
      // Note: API doesn't support status parameter, only supports showStatus
      // showStatus will be mapped to event_status in backend, if need to filter event_status, should use showStatus
    });

    return response;
  }

  /**
   * Get single history event details
   */
  async getHistoryEvent(eventId: string) {
    const response = await apiClient.event.getApisV1ManagerEventCenterEvent1({
      eventId,
    });

    return response;
  }
}

// Create singleton instance
export const historyService = new HistoryService();
