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

import { IconCloud, IconCodeSquare } from '@arco-design/web-react/icon';
import { DataSourceType } from '@veaiops/api-client';
import type { TypeConfig } from './types';

/**
 * Get datasource type configuration
 *
 * @param type - Datasource type
 * @returns Type configuration (icon, color, gradient, etc.)
 */
export const getTypeConfig = (type: string): TypeConfig => {
  switch (type) {
    case DataSourceType.VOLCENGINE:
      return {
        label: '火山引擎',
        color: 'arcoblue',
        icon: <IconCloud />,
        gradient: 'linear-gradient(135deg, #3370ff 0%, #165dff 100%)',
      };
    case DataSourceType.ALIYUN:
      return {
        label: '阿里云',
        color: 'orange',
        icon: <IconCloud />,
        gradient: 'linear-gradient(135deg, #ff7d00 0%, #f77234 100%)',
      };
    case DataSourceType.ZABBIX:
      return {
        label: 'Zabbix',
        color: 'purple',
        icon: <IconCodeSquare />,
        gradient: 'linear-gradient(135deg, #722ed1 0%, #9254de 100%)',
      };
    default:
      return {
        label: type,
        color: 'gray',
        icon: <IconCodeSquare />,
        gradient: 'linear-gradient(135deg, #86909c 0%, #c9cdd4 100%)',
      };
  }
};
