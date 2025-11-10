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
 * Strategy management Hooks unified export
 *
 * According to .cursorrules specification:
 * - Unified export: Each directory **must** have an `index.ts` file for unified export
 * - Prefer unified export over direct import of specific files
 */

// ✅ Optimization: Unified export, file names simplified
export { useStrategyActionConfig } from './use-actions';
export { useStrategyForm as useStrategyManagementLogic } from './use-form';
// ✅ Simplified file name: use-strategy-table-config.tsx → use-table.tsx
export { useStrategyTableConfig } from './use-table';

// ✅ Optimization: Unified export types (from use-table.tsx)
export type {
  StrategyFilters,
  StrategyQueryParams,
  UseStrategyTableConfigOptions,
  UseStrategyTableConfigReturn,
} from './use-table';

// Data fetching Hooks
export { default as useBotsList } from './use-bots';
export { default as useChartsList, default as useChatsList } from './use-chats';

// ✅ According to .cursorrules specification: Directly use InformStrategy (api-generate), do not export StrategyTableData
// InformStrategy already satisfies BaseRecord constraint (has index signature), can be directly used in CustomTable
