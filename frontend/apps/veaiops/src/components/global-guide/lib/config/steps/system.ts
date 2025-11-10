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
 * System configuration module guide step configuration
 * Includes: Bot management, card template management, account management, project management
 */
export const systemSteps: GlobalGuideStep[] = [
  // ========== System configuration module guide ==========
  {
    number: GlobalGuideStepNumber.BOT_MANAGEMENT,
    title: '群聊机器人管理',
    description: '点击配置群聊机器人，管理Bot配置和群组',
    route: '/system/bot-management',
    icon: 'IconRobot',
    frontendFeatures: [
      {
        id: 'new-bot',
        name: '新增Bot',
        description: '创建新的群聊机器人',
        selector: '[data-testid="new-bot-btn"]',
        tooltipContent: '点击此处创建新的群聊机器人✨',
        actionType: 'navigation',
      },
      {
        id: 'edit-bot',
        name: '编辑Bot',
        description: '修改现有Bot配置',
        selector: '[data-testid="edit-bot-btn"]',
        tooltipContent:
          '请先在列表中选择一条Bot记录，然后点击此处的编辑按钮进行修改🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
      {
        id: 'delete-bot',
        name: '删除Bot',
        description: '删除不需要的Bot',
        selector: '[data-testid="delete-bot-btn"]',
        tooltipContent: '请先在列表中选择一条Bot记录，然后点击此处的删除按钮🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
      {
        id: 'view-bot-attributes',
        name: '特别关注',
        description: '查看Bot的详细属性配置',
        selector: '[data-testid="view-bot-attributes-btn"]',
        tooltipContent:
          '请先在列表中选择一条Bot记录，然后点击此处查看Bot属性🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
      {
        id: 'group-management',
        name: '群管理',
        description: '管理Bot关联的群组',
        selector: '[data-testid="group-management-btn"]',
        tooltipContent: '请先在列表中选择一条Bot记录，然后点击此处管理群组🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
    ],
    completionCriteria: [
      'Bot配置完整',
      'App ID和Open ID配置正确',
      '群组关联成功',
    ],
    commonIssues: [
      {
        issue: 'App ID无效',
        solution: '检查飞书开放平台的App ID配置是否正确',
        action: '检查配置',
      },
      {
        issue: 'Open ID获取失败',
        solution: '确认Bot已正确安装到群组',
        action: '重新安装',
      },
      {
        issue: '群组无法关联',
        solution: '确认Bot权限和群组权限配置',
        action: '检查权限',
      },
    ],
  },
  {
    number: GlobalGuideStepNumber.CARD_TEMPLATE,
    title: '卡片模版管理',
    description: '点击配置消息卡片模版，用于ChatOps消息展示',
    route: '/system/card-template',
    icon: 'IconCard',
    frontendFeatures: [
      {
        id: 'new-card-template',
        name: '新增卡片模版',
        description: '创建新的消息卡片模版',
        selector: '[data-testid="new-card-template-btn"]',
        tooltipContent: '点击此处创建新的卡片模版✨',
        actionType: 'navigation',
      },
      {
        id: 'edit-card-template',
        name: '编辑卡片模版',
        description: '修改现有卡片模版配置',
        selector: '[data-testid="edit-card-template-btn"]',
        tooltipContent:
          '请先在列表中选择一条模版记录，然后点击此处的编辑按钮进行修改🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
      {
        id: 'delete-card-template',
        name: '删除卡片模版',
        description: '删除不需要的卡片模版',
        selector: '[data-testid="delete-card-template-btn"]',
        tooltipContent:
          '请先在列表中选择一条模版记录，然后点击此处的删除按钮🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
    ],
    completionCriteria: ['模版配置完整', '模版格式验证通过', '可用于消息展示'],
    commonIssues: [
      {
        issue: '模版格式错误',
        solution: '检查模版JSON格式是否符合飞书卡片规范',
        action: '修复格式',
      },
      {
        issue: '字段映射缺失',
        solution: '补充必要的字段映射关系',
        action: '完善映射',
      },
    ],
  },
  {
    number: GlobalGuideStepNumber.ACCOUNT,
    title: '账号管理',
    description: '点击管理系统账号，管理用户权限和角色',
    route: '/system/account',
    icon: 'IconUser',
    frontendFeatures: [
      {
        id: 'new-account',
        name: '新增账号',
        description: '创建新的系统账号',
        selector: '[data-testid="new-account-btn"]',
        tooltipContent: '点击此处创建新的系统账号✨',
        actionType: 'navigation',
      },
      {
        id: 'delete-account',
        name: '删除账号',
        description: '删除不需要的账号',
        selector: '[data-testid="delete-account-btn"]',
        tooltipContent:
          '请先在列表中选择一条账号记录，然后点击此处的删除按钮🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
    ],
    completionCriteria: ['账号信息完整', '权限角色配置正确', '账号状态正常'],
    commonIssues: [
      {
        issue: '权限不足',
        solution: '确认当前账号具有管理员权限',
        action: '检查权限',
      },
      {
        issue: '账号状态异常',
        solution: '检查账号的激活状态和锁定状态',
        action: '更新状态',
      },
    ],
  },
  {
    number: GlobalGuideStepNumber.PROJECT,
    title: '项目管理',
    description: '点击管理项目配置，导入和管理项目信息',
    route: '/system/project',
    icon: 'IconFolder',
    frontendFeatures: [
      {
        id: 'new-project',
        name: '新建项目',
        description: '创建新的项目配置',
        selector: '[data-testid="new-project-btn"]',
        tooltipContent: '点击此处创建新的项目配置✨',
        actionType: 'navigation',
      },
      {
        id: 'import-project',
        name: '导入项目',
        description: '批量导入项目配置',
        selector: '[data-testid="import-project-btn"]',
        tooltipContent: '点击此处批量导入项目配置✨',
        actionType: 'navigation',
      },
      {
        id: 'delete-project',
        name: '删除项目',
        description: '删除不需要的项目',
        selector: '[data-testid="delete-project-btn"]',
        tooltipContent:
          '请先在列表中选择一条项目记录，然后点击此处的删除按钮🌟',
        actionType: 'navigation',
        allowDisabled: true,
      },
    ],
    completionCriteria: ['项目信息完整', '项目状态正常', '项目配置可用'],
    commonIssues: [
      {
        issue: '项目导入失败',
        solution: '检查导入文件的格式和必填字段',
        action: '检查文件',
      },
      {
        issue: '项目ID冲突',
        solution: '确认项目ID的唯一性',
        action: '修改ID',
      },
    ],
  },
];
