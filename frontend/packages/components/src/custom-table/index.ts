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
 * CustomTable component unified exports
 *
 * ✅ Layered export principle: Export all subdirectory contents through functional module index.ts
 * - Import from functional module index.ts with shortest path (e.g., `@/custom-table`)
 * - Each subdirectory exports through its own index.ts
 */

// ==================== Main component exports ====================
export { CustomTable } from './custom-table';

// ==================== Component exports ====================
export {
  ResetLogControlPanel,
  ResetLogExportButton,
} from './components/reset-log-export-button';

// ==================== Hooks exports ====================
export {
  SubscriptionProvider,
  useBusinessTable,
  useSubscription,
  useTableRefreshHandlers,
  type OperationWrappers,
  type RefreshHandlers,
} from './hooks';

// ==================== Utility function exports ====================
export {
  buildRequestResult,
  devLog,
  extractResponseData,
  filterEmptyDataByKeys,
  filterTableData,
  formatTableData,
  handleRequestError,
  resetLogCollector,
} from './utils';

// ==================== Type Exports ====================
// ⚠️ Important: Explicitly export enum values and functions needed at runtime first to ensure build tools can correctly identify them
// These values must be exported before export * from, because Rollup DTS plugin cannot correctly track multi-level export * from chains

// 1. Enum values - Value exports for runtime
export {
  LifecyclePhaseEnum,
  PluginPriorityEnum,
  PluginStatusEnum,
} from './types/core/enums';

// 2. Utility functions - Value exports for runtime
export { createPaginationStateManager } from './types/utils/state-managers';

// 3. Type exports - Unified export of all types from types/index.ts (avoid duplicate export conflicts)
export * from './types';
// Explicitly export commonly used types to ensure correct recognition during DTS generation (path alias resolution issues)
// Note: Due to potential issues with rollup-plugin-dts when handling path aliases, import and export from specific paths
export type { CustomTableActionType } from './types/api/action-type';
export type { FilterConfigItem } from './types/components/props';
export type {
  BaseQuery,
  BaseRecord,
  FilterValue,
  HandleFilterProps,
  Key,
  QueryFormat,
  QueryValue,
} from './types/core/common';
export type { FilterItemConfig } from './types/plugins/table-filter';

// ==================== Constant Exports ====================
// Avoid duplicate export of FeatureFlags (already exported in types/constants)
export {
  ColumnConstant,
  EMPTY_CONTENT,
  PluginMethods,
  PluginNames,
  RendererNames,
} from './constants';
export type { FeatureFlags } from './constants';

// ==================== Preset Exports ====================
export * from './presets';
