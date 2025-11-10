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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import {
  IconBug,
  IconMessage,
  IconRobot,
  IconUser,
} from '@arco-design/web-react/icon';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type {
  APIResponseSystemStatistics,
  SystemStatistics,
} from 'api-generate';
import { useEffect, useState } from 'react';
import type {
  EventTrendData,
  MessageTrendData,
  StatisticsDataCheck,
  SystemOverviewData,
  ThresholdTrendData,
} from '../types';

/**
 * Statistics data management Hook
 * @description Manages statistics data fetching, processing, and state
 */
export const useStatisticsData = () => {
  const [statistics, setStatistics] = useState<SystemStatistics | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch statistics data
   */
  const fetchStatistics = async () => {
    try {
      setLoading(true);
      const result: APIResponseSystemStatistics =
        await apiClient.statistics.getStatisticsSummary();

      if (result.code === API_RESPONSE_CODE.SUCCESS && result.data) {
        setStatistics(result.data);
      } else {
        throw new Error(result.message || '获取统计数据失败');
      }
    } catch (error) {
      // ✅ Correct: expose actual error information
      const errorMessage =
        error instanceof Error ? error.message : '获取统计数据失败';

      Message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Get intelligent threshold trend data
   */
  const getThresholdTrendData = (): ThresholdTrendData[] => [
    {
      period: '近1天',
      success: statistics?.latest_1d_intelligent_threshold_success_num || 0,
      failed: statistics?.latest_1d_intelligent_threshold_failed_num || 0,
    },
    {
      period: '近7天',
      success: statistics?.latest_7d_intelligent_threshold_success_num || 0,
      failed: statistics?.latest_7d_intelligent_threshold_failed_num || 0,
    },
    {
      period: '近30天',
      success: statistics?.latest_30d_intelligent_threshold_success_num || 0,
      failed: statistics?.latest_30d_intelligent_threshold_failed_num || 0,
    },
  ];

  /**
   * Get event trend data
   */
  const getEventTrendData = (): EventTrendData[] => [
    { period: '近24小时', count: statistics?.latest_24h_events || 0 },
    { period: '近1天', count: statistics?.last_1d_events || 0 },
    { period: '近7天', count: statistics?.last_7d_events || 0 },
    { period: '近30天', count: statistics?.last_30d_events || 0 },
  ];

  /**
   * Get message trend data
   */
  const getMessageTrendData = (): MessageTrendData[] => [
    { period: '近24小时', count: statistics?.latest_24h_messages || 0 },
    { period: '近1天', count: statistics?.last_1d_messages || 0 },
    { period: '近7天', count: statistics?.last_7d_messages || 0 },
    { period: '近30天', count: statistics?.last_30d_messages || 0 },
  ];

  /**
   * Get system resource overview data
   */
  const getSystemOverviewData = (): SystemOverviewData[] => [
    {
      category: '用户管理',
      items: [
        {
          name: '活跃用户',
          value: statistics?.active_users || 0,
          icon: <IconUser />,
        },
        {
          name: '活跃群聊',
          value: statistics?.active_chats || 0,
          icon: <IconMessage />,
        },
      ],
    },
    {
      category: '系统配置',
      items: [
        {
          name: '项目数量',
          value: statistics?.active_projects || 0,
          icon: <IconRobot />,
        },
      ],
    },
    {
      category: '通知管理',
      items: [
        {
          name: '消息卡片通知策略',
          value: statistics?.active_inform_strategies || 0,
          icon: <IconMessage />,
        },
        {
          name: '订阅数量',
          value: statistics?.active_subscribes || 0,
          icon: <IconBug />,
        },
      ],
    },
  ];

  /**
   * Check data status
   */
  const getDataCheck = (): StatisticsDataCheck => {
    const hasData = statistics !== null;
    const hasThresholdData =
      hasData &&
      getThresholdTrendData().some(
        (item) => item.success > 0 || item.failed > 0,
      );
    const hasEventData =
      hasData && getEventTrendData().some((item) => item.count > 0);
    const hasMessageData =
      hasData && getMessageTrendData().some((item) => item.count > 0);

    return {
      hasData,
      hasThresholdData,
      hasEventData,
      hasMessageData,
    };
  };

  useEffect(() => {
    fetchStatistics();
  }, []);

  return {
    statistics,
    loading,
    fetchStatistics,
    getThresholdTrendData,
    getEventTrendData,
    getMessageTrendData,
    getSystemOverviewData,
    getDataCheck,
  };
};
