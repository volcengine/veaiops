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
 * Data source connection management utility functions
 */

import { DataSourceType } from "api-generate";
import { DATA_SOURCE_DISPLAY_NAMES } from "./constants";

/**
 * Get data source display name
 * @param type Data source type
 * @returns Display name
 */
export const getDataSourceDisplayName = (type: DataSourceType): string => {
  return DATA_SOURCE_DISPLAY_NAMES[type] || type;
};

/**
 * Format connection time
 * @param dateString Time string
 * @returns Formatted time
 */
export const formatConnectionTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return "今天";
  } else if (diffInDays === 1) {
    return "昨天";
  } else if (diffInDays < 7) {
    return `${diffInDays}天前`;
  } else {
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }
};

/**
 * Mask sensitive information
 * @param info Sensitive information
 * @param visibleLength Visible length
 * @returns Masked information
 */
/**
 * maskSensitiveInfo parameter interface
 */
export interface MaskSensitiveInfoParams {
  info: string;
  visibleLength?: number;
}

export const maskSensitiveInfo = ({
  info,
  visibleLength = 4,
}: MaskSensitiveInfoParams): string => {
  if (!info || info.length <= visibleLength) {
    return info;
  }

  const visiblePart = info.slice(0, visibleLength);
  const maskedPart = "*".repeat(Math.min(info.length - visibleLength, 8));

  return `${visiblePart}${maskedPart}`;
};

/**
 * Validate connection configuration
 * @param type Data source type
 * @param config Connection configuration
 * @returns Validation result
 */
export const validateConnectionConfig = (
  type: DataSourceType,
  config: Record<string, any>
): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Common validation
  if (!config.name?.trim()) {
    errors.push("连接名称不能为空");
  }

  // Type-specific validation
  switch (type) {
    case DataSourceType.ZABBIX:
      if (!config.zabbix_api_url?.trim()) {
        errors.push("Zabbix API地址不能为空");
      }
      if (!config.zabbix_api_user?.trim()) {
        errors.push("Zabbix API用户名不能为空");
      }
      if (!config.zabbix_api_password?.trim()) {
        errors.push("Zabbix API密码不能为空");
      }
      break;
    case DataSourceType.ALIYUN:
      if (!config.aliyun_access_key_id?.trim()) {
        errors.push("阿里云Access Key ID不能为空");
      }
      if (!config.aliyun_access_key_secret?.trim()) {
        errors.push("阿里云Access Key Secret不能为空");
      }
      break;
    case DataSourceType.VOLCENGINE:
      if (!config.volcengine_access_key_id?.trim()) {
        errors.push("火山引擎Access Key ID不能为空");
      }
      if (!config.volcengine_access_key_secret?.trim()) {
        errors.push("火山引擎Access Key Secret不能为空");
      }
      break;
    default:
      errors.push("不支持的数据源类型");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Generate connection unique identifier
 * @param type Data source type
 * @param name Connection name
 * @returns Unique identifier
 */
export const generateConnectionId = (
  type: DataSourceType,
  name: string
): string => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2, 8);
  return `${type}_${name}_${timestamp}_${randomStr}`;
};

/**
 * Check if connection is healthy
 * @param connect Connection object
 * @returns Whether healthy
 */
export const isConnectionHealthy = (connect: any): boolean => {
  return connect?.is_active === true;
};

/**
 * Format connection status text
 * @param isActive Whether active
 * @returns Status text
 */
export const formatConnectionStatus = (isActive: boolean): string => {
  return isActive ? "正常" : "禁用";
};

/**
 * Get connection status color
 * @param isActive Whether active
 * @returns Color value
 */
export const getConnectionStatusColor = (isActive: boolean): string => {
  return isActive ? "green" : "red";
};
