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

// Static import route configuration (use explicit relative paths to avoid circular references)
import { baseRoutes, notFoundRoute } from './base';
import {
  eventCenterRoutes,
  oncallRoutes,
  statisticsRoutes,
  systemRoutes,
  thresholdRoutes,
} from './modules';

/**
 * Route configuration unified export entry
 *
 * Directory structure (grouped by functional boundaries):
 * - config/         Configuration layer: lazy-loaded component configuration, page path configuration
 * - base/           Base route layer: root path, login, 404, and other framework-level routes
 * - modules/        Module route layer: route definitions for each business module (system, threshold, event-center, oncall, statistics)
 * - utils/          Utility layer: route creation tools, type definitions, components, etc.
 *
 * Usage guidelines:
 * - Import routesConfig from top-level index.ts to get complete route configuration
 * - Import specific layer configurations from each subdirectory's index.ts (e.g., import lazy-loaded components from ./config)
 * - When adding new module routes, create corresponding file in modules/ directory and export in modules/index.ts
 *
 * ⚠️ Circular reference fix notes:
 * - All route module files (base-routes.ts, system.ts, etc.) must import lazy-loaded components from '../config'
 * - '../config' resolves to routes/config/index.ts, does not go through config/index.ts, avoiding circular references
 * - utils/route.ts must import directly from '../config/routes/index', cannot go through config/index.ts
 */
export const routesConfig: RouteConfig[] = [
  ...baseRoutes,
  ...statisticsRoutes, // Statistics overview
  ...systemRoutes, // System configuration
  ...oncallRoutes, // Oncall alerts
  ...thresholdRoutes, // Intelligent threshold
  ...eventCenterRoutes, // Event center
  notFoundRoute, // 404 fallback route - must be placed last
];
