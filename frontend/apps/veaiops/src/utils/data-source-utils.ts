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
 * Data source utility functions
 */

import { DataSourceType } from 'api-generate';

/**
 * Get data source display name
 */
export const getDataSourceDisplayName = (type: DataSourceType): string => {
  const displayNames: Record<DataSourceType, string> = {
    [DataSourceType.ZABBIX]: 'Zabbix',
    [DataSourceType.ALIYUN]: 'Aliyun',
    [DataSourceType.VOLCENGINE]: 'Volcengine',
  };

  return displayNames[type] || type;
};

/**
 * Get data source description
 */
export const getDataSourceDescription = (type: DataSourceType): string => {
  const descriptions: Record<DataSourceType, string> = {
    [DataSourceType.ZABBIX]: 'Manage and configure Zabbix monitoring connections',
    [DataSourceType.ALIYUN]: 'Manage and configure Aliyun monitoring connections',
    [DataSourceType.VOLCENGINE]: 'Manage and configure Volcengine monitoring connections',
  };

  return descriptions[type] || 'Data source connection management';
};

/**
 * maskSensitiveInfo parameter interface
 */
export interface MaskSensitiveInfoParams {
  info: string;
  visibleLength?: number;
}

/**
 * Mask sensitive information
 */
export const maskSensitiveInfo = ({
  info,
  visibleLength = 4,
}: MaskSensitiveInfoParams): string => {
  if (!info || info.length <= visibleLength) {
    return info;
  }

  const visible = info.slice(0, visibleLength);
  const masked = '*'.repeat(Math.min(info.length - visibleLength, 8));

  return `${visible}${masked}`;
};

/**
 * Get data source icon
 */
export const getDataSourceIcon = (type: DataSourceType): string => {
  const icons: Record<DataSourceType, string> = {
    [DataSourceType.ZABBIX]: 'icon-zabbix',
    [DataSourceType.ALIYUN]: 'icon-aliyun',
    [DataSourceType.VOLCENGINE]: 'icon-volcengine',
  };

  return icons[type] || 'icon-database';
};

/**
 * Validate connection configuration completeness
 */
export const validateConnectConfig = (
  type: DataSourceType,
  config: any,
): string[] => {
  const errors: string[] = [];

  if (!config.name || config.name.trim().length < 2) {
    errors.push('Connection name must be at least 2 characters');
  }

  switch (type) {
    case DataSourceType.ZABBIX:
      if (!config.zabbix_api_url) {
        errors.push('Please enter Zabbix API URL');
      } else if (!isValidUrl(config.zabbix_api_url)) {
        errors.push('Please enter a valid API URL');
      }
      if (!config.zabbix_api_user) {
        errors.push('Please enter API username');
      }
      if (!config.zabbix_api_password) {
        errors.push('Please enter API password');
      }
      break;
    case DataSourceType.ALIYUN:
      if (!config.aliyun_access_key_id) {
        errors.push('Please enter Access Key ID');
      }
      if (!config.aliyun_access_key_secret) {
        errors.push('Please enter Access Key Secret');
      }
      break;
    case DataSourceType.VOLCENGINE:
      if (!config.volcengine_access_key_id) {
        errors.push('Please enter Access Key ID');
      }
      if (!config.volcengine_access_key_secret) {
        errors.push('Please enter Access Key Secret');
      }
      break;
    default:
      errors.push('Unsupported data source type');
      break;
  }

  return errors;
};

/**
 * Validate URL format
 *
 * Why use new URL():
 * - URL constructor is the standard method to validate URL format, no other alternatives
 * - Use try-catch wrapper to ensure type safety
 * - Although using new operator, it's only for validation, no actual side effects
 */
const isValidUrl = (url: string): boolean => {
  try {
    // URL constructor is the only standard method to validate URL
    // Note: Although using new operator, it's only for validation, no actual side effects
    const _url = new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Get connection status label configuration
 */
export const getConnectionStatusConfig = (isActive: boolean) => {
  return {
    color: isActive ? 'green' : 'red',
    text: isActive ? 'Active' : 'Disabled',
  };
};

/**
 * Format connection creation time
 */
export const formatConnectionTime = (timestamp: string): string => {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return timestamp;
  }
};

/**
 * Generate unique ID for connection test
 */
export const generateTestId = (): string => {
  return `test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if connection name is duplicate
 */
export const checkDuplicateConnectionName = (
  name: string,
  connections: any[],
  excludeId?: string,
): boolean => {
  return connections.some(
    (conn) => conn.name === name && conn.id !== excludeId,
  );
};
