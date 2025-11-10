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
 * Core plugin collection definition
 * @description Defines the collection of all core filter plugins
 */

import type { FilterPlugin } from '@veaiops/types';

// Import all plugins
import {
  InputNumberPlugin,
  InputPlugin,
  InputTagPlugin,
} from './core/input.plugin';

import {
  CascaderPlugin,
  CheckboxGroupPlugin,
  CheckboxPlugin,
  EnumsCheckBoxGroupPlugin,
  SelectPlugin,
  TreeSelectPlugin,
} from './core/select.plugin';

import { DatePickerPlugin, RangePickerPlugin } from './core/date.plugin';

/**
 * Core plugin collection
 * Contains all built-in filter plugins
 */
export const corePlugins: FilterPlugin[] = [
  // Input type plugins
  InputPlugin,
  InputNumberPlugin,
  InputTagPlugin,

  // Select type plugins
  SelectPlugin,
  CascaderPlugin,
  TreeSelectPlugin,
  EnumsCheckBoxGroupPlugin,

  // Checkbox plugins
  CheckboxPlugin,
  CheckboxGroupPlugin,

  // Date plugins
  DatePickerPlugin,
  RangePickerPlugin,
];

/**
 * Get plugin statistics
 * @returns - Plugin registry statistics
 */
export const getPluginStats = () => {
  // Lazy import to avoid circular dependency
  const { filterPluginRegistry } = require('./registry');
  return filterPluginRegistry.getStats();
};
