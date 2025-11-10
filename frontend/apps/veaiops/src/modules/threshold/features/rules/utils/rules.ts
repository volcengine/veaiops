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

import type { RuleFormData, ThresholdRule } from '../types/rules';

/**
 * Validate rule configuration
 */
export const validateRuleConfig = (
  config: RuleFormData,
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!config.name?.trim()) {
    errors.name = '规则名称不能为空';
  }

  if (!config.metric?.trim()) {
    errors.metric = '指标名称不能为空';
  }

  if (config.threshold === undefined || config.threshold === null) {
    errors.threshold = '阈值不能为空';
  }

  if (
    config.threshold_config.warning_threshold >=
    config.threshold_config.critical_threshold
  ) {
    errors.threshold_config = '警告阈值必须小于严重阈值';
  }

  if (!config.notification_config.channels?.length) {
    errors.channels = '至少选择一个通知Channel';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Format rule data for display
 */
export const formatRuleForDisplay = (rule: ThresholdRule): ThresholdRule => {
  return {
    ...rule,
    created_at: rule.created_at
      ? new Date(rule.created_at).toLocaleString()
      : '',
    updated_at: rule.updated_at
      ? new Date(rule.updated_at).toLocaleString()
      : '',
  };
};

/**
 * Check if rule is in active state
 */
export const isRuleActive = (rule: ThresholdRule): boolean => {
  return rule.status === 'active' && rule.is_active !== false;
};

/**
 * Get rule priority color
 */
export const getRulePriorityColor = (priority: string): string => {
  const colorMap: Record<string, string> = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    critical: 'red',
  };
  return colorMap[priority] || 'gray';
};

/**
 * Get rule status color
 */
export const getRuleStatusColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    active: 'green',
    inactive: 'gray',
    paused: 'orange',
  };
  return colorMap[status] || 'gray';
};

/**
 * Render threshold configuration
 */
export const renderThresholdConfig = (config: any): string => {
  if (!config) {
    return '-';
  }

  return `警告: ${config.warning_threshold}, 严重: ${config.critical_threshold}, 操作符: ${config.comparison_operator}`;
};

/**
 * Render channel tags
 */
export const renderChannelTags = (channels: string[]): string => {
  if (!channels || !channels.length) {
    return '';
  }

  return channels.join(', ');
};

/**
 * Render rule status
 */
export const renderRuleStatus = (record: any): string => {
  if (!record) {
    return '-';
  }

  const status = record.status || 'inactive';
  const isActive = record.is_active !== false;

  if (!isActive) {
    return '已禁用';
  }

  switch (status) {
    case 'active':
      return '启用';
    case 'inactive':
      return '禁用';
    case 'paused':
      return '暂停';
    default:
      return status;
  }
};

// formatDateTime has been unified to @veaiops/utils package
