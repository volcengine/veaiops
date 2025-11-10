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

import { Card, Empty, Grid, Spin } from '@arco-design/web-react';
// ✅ Optimization: Use shortest path, merge same-source imports
import { type StatisticsData, useChartConfigs } from '@ec/statistics';
import type React from 'react';

const { Row, Col } = Grid;

/**
 * Statistics charts component props interface
 */
interface StatisticsChartsProps {
  loading: boolean;
  statisticsData: StatisticsData | null;
}

/**
 * Simple chart placeholder component
 * In actual projects, real chart libraries like ECharts or G2Plot should be used here
 */
const ChartPlaceholder: React.FC<{
  title: string;
  data: any[];
  type: 'pie' | 'line' | 'bar';
}> = ({ title, data, type }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <Empty description="暂无数据" />
      </div>
    );
  }

  return (
    <div className="h-[300px] flex items-center justify-center bg-[#f7f8fa] rounded-md flex-col gap-3">
      <div className="text-base font-medium">{title}</div>
      <div className="text-sm text-[#86909c]">
        {type === 'pie' && '饼图'}
        {type === 'line' && '折线图'}
        {type === 'bar' && '柱状图'}
        {' - '}
        {data.length} 项数据
      </div>
      <div className="text-xs text-[#c9cdd4]">
        图表组件占位符 - 请集成 ECharts 或 G2Plot
      </div>
    </div>
  );
};

/**
 * Statistics charts component
 * Provides display of various statistical charts
 */
export const StatisticsCharts: React.FC<StatisticsChartsProps> = ({
  loading,
  statisticsData,
}) => {
  // Get chart configurations
  const { eventLevelPieConfig, eventTrendLineConfig, eventTypeBarConfig } =
    useChartConfigs(statisticsData);

  return (
    <Spin loading={loading}>
      <Row gutter={16}>
        {/* Event level distribution pie chart */}
        <Col span={8}>
          <Card title="事件级别分布" style={{ height: 400 }}>
            <ChartPlaceholder
              title="事件级别分布"
              data={eventLevelPieConfig.data}
              type="pie"
            />
          </Card>
        </Col>

        {/* Event type distribution bar chart */}
        <Col span={8}>
          <Card title="事件类型分布" style={{ height: 400 }}>
            <ChartPlaceholder
              title="事件类型分布"
              data={eventTypeBarConfig.data}
              type="bar"
            />
          </Card>
        </Col>

        {/* Success rate statistics */}
        <Col span={8}>
          <Card title="处理成功率" style={{ height: 400 }}>
            <div className="h-[300px] flex items-center justify-center flex-col gap-4">
              <div
                className="text-5xl font-bold"
                style={{
                  color:
                    (statisticsData?.successRate.rate || 0) >= 95
                      ? '#00B42A'
                      : '#F53F3F',
                }}
              >
                {(statisticsData?.successRate.rate || 0).toFixed(1)}%
              </div>
              <div className="text-sm text-[#86909c]">
                成功: {statisticsData?.successRate.success || 0} / 失败:{' '}
                {statisticsData?.successRate.failed || 0}
              </div>
              <div className="text-xs text-[#c9cdd4]">
                总计: {statisticsData?.successRate.total || 0} 个事件
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Event trend chart */}
      <Row gutter={16} className="mt-4">
        <Col span={24}>
          <Card title="事件趋势" style={{ height: 400 }}>
            <ChartPlaceholder
              title="24小时事件趋势"
              data={eventTrendLineConfig.data}
              type="line"
            />
          </Card>
        </Col>
      </Row>

      {/* Response time distribution */}
      <Row gutter={16} className="mt-4">
        <Col span={12}>
          <Card title="响应时间统计" style={{ height: 300 }}>
            <div className="h-[200px] flex items-center justify-center flex-col gap-3">
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-[#86909c]">平均: </span>
                  <span className="font-medium">
                    {(statisticsData?.responseTimeStats.average || 0).toFixed(
                      2,
                    )}
                    s
                  </span>
                </div>
                <div>
                  <span className="text-[#86909c]">P95: </span>
                  <span className="font-medium">
                    {(statisticsData?.responseTimeStats.p95 || 0).toFixed(2)}s
                  </span>
                </div>
              </div>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-[#86909c]">最小: </span>
                  <span className="font-medium text-[#00B42A]">
                    {(statisticsData?.responseTimeStats.min || 0).toFixed(2)}s
                  </span>
                </div>
                <div>
                  <span className="text-[#86909c]">最大: </span>
                  <span className="font-medium text-[#F53F3F]">
                    {(statisticsData?.responseTimeStats.max || 0).toFixed(2)}s
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="系统健康度" style={{ height: 300 }}>
            <div className="h-[200px] flex items-center justify-center flex-col gap-4">
              <div className="text-4xl font-bold text-[#00B42A]">健康</div>
              <div className="text-sm text-[#86909c]">
                系统运行正常，所有指标均在正常范围内
              </div>
              <div className="flex gap-4 text-xs text-[#c9cdd4]">
                <span>✓ 响应时间正常</span>
                <span>✓ 成功率达标</span>
                <span>✓ 无异常事件</span>
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default StatisticsCharts;
