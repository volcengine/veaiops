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

/* generated using openapi-typescript-codegen -- do not edit */
import type { AliyunDataSourceConfig } from './aliyun-data-source-config';
import type { Connect } from './connect';
import type { VolcengineDataSourceConfig } from './volcengine-data-source-config';
import type { ZabbixDataSourceConfig } from './zabbix-data-source-config';
export type DataSource = {
  /**
   * Data source ID
   */
  _id?: string;
  /**
   * Data source name
   */
  name: string;
  /**
   * Data source type
   */
  type: DataSource.type;
  /**
   * Data source connection configuration
   */
  connect: Connect;
  /**
   * Data source configuration
   */
  config?: Record<string, any>;
  /**
   * Zabbix data source configuration
   */
  zabbix_config?: ZabbixDataSourceConfig;
  /**
   * Alibaba Cloud data source configuration
   */
  aliyun_config?: AliyunDataSourceConfig;
  /**
   * Volcano Engine data source configuration
   */
  volcengine_config?: VolcengineDataSourceConfig;
  /**
   * Data source description
   */
  description?: string;
  /**
   * Whether active
   */
  is_active?: boolean;
  /**
   * Creation time
   */
  created_at?: string;
  /**
   * Update time
   */
  updated_at?: string;
};
export namespace DataSource {
  /**
   * Data source type
   */
  export enum type {
    ZABBIX = 'zabbix',
    ALIYUN = 'aliyun',
    VOLCENGINE = 'volcengine',
  }
}
