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

import type { ReactNode } from 'react';
import type { EventHandler, FormInstance, GlobalConfig } from './base';

/**
 * Filter plugin type definitions
 * @description Provides type definitions related to filter plugins
 */

// ===== Filter Plugin Types =====

/** Plugin configuration type */
export type PluginConfig = Record<string, unknown>;

/** Field item interface */
export interface FieldItem {
  field?: string;
  label?: string;
  /** Component type */
  type?: string;
  /** Child component type */
  childrenType?: string;
  col?: number;
  /** Properties applied to Field */
  fieldProps?: Record<string, unknown>;
  /** Properties on the component corresponding to type */
  componentProps?: Record<string, unknown>;
  /** FormItem initial value */
  initialValue?: unknown;
  /** Display value */
  textInfo?: unknown;
  display?: unknown;
  format?: unknown;
  /** Whether visible */
  visible?: boolean;
}

/** Plugin context */
export interface FilterPluginContext {
  /** Form instance */
  form?: FormInstance;
  /** Global configuration */
  globalConfig?: GlobalConfig;
  /** Event bus */
  eventBus?: FilterEventBus;
}

/** Event bus interface */
export interface FilterEventBus {
  emit: (event: string, ...args: unknown[]) => void;
  on: (params: { event: string; handler: EventHandler }) => void;
  off: (params: { event: string; handler: EventHandler }) => void;
}

/** Plugin render properties */
export interface FilterPluginRenderProps {
  /** Field configuration */
  field: FieldItem;
  /** Original component properties */
  componentProps: Record<string, unknown>;
  /** Hijacked component properties */
  hijackedProps: Record<string, unknown>;
  /** Plugin context */
  context?: FilterPluginContext;
}

/** Plugin hooks */
export interface FilterPluginHooks {
  /** Before component render */
  beforeRender?: (props: FilterPluginRenderProps) => FilterPluginRenderProps;
  /** After component render */
  afterRender?: (
    element: ReactNode,
    props: FilterPluginRenderProps,
  ) => ReactNode;
  /** Configuration validation */
  validateConfig?: (config: PluginConfig) => boolean | string;
}

/** Plugin registration options */
export interface PluginRegistryOptions {
  /** Whether to override existing plugins */
  override?: boolean;
  /** Plugin priority */
  priority?: number;
}

/** Plugin base interface */
export interface FilterPlugin {
  /** Plugin unique identifier */
  type: string;
  /** Plugin name */
  name: string;
  /** Plugin description */
  description?: string;
  /** Plugin version */
  version?: string;
  /** Render component */
  render: (props: FilterPluginRenderProps) => ReactNode;
  /** Plugin configuration validation */
  validateConfig?: (config: PluginConfig) => boolean;
  /** Plugin default configuration */
  defaultConfig?: PluginConfig;
  /** Dependencies on other plugins */
  dependencies?: string[];
}
