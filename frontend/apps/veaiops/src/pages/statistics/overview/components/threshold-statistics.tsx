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

import thinkingImage from '@/assets/thinking.png';
import { ModernCard } from '@/components/ui';
import { Column } from '@ant-design/plots';
// import { Column } from '@ant-design/plots';
import { Empty, Grid, Spin } from '@arco-design/web-react';
import { IconSync, IconThunderbolt } from '@arco-design/web-react/icon';
import { CardContainer, CardTitle } from '@veaiops/components';
import type { SystemStatistics } from 'api-generate';
import type React from 'react';
import type { StatisticsDataCheck, ThresholdTrendData } from '../types';

const { Row, Col } = Grid;

interface ThresholdStatisticsProps {
  statistics: SystemStatistics | null;
  loading: boolean;
  dataCheck: StatisticsDataCheck;
  getThresholdTrendData: () => ThresholdTrendData[];
}

/**
 * Intelligent threshold task card component
 * @description Displays intelligent threshold task statistics with modern design
 */
const IntelligentThresholdCard: React.FC<{
  statistics: SystemStatistics | null;
}> = ({ statistics }) => {
  const activeTasks = statistics?.active_intelligent_threshold_tasks || 0;
  const autoUpdateTasks =
    statistics?.active_intelligent_threshold_autoupdate_tasks || 0;

  return (
    <ModernCard
      title="智能阈值任务"
      description="智能阈值任务自动监控和调整系统阈值，提供精准的异常检测和预警能力"
      backgroundImage={thinkingImage}
      height={300}
      statistics={[
        {
          label: '活跃任务',
          value: activeTasks,
          color: '#1890ff',
          icon: <IconThunderbolt />,
        },
        {
          label: '自动更新',
          value: autoUpdateTasks,
          color: '#52c41a',
          icon: <IconSync />,
        },
      ]}
    />
  );
};

/**
 * Intelligent threshold statistics component
 * @description Displays intelligent threshold task statistics and trend chart
 */
export const ThresholdStatistics: React.FC<ThresholdStatisticsProps> = ({
  statistics,
  loading,
  dataCheck,
  getThresholdTrendData,
}) => {
  return (
    <Row gutter={16} style={{ marginBottom: '24px' }}>
      <Col span={12}>
        <IntelligentThresholdCard statistics={statistics} />
      </Col>
      <Col span={12}>
        <CardContainer height={300}>
          <CardTitle title="智能阈值成功率趋势" />
          {(() => {
            if (loading) {
              return (
                <div className="flex-1 flex items-center justify-center">
                  <Spin size={20} />
                </div>
              );
            }
            if (dataCheck.hasThresholdData) {
              return (
                <Column
                  data={getThresholdTrendData().flatMap((item) => [
                    { period: item.period, type: '成功', count: item.success },
                    { period: item.period, type: '失败', count: item.failed },
                  ])}
                  xField="period"
                  yField="count"
                  seriesField="type"
                  isGroup={true}
                  color={['#52c41a', '#f5222d']}
                  height={200}
                  style={{
                    maxWidth: 40,
                  }}
                />
              );
            }
            return (
              <div className="flex-1 flex items-center justify-center">
                <Empty description="暂无智能阈值趋势数据" />
              </div>
            );
          })()}
        </CardContainer>
      </Col>
    </Row>
  );
};

export default ThresholdStatistics;
