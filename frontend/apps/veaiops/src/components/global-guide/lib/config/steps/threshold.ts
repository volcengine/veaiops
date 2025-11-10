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
 * Intelligent threshold module guide step configuration
 * Includes: Intelligent threshold tasks
 */
export const thresholdSteps: GlobalGuideStep[] = [
  {
    number: GlobalGuideStepNumber.METRIC_CONFIG,
    title: '智能阈值任务',
    description:
      '点击创建/训练智能阈值任务，生成可对比的版本，查看阈值对比结果',
    route: '/threshold/config',
    icon: 'IconThunderbolt',
    frontendFeatures: [
      {
        id: 'new-task',
        name: '新建任务',
        description: '创建新的智能阈值任务',
        selector: '[data-testid="new-task-btn"]',
        tooltipContent: '点击这里可以创建新的智能阈值任务🌟',
        actionType: 'navigation', // Directly trigger new modal
        placement: 'bottom', // Arrow points downward
      },
      {
        id: 'batch-auto-update',
        name: '批量自动更新',
        description: '批量更新任务配置',
        selector: '[data-testid="batch-auto-update-btn"]',
        tooltipContent:
          '请先在列表中选择一条或多条任务记录，然后点击此处的批量更新按钮🌟',
        actionType: 'direct', // Directly trigger batch update modal
        allowDisabled: true, // Allow showing guide when button is disabled (prompt user to select task first)
        placement: 'bottom', // Arrow points downward
      },
      {
        id: 'view-task-details',
        name: '查看任务详情',
        description: '查看任务的详细信息',
        selector: '[data-testid="view-task-details-btn"]',
        tooltipContent: '请先在列表中选择一条任务记录，然后点击此处查看详情🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        allowDisabled: true, // Allow showing guide when button is disabled (prompt user to select task first)
      },
      {
        id: 'copy-task',
        name: '复制任务',
        description: '复制现有任务配置',
        selector: '[data-testid="copy-task-btn"]',
        tooltipContent:
          '请先在列表中选择一条任务记录，然后点击此处的复制按钮🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        allowDisabled: true, // Allow showing guide when button is disabled (prompt user to select task first)
      },
      {
        id: 'delete-task',
        name: '删除任务',
        description: '删除不需要的任务及其所有版本',
        selector: '[data-testid="delete-task-btn"]',
        tooltipContent:
          '请先在列表中选择一条任务记录，然后点击此处的删除按钮🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        allowDisabled: true, // Allow showing guide when button is disabled (prompt user to select task first)
      },
      {
        id: 'task-metric-template',
        name: '指标模板配置',
        description: '配置任务下的指标模板',
        selector: '[data-testid="view-task-metric-template-btn"]',
        tooltipContent: '点击此处配置指标模板🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        prerequisiteSteps: ['view-task-details'], // Prerequisite step: need to click view task details first
        allowDisabled: true, // Allow showing guide when button is disabled
      },
      {
        id: 're-execute-task',
        name: '任务重新执行',
        description: '重新执行任务',
        selector: '[data-testid="re-execute-task-btn"]',
        tooltipContent: '点击此处重新执行任务🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        prerequisiteSteps: ['view-task-details'], // Prerequisite step: need to click view task details first
        allowDisabled: true, // Allow showing guide when button is disabled (prompt user to select task first)
        placement: 'bottom', // Arrow points downward
      },
      {
        id: 'view-cleaning-result',
        name: '查看任务结果',
        description: '查看任务结果',
        selector: '[data-testid="view-task-result-btn"]',
        tooltipContent: '点击此处查看任务结果🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        prerequisiteSteps: ['view-task-details'], // Prerequisite step: need to click view task details first
        allowDisabled: true, // Allow showing guide when button is disabled
      },
      {
        id: 'create-alert-rule',
        name: '创建告警规则',
        description: '为任务创建告警规则',
        selector: '[data-testid="create-alert-rule-btn"]',
        tooltipContent: '点击此处创建告警规则🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        prerequisiteSteps: ['view-task-details'], // Prerequisite step: need to click view task details first
        allowDisabled: true, // Allow showing guide when button is disabled (prompt user to select task first)
        placement: 'bottom', // Arrow points downward
      },
      {
        id: 'view-time-series',
        name: '查看时序图',
        description: '查看指标时序图',
        selector: '[data-testid="view-time-series-btn"]',
        tooltipContent: '点击此处查看时序图🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        prerequisiteSteps: ['view-task-details', 'view-cleaning-result'], // Prerequisite steps: need to click view task details and view task result first
        allowDisabled: true, // Allow showing guide when button is disabled
      },
    ],
    completionCriteria: ['任务创建成功', '训练完成并生成结果', '版本管理可用'],
    commonIssues: [
      {
        issue: '训练失败',
        solution: '检查算法参数和数据质量，建议重跑',
        action: '重新训练',
      },
      {
        issue: '参数不合理',
        solution: '调整n_count、direction等关键参数',
        action: '调整参数',
      },
      {
        issue: '版本冲突',
        solution: '检查版本状态，必要时回滚到稳定版本',
        action: '版本管理',
      },
    ],
  },
];
