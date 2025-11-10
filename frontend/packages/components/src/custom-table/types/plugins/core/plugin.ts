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
 * Plugin interface definition
 */

import type { BaseQuery, BaseRecord } from '@veaiops/types';
import type { ReactNode } from 'react';
// PluginPriority is already defined in core/enums.ts, import from core to avoid duplication
// Static import enum values, dynamic import() is prohibited
import type { PluginPriority, PluginPriorityEnum } from '../../core/enums';
import type { PluginContext } from './context';
import type { PluginHook } from './utils';

/**
 * Plugin interface definition (full version)
 */
export interface Plugin<Config = Record<string, unknown>> {
  name: string;
  version: string;
  description: string;
  priority: PluginPriority;
  enabled: boolean;
  dependencies?: string[];
  conflicts?: string[];
  config?: Config;

  // Lifecycle methods
  install: (context: PluginContext) => void | Promise<void>;
  setup?: (context: PluginContext) => void | Promise<void>;
  beforeMount?: (context: PluginContext) => void | Promise<void>;
  afterMount?: (context: PluginContext) => void | Promise<void>;
  beforeUpdate?: (context: PluginContext) => void | Promise<void>;
  afterUpdate?: (context: PluginContext) => void | Promise<void>;
  beforeUnmount?: (context: PluginContext) => void | Promise<void>;
  afterUnmount?: (context: PluginContext) => void | Promise<void>;
  uninstall?: (context: PluginContext) => void | Promise<void>;

  // Legacy lifecycle method compatibility
  onMount?: (context: PluginContext) => void | Promise<void>;
  onUnmount?: (context: PluginContext) => void | Promise<void>;
  activate?: (context: PluginContext) => void | Promise<void>;
  deactivate?: (context: PluginContext) => void | Promise<void>;

  // Hook methods
  hooks?: Record<string, PluginHook>;

  // Event handlers
  tableEvents?: Record<
    string,
    (context: PluginContext<BaseRecord, BaseQuery>, ...args: unknown[]) => void
  >;

  // Data processors
  dataProcessors?: Record<
    string,
    (data: unknown, context: PluginContext) => unknown
  >;

  // Renderers
  render?: Record<
    string,
    (
      context: PluginContext<BaseRecord, BaseQuery>,
      ...args: unknown[]
    ) => ReactNode
  >;

  // Component enhancers
  enhanceProps?: (
    props: Record<string, unknown>,
    context: PluginContext,
  ) => Record<string, unknown>;

  // Plugin-specific configuration
  features?: string[];
  settings?: Record<string, unknown>;
}

/**
 * Plugin interface (simplified version, maintain backward compatibility)
 */
export interface CorePlugin<Config = Record<string, unknown>> {
  /** Plugin name */
  readonly name: string;
  /** Plugin configuration */
  readonly config: Config;
  /** Plugin priority */
  readonly priority: typeof PluginPriorityEnum;
  /** Whether enabled */
  readonly enabled: boolean;

  /**
   * Plugin initialization
   */
  initialize?: (context: PluginContext) => Promise<void> | void;

  /**
   * Plugin destruction
   */
  destroy?: () => Promise<void> | void;

  /**
   * Render plugin content
   */
  render?: (context: PluginContext) => ReactNode;

  /**
   * Get plugin state
   */
  getState?: () => Record<string, unknown>;

  /**
   * Update plugin state
   */
  updateState?: (state: Record<string, unknown>) => void;
}
