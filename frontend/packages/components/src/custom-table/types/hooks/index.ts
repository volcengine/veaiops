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
 * Hooks related type definitions unified export
 */

// ==================== Column Configuration Types ====================
// Note: TableColumnsConfig needs to be renamed to HookTableColumnsConfig to avoid conflicts with plugins
export type {
  UseColumnsProps,
  UseColumnsResult,
  TableColumnsConfig as HookTableColumnsConfig,
} from './column-config';

// ==================== Table Action Types ====================
export * from './table-actions';

// ==================== Table State Types ====================
export * from './table-state';

// ==================== Table Instance Types ====================
export * from './table-instance';

// ==================== Table Configuration Types ====================
export * from './table-config';

// ==================== Table Data Fetch Types ====================
// Note: DataSourceConfig needs to be renamed to HookDataSourceConfig to avoid conflicts with components
export type {
  TableFetchActions,
  DataSourceConfig as HookDataSourceConfig,
  TableFetchOptions,
  UseTableFetchProps,
  UseTableFetchReturn,
} from './table-fetch';

// ==================== Lifecycle Types ====================
export * from './lifecycle';

// ==================== Table Renderer Types ====================
// Note: TableRenderers needs to be renamed to HookTableRenderers to avoid conflicts with other modules
export type { TableRenderers as HookTableRenderers } from './table-renderers';

// ==================== Alert Types ====================
export * from './alert';

// ==================== Pagination and Sorting Types ====================
export * from './pagination-sorting';

// ==================== Imperative Action Context Types ====================
export * from './imperative-actions';
