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

import type { DataSourceType } from '@/modules/system/features/datasource/lib';
import type { DataSource } from 'api-generate';
import type { GetConfigDataParams } from '../types';

/**
 * Get configuration data based on data source type
 */
export const getConfigData = ({
  record,
  dataSourceType,
}: GetConfigDataParams) => {
  // Use type assertion because actual data structure contains specific configuration fields
  const recordWithConfigs = record as DataSource & {
    volcengine_config?: Record<string, unknown>;
    aliyun_config?: Record<string, unknown>;
    zabbix_config?: Record<string, unknown>;
  };

  switch (dataSourceType) {
    case 'Volcengine':
      return recordWithConfigs.volcengine_config;
    case 'Aliyun':
      return recordWithConfigs.aliyun_config;
    case 'Zabbix':
      return recordWithConfigs.zabbix_config;
    default:
      // Fallback for generic config if needed, though specific configs are preferred
      return null;
  }
};
