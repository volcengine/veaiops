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

import type { ChannelOption, ComparisonOperator } from '../types/rules';

// Comparison operator options
export const COMPARISON_OPERATORS: ComparisonOperator[] = [
  { label: '大于 (>)', value: 'gt' },
  { label: '大于等于 (>=)', value: 'gte' },
  { label: '小于 (<)', value: 'lt' },
  { label: '小于等于 (<=)', value: 'lte' },
  { label: '等于 (=)', value: 'eq' },
  { label: '不等于 (!=)', value: 'ne' },
];

// Notification Channel options
export const CHANNEL_OPTIONS: ChannelOption[] = [
  { label: '飞书', value: 'lark' },
  { label: '钉钉', value: 'dingtalk' },
  { label: '微信', value: 'wechat' },
  { label: '邮件', value: 'email' },
  { label: '短信', value: 'sms' },
  { label: 'Webhook', value: 'webhook' },
];

/**
 * Get default configuration for threshold rules
 * Used as initial values when creating new rules
 */
export const DEFAULT_RULE_CONFIG = {
  threshold_config: {
    warning_threshold: 70,
    critical_threshold: 80,
    comparison_operator: 'gt' as const,
    evaluation_window: 300,
    evaluation_frequency: 60,
    recovery_threshold: 60,
  },
  notification_config: {
    channels: ['lark'],
    recipients: [],
    message_template: '告警：当前值 {{value}}，超过阈值 {{threshold}}',
    suppress_duration: 1800,
  },
  schedule_config: {
    enabled: true,
    active_hours: {
      start: '09:00',
      end: '18:00',
    },
    active_days: [1, 2, 3, 4, 5],
    timezone: 'Asia/Shanghai',
  },
  is_active: true,
  trigger_count: 0,
};

/**
 * Get default configuration for templates
 */
export const DEFAULT_TEMPLATE_CONFIG = {
  name: '',
  description: '',
  metric_query: '',
};

/**
 * Note: MOCK_TEMPLATES and MOCK_RULES have been removed
 * Please use the following Hooks to fetch data from real API:
 *
 * Template data:
 * import { useMetricTemplates } from '@/hooks/use-api-data';
 * const { data: templates, loading, error, refetch } = useMetricTemplates();
 *
 * Rule data (requires botId):
 * import { useInterestRules } from '@/hooks/use-api-data';
 * const { data: rules, loading, error, refetch } = useInterestRules(botId);
 */
