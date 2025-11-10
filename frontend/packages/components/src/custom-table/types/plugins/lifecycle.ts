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
 * Plugin lifecycle related type definitions
 *
 * @date 2025-12-19
 */

import type { PluginContext } from './core';

/**
 * Lifecycle phase type
 */
export type LifecyclePhase =
  | 'beforeMount'
  | 'afterMount'
  | 'beforeUpdate'
  | 'afterUpdate'
  | 'beforeUnmount'
  | 'afterUnmount'
  | 'onMount'
  | 'onUnmount'
  | 'onUpdate'
  | 'onDestroy'
  | 'uninstall'
  | 'install'
  | 'setup'
  | 'activate'
  | 'deactivate';

/**
 * Lifecycle execution context
 */
export interface LifecycleExecutionContext {
  phase: LifecyclePhase;
  pluginName: string;
  startTime: number;
  timestamp?: number;
  context: PluginContext;
}

/**
 * Lifecycle listener type
 */
export type LifecycleListener = (
  executionContext: LifecycleExecutionContext,
  phase?: LifecyclePhase,
  pluginName?: string,
  context?: PluginContext,
) => void | Promise<void>;

/**
 * Lifecycle callback type
 */
export type LifecycleCallback = (
  context: PluginContext,
) => void | Promise<void>;

/**
 * Plugin lifecycle configuration
 */
export interface PluginLifecycleConfig {
  beforeMount?: LifecycleCallback;
  afterMount?: LifecycleCallback;
  beforeUpdate?: LifecycleCallback;
  afterUpdate?: LifecycleCallback;
  beforeUnmount?: LifecycleCallback;
  afterUnmount?: LifecycleCallback;
  onMount?: LifecycleCallback;
  onUnmount?: LifecycleCallback;
  onUpdate?: LifecycleCallback;
  onDestroy?: LifecycleCallback;
  onUninstall?: LifecycleCallback;
}

/**
 * Lifecycle manager configuration
 */
export interface LifecycleManagerConfig {
  enableLogging?: boolean;
  timeout?: number;
  retryCount?: number;
  globalLifecycle?: PluginLifecycleConfig;
  errorHandling?:
    | 'warn'
    | 'ignore'
    | 'throw'
    | {
        retryOnError?: boolean;
        maxRetries?: number;
        retryDelay?: number;
      };
  debug?: boolean;
  enablePerformanceMonitoring?: boolean;
  listeners?: LifecycleListener[];
}

/**
 * CustomTable lifecycle configuration
 */
export interface CustomTableLifecycleConfig extends LifecycleManagerConfig {
  /** Global lifecycle callbacks */
  global?: PluginLifecycleConfig;
  /** Plugin-specific configuration */
  plugins?: Record<string, PluginLifecycleConfig>;
}

/**
 * Plugin-specific lifecycle configuration
 */
export type PluginSpecificLifecycleConfig = Record<
  string,
  PluginLifecycleConfig
>;
