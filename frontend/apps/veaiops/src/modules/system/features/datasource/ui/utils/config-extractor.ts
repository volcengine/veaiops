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

import type { ConfigItem } from '../types/column-types';
import { getFieldTranslation } from './field-translation';

/**
 * Extract basic configuration items
 */
const extractBasicConfigItems = (
  record: Record<string, unknown>,
): ConfigItem[] => {
  const configItems: ConfigItem[] = [];

  if (record.connect_name) {
    configItems.push({ configKey: 'connect_name', value: record.connect_name });
  }

  if (record.metric_name) {
    configItems.push({ configKey: 'metric_name', value: record.metric_name });
  }

  if (record.history_type !== undefined && record.history_type !== null) {
    configItems.push({ configKey: 'history_type', value: record.history_type });
  }

  return configItems;
};

/**
 * Extract data source specific configuration items
 */
const extractDataSourceConfigItems = (
  record: Record<string, unknown>,
): ConfigItem[] => {
  const configItems: ConfigItem[] = [];

  // Process Zabbix configuration
  if (record.zabbix_config && typeof record.zabbix_config === 'object') {
    Object.entries(record.zabbix_config).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        const translationKey =
          key === 'targets' ? 'zabbix_targets' : `zabbix_${key}`;
        // Only add fields that have translations
        if (getFieldTranslation(translationKey)) {
          configItems.push({ configKey: translationKey, value });
        }
      }
    });
  }

  // Process Volcengine configuration
  if (
    record.volcengine_config &&
    typeof record.volcengine_config === 'object'
  ) {
    Object.entries(record.volcengine_config).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        // Special handling for instances field
        const translationKey =
          key === 'instances' ? 'volcengine_instances' : `volcengine_${key}`;
        // Only add fields that have translations
        if (getFieldTranslation(translationKey)) {
          configItems.push({ configKey: translationKey, value });
        }
      }
    });
  }

  // Process Aliyun configuration
  if (record.aliyun_config && typeof record.aliyun_config === 'object') {
    Object.entries(record.aliyun_config).forEach(([key, value]) => {
      // Skip empty values
      if (value === null || value === undefined || value === '') {
        return;
      }

      // Special handling for dimensions field, skip if empty array
      if (key === 'dimensions' && Array.isArray(value) && value.length === 0) {
        return;
      }

      // Build translation key: directly use aliyun_${key}
      const translationKey = `aliyun_${key}`;
      // Only add fields that have translations
      if (getFieldTranslation(translationKey)) {
        configItems.push({ configKey: translationKey, value });
      }
    });
  }

  // Process common targets field
  if (record.targets) {
    const translationKey = 'targets';
    if (getFieldTranslation(translationKey)) {
      configItems.push({ configKey: translationKey, value: record.targets });
    }
  }

  // Process common instances field
  if (record.instances) {
    const translationKey = 'instances';
    if (getFieldTranslation(translationKey)) {
      configItems.push({ configKey: translationKey, value: record.instances });
    }
  }

  return configItems;
};

/**
 * Extract all configuration items
 */
export const extractAllConfigItems = (
  record: Record<string, unknown>,
): ConfigItem[] => {
  const basicConfigItems = extractBasicConfigItems(record);
  const dataSourceConfigItems = extractDataSourceConfigItems(record);
  return [...basicConfigItems, ...dataSourceConfigItems];
};
