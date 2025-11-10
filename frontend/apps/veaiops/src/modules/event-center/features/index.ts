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
 * Event center feature modules unified export
 * Refactored based on CustomTable best practices
 */

// Strategy management feature
export {
  StrategyDetailDrawer,
  StrategyManagement,
  StrategyModal,
  StrategyTable,
  useStrategyManagementLogic,
} from './strategy';

// Subscription management feature
export {
  SubscriptionManagement,
  SubscriptionModal,
  SubscriptionTable,
  useSubscriptionManagementLogic,
} from './subscription';

// History event feature
export {
  HistoryDetailDrawer,
  HistoryManagement,
  HistoryTable,
  useHistoryManagementLogic,
} from './history';

// Statistics management feature
export {
  StatisticsCharts,
  StatisticsManagement,
  StatisticsOverview,
  useStatisticsLogic,
} from './statistics';

// Subscription relation page component (exported separately because it has default export)
export { default as SubscribeRelationPage } from './subscription/ui/relation-page';
