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
  /** Event Center */
  EVENT_CENTER = 'event-center',
  /** Time Series Anomaly Detection */
  TIMESERIES = 'timeseries',
  /** Intelligent Threshold */
  INTELLIGENT_THRESHOLD = 'intelligent-threshold',
  /** Oncall Anomaly */
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
    displayName: 'Event Center',
    pageTitle: 'Subscription Relationship Management',
    description: 'Manage subscription relationships for Event Center',
    pathPattern: '/event-center/',
  },
  [ModuleType.TIMESERIES]: {
    type: ModuleType.TIMESERIES,
    displayName: 'Time Series Anomaly',
    pageTitle: 'Subscription Rule Management',
    description: 'Manage subscription rules for time series anomaly detection',
    pathPattern: '/timeseries/',
  },
  [ModuleType.INTELLIGENT_THRESHOLD]: {
    type: ModuleType.INTELLIGENT_THRESHOLD,
    displayName: 'Intelligent Threshold',
    pageTitle: 'Threshold Subscription Management',
    description: 'Manage subscription relationships for Intelligent Threshold',
    pathPattern: '/threshold/',
  },
  [ModuleType.ONCALL]: {
    type: ModuleType.ONCALL,
    displayName: 'Oncall Anomaly',
    pageTitle: 'Oncall Subscription Management',
    description: 'Manage subscription relationships for Oncall Anomaly',
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
 * @returns Module type array
 */
export function getAllModuleTypes(): ModuleType[] {
  return Object.values(ModuleType);
}
