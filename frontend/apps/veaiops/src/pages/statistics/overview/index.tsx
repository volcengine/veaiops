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

import { Spin } from '@arco-design/web-react';
import type React from 'react';
import {
  BottomSection,
  CoreMetricsCards,
  PageHeader,
  ThresholdStatistics,
  TrendCharts,
} from './components';
import { useStatisticsData } from './hooks/use-statistics-data';

/**
 * Statistics overview page
 * @description Display statistics data for each module of the system, including active count, event count, message count, etc.
 */

const StatisticsOverview: React.FC = () => {
  const {
    statistics,
    loading,
    getThresholdTrendData,
    getEventTrendData,
    getMessageTrendData,
    getSystemOverviewData,
    getDataCheck,
  } = useStatisticsData();

  const dataCheck = getDataCheck();

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '400px',
        }}
      >
        <Spin size={40} />
      </div>
    );
  }

  return (
    <div className="statistics-overview">
      {/* Page header */}
      <PageHeader />

      {/* Core metrics cards */}
      <CoreMetricsCards statistics={statistics} />

      {/* Event and message trend charts */}
      <TrendCharts
        loading={loading}
        dataCheck={dataCheck}
        getEventTrendData={getEventTrendData}
        getMessageTrendData={getMessageTrendData}
      />

      {/* Intelligent threshold task statistics */}
      <ThresholdStatistics
        statistics={statistics}
        loading={loading}
        dataCheck={dataCheck}
        getThresholdTrendData={getThresholdTrendData}
      />

      {/* Intelligent threshold detailed statistics and system resource overview */}
      <BottomSection
        statistics={statistics}
        getSystemOverviewData={getSystemOverviewData}
      />
    </div>
  );
};

export default StatisticsOverview;
