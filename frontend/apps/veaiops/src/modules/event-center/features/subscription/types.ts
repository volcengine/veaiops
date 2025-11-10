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
 * Event Center subscription rule related type definitions
 */

export interface SubscriptionRule {
  id: string;
  name: string;
  description?: string;
  event_types: string[];
  filter_conditions: FilterCondition[];
  notification_config: SubscriptionNotificationConfig;
  enabled: boolean;
  priority: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface FilterCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'regex';
  value: string | number | boolean;
  logic_operator?: 'and' | 'or';
}

export interface SubscriptionNotificationConfig {
  channels: NotificationChannel[];
  template_id?: string;
  custom_template?: string;
  throttle_config?: ThrottleConfig;
}

export interface NotificationChannel {
  type: 'email' | 'sms' | 'webhook' | 'lark' | 'dingtalk';
  config: Record<string, any>;
  enabled: boolean;
}

export interface ThrottleConfig {
  enabled: boolean;
  interval: number; // seconds
  max_count: number;
}

export interface SubscriptionRuleTableData extends SubscriptionRule {
  key: string;
}

export interface SubscriptionRuleCreateRequest {
  name: string;
  description?: string;
  event_types: string[];
  filter_conditions: FilterCondition[];
  notification_config: SubscriptionNotificationConfig;
  enabled?: boolean;
  priority?: number;
}

export interface SubscriptionRuleUpdateRequest {
  name?: string;
  description?: string;
  event_types?: string[];
  filter_conditions?: FilterCondition[];
  notification_config?: SubscriptionNotificationConfig;
  enabled?: boolean;
  priority?: number;
}

export interface SubscriptionRuleQuery {
  name?: string;
  event_types?: string[];
  enabled?: boolean;
  current?: number;
  pageSize?: number;
}

/**
 * Subscription relation filter conditions interface
 */
export interface SubscriptionFilters {
  name?: string;
  agents?: string[];
  eventLevels?: string[];
  enableWebhook?: boolean;
  projects?: string[];
  statuses?: string[];
}
