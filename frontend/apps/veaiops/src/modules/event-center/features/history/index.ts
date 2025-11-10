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
 * History event feature module unified export
 *
 * ✅ Layered export principle: Export all subdirectory contents through feature module index.ts
 * - Import from feature module index.ts, shortest path (e.g., `@ec/history`)
 * - Each subdirectory exports through its own index.ts
 *
 * Note: Follow single source of truth principle
 * - Type definitions should be imported directly from @veaiops/types or api-generate
 */

// ==================== UI Components Export ====================
export { HistoryDetailDrawer } from './ui/components/table/history-detail-drawer';
export { HistoryTable } from './ui/components/table/history-table';
export { HistoryManagement } from './ui/pages/history-management';

// ==================== Hooks Export ====================
export {
  useHistoryActionConfig,
  useHistoryManagementLogic,
  useHistoryTableConfig,
  useHistoryTableConfigFromTable,
  type HistoryFilters,
} from './hooks';

// ==================== Config Export ====================
export {
  getHistoryColumns,
  getHistoryFilters,
  renderEventStatus,
} from './config';

// ==================== Lib Export ====================
export { historyService } from './lib';
