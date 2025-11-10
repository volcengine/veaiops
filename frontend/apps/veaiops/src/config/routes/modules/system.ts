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

import type { RouteConfig } from '@/types/route';
import { Navigate, useLocation } from '@modern-js/runtime/router';
import React from 'react';
// Import directly from routes/config directory to avoid circular dependency through config/index.ts
// Using ../config will resolve to routes/config/index.ts, not through config/index.ts
import { SystemPages } from '../config';

/**
 * System configuration module route configuration
 */
export const systemRoutes: RouteConfig[] = [
  // System module defaults to redirect to Bot management page
  {
    path: '/system',
    element: React.createElement(() => {
      const location = useLocation();
      const targetUrl = `/system/bot-management${location.search}`;

      return React.createElement(Navigate, {
        to: targetUrl,
        replace: true,
      });
    }),
    requireAuth: true,
  },
  {
    path: '/system/bot-management',
    element: React.createElement(SystemPages.BotManagement),
    title: '群聊机器人管理',
    requireAuth: true,
  },
  {
    path: '/system/card-template',
    element: React.createElement(SystemPages.CardTemplate),
    title: '卡片模版管理',
    icon: 'IconCard',
    requireAuth: true,
  },
  {
    path: '/system/account',
    element: React.createElement(SystemPages.Account),
    title: '账号管理',
    requireAuth: true,
  },
  {
    path: '/system/datasource',
    element: React.createElement(SystemPages.Monitor),
    title: '监控数据源管理',
    requireAuth: true,
  },
  {
    path: '/system/project',
    element: React.createElement(SystemPages.Project),
    title: '项目管理',
    requireAuth: true,
  },
];
