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

import { Message } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import React, { useState, useCallback, useEffect } from 'react';

/**
 * Statistics data type
 */
export interface StatisticsData {
  // Overall statistics
  totalEvents: number;
  totalStrategies: number;
  totalSubscriptions: number;
  activeSubscriptions: number;

  // Event level distribution
  eventLevelDistribution: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };

  // Event type distribution
  eventTypeDistribution: {
    alert: number;
    warning: number;
    info: number;
    error: number;
  };

  // Time trend data
  eventTrend: Array<{
    date: string;
    count: number;
    level: string;
  }>;

  // Response time statistics
  responseTimeStats: {
    average: number;
    min: number;
    max: number;
    p95: number;
  };

  // Success rate statistics
  successRate: {
    total: number;
    success: number;
    failed: number;
    rate: number;
  };
}

/**
 * Time range type
 */
export type TimeRange = '1h' | '24h' | '7d' | '30d';

/**
 * Statistics logic Hook
 * Provides all business logic for statistics page
 */
export const useStatisticsLogic = () => {
  const [loading, setLoading] = useState(false);
  const [statisticsData, setStatisticsData] = useState<StatisticsData | null>(
    null,
  );
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');

  /**
   * Fetch statistics data
   */
  const fetchStatistics = useCallback(
    async (_range: TimeRange = timeRange) => {
      try {
        setLoading(true);

        // Temporarily use mock data, waiting for backend API implementation
        const mockData: StatisticsData = {
          totalEvents: Math.floor(Math.random() * 10000) + 1000,
          totalStrategies: Math.floor(Math.random() * 100) + 10,
          totalSubscriptions: Math.floor(Math.random() * 200) + 20,
          activeSubscriptions: Math.floor(Math.random() * 150) + 15,

          eventLevelDistribution: {
            critical: Math.floor(Math.random() * 100) + 10,
            high: Math.floor(Math.random() * 200) + 50,
            medium: Math.floor(Math.random() * 500) + 100,
            low: Math.floor(Math.random() * 1000) + 200,
          },

          eventTypeDistribution: {
            alert: Math.floor(Math.random() * 300) + 50,
            warning: Math.floor(Math.random() * 400) + 100,
            info: Math.floor(Math.random() * 600) + 200,
            error: Math.floor(Math.random() * 200) + 30,
          },

          eventTrend: Array.from({ length: 24 }, (_, i) => ({
            date: new Date(
              Date.now() - (23 - i) * 60 * 60 * 1000,
            ).toISOString(),
            count: Math.floor(Math.random() * 100) + 10,
            level: ['critical', 'high', 'medium', 'low'][
              Math.floor(Math.random() * 4)
            ],
          })),

          responseTimeStats: {
            average: Math.random() * 2 + 0.5,
            min: Math.random() * 0.5,
            max: Math.random() * 5 + 2,
            p95: Math.random() * 3 + 1,
          },

          successRate: {
            total: Math.floor(Math.random() * 1000) + 500,
            success: 0,
            failed: 0,
            rate: 0,
          },
        };

        // Calculate success rate
        mockData.successRate.success = Math.floor(
          mockData.successRate.total * (0.85 + Math.random() * 0.1),
        );
        mockData.successRate.failed =
          mockData.successRate.total - mockData.successRate.success;
        mockData.successRate.rate =
          (mockData.successRate.success / mockData.successRate.total) * 100;

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));

        setStatisticsData(mockData);
      } catch (error: unknown) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch statistics data, please try again';
        Message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [timeRange],
  );

  /**
   * Switch time range
   */
  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setTimeRange(range);
      fetchStatistics(range);
    },
    [fetchStatistics],
  );

  /**
   * Refresh data
   */
  const handleRefresh = useCallback(() => {
    fetchStatistics(timeRange);
    Message.success('Data refreshed');
  }, [fetchStatistics, timeRange]);

  // Initialize and load data
  useEffect(() => {
    fetchStatistics();
  }, [fetchStatistics]);

  return {
    // State
    loading,
    statisticsData,
    timeRange,

    // Event handlers
    handleTimeRangeChange,
    handleRefresh,
    fetchStatistics,
  };
};

/**
 * Statistics page action button configuration Hook
 * Provides page toolbar action button configuration
 */
export const useStatisticsActionConfig = (onRefresh: () => void) => {
  const actions = [
    React.createElement(
      'div',
      {
        key: 'refresh',
      },
      React.createElement(
        'button',
        {
          type: 'button',
          className: 'arco-btn arco-btn-secondary',
          onClick: onRefresh,
        },
        [React.createElement(IconRefresh, { key: 'icon' }), 'Refresh'],
      ),
    ),
  ];

  return { actions };
};

/**
 * Chart configuration Hook
 * Provides configuration options for various charts
 */
export const useChartConfigs = (statisticsData: StatisticsData | null) => {
  // Event level distribution pie chart configuration
  const eventLevelPieConfig = {
    data: statisticsData
      ? [
          {
            type: 'Critical',
            value: statisticsData.eventLevelDistribution.critical,
          },
          { type: 'High', value: statisticsData.eventLevelDistribution.high },
          {
            type: 'Medium',
            value: statisticsData.eventLevelDistribution.medium,
          },
          { type: 'Low', value: statisticsData.eventLevelDistribution.low },
        ]
      : [],
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
    },
    interactions: [{ type: 'element-active' }],
  };

  // Event trend line chart configuration
  const eventTrendLineConfig = {
    data: statisticsData?.eventTrend || [],
    xField: 'date',
    yField: 'count',
    seriesField: 'level',
    smooth: true,
    animation: {
      appear: {
        animation: 'path-in',
        duration: 1000,
      },
    },
  };

  // Event type bar chart configuration
  const eventTypeBarConfig = {
    data: statisticsData
      ? [
          { type: 'Alert', value: statisticsData.eventTypeDistribution.alert },
          {
            type: 'Warning',
            value: statisticsData.eventTypeDistribution.warning,
          },
          { type: 'Info', value: statisticsData.eventTypeDistribution.info },
          { type: 'Error', value: statisticsData.eventTypeDistribution.error },
        ]
      : [],
    xField: 'value',
    yField: 'type',
    seriesField: 'type',
    legend: {
      position: 'top-left',
    },
  };

  return {
    eventLevelPieConfig,
    eventTrendLineConfig,
    eventTypeBarConfig,
  };
};
