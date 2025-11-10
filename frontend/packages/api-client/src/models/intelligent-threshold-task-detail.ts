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
import type { IntelligentThresholdTaskVersion } from './intelligent-threshold-task-version';
export type IntelligentThresholdTaskDetail = {
  /**
   * Task ID
   */
  _id?: string;
  /**
   * Task name
   */
  task_name: string;
  /**
   * Associated template ID
   */
  template_id: string;
  /**
   * Data source ID
   */
  datasource_id: string;
  /**
   * Data source type
   */
  datasource_type: IntelligentThresholdTaskDetail.datasource_type;
  /**
   * Auto update switch
   */
  auto_update?: boolean;
  /**
   * List of project names
   */
  projects?: Array<string>;
  /**
   * List of product names
   */
  products?: Array<string>;
  /**
   * List of customer names
   */
  customers?: Array<string>;
  /**
   * Creation time
   */
  created_at?: string;
  /**
   * Update time
   */
  updated_at?: string;
  latest_version?: IntelligentThresholdTaskVersion;
};
export namespace IntelligentThresholdTaskDetail {
  /**
   * Data source type
   */
  export enum datasource_type {
    ZABBIX = 'Zabbix',
    ALIYUN = 'Aliyun',
    VOLCENGINE = 'Volcengine',
  }
}
