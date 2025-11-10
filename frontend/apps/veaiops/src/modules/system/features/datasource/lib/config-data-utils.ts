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

// Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You obtain a copy of the License at
//
//      https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import type { DataSource, DataSourceType } from 'api-generate';

/**
 * Data source record extended type (contains specific configuration fields)
 */
export type DataSourceWithConfigs = DataSource & {
  volcengine_config?: Record<string, unknown>;
  aliyun_config?: Record<string, unknown>;
  zabbix_config?: Record<string, unknown>;
};

/**
 * Get configuration data based on data source type
 *
 * Why use type assertion:
 * - DataSource type definition may not include specific data source configuration fields (volcengine_config, aliyun_config, zabbix_config)
 * - Actual API returned data contains these fields, but type definition may be incomplete
 * - Use type assertion to ensure type safety, runtime data correctness guaranteed by API
 *
 * TODO: Improve DataSource type definition in api-generate, add optional configuration fields
 *
 * @param record - Data source record
 * @param dsType - Data source type
 * @returns Configuration data object
 */
export interface GetConfigDataParams {
  record: DataSource;
  dsType: DataSourceType;
}

export const getConfigData = ({
  record,
  dsType,
}: GetConfigDataParams): Record<string, unknown> | undefined => {
  // Use type assertion because actual data structure contains specific configuration fields
  const recordWithConfigs = record as DataSourceWithConfigs;

  switch (dsType) {
    case 'Volcengine':
      return recordWithConfigs.volcengine_config;
    case 'Aliyun':
      return recordWithConfigs.aliyun_config;
    case 'Zabbix':
      return recordWithConfigs.zabbix_config;
    default:
      return record.config as Record<string, unknown> | undefined;
  }
};
