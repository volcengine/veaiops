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

import { lazy } from 'react';

/**
 * Lazy-loaded route component configuration
 *
 * Unified management of all lazy-loaded components for routes
 * Implements code splitting to improve first screen loading performance
 *
 * Note: Using React.lazy(() => import(...)) here is an allowed exception
 * - React.lazy is the official React-recommended code splitting approach
 * - Used for route-level lazy loading to improve first screen performance
 * - Type safety is guaranteed by React.lazy, no type issues
 * - This is a framework-level feature, not dynamic import in business code
 *
 * ⚠️ CRITICAL: Must use string literals, cannot use variables
 * - Webpack requires static analysis of import() paths, cannot handle variable expressions
 * - Using string literals eliminates "Critical dependency" warnings
 * - Cannot use PAGES_PATH_CONFIG because webpack needs compile-time static paths
 * - Example of INCORRECT usage:
 *   ❌ lazy(() => import(ONCALL_PAGES_PATH.Config))  // Webpack cannot analyze this
 * - Example of CORRECT usage:
 *   ✅ lazy(() => import('@/pages/oncall/config'))   // Webpack can analyze this
 *
 * Relationship with pages-path.config.ts:
 * - PAGES_PATH_CONFIG (import paths): Reference only, not used in code due to webpack limitation
 * - ROUTES_PATH_CONFIG (URL paths): Used in route modules, CAN use variables
 * - lazy.ts (import paths): Must use string literals, CANNOT use variables
 *
 * Usage guidelines:
 * - All route files must import lazy-loaded components from this file
 * - Page paths are defined in pages-path.config.ts (for documentation and type checking)
 * - Use string literals in this file, paths should match pages-path.config.ts
 * - Use path aliases (@/pages/*) instead of relative paths for maintainability
 * - When adding new pages: add path config in pages-path.config.ts first, then add lazy component here
 */

// System management module
export const SystemPages = {
  Monitor: lazy(() => import('@/pages/system/datasource')),
  Account: lazy(() => import('@/pages/system/account')),
  BotManagement: lazy(() => import('@/pages/system/bot')),
  Project: lazy(() => import('@/pages/system/project')),
  CardTemplate: lazy(() => import('@/pages/system/card-template')),
};

// Intelligent threshold module
export const ThresholdPages = {
  Config: lazy(() => import('@/pages/threshold/config')),
  History: lazy(() => import('@/pages/threshold/history')),
  Template: lazy(() => import('@/pages/threshold/template')),
  Subscription: lazy(() => import('@/pages/threshold/subscription')),
};

// Event center module
export const EventCenterPages = {
  History: lazy(() => import('@/pages/event-center/history')),
  Statistics: lazy(() => import('@/pages/event-center/statistics')),
  Strategy: lazy(() => import('@/pages/event-center/strategy')),
  SubscribeRelation: lazy(
    () => import('@/pages/event-center/subscribe-relation'),
  ),
};

// Oncall module
export const OncallPages = {
  Config: lazy(() => import('@/pages/oncall/config')),
  History: lazy(() => import('@/pages/oncall/history')),
  Rules: lazy(() => import('@/pages/oncall/rules')),
};

// Statistics module
export const StatisticsPages = {
  Overview: lazy(() => import('@/pages/statistics/overview')),
};

// Common pages
export const CommonPages = {
  Login: lazy(() => import('@/pages/auth/login')),
  NotFound: lazy(() => import('@/pages/common/not-found')),
};
