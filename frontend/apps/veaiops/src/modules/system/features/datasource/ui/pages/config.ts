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

import { TAB_KEYS } from '@datasource/lib';
import type { DataSourceType } from 'api-generate';
import type { DataSourceConfig, TableRefMap } from './types';

/**
 * Create data source configuration list
 */
export const createDataSourceConfigs = (handlers: {
  handleDeleteVolcengine: (
    monitorId: string,
    dataSourceType?: DataSourceType,
  ) => Promise<boolean>;
  handleDeleteAliyun: (
    monitorId: string,
    dataSourceType?: DataSourceType,
  ) => Promise<boolean>;
  handleDeleteZabbix: (
    monitorId: string,
    dataSourceType?: DataSourceType,
  ) => Promise<boolean>;
}): DataSourceConfig[] => [
  {
    key: TAB_KEYS.VOLCENGINE,
    type: 'Volcengine' as DataSourceType,
    deleteHandler: handlers.handleDeleteVolcengine,
    tableRefKey: 'volcengineTableRef' as const,
  },
  {
    key: TAB_KEYS.ALIYUN,
    type: 'Aliyun' as DataSourceType,
    deleteHandler: handlers.handleDeleteAliyun,
    tableRefKey: 'aliyunTableRef' as const,
  },
  {
    key: TAB_KEYS.ZABBIX,
    type: 'Zabbix' as DataSourceType,
    deleteHandler: handlers.handleDeleteZabbix,
    tableRefKey: 'zabbixTableRef' as const,
  },
];

/**
 * Get corresponding tableRef
 */
export const getTableRef = (
  refKey: DataSourceConfig['tableRefKey'],
  refMap: TableRefMap,
) => {
  return refMap[refKey];
};
