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

import { Descriptions, Typography } from '@arco-design/web-react';
import type React from 'react';

const { Title } = Typography;

/**
 * Zabbix configuration details section
 */
export const ZabbixDetailSection: React.FC = () => (
  <div className="mt-4">
    <Title heading={6}>Zabbix配置</Title>
    <Descriptions
      column={1}
      data={[
        {
          label: '指标名称',
          value: '-',
        },
        {
          label: '目标配置',
          value: '-',
        },
      ]}
    />
  </div>
);

/**
 * Aliyun configuration details section
 */
export const AliyunDetailSection: React.FC = () => (
  <div className="mt-4">
    <Title heading={6}>阿里云配置</Title>
    <Descriptions
      column={1}
      data={[
        {
          label: '命名空间',
          value: '-',
        },
        {
          label: '指标名称',
          value: '-',
        },
      ]}
    />
  </div>
);

/**
 * Volcengine configuration details section
 */
export const VolcengineDetailSection: React.FC = () => (
  <div className="mt-4">
    <Title heading={6}>火山引擎配置</Title>
    <Descriptions
      column={1}
      data={[
        {
          label: '命名空间',
          value: '-',
        },
        {
          label: '指标名称',
          value: '-',
        },
      ]}
    />
  </div>
);
