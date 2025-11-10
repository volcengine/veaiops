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
 * Layout configuration
 */
export const layoutConfig = {
  // Sidebar configuration
  sidebar: {
    collapsedWidth: 'w-16', // 64px
    expandedWidth: 'w-60', // 240px
    transitionDuration: 'duration-300',
    background: 'bg-white/5',
    backdropFilter: 'backdrop-blur-sm',
    borderRight: 'border-r border-white/10',
    shadow:
      'shadow-[0_2px_8px_0_rgba(0,0,0,0.1),0_0_0_1px_rgba(255,255,255,0.05)]',
  },

  // Header configuration
  header: {
    backgroundColor: 'bg-surface',
    borderColor: 'border-b border-border',
    height: 'h-auto',
    padding: 'px-6 py-4',
  },

  // Main content configuration
  main: {
    backgroundColor: 'bg-background',
    padding: 'p-6',
  },

  // Logo configuration
  logo: {
    gradient: 'bg-gradient-to-br from-primary to-secondary',
    sidebar: {
      size: 'w-8 h-8',
      iconSize: 'w-5 h-5',
    },
    header: {
      size: 'w-10 h-10',
      iconSize: 'w-6 h-6',
    },
  },

  // Icon size configuration
  icons: {
    sidebarMenu: 'w-5 h-5',
    sidebarToggle: 'w-5 h-5',
    search: 'w-4 h-4',
    notification: 'w-5 h-5',
    plus: 'w-4 h-4',
    card: 'w-5 h-5',
  },

  // Navigation configuration
  navigation: {
    activeClass: 'text-primary font-medium border-b-2 border-primary pb-1',
    inactiveClass:
      'text-textSecondary hover:text-text transition-colors border-b-2 border-transparent hover:border-primary pb-1',
  },

  // Search configuration
  search: {
    width: 'w-80',
    background: 'bg-surfaceLight',
    border: 'border border-border',
    placeholder: 'placeholder-textSecondary',
  },

  // Notification configuration
  notification: {
    background: 'bg-surfaceLight',
    border: 'border border-border',
    badge: 'bg-error text-white text-xs',
  },

  // User configuration
  user: {
    avatar: 'bg-primary rounded-full',
    size: 'w-8 h-8',
  },
} as const;

/**
 * Module configuration
 */
export const moduleConfig = {
  // Module default path mapping
  defaultPaths: {
    statistics: '/statistics/overview',
    timeseries: '/timeseries/config',
    threshold: '/threshold/config',
    oncall: '/oncall/config',
    'event-center': '/event-center/strategy',
    system: '/system/datasource',
  },

  // Navigation items configuration
  navItems: [
    { key: 'statistics', label: '用量统计' },
    { key: 'timeseries', label: '时序异常' },
    { key: 'threshold', label: '智能阈值' },
    { key: 'oncall', label: 'Oncall异动' },
    { key: 'event-center', label: '事件中心' },
    { key: 'system', label: '系统配置' },
  ],
} as const;
