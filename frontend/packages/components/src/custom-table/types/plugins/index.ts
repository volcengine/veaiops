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
 * Plugin types unified export
 */

// ==================== Row selection plugin ====================
export * from './row-selection';

// ==================== Drag and drop sort plugin ====================
export * from './drag-sort';

// ==================== Column freeze plugin ====================
export * from './column-freeze';

// ==================== Table expand plugin ====================
export * from './table-expand';

// ==================== Virtual scroll plugin ====================
export * from './virtual-scroll';

// ==================== Table toolbar plugin ====================
export * from './table-toolbar';

// ==================== Smart cell plugin ====================
export * from './smart-cell';

// ==================== Table columns plugin ====================
export * from './table-columns';

// ==================== Inline edit plugin types ====================
export * from './inline-edit';

// ==================== Data source plugin ====================
// Note: DataSourceConfig and DataSourceState need to be renamed to avoid conflicts with other modules
export type {
  DataSourceMethods,
  DataSourceConfig as PluginDataSourceConfig,
  DataSourceState as PluginDataSourceState,
} from './data-source';

// ==================== Table alert plugin ====================
export * from './table-alert';

// ==================== Table filter plugin ====================
export * from './table-filter';

// ==================== Table pagination plugin ====================
export * from './table-pagination';

// ==================== Table sorting plugin ====================
export * from './table-sorting';

// ==================== Column width persistence plugin ====================
export * from './column-width-persistence';

// ==================== Query sync plugin ====================
export * from './query-sync';

// ==================== Custom filter setting plugin ====================
export type {
  CustomFilterSettingProps,
  CustomFilterSettingConfig,
  CustomFilterSettingState,
} from '../../plugins/custom-filter-setting';

// ==================== Core plugin system types ====================
export * from './core';
