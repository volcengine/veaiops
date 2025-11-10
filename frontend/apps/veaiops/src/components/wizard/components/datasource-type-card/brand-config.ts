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
 * Data source brand configuration
 * @description Defines brand colors and style classes for each data source type
 */

import { DataSourceType } from '../../types';
import styles from './styles.module.less';

/** Brand configuration interface */
export interface BrandConfig {
  /** Main container style class */
  className: string;
  /** Gradient background style class */
  gradientClass: string;
  /** Icon style class */
  iconClass: string;
  /** Brand primary color */
  brandColor: string;
}

/** Data source brand configuration mapping */
export const DATASOURCE_BRAND_CONFIGS: Record<DataSourceType, BrandConfig> = {
  [DataSourceType.VOLCENGINE]: {
    className: styles.volcengine,
    gradientClass: styles.volcengineGradient,
    iconClass: styles.volcengineIcon,
    // Volcengine brand color: blue tech feel
    brandColor: '#1664FF',
  },
  [DataSourceType.ALIYUN]: {
    className: styles.aliyun,
    gradientClass: styles.aliyunGradient,
    iconClass: styles.aliyunIcon,
    // Aliyun brand color: orange vitality feel
    brandColor: '#FF6A00',
  },
  [DataSourceType.ZABBIX]: {
    className: styles.zabbix,
    gradientClass: styles.zabbixGradient,
    iconClass: styles.zabbixIcon,
    // Zabbix brand color: red professional feel
    brandColor: '#D40000',
  },
};

/**
 * Get data source brand configuration
 * @param type Data source type
 * @returns Brand configuration object
 */
export const getBrandConfig = (type: DataSourceType): BrandConfig => {
  return DATASOURCE_BRAND_CONFIGS[type];
};
