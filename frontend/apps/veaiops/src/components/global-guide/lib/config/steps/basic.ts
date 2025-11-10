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
 * Infrastructure module guide step configuration
 * Includes: Connection management, data source, metric template
 */
export const basicSteps: GlobalGuideStep[] = [
  {
    number: GlobalGuideStepNumber.CONNECTION,
    title: '连接管理',
    description: '点击配置监控数据源连接',
    route: '/system/datasource', // 🔥 Remove URL parameters, only navigate to page
    icon: 'IconLink',
    frontendFeatures: [
      {
        id: 'new-connection',
        name: '新建连接',
        description: '创建新的数据源连接',
        selector: '[data-testid="new-connection-btn"]', // New connection button, located in connection management drawer
        tooltipContent: '点击此处创建数据源连接✨',
        actionType: 'navigation', // Need to navigate to page, open connection management drawer and highlight
      },
      {
        id: 'edit-connection',
        name: '编辑连接',
        description: '修改现有连接配置',
        selector: '[data-testid="edit-connection-btn"]',
        tooltipContent:
          '请先在列表中选择一条连接记录，然后点击此处的编辑按钮进行修改🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        allowDisabled: true, // Allow showing guide when button is disabled (prompt user to select connection first)
      },
      {
        id: 'test-connection',
        name: '测试连接',
        description: '验证连接是否正常',
        selector: '[data-testid="test-connection-btn"]',
        tooltipContent:
          '请先在列表中选择一条连接记录，然后点击此处的测试按钮验证连接🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        allowDisabled: true, // Allow showing guide when button is disabled (prompt user to select connection first)
      },
      {
        id: 'delete-connection',
        name: '删除连接',
        description: '删除不需要的连接',
        selector: '[data-testid="delete-connection-btn"]',
        tooltipContent:
          '请先在列表中选择一条连接记录，然后点击此处的删除按钮🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
        allowDisabled: true, // Allow showing guide when button is disabled (prompt user to select connection first)
      },
    ],
    completionCriteria: [
      '连接健康检查通过',
      '权限校验成功',
      '可拉取项目/产品列表',
    ],
    commonIssues: [
      {
        issue: '连接超时',
        solution: '检查网络连接和Endpoint配置',
        action: '检查连接',
      },
      {
        issue: '凭据无效',
        solution: '验证AK/SK或Token的有效性',
        action: '更新凭据',
      },
      {
        issue: '权限不足',
        solution: '确认账号具有必要的监控权限',
        action: '检查权限',
      },
    ],
  },
  {
    number: GlobalGuideStepNumber.DATASOURCE,
    title: '数据源',
    description: '点击选择平台数据源，配置监控指标来源',
    route: '/system/datasource',
    icon: 'IconStorage',
    frontendFeatures: [
      {
        id: 'new-datasource',
        name: '新增数据源',
        description: '创建新的数据源配置',
        selector: '#new-datasource-btn',
        tooltipContent: '点击此按钮打开新增数据源向导🌟',
        actionType: 'direct', // 🔥 Only highlight, do not auto-trigger
      },
      {
        id: 'delete-datasource',
        name: '删除数据源',
        description: '删除不需要的数据源',
        selector: '[data-testid="delete-datasource-btn"]',
        tooltipContent: '点击此处可以删除数据源🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
      },
      {
        id: 'edit-datasource',
        name: '编辑数据源',
        description: '修改现有数据源配置',
        selector: '[data-testid="edit-datasource-btn"]',
        tooltipContent: '点击此处可以对数据源进行修改🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
      },
      {
        id: 'toggle-datasource',
        name: '开启/停用数据源',
        description: '启用或禁用数据源',
        selector: '[data-testid="toggle-datasource-btn"]',
        tooltipContent: '点击此处可以对数据源进行开启/停用🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
      },
    ],
    completionCriteria: [
      '数据源配置完整',
      '近30天空洞率低于阈值',
      '维度/实例可获取',
    ],
    commonIssues: [
      {
        issue: '无可用实例',
        solution: '检查namespace/sub_namespace配置或权限范围',
        action: '刷新重试',
      },
      {
        issue: '空洞率过高',
        solution: '调整时间窗口或变更维度组合',
        action: '调整参数',
      },
      {
        issue: '维度不匹配',
        solution: '检查维度字段映射关系',
        action: '修复映射',
      },
    ],
  },
  {
    number: GlobalGuideStepNumber.TEMPLATE,
    title: '指标配置',
    description: '点击配置指标模版阈值',
    route: '/threshold/template',
    icon: 'IconSettings',
    frontendFeatures: [
      {
        id: 'new-metric',
        name: '新增指标',
        description: '创建新的指标配置',
        selector: '[data-testid="new-metric-template-btn"]',
        tooltipContent: '点击这里可以新增指标配置🌟',
        actionType: 'navigation', // Directly trigger new modal
        placement: 'bottom', // Arrow points downward
      },
      {
        id: 'edit-metric',
        name: '编辑指标',
        description: '修改现有指标配置',
        selector: '[data-testid="edit-metric-template-btn"]',
        tooltipContent:
          '请先在列表中选择一条指标记录，然后点击此处的编辑按钮进行修改🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
      },
      {
        id: 'delete-metric',
        name: '删除指标',
        description: '删除不需要的指标',
        selector: '[data-testid="delete-metric-template-btn"]',
        tooltipContent:
          '请先在列表中选择一条指标记录，然后点击此处的删除按钮🌟',
        actionType: 'navigation', // Need to navigate to page and highlight
      },
    ],
    completionCriteria: [
      '模型选择/创建完成',
      '维度映射无缺失',
      '聚合约束满足',
      '指标配置有效',
      '近7/30天预览正常',
      '覆盖率/空洞率达标',
    ],
    commonIssues: [
      {
        issue: '维度映射缺失',
        solution: '补充必选维度的映射关系',
        action: '修复映射',
      },
      {
        issue: '聚合约束冲突',
        solution: '调整聚合方式或维度组合',
        action: '调整约束',
      },
      {
        issue: '模型模板不匹配',
        solution: '选择适合的模型模板或创建自定义模型',
        action: '选择模板',
      },
      {
        issue: '采样周期不稳',
        solution: '切换采样周期并即时刷新预览',
        action: '调整周期',
      },
      {
        issue: '维度过细导致噪声',
        solution: '建议聚合或过滤部分维度值',
        action: '优化维度',
      },
      {
        issue: '数据质量不达标',
        solution: '检查数据源质量和时间范围',
        action: '检查数据',
      },
    ],
  },
];
