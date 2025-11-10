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
 * CustomTable type definitions unified export
 * Refactored type system, organized by functionality
 *
 * ⚠️ Important export order notes (following Modern.js best practices):
 * 1. First explicitly export key types (ensure build tools prioritize recognition)
 * 2. Then use export * from to export all sub-modules (maintain type system integrity)
 *
 * Why explicit exports are needed:
 * - Modern.js/Rollup DTS plugin cannot correctly track exports when processing multi-level export * from
 * - Path alias @/custom-table/types requires explicit export declarations when parsing
 * - Rollup DTS plugin cannot expand all nested export * from statements
 * - In bundle mode, build tools may think the module has no exports if export * from is seen first during parsing
 */

// ==================== Key Types Explicit Export (must be before export * from) ====================
// ⚠️ Important: These types must be explicitly exported because Rollup DTS plugin cannot correctly track multi-level export * from chains
//
// Export strategy notes:
// 1. Enum values use export { } (value export, for runtime)
// 2. Type aliases use export type { } (type export, isolatedModules requirement)
// 3. Functions use export { } (value export, for runtime)
// 4. Interfaces/types use export type { } (type export)

// 1. Enum values (enum) - value export, for runtime
export {
  AlertTypeEnum,
  ColumnFixedEnum,
  LifecyclePhaseEnum,
  PaginationPropertyEnum,
  PluginNameEnum,
  PluginPriorityEnum,
  PluginStatusEnum,
  SortDirectionEnum,
  TableActionEnum,
  TableFeatureEnum,
  TableSizeEnum,
} from './core/enums';

// 2. Type aliases - type export
export type {
  PluginPriority,
  PriorityMap,
} from './core/enums';

// 3. Base types - type export (from core/common.ts)
export type {
  BaseQuery,
  BaseRecord,
  ServiceRequestType,
} from './core/common';

// 4. Component types - type export (from components/props.ts)
export type { CustomTableProps } from './components/props';

// 5. Plugin core types - type export (from plugins/core/context.ts)
export type {
  CustomTablePluginProps,
  PluginContext,
} from './plugins/core/context';

// 6. Column types - type export (from plugins/table-columns.ts)
export type { ColumnItem } from './plugins/table-columns';

// 7. Utility functions - value export, for runtime
export { createPaginationStateManager } from './utils/state-managers';

// ==================== Core Types (use export * from, maintain type system integrity) ====================
export * from './core';

// ==================== Component Types ====================
export * from './components';

// ==================== Plugin Types ====================
export * from './plugins';

// ==================== Utility Types ====================
export * from './utils';

// ==================== Constant Types ====================
export * from './constants';

// ==================== Hooks Types ====================
export * from './hooks';

// ==================== Table Ref Types ====================
export * from './table-ref';

// ==================== Schema Table Preset Types ====================
// Note: Type definitions in schema-table/types.ts use Schema prefix naming
// (e.g., SchemaFilterConfig, SchemaPaginationConfig, etc.) to avoid conflicts with types in components
export * from './schema-table';

// ==================== API Types ====================
// Unified export from api directory (avoid cross-level exports, unified export at top level)
export * from './api';
