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
 * Oncall module type definitions
 * Keep consistent with openapi-specs/modules/oncall.json
 */

// ============================================================
// Interest Rule related types (main rule types)
// ============================================================

/**
 * Alert level enumeration
 */
export type AlertLevel = 'P0' | 'P1' | 'P2';

/**
 * Rule action category
 */
export type ActionCategory = 'Detect' | 'Filter';

/**
 * Rule inspection category
 */
export type InspectCategory = 'Semantic' | 'RE';

/**
 * Interest Rule (Oncall rule)
 * Corresponds to API: Interest schema
 */
export interface OncallRule {
  /** Rule ID */
  _id: string;
  /** Rule name */
  name: string;
  /** Rule description */
  description?: string;
  /** Alert level */
  level?: AlertLevel;
  /** Positive examples */
  examples_positive?: string[];
  /** Negative examples */
  examples_negative?: string[];
  /** Action category */
  action_category: ActionCategory;
  /** Inspection category */
  inspect_category: InspectCategory;
  /** Regular expression (used when inspect_category is 'RE') */
  regular_expression?: string;
  /** Number of historical messages to inspect */
  inspect_history?: number;
  /** Alert suppression interval */
  silence_delta?: string;
  /** Whether the rule is active */
  is_active?: boolean;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
  /** Version number */
  version?: number;
}

/**
 * Rule update request
 * Corresponds to API: InterestUpdateRequest schema
 */
export interface OncallRuleUpdateRequest {
  /** Rule name */
  name?: string;
  /** Description */
  description?: string;
  /** Alert level */
  level?: AlertLevel;
  /** Alert suppression interval */
  silence_delta?: string;
  /** Whether the rule is enabled */
  is_active?: boolean;
  /** Positive examples (editable when inspection category is semantic analysis) */
  examples_positive?: string[];
  /** Negative examples (editable when inspection category is semantic analysis) */
  examples_negative?: string[];
  /** Regular expression (editable when inspection category is regular expression) */
  regular_expression?: string;
}

// ============================================================
// Oncall Schedule related types (oncall schedule)
// ============================================================

/**
 * Schedule type
 */
export type ScheduleType = 'daily' | 'weekly' | 'monthly' | 'custom';

/**
 * Oncall participant contact information
 */
export interface ParticipantContactInfo {
  /** Phone number */
  phone?: string;
  /** Email address */
  email?: string;
  /** Chat ID */
  chat_id?: string;
}

/**
 * Oncall participant
 */
export interface OncallParticipant {
  /** User ID */
  user_id: string;
  /** User name */
  user_name: string;
  /** Contact information */
  contact_info?: ParticipantContactInfo;
  /** Priority */
  priority?: number;
}

/**
 * Oncall schedule configuration
 */
export interface OncallScheduleConfig {
  /** Rotation interval (in hours) */
  rotation_interval?: number;
  /** Start time */
  start_time?: string;
  /** End time */
  end_time?: string;
  /** Timezone */
  timezone?: string;
  /** Workdays (0=Sunday, 6=Saturday) */
  weekdays?: number[];
}

// Note: ScheduleConfig is defined in event-center module
// Use OncallScheduleConfig directly for oncall-specific scheduling

/**
 * Escalation level
 */
export interface EscalationLevel {
  /** Level */
  level?: number;
  /** Participants */
  participants?: string[];
  /** Timeout duration */
  timeout?: number;
}

/**
 * Escalation policy
 */
export interface EscalationPolicy {
  /** Whether escalation is enabled */
  enabled?: boolean;
  /** Escalation timeout (in minutes) */
  escalation_timeout?: number;
  /** Escalation level configurations */
  escalation_levels?: EscalationLevel[];
}

/**
 * Oncall schedule
 * Corresponds to API: OncallSchedule schema
 */
export interface OncallSchedule {
  /** Schedule ID */
  id?: string;
  /** Associated rule ID */
  rule_id: string;
  /** Schedule name */
  name: string;
  /** Schedule description */
  description?: string;
  /** Schedule type */
  schedule_type: ScheduleType;
  /** List of oncall participants */
  participants: OncallParticipant[];
  /** Schedule configuration */
  schedule_config: OncallScheduleConfig;
  /** Escalation policy */
  escalation_policy?: EscalationPolicy;
  /** Whether the schedule is active */
  is_active?: boolean;
  /** Effective start time */
  effective_start?: string;
  /** Effective end time */
  effective_end?: string;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
}

/**
 * Oncall schedule creation request
 * Corresponds to API: OncallScheduleCreateRequest schema
 */
export interface OncallScheduleCreateRequest {
  /** Schedule name */
  name: string;
  /** Schedule description */
  description?: string;
  /** Schedule type */
  schedule_type: ScheduleType;
  /** List of oncall participants */
  participants: OncallParticipant[];
  /** Schedule configuration */
  schedule_config: OncallScheduleConfig;
  /** Escalation policy */
  escalation_policy?: EscalationPolicy;
  /** Effective start time */
  effective_start?: string;
  /** Effective end time */
  effective_end?: string;
}

/**
 * Oncall schedule update request
 * Corresponds to API: OncallScheduleUpdateRequest schema
 */
export interface OncallScheduleUpdateRequest {
  /** Schedule name */
  name?: string;
  /** Schedule description */
  description?: string;
  /** List of oncall participants */
  participants?: OncallParticipant[];
  /** Schedule configuration */
  schedule_config?: any; // ScheduleConfig type is not yet defined
  /** Escalation policy */
  escalation_policy?: EscalationPolicy;
  /** Whether the schedule is active */
  is_active?: boolean;
  /** Effective start time */
  effective_start?: string;
  /** Effective end time */
  effective_end?: string;
}

// ============================================================
// API request parameter types
// ============================================================

/**
 * Parameters for getting Oncall rule list
 */
export interface GetOncallRulesParams {
  /** Channel */
  channel: string;
  /** Bot ID */
  bot_id: string;
}

/**
 * Parameters for getting oncall schedule list
 */
export interface GetOncallSchedulesParams {
  /** Channel */
  channel: string;
  /** Bot ID */
  bot_id: string;
  /** Number of records to skip */
  skip?: number;
  /** Maximum number of records to return */
  limit?: number;
  /** Start time */
  start_time?: string;
  /** End time */
  end_time?: string;
}
