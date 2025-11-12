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
 * 事件中心功能模块统一导出
 * 基于 CustomTable 的模范实践改造
 */

// 策略管理功能
export {
  StrategyDetailDrawer,
  StrategyManagement,
  StrategyModal,
  StrategyTable,
  useStrategyManagementLogic,
} from './strategy';

// 订阅管理功能
export {
  SubscriptionManagement,
  SubscriptionModal,
  SubscriptionTable,
  useSubscriptionManagementLogic,
} from './subscription';

// 历史事件功能
export {
  HistoryDetailDrawer,
  useHistoryManagementLogic,
} from './history';
// HistoryManagement and HistoryTable removed - all history pages now use EventHistoryTable from @veaiops/components

// 统计管理功能
export {
  StatisticsCharts,
  StatisticsManagement,
  StatisticsOverview,
  useStatisticsLogic,
} from './statistics';

// 订阅关系页面组件（单独导出，因为它有默认导出）
export { default as SubscribeRelationPage } from './subscription/ui/relation-page';
