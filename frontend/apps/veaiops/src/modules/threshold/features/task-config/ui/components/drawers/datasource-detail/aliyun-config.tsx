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

import { Descriptions, Space, Tag, Typography } from '@arco-design/web-react';
import { IconSettings } from '@arco-design/web-react/icon';
import { CardWithTitle } from '@veaiops/components';
import { isAliyunType } from './type-guards';
import type { ConfigSectionProps } from './types';

const { Text } = Typography;

/**
 * Aliyun configuration card
 *
 * Displays Aliyun datasource configuration information and dimension list
 */
export const AliyunConfig: React.FC<ConfigSectionProps> = ({ datasource }) => {
  if (!isAliyunType(datasource.type) || !datasource.aliyun_config) {
    return null;
  }

  const config = datasource.aliyun_config;

  return (
    <>
      <CardWithTitle
        title={
          <Space size={4}>
            <IconSettings className="text-gray-600" />
            <span>阿里云配置</span>
          </Space>
        }
        className="mb-4"
      >
        <Descriptions
          column={2}
          data={[
            {
              label: '配置名称',
              value: config.name || '-',
            },
            {
              label: '连接名称',
              value: config.connect_name || '-',
            },
            {
              label: '地域',
              value: config.region || '-',
            },
            {
              label: '命名空间',
              value: config.namespace || '-',
            },
            {
              label: '指标名称',
              value: config.metric_name || '-',
            },
            {
              label: '分组维度',
              value: (() => {
                if (!config.group_by) {
                  return '-';
                }
                if (Array.isArray(config.group_by)) {
                  return config.group_by.join(', ');
                }
                return String(config.group_by);
              })(),
            },
          ]}
          className="mb-0"
        />
      </CardWithTitle>

      {/* Dimension configuration */}
      {config.dimensions &&
        Array.isArray(config.dimensions) &&
        config.dimensions.length > 0 && (
          <CardWithTitle
            title={`维度配置 (${config.dimensions.length})`}
            className="mb-4"
          >
            <div className="space-y-2">
              {config.dimensions.map((dimension, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <Text className="font-mono text-sm">
                      {JSON.stringify(dimension)}
                    </Text>
                    <Tag size="small" color="orange">
                      维度 {index + 1}
                    </Tag>
                  </div>
                </div>
              ))}
            </div>
          </CardWithTitle>
        )}
    </>
  );
};
