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

import { Drawer, Space, Spin } from '@arco-design/web-react';
import { IconLink } from '@arco-design/web-react/icon';
import { AliyunConfig } from './aliyun-config';
import { BasicInfo } from './basic-info';
import { ConnectionConfig } from './connection-config';
import { Header } from './header';
import { TimeInfo } from './time-info';
import type { DatasourceDetailDrawerProps } from './types';
import { getTypeConfig } from './utils';
import { VolcengineConfig } from './volcengine-config';
import { ZabbixConfig } from './zabbix-config';

/**
 * Datasource detail drawer component
 *
 * Used to view detailed information of associated datasources in the intelligent threshold task configuration list
 *
 * ### Features
 * - Beautiful background image + gradient header card
 * - Supports three datasource types: Volcengine, Aliyun, and Zabbix
 * - Dynamically displays type-specific configuration information
 * - Automatically translates datasource types to Chinese
 */
export const DatasourceDetailDrawer: React.FC<DatasourceDetailDrawerProps> = ({
  visible,
  datasource,
  loading,
  onClose,
}) => {
  if (!datasource && !loading) {
    return null;
  }

  const typeConfig = datasource ? getTypeConfig(datasource.type) : null;

  return (
    <Drawer
      title={
        <Space size={8}>
          <IconLink />
          <span>数据源详情</span>
        </Space>
      }
      visible={visible}
      onCancel={onClose}
      width={680}
      placement="right"
      unmountOnExit
      footer={null}
    >
      <Spin loading={loading} className="w-full">
        {datasource && typeConfig && (
          <div>
            {/* Header card */}
            <Header datasource={datasource} typeConfig={typeConfig} />

            {/* Basic information */}
            <BasicInfo datasource={datasource} />

            {/* Connection configuration */}
            <ConnectionConfig datasource={datasource} />

            {/* Volcengine configuration */}
            <VolcengineConfig datasource={datasource} />

            {/* Aliyun configuration */}
            <AliyunConfig datasource={datasource} />

            {/* Zabbix configuration */}
            <ZabbixConfig datasource={datasource} />

            {/* Time information */}
            <TimeInfo datasource={datasource} />
          </div>
        )}
      </Spin>
    </Drawer>
  );
};
