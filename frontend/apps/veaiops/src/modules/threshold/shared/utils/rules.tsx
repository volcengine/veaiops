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

import { Badge, Typography } from '@arco-design/web-react';
import { CellRender } from '@veaiops/components';
import React from 'react';
import { CHANNEL_OPTIONS, COMPARISON_OPERATORS } from '../constants/rules';
import type { ThresholdConfig, ThresholdRule } from '../types/rules';

// Destructure CellRender component to avoid repeated calls
const { CustomOutlineTag } = CellRender;

const { Text } = Typography;

/**
 * Render notification Channel tags
 */
export const renderChannelTags = (channels: string[]) => {
  return channels.map((channel) => {
    const option = CHANNEL_OPTIONS.find((opt) => opt.value === channel);
    return (
      <CustomOutlineTag key={channel}>
        {option?.label || channel}
      </CustomOutlineTag>
    );
  });
};

/**
 * Render threshold configuration information
 */
export const renderThresholdConfig = (config: ThresholdConfig) => {
  const operator = COMPARISON_OPERATORS.find(
    (op) => op.value === config.comparison_operator,
  );

  return (
    <div>
      <div>
        <Text type="warning">警告: {config.warning_threshold}</Text>
        <Text style={{ margin: '0 8px' }}>
          {operator?.label || config.comparison_operator}
        </Text>
      </div>
      <div>
        <Text type="error">严重: {config.critical_threshold}</Text>
        <Text style={{ margin: '0 8px' }}>
          {operator?.label || config.comparison_operator}
        </Text>
      </div>
      <div>
        <Text type="secondary">
          评估窗口: {config.evaluation_window}s | 频率:{' '}
          {config.evaluation_frequency}s
        </Text>
      </div>
      {config.recovery_threshold && (
        <div>
          <Text type="success">恢复阈值: {config.recovery_threshold}</Text>
        </div>
      )}
    </div>
  );
};

/**
 * Render rule status
 */
export const renderRuleStatus = (rule: ThresholdRule) => {
  if (!rule.is_active) {
    return <Badge status="default" text="已禁用" />;
  }

  if (rule.last_triggered_at) {
    const lastTriggered = new Date(rule.last_triggered_at);
    const now = new Date();
    const diffHours =
      (now.getTime() - lastTriggered.getTime()) / (1000 * 60 * 60);

    if (diffHours < 1) {
      return <Badge status="error" text="最近告警" />;
    } else if (diffHours < 24) {
      return <Badge status="warning" text="今日告警" />;
    }
  }

  return <Badge status="success" text="正常运行" />;
};

/**
 * Format relative time
 */
export const formatRelativeTime = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return '刚刚';
  } else if (diffMinutes < 60) {
    return `${diffMinutes}分钟前`;
  } else if (diffHours < 24) {
    return `${diffHours}小时前`;
  } else {
    return `${diffDays}天前`;
  }
};

/**
 * Get operator display text
 */
export const getOperatorLabel = (value: string) => {
  const operator = COMPARISON_OPERATORS.find((op) => op.value === value);
  return operator?.label || value;
};

/**
 * Get Channel display text
 */
export const getChannelLabel = (value: string) => {
  const channel = CHANNEL_OPTIONS.find((opt) => opt.value === value);
  return channel?.label || value;
};

/**
 * Validate rule configuration
 */
export const validateRuleConfig = (values: any) => {
  const errors: Record<string, string> = {};

  if (!values.name?.trim()) {
    errors.name = '请输入规则名称';
  }

  if (!values.template_id) {
    errors.template_id = '请选择监控模板';
  }

  if (!values.metric_query?.trim()) {
    errors.metric_query = '请输入指标查询语句';
  }

  if (values.warning_threshold >= values.critical_threshold) {
    errors.critical_threshold = '严重阈值必须大于警告阈值';
  }

  if (!values.channels?.length) {
    errors.channels = '请至少选择一个通知Channel';
  }

  if (!values.recipients?.length) {
    errors.recipients = '请至少添加一个通知接收人';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};
