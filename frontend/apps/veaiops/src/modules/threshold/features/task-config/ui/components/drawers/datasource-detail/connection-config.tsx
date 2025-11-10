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
import { IconLink } from '@arco-design/web-react/icon';
import { CardWithTitle } from '@veaiops/components';
import type { ReactNode } from 'react';
import type { ConfigSectionProps } from './types';

const { Text } = Typography;

/**
 * Connection configuration card
 *
 * Displays datasource connection information (connection ID, name, API URL, Access Key, etc.)
 */
export const ConnectionConfig: React.FC<ConfigSectionProps> = ({
  datasource,
}) => {
  if (!datasource.connect) {
    return null;
  }

  return (
    <CardWithTitle
      title={
        <Space size={4}>
          <IconLink className="text-gray-600" />
          <span>连接配置</span>
        </Space>
      }
      className="mb-4"
    >
      <Descriptions
        column={1}
        data={[
          {
            label: '连接ID',
            value: (datasource.connect.id || datasource.connect._id ? (
              <Text
                copyable={{
                  text: datasource.connect.id || datasource.connect._id || '',
                }}
              >
                {datasource.connect.id || datasource.connect._id || '-'}
              </Text>
            ) : (
              '-'
            )) as ReactNode,
          },
          {
            label: '连接名称',
            value: datasource.connect.name || '-',
          },
          {
            label: 'Zabbix API URL',
            value: datasource.connect.zabbix_api_url || '-',
          },
          {
            label: 'Zabbix API 用户',
            value: datasource.connect.zabbix_api_user || '-',
          },
          {
            label: '阿里云 Access Key',
            value: datasource.connect.aliyun_access_key_id
              ? `${datasource.connect.aliyun_access_key_id.slice(0, 8)}●●●●●●`
              : '-',
          },
          {
            label: '火山引擎 Access Key',
            value: datasource.connect.volcengine_access_key_id
              ? `${datasource.connect.volcengine_access_key_id.slice(0, 8)}●●●●●●`
              : '-',
          },
        ].filter((item) => item.value !== '-')}
        className="mb-0"
      />
    </CardWithTitle>
  );
};
