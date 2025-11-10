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
 * Intelligent threshold rule related constants
 */

// Channel options
export const CHANNEL_OPTIONS = [
  { label: '钉钉', value: 'dingtalk' },
  { label: '飞书', value: 'lark' },
  { label: '企业微信', value: 'wechat' },
  { label: '邮件', value: 'email' },
  { label: 'Webhook', value: 'webhook' },
];

// Comparison operators
export const COMPARISON_OPERATORS = [
  { label: '大于', value: '>' },
  { label: '大于等于', value: '>=' },
  { label: '小于', value: '<' },
  { label: '小于等于', value: '<=' },
  { label: '等于', value: '==' },
  { label: '不等于', value: '!=' },
];

// Aggregation functions
export const AGGREGATION_FUNCTIONS = [
  { label: '平均值', value: 'avg' },
  { label: '最大值', value: 'max' },
  { label: '最小值', value: 'min' },
  { label: '求和', value: 'sum' },
  { label: '计数', value: 'count' },
];

// Time window options
export const TIME_WINDOW_OPTIONS = [
  { label: '1分钟', value: '1m' },
  { label: '5分钟', value: '5m' },
  { label: '10分钟', value: '10m' },
  { label: '30分钟', value: '30m' },
  { label: '1小时', value: '1h' },
  { label: '6小时', value: '6h' },
  { label: '12小时', value: '12h' },
  { label: '24小时', value: '24h' },
];

// Rule status
export const RULE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PAUSED: 'paused',
};

// Rule status labels
export const RULE_STATUS_LABELS = {
  [RULE_STATUS.ACTIVE]: '启用',
  [RULE_STATUS.INACTIVE]: '禁用',
  [RULE_STATUS.PAUSED]: '暂停',
};

// Rule priority
export const RULE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// Rule priority labels
export const RULE_PRIORITY_LABELS = {
  [RULE_PRIORITY.LOW]: '低',
  [RULE_PRIORITY.MEDIUM]: '中',
  [RULE_PRIORITY.HIGH]: '高',
  [RULE_PRIORITY.CRITICAL]: '紧急',
};

// Default rule configuration
export const DEFAULT_RULE_CONFIG = {
  name: '',
  description: '',
  metric: '',
  operator: '>',
  threshold: 0,
  aggregation: 'avg',
  timeWindow: '5m',
  status: RULE_STATUS.ACTIVE,
  priority: RULE_PRIORITY.MEDIUM,
  channels: [],
  threshold_config: {
    warning_threshold: 70,
    critical_threshold: 90,
    comparison_operator: '>',
  },
  notification_config: {
    channels: [],
    recipients: [],
    suppress_duration: 300,
  },
};
