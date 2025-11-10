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
 * CustomTable core types unified export
 */

// ==================== Base Types ====================
// Export all types from common (PluginPriority, PluginStatus, LifecyclePhase are already exported from enums, not redefined in common)
export * from './common';

// ==================== Data Source Types ====================
// Note: DataSourceConfig needs to be renamed to CoreDataSourceConfig to avoid conflict with DataSourceConfig in plugins/data-source.ts
export type {
  TableDataSource,
  DataSourceState,
  DataSourceActions,
  DataSourceHookResult,
  DataSourceConfig as CoreDataSourceConfig,
  DataProcessor,
} from './data-source';

// ==================== Request Management Types ====================
export * from './request-manager';

// ==================== Table Helper Types ====================
export * from './table-helpers';

// ==================== Type Guards and Safe Conversions ====================
export * from './type-guards';

// ==================== Enum Types ====================
// ⚠️ Note: Enum types are exported via export *, but build tools may not correctly track multi-level export chains
// Therefore, enums also need to be explicitly exported in the top-level types/index.ts (see types/index.ts lines 60-72)
// This ensures:
// 1. Enums can be accessed via export * from './core' path (for type checking)
// 2. Enums can be accessed via explicit export path (for runtime builds)
export * from './enums';
