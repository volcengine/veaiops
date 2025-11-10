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
// Import directly from routes/config directory to avoid circular dependency through config/index.ts
// Using ../config will resolve to routes/config/index.ts, not through config/index.ts
import { StatisticsPages } from '../config';

/**
 * Statistics route configuration
 */
export const statisticsRoutes: RouteConfig[] = [
  {
    path: '/statistics/overview',
    element: React.createElement(StatisticsPages.Overview),
    title: '概览数据',
    requireAuth: true,
  },
];
