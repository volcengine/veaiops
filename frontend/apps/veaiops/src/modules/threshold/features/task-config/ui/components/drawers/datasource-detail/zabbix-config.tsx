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
import { isZabbixType } from './type-guards';
import type { ConfigSectionProps } from './types';

const { Text } = Typography;

/**
 * Zabbix configuration card
 *
 * Displays Zabbix datasource configuration information and target list
 */
export const ZabbixConfig: React.FC<ConfigSectionProps> = ({ datasource }) => {
  if (!isZabbixType(datasource.type) || !datasource.zabbix_config) {
    return null;
  }

  const config = datasource.zabbix_config;

  return (
    <>
      <CardWithTitle
        title={
          <Space size={4}>
            <IconSettings className="text-gray-600" />
            <span>Zabbix 配置</span>
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
              label: '指标名称',
              value: config.metric_name || '-',
            },
            {
              label: '历史类型',
              value:
                config.history_type !== undefined
                  ? String(config.history_type)
                  : '-',
            },
          ]}
          className="mb-0"
        />
      </CardWithTitle>

      {/* Target configuration */}
      {config.targets &&
        Array.isArray(config.targets) &&
        config.targets.length > 0 && (
          <CardWithTitle
            title={`目标配置 (${config.targets.length})`}
            className="mb-4"
          >
            <div className="space-y-2">
              {config.targets.map((target, index) => (
                <div
                  key={index}
                  className="p-2 bg-gray-50 rounded border border-gray-200"
                >
                  <div className="flex items-center justify-between">
                    <Text className="font-mono text-sm">
                      {typeof target === 'object' && target !== null
                        ? JSON.stringify(target)
                        : String(target)}
                    </Text>
                    <Tag size="small" color="purple">
                      目标 {index + 1}
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
