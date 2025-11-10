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
 * Connect filter component
 * @description Handles connect filtering and search logic
 * @author AI Assistant
 * @date 2025-01-17
 */

import type { Connect } from 'api-generate';
import { DataSourceType as ApiDataSourceType } from 'api-generate';
import { DataSourceType } from '../../../types';

export const useConnectFilter = (
  connects: Connect[],
  dataSourceType?: DataSourceType | 'all',
  searchText = '',
) => {
  const filteredConnects = connects.filter((connect) => {
    // Filter by data source type - convert API type to local type
    let typeMatch = !dataSourceType || dataSourceType === 'all';
    if (!typeMatch) {
      if (
        connect.type === ApiDataSourceType.ZABBIX &&
        dataSourceType === DataSourceType.ZABBIX
      ) {
        typeMatch = true;
      } else if (
        connect.type === ApiDataSourceType.ALIYUN &&
        dataSourceType === DataSourceType.ALIYUN
      ) {
        typeMatch = true;
      } else if (
        connect.type === ApiDataSourceType.VOLCENGINE &&
        dataSourceType === DataSourceType.VOLCENGINE
      ) {
        typeMatch = true;
      }
    }

    // Filter by search text
    const searchMatch =
      !searchText ||
      connect.name?.toLowerCase().includes(searchText.toLowerCase()) ||
      connect.description?.toLowerCase().includes(searchText.toLowerCase());

    return typeMatch && searchMatch;
  });

  return { filteredConnects };
};

export const getDataSourceTypeLabel = (type: DataSourceType) => {
  switch (type) {
    case DataSourceType.ZABBIX:
      return 'Zabbix';
    case DataSourceType.ALIYUN:
      return 'Alibaba Cloud';
    case DataSourceType.VOLCENGINE:
      return 'Volcano Engine';
    default:
      return type;
  }
};

export const getConnectStatusColor = (isActive?: boolean) => {
  return isActive ? 'green' : 'red';
};

export const getConnectStatusText = (isActive?: boolean) => {
  return isActive ? 'Active' : 'Inactive';
};
