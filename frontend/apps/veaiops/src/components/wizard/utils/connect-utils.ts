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
 * Connection-related utility functions
 * @description Provides utility functions for connection status and data source types
 * @date 2025-01-19
 */

import {
  DataSourceType as ApiDataSourceType,
  DataSource,
} from '@veaiops/api-client';
import type { Connect } from '@veaiops/api-client';
import type { DataSourceType } from '../types';

/**
 * Connection filter parameters interface
 */
export interface UseConnectFilterParams {
  connects: Connect[];
  dataSourceType?: DataSourceType | 'all';
  searchText?: string;
}

/**
 * Connection filter Hook
 * @description Filters connection list based on data source type and search text
 */
export const useConnectFilter = ({
  connects,
  dataSourceType,
  searchText = '',
}: UseConnectFilterParams) => {
  const filteredConnects = connects.filter((connect) => {
    // Filter by data source type - convert API type to local type
    let typeMatch = !dataSourceType || dataSourceType === 'all';
    if (!typeMatch) {
      if (
        connect.type === ApiDataSourceType.ZABBIX &&
        dataSourceType === DataSource.type.ZABBIX
      ) {
        typeMatch = true;
      } else if (
        connect.type === ApiDataSourceType.ALIYUN &&
        dataSourceType === DataSource.type.ALIYUN
      ) {
        typeMatch = true;
      } else if (
        connect.type === ApiDataSourceType.VOLCENGINE &&
        dataSourceType === DataSource.type.VOLCENGINE
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

/**
 * Get data source type label
 * @param type Data source type (supports local type and API type)
 * @returns Label
 */
export const getDataSourceTypeLabel = (
  type: ApiDataSourceType | string,
): string => {
  // Convert type to lowercase for comparison (compatible with API type and local type)
  const typeStr = String(type).toLowerCase();

  switch (typeStr) {
    case 'zabbix':
      return 'Zabbix';
    case 'aliyun':
      return '阿里云';
    case 'volcengine':
      return '火山引擎';
    default:
      return String(type);
  }
};

/**
 * Get connection status color
 * @param isActive Whether active
 * @returns Color identifier
 */
export const getConnectStatusColor = (isActive?: boolean) => {
  return isActive ? 'green' : 'red';
};

/**
 * Get connection status Badge type
 * @param isActive Whether active
 * @returns Badge status
 */
export const getConnectStatusBadge = (isActive?: boolean) => {
  return isActive ? 'success' : 'error';
};

/**
 * Get connection status text (Chinese)
 * @param isActive Whether active
 * @returns Status text (Chinese)
 */
export const getConnectStatusText = (isActive?: boolean) => {
  return isActive ? '已激活' : '未激活';
};
