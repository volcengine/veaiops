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
 * Page path configuration
 *
 * Unified management of all route page import paths and URL paths
 * Reference Modern.js source code configuration approach
 *
 * This file contains two types of path configurations:
 * 1. Import Paths (PAGES_PATH_CONFIG): For documentation and type checking
 *    - ⚠️ NOT used in lazy.ts due to webpack limitation (must use string literals)
 *    - Used as reference to ensure consistency between lazy.ts and this config
 * 2. URL Paths (ROUTES_PATH_CONFIG): For route definitions
 *    - ✅ Used in route modules (e.g., event-center.ts, system.ts)
 *    - Can use variables because they're not in dynamic import()
 *
 * Usage:
 * - All page paths must be defined in this configuration file
 * - Use path aliases (@/pages/*) instead of relative paths
 * - Path configuration is grouped by module for easy maintenance
 * - Import paths for documentation reference (lazy.ts uses string literals)
 * - URL paths for route definitions (used via variables)
 *
 * See lazy.ts for explanation of why import paths cannot use variables
 */

// ============================================================================
// Import Paths (for lazy loading components)
// Documentation reference only - lazy.ts must use string literals
// ============================================================================

// System management module page paths
export const SYSTEM_PAGES_PATH = {
  Monitor: '@/pages/system/datasource',
  Account: '@/pages/system/account',
  BotManagement: '@/pages/system/bot',
  Project: '@/pages/system/project',
  CardTemplate: '@/pages/system/card-template',
} as const;

// Intelligent threshold module page paths
export const THRESHOLD_PAGES_PATH = {
  Config: '@/pages/threshold/config',
  History: '@/pages/threshold/history',
  Template: '@/pages/threshold/template',
  Subscription: '@/pages/threshold/subscription',
} as const;

// Event center module page paths
export const EVENT_CENTER_PAGES_PATH = {
  History: '@/pages/event-center/history',
  Statistics: '@/pages/event-center/statistics',
  Strategy: '@/pages/event-center/strategy',
  SubscribeRelation: '@/pages/event-center/subscribe-relation',
} as const;

// Oncall module page paths
export const ONCALL_PAGES_PATH = {
  Config: '@/pages/oncall/config',
  History: '@/pages/oncall/history',
  Rules: '@/pages/oncall/rules',
} as const;

// Statistics module page paths
export const STATISTICS_PAGES_PATH = {
  Overview: '@/pages/statistics/overview',
} as const;

// Common page paths
export const COMMON_PAGES_PATH = {
  Login: '@/pages/auth/login',
  NotFound: '@/pages/common/not-found',
} as const;

/**
 * Page path configuration mapping (import paths)
 * Used for unified management and access to all page paths
 */
export const PAGES_PATH_CONFIG = {
  system: SYSTEM_PAGES_PATH,
  threshold: THRESHOLD_PAGES_PATH,
  eventCenter: EVENT_CENTER_PAGES_PATH,
  oncall: ONCALL_PAGES_PATH,
  statistics: STATISTICS_PAGES_PATH,
  common: COMMON_PAGES_PATH,
} as const;

// ============================================================================
// URL Paths (for route definitions)
// ============================================================================

// System management module URL paths
export const SYSTEM_ROUTES_PATH = {
  Root: '/system',
  BotManagement: '/system/bot-management',
  CardTemplate: '/system/card-template',
  Account: '/system/account',
  Monitor: '/system/datasource',
  Project: '/system/project',
} as const;

// Intelligent threshold module URL paths
export const THRESHOLD_ROUTES_PATH = {
  Config: '/threshold/config',
  Template: '/threshold/template',
  Subscription: '/threshold/subscription',
  History: '/threshold/history',
} as const;

// Event center module URL paths
export const EVENT_CENTER_ROUTES_PATH = {
  Strategy: '/event-center/strategy',
  SubscribeRelation: '/event-center/subscribe-relation',
  History: '/event-center/history',
} as const;

// Oncall module URL paths
export const ONCALL_ROUTES_PATH = {
  Config: '/oncall/config',
  History: '/oncall/history',
  Rules: '/oncall/rules',
} as const;

// Statistics module URL paths
export const STATISTICS_ROUTES_PATH = {
  Overview: '/statistics/overview',
} as const;

// Common page URL paths
export const COMMON_ROUTES_PATH = {
  Login: '/login',
  NotFound: '/404',
} as const;

/**
 * Route path configuration mapping (URL paths)
 * Used for route definitions in modules
 */
export const ROUTES_PATH_CONFIG = {
  system: SYSTEM_ROUTES_PATH,
  threshold: THRESHOLD_ROUTES_PATH,
  eventCenter: EVENT_CENTER_ROUTES_PATH,
  oncall: ONCALL_ROUTES_PATH,
  statistics: STATISTICS_ROUTES_PATH,
  common: COMMON_ROUTES_PATH,
} as const;
