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

import { GlobalGuideStepNumber } from '../../../enums/guide-steps.enum';
import type { GlobalGuideStep } from '../../types';

/**
 * Oncall anomaly module guide step configuration
 * Includes: Oncall anomaly configuration, Oncall anomaly rules, Oncall anomaly history
 */
export const oncallSteps: GlobalGuideStep[] = [
  // ========== Oncall anomaly module guide ==========
  {
    number: GlobalGuideStepNumber.ONCALL_CONFIG,
    title: 'Oncall异动配置',
    description: '点击配置Oncall异动规则，管理值班规则和通知策略',
    route: '/oncall/config',
    icon: 'IconSettings',
    frontendFeatures: [
      {
        id: 'edit-oncall-rule',
        name: '编辑规则',
        description: '修改现有规则配置',
        selector: '[data-testid="edit-oncall-rule-btn"]',
        tooltipContent:
          '请先在列表中选择一条规则记录，然后点击此处的编辑按钮进行修改🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
      {
        id: 'toggle-oncall-rule',
        name: '启用/停用规则',
        description: '启用或停用规则',
        selector: '[data-testid="toggle-oncall-rule-btn"]',
        tooltipContent: '点击此处可以启用或停用规则🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
      {
        id: 'view-oncall-rule-details',
        name: '查看规则详情',
        description: '查看规则的详细配置',
        selector: '[data-testid="view-oncall-rule-details-btn"]',
        tooltipContent: '请先在列表中选择一条规则记录，然后点击此处查看详情🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
      {
        id: 'new-oncall-rule',
        name: '新建规则',
        description: '通过编辑现有规则或联系管理员创建新的Oncall异动规则',
        selector: '[data-testid="oncall-config-table"]',
        tooltipContent: '提示：新建规则功能可通过编辑空规则或联系管理员实现✨',
        actionType: 'direct',
      },
    ],
    completionCriteria: ['规则配置完整', '消息卡片通知策略设置正确', '规则状态正常'],
    commonIssues: [
      {
        issue: '规则匹配失败',
        solution: '检查规则的匹配条件和时间窗口配置',
        action: '检查配置',
      },
      {
        issue: '通知发送失败',
        solution: '确认通知渠道和Bot配置正确',
        action: '检查渠道',
      },
    ],
  },
  {
    number: GlobalGuideStepNumber.ONCALL_RULES,
    title: 'Oncall异动规则',
    description: '点击查看和管理Oncall异动规则列表',
    route: '/oncall/rules',
    icon: 'IconList',
    frontendFeatures: [
      {
        id: 'view-oncall-rules-list',
        name: '查看规则列表',
        description: '查看所有Oncall异动规则',
        selector: '[data-testid="oncall-rules-table"]',
        tooltipContent: '此处显示所有Oncall异动规则列表🌟',
        actionType: 'direct',
      },
      {
        id: 'filter-oncall-rules',
        name: '筛选规则',
        description: '根据条件筛选规则',
        selector:
          '[data-testid="oncall-rules-table"] .filters-container, [data-testid="oncall-rules-table"] .arco-space',
        tooltipContent: '使用筛选器可以快速查找目标规则🌟',
        actionType: 'direct',
      },
    ],
    completionCriteria: ['规则列表正常显示', '筛选功能可用'],
    commonIssues: [
      {
        issue: '规则列表为空',
        solution: '确认是否已创建规则或检查筛选条件',
        action: '检查筛选',
      },
      {
        issue: '规则加载失败',
        solution: '检查网络连接和API权限',
        action: '刷新重试',
      },
    ],
  },
  {
    number: GlobalGuideStepNumber.ONCALL_HISTORY,
    title: 'Oncall异动历史',
    description: '点击查看Oncall异动历史记录和统计',
    route: '/oncall/history',
    icon: 'IconClockCircle',
    frontendFeatures: [
      {
        id: 'view-oncall-history',
        name: '查看历史记录',
        description: '查看历史异动记录',
        selector: '[data-testid="oncall-history-table"]',
        tooltipContent: '此处显示所有Oncall异动历史记录🌟',
        actionType: 'direct',
      },
      {
        id: 'filter-oncall-history',
        name: '筛选历史',
        description: '根据时间范围和条件筛选历史记录',
        selector:
          '[data-testid="oncall-history-table"] .filters-container, [data-testid="oncall-history-table"] .arco-space',
        tooltipContent: '使用筛选器可以快速查找目标历史记录🌟',
        actionType: 'direct',
      },
      {
        id: 'export-oncall-history',
        name: '导出历史',
        description: '导出历史记录数据',
        selector: '[data-testid="export-oncall-history-btn"]',
        tooltipContent: '点击此处可以导出历史记录数据✨',
        actionType: 'navigation',
      },
    ],
    completionCriteria: [
      '历史记录正常显示',
      '时间筛选功能可用',
      '数据导出正常',
    ],
    commonIssues: [
      {
        issue: '历史记录为空',
        solution: '确认时间范围选择是否正确',
        action: '调整时间范围',
      },
      {
        issue: '导出失败',
        solution: '检查导出文件格式和权限',
        action: '检查权限',
      },
    ],
  },
];
