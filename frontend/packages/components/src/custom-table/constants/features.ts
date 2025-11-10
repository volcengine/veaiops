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
 * CustomTable feature flag constants definition
 */
import { PluginNames } from './enum';

/**
 * Feature flag default values
 * Optimized based on actual business requirements, column width persistence enabled by default
 */
export const DEFAULT_FEATURES = {
  enableFilter: true,
  // 🐛 Re-enabled, using simplified implementation
  enableAlert: true,
  enablePagination: true,
  enableSorting: true,
  enableDataSource: true,
  enableColumns: true,
  enableCustomLoading: false,
  enableToolbar: false,
  enableSearch: false,
  enableRowSelection: false,
  enableColumnWidthPersistence: true, // 🎯 Column width persistence enabled by default
} as const;

// Feature flag types have been moved to types directory for unified management
// Avoid circular imports, import directly from types/constants/features
export type { FeatureFlags } from '@/custom-table/types/constants/features';

/**
 * Feature plugin mapping table
 */
export const FEATURE_PLUGIN_MAP = {
  enableFilter: [PluginNames.TABLE_FILTER],
  enableAlert: [PluginNames.TABLE_ALERT],
  enablePagination: [PluginNames.TABLE_PAGINATION],
  enableSorting: [PluginNames.TABLE_SORTING],
  enableDataSource: [PluginNames.DATA_SOURCE],
  enableColumns: [PluginNames.TABLE_COLUMNS],
  enableCustomLoading: [PluginNames.CUSTOM_LOADING],
  enableToolbar: [PluginNames.TABLE_TOOLBAR],
  enableSearch: [PluginNames.TABLE_SEARCH],
  enableRowSelection: [PluginNames.ROW_SELECTION],
  enableColumnWidthPersistence: [PluginNames.COLUMN_WIDTH_PERSISTENCE],
} as const;
