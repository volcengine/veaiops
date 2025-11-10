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
 * Creation confirmation modal utility functions
 */

import { DataSource } from '@veaiops/api-client';
import type { DataSourceType } from '../../../types';

/**
 * Get data source type display text
 */
export const getDataSourceTypeText = (type: DataSourceType): string => {
  switch (type) {
    case DataSource.type.ZABBIX:
      return 'Zabbix';
    case DataSource.type.ALIYUN:
      return '阿里云';
    case DataSource.type.VOLCENGINE:
      return '火山引擎';
    default:
      return type;
  }
};
