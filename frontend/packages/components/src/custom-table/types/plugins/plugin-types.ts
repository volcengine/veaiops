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
 * Plugin system precise type definitions
 * Replace any types, provide safer type constraints
 */

import type { BaseQuery, BaseRecord } from '@veaiops/types';
import type { ReactNode } from 'react';
import type { PluginContext } from './core';

/**
 * Plugin configuration base interface
 */
export interface PluginConfigBase {
  /** Plugin name */
  name: string;
  /** Plugin version */
  version: string;
  /** Whether enabled */
  enabled?: boolean;
  /** Plugin priority */
  priority?: number;
  /** Dependency plugin list */
  dependencies?: string[];
}

/**
 * Plugin registration information
 */
export interface PluginRegistration<
  Config extends PluginConfigBase = PluginConfigBase,
> {
  /** Plugin unique identifier */
  id: string;
  /** Plugin configuration */
  config: Config;
  /** Plugin status */
  status: 'registered' | 'installed' | 'active' | 'inactive' | 'error';
  /** Error information */
  error?: Error;
}

/**
 * Plugin validation result
 */
export interface PluginValidationResult {
  /** Whether valid */
  isValid: boolean;
  /** Error messages */
  errors: string[];
  /** Warning messages */
  warnings: string[];
}

/**
 * Sorted plugin collection
 */
export interface SortedPlugins<
  Config extends PluginConfigBase = PluginConfigBase,
> {
  /** Plugin list sorted by priority */
  plugins: PluginRegistration<Config>[];
  /** Sort metadata */
  metadata: {
    totalCount: number;
    activeCount: number;
    sortCriteria: 'priority' | 'dependencies' | 'name';
  };
}

/**
 * Plugin conflict detection result
 */
export interface PluginConflictResult<
  Config extends PluginConfigBase = PluginConfigBase,
> {
  /** Whether conflicts exist */
  hasConflicts: boolean;
  /** Conflicting plugin pairs */
  conflicts: Array<{
    plugin1: PluginRegistration<Config>;
    plugin2: PluginRegistration<Config>;
    reason: string;
  }>;
}

/**
 * Plugin dependency check result
 */
export interface PluginDependencyResult<
  Config extends PluginConfigBase = PluginConfigBase,
> {
  /** Whether all dependencies are met */
  allDependenciesMet: boolean;
  /** Missing dependencies */
  missingDependencies: Array<{
    plugin: PluginRegistration<Config>;
    missingDeps: string[];
  }>;
  /** Dependency graph */
  dependencyGraph: Map<string, string[]>;
}

/**
 * Type-safe plugin utility function interface
 */
export interface TypeSafePluginUtils {
  /**
   * Validate plugin configuration
   */
  validatePluginConfig: <Config extends PluginConfigBase>(
    plugin: PluginRegistration<Config>,
  ) => PluginValidationResult;

  /**
   * Sort plugins by priority
   */
  sortPluginsByPriority: <Config extends PluginConfigBase>(
    plugins: PluginRegistration<Config>[],
  ) => SortedPlugins<Config>;

  /**
   * Detect plugin conflicts
   */
  detectPluginConflicts: <Config extends PluginConfigBase>(
    plugin: PluginRegistration<Config>,
    registeredPlugins: PluginRegistration<Config>[],
  ) => PluginConflictResult<Config>;

  /**
   * Check plugin dependencies
   */
  checkPluginDependencies: <Config extends PluginConfigBase>(
    plugin: PluginRegistration<Config>,
    registeredPlugins: PluginRegistration<Config>[],
  ) => PluginDependencyResult<Config>;
}

/**
 * Plugin renderer parameter types
 */
export interface PluginRenderParams<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
  ExtraProps extends Record<string, unknown> = Record<string, unknown>,
> {
  /** Plugin context */
  context: PluginContext<RecordType, QueryType>;
  /** Extra properties */
  extraProps?: ExtraProps;
  /** Children nodes */
  children?: ReactNode;
}

/**
 * Plugin render function type
 */
export type PluginRenderFunction<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
  ExtraProps extends Record<string, unknown> = Record<string, unknown>,
> = (
  params: PluginRenderParams<RecordType, QueryType, ExtraProps>,
) => ReactNode;

/**
 * Plugin callback function type
 */
export type PluginCallback<
  Args extends unknown[] = unknown[],
  ReturnType = void,
> = (...args: Args) => ReturnType;

/**
 * Plugin event listener type
 */
export interface PluginEventListener<EventData = unknown> {
  /** Event name */
  eventName: string;
  /** Listener function */
  listener: (eventData: EventData) => void;
  /** Whether to listen only once */
  once?: boolean;
}

/**
 * Plugin hook configuration
 */
export interface PluginHookConfig<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Hook name */
  hookName: string;
  /** Hook function */
  hook: PluginCallback<[PluginContext<RecordType, QueryType>], void>;
  /** Execution priority */
  priority?: number;
}
