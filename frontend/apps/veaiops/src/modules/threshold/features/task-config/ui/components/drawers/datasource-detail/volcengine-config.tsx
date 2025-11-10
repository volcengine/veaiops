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
import { isVolcengineType } from './type-guards';
import type { ConfigSectionProps } from './types';

const { Text } = Typography;

/**
 * Volcengine configuration card
 *
 * Displays Volcengine datasource configuration information and instance list
 */
export const VolcengineConfig: React.FC<ConfigSectionProps> = ({
  datasource,
}) => {
  if (!isVolcengineType(datasource.type) || !datasource.volcengine_config) {
    return null;
  }

  const config = datasource.volcengine_config;

  return (
    <>
      <CardWithTitle
        title={
          <Space size={4}>
            <IconSettings className="text-gray-600" />
            <span>火山引擎配置</span>
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
              label: '子命名空间',
              value: config.sub_namespace || '-',
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

      {/* Instance list */}
      {config.instances &&
        Array.isArray(config.instances) &&
        config.instances.length > 0 && (
          <CardWithTitle
            title={`实例列表 (${config.instances.length})`}
            className="mb-4"
          >
            <div className="space-y-2">
              {config.instances.map((instance, index) => {
                const resourceId =
                  typeof instance === 'object' && instance !== null
                    ? instance.ResourceID ||
                      instance.resourceId ||
                      JSON.stringify(instance)
                    : String(instance);

                return (
                  <div
                    key={index}
                    className="p-2 bg-gray-50 rounded border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <Text
                        className="font-mono text-sm"
                        copyable={{ text: resourceId }}
                      >
                        {resourceId}
                      </Text>
                      <Tag size="small" color="blue">
                        实例 {index + 1}
                      </Tag>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardWithTitle>
        )}
    </>
  );
};
