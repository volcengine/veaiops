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
 * Event Center related type definitions
 * Based on api-generate types, avoiding duplicate definitions
 */

// Note: api-generate is located in apps/veaiops, packages should not directly depend on it
// Here we use type aliases, actual types are imported from api-generate

/**
 * Agent type enumeration
 */
export type AgentType =
  | 'chatops_interest_agent'
  | 'chatops_proactive_reply_agent'
  | 'chatops_reactive_reply_agent'
  | 'intelligent_threshold_agent';

/**
 * Event level enumeration
 */
export type EventLevel = 'P0' | 'P1' | 'P2';

// Event type needs to be imported from api-generate, here we only define the interface
export interface Event {
  _id?: string;
  event_id?: string;
  agent_type: AgentType;
  event_level: EventLevel;
  region?: string[];
  project?: string[];
  product?: string[];
  customer?: string[];
  raw_data: Record<string, unknown>;
  datasource_type: string;
  channel_msg?: Record<string, unknown>;
  status?: number;
  created_at?: string;
  updated_at?: string;
}

/**
 * Event query parameters
 * Aligned with backend API parameters (using plural form: projects, products, customers)
 */
export interface EventQueryParams {
  agentType?: AgentType | AgentType[];
  eventLevel?: EventLevel;
  status?: number[];
  region?: string[];
  projects?: string[];
  products?: string[];
  customers?: string[];
  startTime?: string;
  endTime?: string;
  skip?: number;
  limit?: number;
}

/**
 * Event filter type
 * Used for frontend filter forms (using plural form: projects, products, customers)
 */
export interface EventFilters {
  agentType?: AgentType[];
  eventLevel?: EventLevel | '';
  status?: number[];
  region?: string[];
  projects?: string[];
  products?: string[];
  customers?: string[];
  dateRange?: [string, string];
}

/**
 * Event table data type
 * Directly uses api-generate's Event type
 */
export type EventTableData = Event;
