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
 * Filters component unified exports
 */

// Re-export main component
export { Filters } from './filters';
export { default as FiltersDefault } from './filters';

// Re-export core types
export type {
  FiltersComponentProps,
  FilterStyle,
  FieldItem,
} from './core/types';

// Re-export plugin system types
export type {
  FilterPlugin,
  FilterPluginContext,
  FilterPluginRenderProps,
  PluginConfig,
  FilterEventBus,
} from '@veaiops/types';

// Export utility functions and constants
export * from './core/constants';
export * from './core/utils';
export * from './core/renderer';

// Selectively export plugin system to avoid type conflicts
export {
  filterPluginRegistry,
  initializeCorePlugins,
  getPluginStats,
  pluginExtensionManager,
  corePlugins,
} from './plugins';

// Export presets
export * from './presets';
