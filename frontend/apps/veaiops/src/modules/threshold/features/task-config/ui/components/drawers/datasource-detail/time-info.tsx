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

import { Descriptions } from '@arco-design/web-react';
import { CardWithTitle, CellRender } from '@veaiops/components';
import type { ReactNode } from 'react';
import type { ConfigSectionProps } from './types';

/**
 * Time information card
 *
 * Displays creation time and update time
 *
 * Note: StampTime component already has null value check logic, no additional check needed
 */
export const TimeInfo: React.FC<ConfigSectionProps> = ({ datasource }) => {
  return (
    <CardWithTitle title="时间信息">
      <Descriptions
        column={2}
        data={[
          {
            label: '创建时间',
            value: (
              <CellRender.StampTime time={datasource.created_at} />
            ) as ReactNode,
          },
          {
            label: '更新时间',
            value: (
              <CellRender.StampTime time={datasource.updated_at} />
            ) as ReactNode,
          },
        ]}
        className="mb-0"
      />
    </CardWithTitle>
  );
};
