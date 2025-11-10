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
 * Statistics management feature unified export
 *
 * ✅ Layered export principle: Unified export of all subdirectory contents through feature module index.ts
 * - Import from feature module index.ts for shortest path (e.g., `@ec/statistics`)
 * - Each subdirectory exports through its own index.ts
 */

// ==================== Hooks Export ====================
export {
  useStatisticsLogic,
  useChartConfigs,
  type StatisticsData,
  type TimeRange,
} from './hooks';

// ==================== UI Components Export ====================
export { default as StatisticsOverview } from './ui/statistics-overview';
export { default as StatisticsCharts } from './ui/statistics-charts';
export { default as StatisticsManagement } from './ui/statistics-management';

// ==================== Default Export ====================
export { default } from './ui/statistics-management';
