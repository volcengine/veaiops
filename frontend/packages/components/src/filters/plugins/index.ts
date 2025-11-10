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
 * Filter plugin system unified export
 * @description Entry file for filter plugin system, provides exports for all plugin-related functionality

 *
 */

// ===== Type definitions export =====
export type {
  FieldItem,
  FilterEventBus,
  FilterPlugin,
  FilterPluginContext,
  FilterPluginHooks,
  FilterPluginRenderProps,
  PluginConfig,
  PluginRegistryOptions,
} from '@veaiops/types';

// ===== Core components export =====
export * from './extension/manager';
export * from './registry';

// ===== Core plugins export =====
export * from './core/date.plugin';
export * from './core/input.plugin';
export * from './core/select.plugin';

// ===== Plugin collections and initialization =====
export * from './core-plugins';
export * from './initialization';
