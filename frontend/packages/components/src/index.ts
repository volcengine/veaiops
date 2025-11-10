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
 * VolcAIOpsKit Component Library Unified Export Entry
 *
 * Export Principles:
 * - Use selective exports to avoid type naming conflicts
 * - Group by functional modules for clear organization
 * - Merge imports from the same source to improve code readability
 * - Each directory exports through its own index.ts
 */

// ==================== Basic Components ====================
export * from './business';
export * from './button';
export * from './card';
export * from './cell-render';
export * from './config-provider';
export * from './constants';
export * from './shared';
export * from './subscription';
export * from './tip';
export * from './wrapper-with-title';

// ==================== CustomFields Components ====================
// Note: Use selective exports to avoid type conflicts
export { CustomFields } from './custom-fields';
export type * from './custom-fields/types';
export * from './custom-fields/utils';

// ==================== CustomTable Components ====================
// Note: Use selective exports for commonly used components and Hooks to avoid type conflicts
export {
  CustomTable,
  SubscriptionProvider,
  useBusinessTable,
  useSubscription,
  useTableRefreshHandlers,
} from './custom-table';
export type {
  BaseQuery,
  CustomTableActionType,
  FilterConfigItem,
  FilterItemConfig,
  HandleFilterProps,
  OperationWrappers,
  QueryFormat,
  QueryValue,
} from './custom-table';

// ==================== FormControl Components ====================
// Note: Use selective exports to avoid Option type conflicts
export {
  FormItemWrapper,
  Input,
  InputBlock,
  Select,
  SelectBlock,
} from './form-control';
export type {
  DataSourceSetter,
  Option,
  SelectDataSourceProps,
} from './form-control';

// ==================== SelectBlock Logger Types ====================
// Export SelectBlock logger types for global type definitions
export type { SelectBlockLogger } from './form-control/select/block/logger';
export type { LogEntry } from './form-control/select/block/types/logger';

// ==================== Filters Components ====================
// Note: Use selective exports to avoid type conflicts
export type { FiltersProps } from './custom-table/types/core/common';
export type { FieldItem } from './filters';

// ==================== Other Type Exports ====================
export type { CustomTitleProps } from './custom-table/types/components/missing-types';

// ==================== EventHistoryTable Components ====================
// Unified historical event table component
export {
  EventHistoryTable,
  HistoryModuleType,
  getAllowedAgentTypes,
} from './event-history-table';
export type {
  EventHistoryTableProps,
  EventHistoryFilters,
} from './event-history-table';

// ==================== XGuide Components ====================
// Note: Use selective exports to avoid naming conflicts
export { XGuide } from './x-guide';
export type { IGuide, IStep } from './x-guide';
