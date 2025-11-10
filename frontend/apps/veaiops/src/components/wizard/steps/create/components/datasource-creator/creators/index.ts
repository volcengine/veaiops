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

/**
 * Data source creation function unified export
 */

import type { DataSourceType, WizardState } from '@/components/wizard/types';
import { DataSource } from '@veaiops/api-client';
import type { CreateResult } from '../types';
import { createAliyunDataSource } from './aliyun';
import { createVolcengineDataSource } from './volcengine';
import { createZabbixDataSource } from './zabbix';

export { createAliyunDataSource } from './aliyun';
export { createVolcengineDataSource } from './volcengine';
export { createZabbixDataSource } from './zabbix';

/**
 * Create data source based on data source type
 */
export const createDataSource = async (
  dataSourceType: DataSourceType,
  state: WizardState,
): Promise<CreateResult> => {
  switch (dataSourceType) {
    case DataSource.type.ZABBIX:
      return createZabbixDataSource(state);
    case DataSource.type.ALIYUN:
      return createAliyunDataSource(state);
    case DataSource.type.VOLCENGINE:
      return createVolcengineDataSource(state);
    default:
      return {
        success: false,
        message: '不支持的数据源类型',
        error: 'Unsupported data source type',
      };
  }
};
