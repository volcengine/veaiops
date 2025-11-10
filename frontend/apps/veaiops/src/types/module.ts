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
 * Module type enumeration
 * Used to distinguish subscription relationship management for different modules
 */
export enum ModuleType {
  /** Event center */
  EVENT_CENTER = 'event-center',
  /** Time series anomaly detection */
  TIMESERIES = 'timeseries',
  /** Intelligent threshold */
  INTELLIGENT_THRESHOLD = 'intelligent-threshold',
  /** Oncall anomaly */
  ONCALL = 'oncall',
}

/**
 * Module type configuration
 */
export interface ModuleConfig {
  /** Module type */
  type: ModuleType;
  /** Display name */
  displayName: string;
  /** Page title */
  pageTitle: string;
  /** Description */
  description: string;
  /** Route path matching pattern */
  pathPattern: string;
}

/**
 * Module configuration mapping
 */
export const MODULE_CONFIGS: Record<ModuleType, ModuleConfig> = {
  [ModuleType.EVENT_CENTER]: {
    type: ModuleType.EVENT_CENTER,
    displayName: '事件中心',
    pageTitle: '订阅关系管理',
    description: '管理事件中心的订阅关系',
    pathPattern: '/event-center/',
  },
  [ModuleType.TIMESERIES]: {
    type: ModuleType.TIMESERIES,
    displayName: '时序异常',
    pageTitle: '订阅规则管理',
    description: '管理时序异常检测的订阅规则',
    pathPattern: '/timeseries/',
  },
  [ModuleType.INTELLIGENT_THRESHOLD]: {
    type: ModuleType.INTELLIGENT_THRESHOLD,
    displayName: '智能阈值',
    pageTitle: '阈值订阅管理',
    description: '管理智能阈值的订阅关系',
    pathPattern: '/threshold/',
  },
  [ModuleType.ONCALL]: {
    type: ModuleType.ONCALL,
    displayName: 'Oncall异动',
    pageTitle: 'Oncall订阅管理',
    description: '管理Oncall异动的订阅关系',
    pathPattern: '/oncall/',
  },
};

/**
 * Detect module type from path
 * @param pathname Current path
 * @returns Detected module type
 */
export function detectModuleTypeFromPath(pathname: string): ModuleType {
  for (const config of Object.values(MODULE_CONFIGS)) {
    if (pathname.includes(config.pathPattern)) {
      return config.type;
    }
  }
  return ModuleType.EVENT_CENTER;
}

/**
 * Get module configuration
 * @param moduleType Module type
 * @returns Module configuration
 */
export function getModuleConfig(moduleType: ModuleType): ModuleConfig {
  return MODULE_CONFIGS[moduleType];
}

/**
 * Get all module types
 * @returns Array of module types
 */
export function getAllModuleTypes(): ModuleType[] {
  return Object.values(ModuleType);
}
