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
 * Global guide step enumeration
 */
export enum GlobalGuideStepNumber {
  /** Step 1: Connection management */
  CONNECTION = 1,
  /** Step 2: Data source */
  DATASOURCE = 2,
  /** Step 3: Metric template */
  TEMPLATE = 3,
  /** Step 4: Metric configuration */
  METRIC_CONFIG = 4,
  /** Step 5: Intelligent threshold task */
  TASK = 5,
  /** Step 6: Inject alert rule */
  INJECTION = 6,
  /** Step 7: Bot management */
  BOT_MANAGEMENT = 7,
  /** Step 8: Card template management */
  CARD_TEMPLATE = 8,
  /** Step 9: Account management */
  ACCOUNT = 9,
  /** Step 10: Project management */
  PROJECT = 10,
  /** Step 11: Oncall anomaly configuration */
  ONCALL_CONFIG = 11,
  /** Step 12: Oncall anomaly rules */
  ONCALL_RULES = 12,
  /** Step 13: Oncall anomaly history */
  ONCALL_HISTORY = 13,
  /** Step 14: Oncall anomaly statistics */
  ONCALL_STATS = 14,
}

/**
 * Global guide step path enumeration
 */
export enum GlobalGuideStepPath {
  /** Connection management path - 🔥 Remove URL parameters, only navigate to page */
  CONNECTION = '/system/datasource',
  /** Data source path */
  DATASOURCE = '/system/datasource#config',
  /** Metric template path */
  TEMPLATE = '/threshold/template',
  /** Intelligent threshold task path */
  METRIC_CONFIG = '/threshold/config',
  /** Bot management path */
  BOT_MANAGEMENT = '/system/bot-management',
  /** Card template management path */
  CARD_TEMPLATE = '/system/card-template',
  /** Account management path */
  ACCOUNT = '/system/account',
  /** Project management path */
  PROJECT = '/system/project',
  /** Oncall anomaly configuration path */
  ONCALL_CONFIG = '/oncall/config',
  /** Oncall anomaly rules path */
  ONCALL_RULES = '/oncall/rules',
  /** Oncall anomaly history path */
  ONCALL_HISTORY = '/oncall/history',
  /** Oncall anomaly statistics path */
  ONCALL_STATS = '/oncall/stats',
}

/**
 * Global guide step parameters enumeration
 * 🔥 Deprecated: No longer use URL parameters to auto-open drawers, changed to only highlight buttons
 */
export enum GlobalGuideStepParams {
  /** Connection management parameter (deprecated) */
  CONNECTION_DRAWER = 'connectDrawerShow=true',
  /** Data source parameter (deprecated) */
  DATASOURCE_WIZARD = 'dataSourceWizardShow=true',
}
