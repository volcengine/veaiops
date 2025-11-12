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
 * 历史事件功能模块统一导出
 *
 * ✅ 层层导出原则：通过功能模块 index.ts 统一导出所有子目录内容
 * - 从功能模块 index.ts 导入，路径最短（如 `@ec/history`）
 * - 每个子目录通过各自的 index.ts 统一导出
 *
 * 注意：遵循单一数据源原则
 * - 类型定义应直接从 @veaiops/types 或 api-generate 导入
 */

// ==================== UI 组件导出 ====================
export { HistoryDetailDrawer } from './ui/components/table/history-detail-drawer';
// HistoryTable and HistoryManagement removed - all history pages now use EventHistoryTable from @veaiops/components

// ==================== Hooks 导出 ====================
export {
  useHistoryActionConfig,
  useHistoryManagementLogic,
  useHistoryTableConfig,
  useHistoryTableConfigFromTable,
  type HistoryFilters,
} from './hooks';

// ==================== Config 导出 ====================
export {
  getHistoryColumns,
  getHistoryFilters,
  renderEventStatus,
} from './config';

// ==================== Lib 导出 ====================
export { historyService } from './lib';
