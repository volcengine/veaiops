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

import { Column } from '@ant-design/plots';
import { Empty, Grid, Progress, Spin } from '@arco-design/web-react';
import { CardContainer, CardTitle } from '@veaiops/components';
import type React from 'react';
import { useState } from 'react';
import type { StatisticsDataCheck, ThresholdTrendData } from '../types';

const { Row, Col } = Grid;

const getSuccessRateColor = (rate: number) => {
  if (rate >= 80) {
    return '#52c41a';
  } else if (rate >= 60) {
    return '#faad14';
  } else {
    return '#f5222d';
  }
};

const getProgressStatus = (rate: number) => {
  if (rate >= 80) {
    return 'success';
  } else if (rate >= 60) {
    return 'warning';
  } else {
    return 'error';
  }
};

const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
  if (trend === 'up') {
    return '#52c41a';
  } else if (trend === 'down') {
    return '#f5222d';
  } else {
    return '#666';
  }
};

const getTrendSymbol = (trend: 'up' | 'down' | 'stable') => {
  if (trend === 'up') {
    return '↗';
  } else if (trend === 'down') {
    return '↘';
  } else {
    return '→';
  }
};

interface EnhancedThresholdStatisticsProps {
  statistics: any;
  loading: boolean;
  dataCheck: StatisticsDataCheck;
  getThresholdTrendData: () => ThresholdTrendData[];
}

/**
 * Enhanced intelligent threshold statistics component
 * @description Displays intelligent threshold task statistics and trend charts with better visual effects and interactivity
 */
export const EnhancedThresholdStatistics: React.FC<
  EnhancedThresholdStatisticsProps
> = ({ statistics, loading, dataCheck, getThresholdTrendData }) => {
  const [hoveredChart, setHoveredChart] = useState<string | null>(null);

  /**
   * calculateSuccessRate parameters interface
   */
  interface CalculateSuccessRateParams {
    success: number;
    failed: number;
  }

  // Calculate success rate
  const calculateSuccessRate = ({
    success,
    failed,
  }: CalculateSuccessRateParams) => {
    const total = success + failed;
    return total === 0 ? 0 : Math.round((success / total) * 100);
  };

  // Process intelligent threshold trend data
  const processedThresholdData = getThresholdTrendData().map((item) => ({
    period: item.period,
    success: item.success,
    failed: item.failed,
    total: item.success + item.failed,
    successRate: calculateSuccessRate({
      success: item.success,
      failed: item.failed,
    }),
  }));

  // Intelligent threshold trend chart configuration
  const thresholdChartConfig = {
    data: processedThresholdData.flatMap((item) => [
      {
        period: item.period,
        type: '成功',
        count: item.success,
        successRate: item.successRate,
        total: item.total,
      },
      {
        period: item.period,
        type: '失败',
        count: item.failed,
        successRate: item.successRate,
        total: item.total,
      },
    ]),
    xField: 'period',
    yField: 'count',
    seriesField: 'type',
    isGroup: true,
    color: ['#52c41a', '#f5222d'],
    height: 200,
    columnStyle: {
      radius: [4, 4, 0, 0],
    },
    label: {
      position: 'top' as const,
      style: {
        fill: '#666',
        fontSize: 12,
        fontWeight: 'bold',
      },
      formatter: (datum: any) => {
        const { type, count, successRate } = datum;
        if (type === '成功') {
          return `${count} (${successRate}%)`;
        } else {
          return count;
        }
      },
    },
    tooltip: {
      customContent: (title: string, items: any[]) => {
        const successItem = items.find((item) => item.data.type === '成功');
        const failedItem = items.find((item) => item.data.type === '失败');

        if (!successItem || !failedItem) {
          return '';
        }

        // Continue with tooltip content generation

        const { successRate } = successItem.data;
        const successRateColor = getSuccessRateColor(successRate);

        return `
          <div style="padding: 12px; background: white; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); min-width: 200px;">
            <div style="font-weight: bold; margin-bottom: 8px; font-size: 14px;">${title}</div>
            <div style="margin-bottom: 8px;">
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 8px; height: 8px; background: #52c41a; border-radius: 50%; margin-right: 8px;"></div>
                <span>成功: <strong>${successItem.value}</strong></span>
              </div>
              <div style="display: flex; align-items: center; margin-bottom: 4px;">
                <div style="width: 8px; height: 8px; background: #f5222d; border-radius: 50%; margin-right: 8px;"></div>
                <span>失败: <strong>${failedItem.value}</strong></span>
              </div>
            </div>
            <div style="border-top: 1px solid #f0f0f0; padding-top: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 12px; color: #666;">成功率</span>
                <span style="font-weight: bold; color: ${successRateColor};">${successRate}%</span>
              </div>
              <div style="margin-top: 4px;">
                <div style="width: 100%; height: 4px; background: #f0f0f0; border-radius: 2px; overflow: hidden;">
                  <div style="width: ${successRate}%; height: 100%; background: ${successRateColor}; transition: all 0.3s ease;"></div>
                </div>
              </div>
            </div>
          </div>
        `;
      },
    },
    interactions: [
      {
        type: 'element-active',
        cfg: {
          start: [
            {
              trigger: 'element:mouseenter',
              action: 'element:active',
            },
          ],
          end: [
            {
              trigger: 'element:mouseleave',
              action: 'element:reset',
            },
          ],
        },
      },
    ],
    animation: {
      appear: {
        animation: 'scale-in-y',
        duration: 800,
      },
      update: {
        animation: 'scale-in-y',
        duration: 400,
      },
    },
  };

  // Calculate overall success rate trend
  const calculateOverallTrend = () => {
    if (processedThresholdData.length < 2) {
      return null;
    }
    const first = processedThresholdData[0].successRate;
    const last =
      processedThresholdData[processedThresholdData.length - 1].successRate;
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (last > first) {
      trend = 'up';
    } else if (last < first) {
      trend = 'down';
    }
    const percentage = Math.abs(last - first);
    return { trend, percentage };
  };

  const overallTrend = calculateOverallTrend();

  return (
    <>
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={12}>
          <CardContainer height={300}>
            <CardTitle title="智能阈值任务统计" />
            <div style={{ padding: '16px 0' }}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '16px',
                }}
              >
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#52c41a',
                    }}
                  >
                    {statistics?.active_intelligent_threshold_tasks || 0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    活跃任务
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      fontSize: '24px',
                      fontWeight: 'bold',
                      color: '#1890ff',
                    }}
                  >
                    {statistics?.active_intelligent_threshold_autoupdate_tasks ||
                      0}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    自动更新任务
                  </div>
                </div>
              </div>

              {/* Success rate overview */}
              <div style={{ marginTop: '20px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    marginBottom: '8px',
                  }}
                >
                  整体成功率
                </div>
                {processedThresholdData.map((item, index) => (
                  <div key={index} style={{ marginBottom: '12px' }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginBottom: '4px',
                      }}
                    >
                      <span style={{ fontSize: '12px', color: '#666' }}>
                        {item.period}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 'bold',
                          color: getSuccessRateColor(item.successRate),
                        }}
                      >
                        {item.successRate}%
                      </span>
                    </div>
                    <Progress
                      percent={item.successRate}
                      size="small"
                      status={getProgressStatus(item.successRate)}
                      showText={false}
                    />
                  </div>
                ))}
              </div>
            </div>
          </CardContainer>
        </Col>
        <Col span={12}>
          <div
            style={{
              transition: 'all 0.3s ease',
              transform:
                hoveredChart === 'threshold'
                  ? 'translateY(-2px)'
                  : 'translateY(0)',
              boxShadow:
                hoveredChart === 'threshold'
                  ? '0 8px 24px rgba(0,0,0,0.12)'
                  : '0 2px 8px rgba(0,0,0,0.08)',
            }}
            onMouseEnter={() => setHoveredChart('threshold')}
            onMouseLeave={() => setHoveredChart(null)}
          >
            <CardContainer height={300}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '16px',
                }}
              >
                <CardTitle title="智能阈值成功率趋势" />
                {overallTrend && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        color: getTrendColor(overallTrend.trend),
                        fontWeight: 'bold',
                      }}
                    >
                      {getTrendSymbol(overallTrend.trend)}
                      {overallTrend.percentage !== 0 &&
                        `${overallTrend.percentage}%`}
                    </span>
                  </div>
                )}
              </div>
              {(() => {
                if (loading) {
                  return (
                    <div className="flex-1 flex items-center justify-center">
                      <Spin size={20} />
                    </div>
                  );
                } else if (dataCheck.hasThresholdData) {
                  return <Column {...thresholdChartConfig} />;
                }
                return (
                  <div className="flex-1 flex items-center justify-center">
                    <Empty description="暂无智能阈值趋势数据" />
                  </div>
                );
              })()}
            </CardContainer>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default EnhancedThresholdStatistics;
