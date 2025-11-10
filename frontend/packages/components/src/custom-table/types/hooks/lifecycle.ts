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
 * Lifecycle management Hook related type definitions
 */
import type { BaseQuery, BaseRecord } from '../core';
import type {
  LifecycleListener,
  LifecyclePhase as PluginLifecyclePhase,
} from '../plugins/lifecycle';

/**
 * Lifecycle phase (re-export definition from plugin)
 */
export type LifecyclePhase = PluginLifecyclePhase;

/**
 * Lifecycle callback function
 */
export type LifecycleCallback<T = Record<string, unknown>> = (
  context: T,
) => void | Promise<void>;

/**
 * Lifecycle configuration
 */
export type LifecycleConfig<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> = {
  [K in LifecyclePhase]?: LifecycleCallback<{
    phase: K;
    data?: RecordType[];
    query?: QueryType;
    error?: Error;
    [key: string]: unknown;
  }>;
};

/**
 * useLifecycleManager Hook Props
 */
export interface UseLifecycleManagerProps {
  /** Lifecycle configuration */
  config?: LifecycleConfig;
  /** Lifecycle configuration */
  lifecycleConfig?: Record<string, unknown>;
  /** Manager configuration */
  managerConfig?: Record<string, unknown>;
  /** Global callbacks */
  globalCallbacks?: Record<string, unknown>;
  /** Lifecycle error callback */
  onLifecycleError?: (error: Error) => void;
  /** Whether to enable debugging */
  debug?: boolean;
  /** Custom context */
  context?: Record<string, unknown>;
}

/**
 * Lifecycle executor
 */
export interface LifecycleExecutor {
  execute: (
    phase: LifecyclePhase,
    context?: Record<string, unknown>,
  ) => Promise<void>;
  register: (phase: LifecyclePhase, callback: LifecycleCallback) => void;
  unregister: (phase: LifecyclePhase, callback?: LifecycleCallback) => void;
  clear: () => void;
  getRegistered: (phase?: LifecyclePhase) => LifecycleCallback[];
}

/**
 * useLifecycleManager Hook return value
 */
export interface UseLifecycleManagerResult {
  /** Execute lifecycle */
  executeLifecycle: (
    phase: LifecyclePhase,
    pluginName: string,
    context: Record<string, unknown>,
  ) => Promise<void>;
  /** Add listener */
  addListener: (listener: LifecycleListener) => void;
  /** Remove listener */
  removeListener: (listener: LifecycleListener) => void;
  /** Get performance metrics */
  getPerformanceMetrics: () => Record<string, unknown>;
  /** Clear performance metrics */
  clearPerformanceMetrics: () => void;
}
