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
// Import lazy-loaded components and route paths from config
// Using ../config resolves to routes/config/index.ts, avoiding circular dependencies
import { THRESHOLD_ROUTES_PATH, ThresholdPages } from '../config';

/**
 * Intelligent threshold module route configuration
 */
export const thresholdRoutes: RouteConfig[] = [
  // Intelligent threshold task configuration
  {
    path: THRESHOLD_ROUTES_PATH.Config,
    element: React.createElement(ThresholdPages.Config),
    requireAuth: true,
  },
  // Metric template management
  {
    path: THRESHOLD_ROUTES_PATH.Template,
    element: React.createElement(ThresholdPages.Template),
    requireAuth: true,
  },
  // Subscription rules
  {
    path: THRESHOLD_ROUTES_PATH.Subscription,
    element: React.createElement(ThresholdPages.Subscription),
    requireAuth: true,
  },
  // Historical events
  {
    path: THRESHOLD_ROUTES_PATH.History,
    element: React.createElement(ThresholdPages.History),
    requireAuth: true,
  },
];
