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

import type {} from '../types/strategy';

/**
 * Event strategy related constants
 */

// Event type options
export const EVENT_TYPE_OPTIONS = [
  { label: '系统告警', value: 'system_alert' },
  { label: '应用异常', value: 'app_exception' },
  { label: '性能告警', value: 'performance_alert' },
  { label: '安全事件', value: 'security_event' },
  { label: '业务异常', value: 'business_exception' },
  { label: '基础设施告警', value: 'infrastructure_alert' },
];

// Priority options
export const PRIORITY_OPTIONS = [
  { label: '紧急', value: 'critical', color: 'red' },
  { label: '高', value: 'high', color: 'orange' },
  { label: '中', value: 'medium', color: 'blue' },
  { label: '低', value: 'low', color: 'gray' },
];

// Notification Channel options
export const EVENT_CHANNEL_OPTIONS = [
  { label: '飞书', value: 'lark' },
  { label: '钉钉', value: 'dingtalk' },
  { label: '微信', value: 'wechat' },
  { label: '邮件', value: 'email' },
  { label: '短信', value: 'sms' },
  { label: 'Webhook', value: 'webhook' },
];

// Weekday options
export const WEEKDAY_OPTIONS = [
  { label: '周一', value: 1 },
  { label: '周二', value: 2 },
  { label: '周三', value: 3 },
  { label: '周四', value: 4 },
  { label: '周五', value: 5 },
  { label: '周六', value: 6 },
  { label: '周日', value: 7 },
];

// Timezone options
export const TIMEZONE_OPTIONS = [
  { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
  { label: 'UTC', value: 'UTC' },
  { label: 'America/New_York', value: 'America/New_York' },
  { label: 'Europe/London', value: 'Europe/London' },
];

/**
 * Get default configuration for event strategy
 * Used as initial values when creating new strategy
 */
export const DEFAULT_STRATEGY_CONFIG = {
  event_types: ['system_alert'],
  priority_levels: ['critical', 'high'],
  notification_channels: ['lark'],
  escalation_rules: [
    {
      level: 1,
      delay_minutes: 0,
      channels: ['lark'],
      recipients: [],
    },
  ],
  throttling_config: {
    enabled: true,
    max_notifications_per_hour: 10,
    cooldown_minutes: 5,
  },
  schedule_config: {
    enabled: false,
    working_hours: { start: '09:00', end: '18:00' },
    working_days: [1, 2, 3, 4, 5],
    timezone: 'Asia/Shanghai',
  },
  is_active: true,
};

/**
 * Note: MOCK_STRATEGIES has been removed
 * Please use useInformStrategies Hook to fetch data from real API
 *
 * Usage example:
 * import { useInformStrategies } from '@/hooks/use-api-data';
 *
 * const { data: strategies, loading, error, refetch } = useInformStrategies();
 */
