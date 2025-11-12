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
import React from 'react';
import { OncallPages, ROUTES_PATH_CONFIG } from '../config';

/**
 * Oncall module route configuration
 */
export const oncallRoutes: RouteConfig[] = [
  {
    path: ROUTES_PATH_CONFIG.oncall.Config,
    element: React.createElement(OncallPages.Config),
    title: 'Oncall异动配置',
    requireAuth: true,
  },
  {
    path: ROUTES_PATH_CONFIG.oncall.Rules,
    element: React.createElement(OncallPages.Rules),
    title: 'Oncall异动规则',
    requireAuth: true,
  },
  {
    path: ROUTES_PATH_CONFIG.oncall.History,
    element: React.createElement(OncallPages.History),
    title: 'Oncall异动历史',
    requireAuth: true,
  },
  // Note: Statistics route removed - path not defined in ROUTES_PATH_CONFIG
  // TODO: Add Statistics route after creating the page and defining the path
];
