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

import {
  Button,
  Card,
  Grid,
  Radio,
  Space,
  Spin,
  Statistic,
} from '@arco-design/web-react';
import { IconDown, IconRefresh, IconUp } from '@arco-design/web-react/icon';
import type { StatisticsData, TimeRange } from '@ec/statistics';
import type React from 'react';

const { Row, Col } = Grid;

/**
 * Statistics overview component props interface
 */
interface StatisticsOverviewProps {
  loading: boolean;
  statisticsData: StatisticsData | null;
  timeRange: TimeRange;
  onTimeRangeChange: (range: TimeRange) => void;
  onRefresh: () => void;
}

/**
 * Statistics overview component
 * Provides overview display of key metrics
 */
export const StatisticsOverview: React.FC<StatisticsOverviewProps> = ({
  loading,
  statisticsData,
  timeRange,
  onTimeRangeChange,
  onRefresh,
}) => {
  // Time range options
  const timeRangeOptions = [
    { label: '1小时', value: '1h' as TimeRange },
    { label: '24小时', value: '24h' as TimeRange },
    { label: '7天', value: '7d' as TimeRange },
    { label: '30天', value: '30d' as TimeRange },
  ];

  return (
    <div className="mb-6">
      {/* Toolbar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="m-0">概述统计</h2>
        <Space>
          <Radio.Group
            type="button"
            value={timeRange}
            onChange={onTimeRangeChange}
            options={timeRangeOptions}
          />
          <Button icon={<IconRefresh />} onClick={onRefresh} loading={loading}>
            刷新
          </Button>
        </Space>
      </div>

      {/* Statistics cards */}
      <Spin loading={loading}>
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="总事件数"
                value={statisticsData?.totalEvents || 0}
                prefix={<IconUp style={{ color: '#00B42A' }} />}
                countUp
                styleValue={{ color: '#1D2129' }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="消息卡片通知策略"
                value={statisticsData?.totalStrategies || 0}
                prefix={<IconUp style={{ color: '#165DFF' }} />}
                countUp
                styleValue={{ color: '#1D2129' }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="订阅关系"
                value={statisticsData?.totalSubscriptions || 0}
                suffix={`/ ${statisticsData?.activeSubscriptions || 0} 活跃`}
                prefix={<IconUp style={{ color: '#FF7D00' }} />}
                countUp
                styleValue={{ color: '#1D2129' }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="成功率"
                value={statisticsData?.successRate.rate || 0}
                precision={2}
                suffix="%"
                prefix={
                  (statisticsData?.successRate.rate || 0) >= 95 ? (
                    <IconUp style={{ color: '#00B42A' }} />
                  ) : (
                    <IconDown style={{ color: '#F53F3F' }} />
                  )
                }
                countUp
                styleValue={{
                  color:
                    (statisticsData?.successRate.rate || 0) >= 95
                      ? '#00B42A'
                      : '#F53F3F',
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* Response time statistics */}
        <Row gutter={16} className="mt-4">
          <Col span={6}>
            <Card>
              <Statistic
                title="平均响应时间"
                value={statisticsData?.responseTimeStats.average || 0}
                precision={2}
                suffix="s"
                styleValue={{ color: '#1D2129' }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="最小响应时间"
                value={statisticsData?.responseTimeStats.min || 0}
                precision={2}
                suffix="s"
                styleValue={{ color: '#00B42A' }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="最大响应时间"
                value={statisticsData?.responseTimeStats.max || 0}
                precision={2}
                suffix="s"
                styleValue={{ color: '#F53F3F' }}
              />
            </Card>
          </Col>

          <Col span={6}>
            <Card>
              <Statistic
                title="P95响应时间"
                value={statisticsData?.responseTimeStats.p95 || 0}
                precision={2}
                suffix="s"
                styleValue={{ color: '#FF7D00' }}
              />
            </Card>
          </Col>
        </Row>
      </Spin>
    </div>
  );
};

export default StatisticsOverview;
