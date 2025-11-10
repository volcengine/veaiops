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
 * Strategy management feature unified export
 *
 * ✅ Layered export principle: Export all subdirectory contents through feature module index.ts
 * - Import from feature module index.ts, shortest path (e.g., `@ec/strategy`)
 * - Each subdirectory exports through its own index.ts
 */

// ==================== Constants Export ====================
export {
  channelInfoMap,
  channelTypeOptions,
  STRATEGY_MANAGEMENT_CONFIG,
} from './constants';

// ==================== Hooks Export ====================
export {
  useBotsList,
  useChatsList,
  useStrategyActionConfig,
  useStrategyManagementLogic,
  useStrategyTableConfig,
  type StrategyFilters,
  type StrategyQueryParams,
  type UseStrategyTableConfigOptions,
  type UseStrategyTableConfigReturn,
} from './hooks';

// ==================== Config Export ====================
export { getStrategyColumns, getStrategyFilters } from './config';

// ==================== Lib Export ====================
export { adaptStrategyForEdit, strategyApi, strategyService } from './lib';

// ==================== UI Components Export ====================
export {
  CardTemplateConfigMessage,
  StrategyDetailDrawer,
} from './ui';
export { default as StrategyModal } from './ui/modal';
export { StrategyTable, type StrategyTableRef } from './ui/table';
export { default as StrategyManagement } from './ui/main';

// ==================== Default Export ====================
export { default } from './ui/main';
