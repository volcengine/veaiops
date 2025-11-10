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
 * Data source type constants
 */
export const DATASOURCE_TYPES = {
  VOLCENGINE: 'Volcengine',
  ALIYUN: 'Aliyun',
  ZABBIX: 'Zabbix',
} as const;

/**
 * Data source type configuration (includes translation and styling)
 */
export const DATA_SOURCE_CONFIG = {
  Zabbix: {
    label: 'Zabbix',
    color: 'blue',
    iconColor: '#1890ff',
  },
  Aliyun: {
    label: 'Aliyun',
    color: 'orange',
    iconColor: '#fa8c16',
  },
  Volcengine: {
    label: 'Volcengine',
    color: 'purple',
    iconColor: '#722ed1',
  },
} as const;

/**
 * Data source type options (for dropdown selection, etc.)
 */
export const DATA_SOURCE_OPTIONS = [
  { label: 'Zabbix', value: 'Zabbix' },
  { label: 'Aliyun', value: 'Aliyun' },
  { label: 'Volcengine', value: 'Volcengine' },
] as const;

/**
 * Data source type mapping (for quick label lookup)
 */
export const DATA_SOURCE_LABELS = {
  Zabbix: 'Zabbix',
  Aliyun: 'Aliyun',
  Volcengine: 'Volcengine',
} as const;

/**
 * Get label for data source type
 */
export function getDataSourceLabel(type: string): string {
  return DATA_SOURCE_LABELS[type as keyof typeof DATA_SOURCE_LABELS] || type;
}

/**
 * Get data source type configuration
 */
export function getDataSourceConfig(type: string) {
  return (
    DATA_SOURCE_CONFIG[type as keyof typeof DATA_SOURCE_CONFIG] || {
      label: type,
      color: 'default',
      iconColor: '#666666',
    }
  );
}
