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

export interface MenuItem {
  key: string;
  title: string;
  icon: string;
}

export interface MenuConfig {
  [module: string]: MenuItem[];
}

// Sidebar menu configuration - split by modules in the diagram, only keep 5 core modules
export const sidebarMenuConfig: MenuConfig = {
  // Usage statistics
  statistics: [{ key: 'overview', title: '用量统计概览', icon: 'bar-chart' }],
  // Intelligent threshold module
  threshold: [
    { key: 'template', title: '指标模版管理', icon: 'credit-card' },
    { key: 'config', title: '智能阈值任务配置', icon: 'settings' },
    { key: 'subscription', title: '事件订阅', icon: 'list' },
    { key: 'history', title: '历史事件', icon: 'push-history' },
  ],
  // Oncall anomaly module
  oncall: [
    { key: 'config', title: '配置管理', icon: 'settings' },
    { key: 'rules', title: '事件订阅', icon: 'list' },
    { key: 'history', title: '历史事件', icon: 'push-history' },
  ],
  // System configuration module
  system: [
    { key: 'bot-management', title: '群聊机器人管理', icon: 'robot' },
    { key: 'card-template', title: '卡片模版管理', icon: 'credit-card' },
    { key: 'datasource', title: '监控数据源管理', icon: 'database' },
    { key: 'project', title: '项目管理', icon: 'folder' },
    { key: 'account', title: '账号管理', icon: 'user' },
  ],
  // Event center module
  'event-center': [
    { key: 'strategy', title: '消息卡片通知策略', icon: 'bell' },
    { key: 'subscribe-relation', title: '事件订阅', icon: 'list' },
    { key: 'history', title: '历史事件', icon: 'push-history' },
  ],
};

/**
 * Get menu items for specified module
 * @param module Module name
 * @returns Array of menu items
 */
export const getMenuItems = (module: string): MenuItem[] => {
  return sidebarMenuConfig[module] || [];
};
