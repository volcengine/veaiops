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

import { useStatisticsLogic } from '@ec/statistics';
import type React from 'react';
import { StatisticsCharts } from './statistics-charts';
import { StatisticsOverview } from './statistics-overview';

/**
 * Statistics management page
 * Provides event center statistics data display functionality
 *
 * Architecture features:
 * - Uses custom Hook to encapsulate business logic
 * - Single responsibility components, easy to maintain
 * - State management separated from UI rendering
 * - Supports configuration and extension
 * - Provides rich charts and statistical information
 */
const StatisticsManagement: React.FC = () => {
  // Use custom Hook to get all business logic
  const {
    // State
    loading,
    statisticsData,
    timeRange,

    // Event handlers
    handleTimeRangeChange,
    handleRefresh,
  } = useStatisticsLogic();

  return (
    <div className="statistics-management">
      {/* Statistics overview component */}
      <StatisticsOverview
        loading={loading}
        statisticsData={statisticsData}
        timeRange={timeRange}
        onTimeRangeChange={handleTimeRangeChange}
        onRefresh={handleRefresh}
      />

      {/* Statistics charts component */}
      <StatisticsCharts loading={loading} statisticsData={statisticsData} />
    </div>
  );
};

export default StatisticsManagement;
