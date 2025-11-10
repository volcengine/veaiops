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
 * Plugin utility type definition
 */

import type { ReactNode } from 'react';
// Static import types, forbidden to use dynamic import()
import type { PluginPriority } from '../../core/enums';
import type { PluginLifecycle } from './base';
import type { PluginContext } from './context';
import type { CorePlugin, Plugin } from './plugin';

/**
 * Plugin hook type
 */
export type PluginHook<T = unknown> = (...args: unknown[]) => T;

/**
 * Plugin renderer type
 */
export type PluginRenderer = (...args: unknown[]) => ReactNode;

/**
 * Plugin event listener type
 */
export type PluginEventListener = (...args: unknown[]) => void;

/**
 * Plugin props enhancer type
 */
export type PluginPropsEnhancer = (
  props: Record<string, unknown>,
  context: PluginContext,
) => Record<string, unknown>;

/**
 * Plugin data processor type
 */
export type PluginDataProcessor = (
  data: unknown,
  context: PluginContext,
) => unknown;

/**
 * Plugin factory function type
 */
export type PluginFactory<Config = Record<string, unknown>> = (
  config?: Config,
) => Plugin<Config>;

/**
 * Simplified plugin factory function type (backward compatible)
 */
export type CorePluginFactory<Config = Record<string, unknown>> = (
  config?: Partial<Config>,
) => CorePlugin<Config> & { config: Config };

/**
 * Plugin instantiation configuration
 */
export interface PluginInstallConfig {
  priority?: PluginPriority;
  autoStart?: boolean;
  dependencies?: string[];
  conflicts?: string[];
  config?: Record<string, unknown>;
}

/**
 * Plugin error information
 */
export interface PluginError {
  plugin: string;
  phase: PluginLifecycle;
  error: Error;
  timestamp: number;
}

/**
 * Plugin dependency resolution result
 */
export interface PluginDependencyResolution {
  resolved: string[];
  unresolved: string[];
  conflicts: string[];
  circularDependencies: string[][];
}
