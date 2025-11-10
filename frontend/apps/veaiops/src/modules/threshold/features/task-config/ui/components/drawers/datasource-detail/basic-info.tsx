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

import { Descriptions, Space, Typography } from '@arco-design/web-react';
import { IconCodeSquare } from '@arco-design/web-react/icon';
import { CardWithTitle } from '@veaiops/components';
import type { ReactNode } from 'react';
import type { ConfigSectionProps } from './types';

const { Text } = Typography;

/**
 * Basic information card
 *
 * Displays datasource ID and name
 */
export const BasicInfo: React.FC<ConfigSectionProps> = ({ datasource }) => {
  return (
    <CardWithTitle title="基础信息" className="mb-4">
      <Descriptions
        column={2}
        data={[
          {
            label: (
              <Space size={4}>
                <IconCodeSquare className="text-gray-500" />
                <span>数据源ID</span>
              </Space>
            ),
            value: (
              <Text copyable={{ text: datasource._id || '' }}>
                {datasource._id || '-'}
              </Text>
            ) as ReactNode,
          },
          {
            label: (
              <Space size={4}>
                <IconCodeSquare className="text-gray-500" />
                <span>数据源名称</span>
              </Space>
            ),
            value: datasource.name || '-',
          },
        ]}
        className="mb-0"
      />
    </CardWithTitle>
  );
};
