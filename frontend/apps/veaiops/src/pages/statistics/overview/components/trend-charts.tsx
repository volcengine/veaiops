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
// import { Column } from '@ant-design/plots';
import { Empty, Grid, Spin } from '@arco-design/web-react';
import { CardContainer, CardTitle } from '@veaiops/components';
import type React from 'react';
import type {
  EventTrendData,
  MessageTrendData,
  StatisticsDataCheck,
} from '../types';

const { Row, Col } = Grid;

interface TrendChartsProps {
  loading: boolean;
  dataCheck: StatisticsDataCheck;
  getEventTrendData: () => EventTrendData[];
  getMessageTrendData: () => MessageTrendData[];
}

/**
 * Trend charts component
 * @description Display trend charts for events and messages
 */
export const TrendCharts: React.FC<TrendChartsProps> = ({
  loading,
  dataCheck,
  getEventTrendData,
  getMessageTrendData,
}) => {
  return (
    <Row gutter={16} style={{ marginBottom: '24px' }}>
      <Col span={12}>
        <CardContainer height={300}>
          <CardTitle title="事件数量趋势" />
          {(() => {
            if (loading) {
              return (
                <div className="flex-1 flex items-center justify-center">
                  <Spin size={20} />
                </div>
              );
            }
            if (dataCheck.hasEventData) {
              return (
                <Column
                  data={getEventTrendData()}
                  xField="period"
                  yField="count"
                  color="#1890ff"
                  height={200}
                  style={{
                    maxWidth: 40,
                  }}
                />
              );
            }
            return (
              <div className="flex-1 flex items-center justify-center">
                <Empty description="暂无事件数据" />
              </div>
            );
          })()}
        </CardContainer>
      </Col>
      <Col span={12}>
        <CardContainer height={300}>
          <CardTitle title="消息数量趋势" />
          {(() => {
            if (loading) {
              return (
                <div className="flex-1 flex items-center justify-center">
                  <Spin size={20} />
                </div>
              );
            }
            if (dataCheck.hasMessageData) {
              return (
                <Column
                  data={getMessageTrendData()}
                  xField="period"
                  yField="count"
                  color="#faad14"
                  height={200}
                  style={{
                    maxWidth: 40,
                  }}
                />
              );
            }
            return (
              <div className="flex-1 flex items-center justify-center">
                <Empty description="暂无消息数据" />
              </div>
            );
          })()}
        </CardContainer>
      </Col>
    </Row>
  );
};

export default TrendCharts;
