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

import type React from 'react';
import { AliyunIcon } from './aliyun-icon';
import { MonitorIcon } from './monitor-icon';
import { VolcengineIcon } from './volcengine-icon';
import { ZabbixIcon } from './zabbix-icon';

export { ZabbixIcon } from './zabbix-icon';
export { AliyunIcon } from './aliyun-icon';
export { VolcengineIcon } from './volcengine-icon';
export { MonitorIcon } from './monitor-icon';

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

/**
 * Get the corresponding icon based on data source type
 */
export const getDataSourceIcon = (
  type: 'Zabbix' | 'Aliyun' | 'Volcengine' | string,
  props?: IconProps,
): React.ReactElement => {
  switch (type) {
    case 'Zabbix':
      return <ZabbixIcon {...props} />;
    case 'Aliyun':
      return <AliyunIcon {...props} />;
    case 'Volcengine':
      return <VolcengineIcon {...props} />;
    default:
      return <MonitorIcon {...props} />;
  }
};
