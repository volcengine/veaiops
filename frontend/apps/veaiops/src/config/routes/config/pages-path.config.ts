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
 * Unified management of all route page import paths, implementing configuration-based management
 * Reference Modern.js source code's configuration approach, extracting paths as configuration
 *
 * Usage guidelines:
 * - All page paths must be defined in this configuration file
 * - Use path aliases (@/pages/*) instead of relative paths
 * - Path configurations grouped by module for easier maintenance
 */

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

// Oncall alerts module page paths
export const ONCALL_PAGES_PATH = {
  Config: '@/pages/oncall/config',
  History: '@/pages/oncall/history',
  Rules: '@/pages/oncall/rules',
  Statistics: '@/pages/oncall/statistics',
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
 * Page path configuration mapping
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
