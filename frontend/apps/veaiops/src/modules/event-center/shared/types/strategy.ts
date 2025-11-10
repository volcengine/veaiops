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
 * Event strategy related type definitions
 *
 * Optimization notes:
 * - EventStrategy extends InformStrategy, adds frontend display and compatibility fields
 * - If backend API returns these additional fields, should update OpenAPI Spec
 */

import type { InformStrategy } from 'api-generate';

/**
 * Event strategy extended type
 * Based on InformStrategy, adds frontend display and compatibility fields
 */
export interface EventStrategy extends InformStrategy {
  // Timestamp fields that backend may return (need to verify if should be in OpenAPI Spec)
  is_active?: boolean;
  created_user?: string;
  updated_user?: string;
  created_at?: string;
  updated_at?: string;
  escalation_rules?: EscalationRule[];

  // Frontend flattened fields (for display and compatibility)
  bot_id?: string;
  bot_name?: string;
  chat_ids?: string[];
  chat_names?: string[];
}

export interface EscalationRule {
  level: number;
  delay_minutes: number;
  channels: string[];
  recipients: string[];
}

export interface ThrottlingConfig {
  enabled: boolean;
  max_notifications_per_hour: number;
  cooldown_minutes: number;
}

export interface StrategyScheduleConfig {
  enabled: boolean;
  working_hours: {
    start: string;
    end: string;
  };
  working_days: number[];
  timezone: string;
}

export interface StrategyFormData {
  name: string;
  description: string;
  event_types: string[];
  priority_levels: string[];
  notification_channels: string[];
  escalation_rules: EscalationRule[];
  throttling_config: ThrottlingConfig;
  schedule_config?: StrategyScheduleConfig;
  is_active: boolean;
}

export interface StrategyTableColumn {
  title: string;
  dataIndex: string;
  key: string;
  width?: number;
  render?: (value: unknown, record: EventStrategy) => React.ReactNode;
  fixed?: 'left' | 'right';
}
