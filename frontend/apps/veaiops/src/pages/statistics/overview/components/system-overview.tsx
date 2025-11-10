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

import { Grid, Typography } from '@arco-design/web-react';
import { CardContainer, CardTitle } from '@veaiops/components';
import type React from 'react';
import type { SystemOverviewData } from '../types';

const { Row, Col } = Grid;

interface SystemOverviewProps {
  getSystemOverviewData: () => SystemOverviewData[];
}

/**
 * System resource overview component
 * @description Display resource overview information for each module of the system
 */
export const SystemOverview: React.FC<SystemOverviewProps> = ({
  getSystemOverviewData,
}) => {
  return (
    <Row gutter={16} style={{ marginBottom: '24px' }}>
      <Col span={24}>
        <CardContainer height={400}>
          <CardTitle title="系统资源概览" />
          <div style={{ marginTop: '16px', flex: 1, overflowY: 'auto' }}>
            {getSystemOverviewData().map((category, index) => (
              <div key={index} style={{ marginBottom: '20px' }}>
                <Typography.Text
                  bold
                  style={{ fontSize: '14px', color: '#1890ff' }}
                >
                  {category.category}
                </Typography.Text>
                <div style={{ marginTop: '8px' }}>
                  {category.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '8px 0',
                        borderBottom:
                          itemIndex < category.items.length - 1
                            ? '1px solid #f0f0f0'
                            : 'none',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ marginRight: '8px', color: '#666' }}>
                          {item.icon}
                        </span>
                        <Typography.Text style={{ fontSize: '13px' }}>
                          {item.name}
                        </Typography.Text>
                      </div>
                      <Typography.Text bold style={{ color: '#1890ff' }}>
                        {item.value}
                      </Typography.Text>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContainer>
      </Col>
    </Row>
  );
};

export default SystemOverview;
