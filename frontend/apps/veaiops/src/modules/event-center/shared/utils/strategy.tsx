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

import { Badge, Space } from '@arco-design/web-react';
import { CellRender } from '@veaiops/components';
import React from 'react';
import {
  EVENT_CHANNEL_OPTIONS,
  EVENT_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
} from '../constants/strategy';
import type { EventStrategy, StrategyFormData } from '../types/strategy';

// Destructure CellRender components to avoid repeated calls
const { CustomOutlineTag } = CellRender;

/**
 * Event strategy related utility functions
 */

/**
 * Render priority tags
 */
export const renderPriorityTags = (priorities: string[]) => {
  return (
    <Space wrap>
      {priorities.map((priority) => {
        const option = PRIORITY_OPTIONS.find((opt) => opt.value === priority);
        return (
          <CustomOutlineTag key={priority}>
            {option?.label || priority}
          </CustomOutlineTag>
        );
      })}
    </Space>
  );
};

/**
 * Render notification Channel tags
 */
export const renderEventChannelTags = (channels: string[]) => {
  return (
    <Space wrap>
      {channels.map((channel) => {
        const option = EVENT_CHANNEL_OPTIONS.find(
          (opt) => opt.value === channel,
        );
        return (
          <CustomOutlineTag key={channel}>
            {option?.label || channel}
          </CustomOutlineTag>
        );
      })}
    </Space>
  );
};

/**
 * Render event type tags
 */
export const renderEventTypeTags = (eventTypes: string[]) => {
  return (
    <Space wrap>
      {eventTypes.map((type) => {
        const option = EVENT_TYPE_OPTIONS.find((opt) => opt.value === type);
        return (
          <CustomOutlineTag key={type}>
            {option?.label || type}
          </CustomOutlineTag>
        );
      })}
    </Space>
  );
};

/**
 * Render status badge
 */
export const renderStatusBadge = (isActive: boolean) => {
  return (
    <Badge
      status={isActive ? 'success' : 'default'}
      text={isActive ? '启用' : '禁用'}
    />
  );
};

/**
 * Render escalation rules summary
 */
export const renderEscalationSummary = (
  escalationRules: Record<string, unknown>[],
) => {
  if (!escalationRules || escalationRules.length === 0) {
    return <span className="text-gray-400">无升级规则</span>;
  }

  return (
    <div>
      <div className="text-xs text-gray-500">
        {escalationRules.length} 级升级规则
      </div>
      <div className="text-xs text-gray-400">
        延迟:{' '}
        {escalationRules.map((rule) => `${rule.delay_minutes}分钟`).join(' → ')}
      </div>
    </div>
  );
};

/**
 * Render throttling configuration summary
 */
export const renderThrottlingSummary = (
  throttlingConfig: Record<string, unknown>,
) => {
  if (!throttlingConfig?.enabled) {
    return <span className="text-gray-400">未启用限流</span>;
  }

  return (
    <div className="text-xs">
      <div>
        每小时最多 {throttlingConfig.max_notifications_per_hour as number} 次
      </div>
      <div className="text-gray-500">
        冷却时间 {throttlingConfig.cooldown_minutes as number} 分钟
      </div>
    </div>
  );
};

/**
 * Render schedule configuration summary
 */
export const renderScheduleSummary = (
  scheduleConfig?: Record<string, unknown>,
) => {
  if (!scheduleConfig?.enabled) {
    return <span className="text-gray-400">24小时监控</span>;
  }

  const workingDays = (scheduleConfig.working_days as number[]) || [];
  const dayNames = ['', '周一', '周二', '周三', '周四', '周五', '周六', '周日'];
  const workingDayNames = workingDays
    .map((day: number) => dayNames[day])
    .join('、');

  const workingHours = scheduleConfig.working_hours as
    | { start?: string; end?: string }
    | undefined;

  return (
    <div className="text-xs">
      <div>
        {workingHours?.start} - {workingHours?.end}
      </div>
      <div className="text-gray-500">{workingDayNames}</div>
    </div>
  );
};

/**
 * Validate strategy form data
 */
export const validateStrategyForm = (values: StrategyFormData) => {
  const errors: Record<string, string> = {};

  if (!values.name?.trim()) {
    errors.name = '请输入策略名称';
  }

  if (!values.event_types || values.event_types.length === 0) {
    errors.event_types = '请选择至少一个事件类型';
  }

  if (!values.priority_levels || values.priority_levels.length === 0) {
    errors.priority_levels = '请选择至少一个优先级';
  }

  if (
    !values.notification_channels ||
    values.notification_channels.length === 0
  ) {
    errors.notification_channels = '请选择至少一个通知Channel';
  }

  if (!values.escalation_rules || values.escalation_rules.length === 0) {
    errors.escalation_rules = '请配置至少一个升级规则';
  }

  // Validate escalation rules
  if (values.escalation_rules) {
    values.escalation_rules.forEach((rule, index) => {
      if (!rule.channels || rule.channels.length === 0) {
        errors[`escalation_rules.${index}.channels`] = `第${
          index + 1
        }级升级规则必须选择通知Channel`;
      }
      if (!rule.recipients || rule.recipients.length === 0) {
        errors[`escalation_rules.${index}.recipients`] = `第${
          index + 1
        }级升级规则必须添加接收人`;
      }
    });
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

/**
 * Generate strategy summary text
 */
export const generateStrategySummary = (strategy: EventStrategy) => {
  const chatCount = strategy.chat_ids?.length || 0;
  const channelType = strategy.channel || '未知';
  const status = strategy.is_active ? '启用' : '禁用';

  return `通过 ${channelType} 企业协同工具向 ${chatCount} 个群组发送通知，当前状态：${status}`;
};
