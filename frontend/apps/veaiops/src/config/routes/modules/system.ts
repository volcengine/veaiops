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
// Import lazy-loaded components and route paths from config
// Using ../config resolves to routes/config/index.ts, avoiding circular dependencies
import { SYSTEM_ROUTES_PATH, SystemPages } from '../config';

/**
 * System configuration module route configuration
 */
export const systemRoutes: RouteConfig[] = [
  // Default redirect to Bot management page
  {
    path: SYSTEM_ROUTES_PATH.Root,
    element: React.createElement(() => {
      const location = useLocation();
      const targetUrl = `${SYSTEM_ROUTES_PATH.BotManagement}${location.search}`;

      return React.createElement(Navigate, {
        to: targetUrl,
        replace: true,
      });
    }),
    requireAuth: true,
  },
  {
    path: SYSTEM_ROUTES_PATH.BotManagement,
    element: React.createElement(SystemPages.BotManagement),
    title: '群聊机器人管理',
    requireAuth: true,
  },
  {
    path: SYSTEM_ROUTES_PATH.CardTemplate,
    element: React.createElement(SystemPages.CardTemplate),
    title: '卡片模版管理',
    icon: 'IconCard',
    requireAuth: true,
  },
  {
    path: SYSTEM_ROUTES_PATH.Account,
    element: React.createElement(SystemPages.Account),
    title: '账号管理',
    requireAuth: true,
  },
  {
    path: SYSTEM_ROUTES_PATH.Monitor,
    element: React.createElement(SystemPages.Monitor),
    title: '监控数据源管理',
    requireAuth: true,
  },
  {
    path: SYSTEM_ROUTES_PATH.Project,
    element: React.createElement(SystemPages.Project),
    title: '项目管理',
    requireAuth: true,
  },
];
