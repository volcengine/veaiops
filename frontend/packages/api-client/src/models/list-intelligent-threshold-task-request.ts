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
export type ListIntelligentThresholdTaskRequest = {
  /**
   * List of project names
   */
  projects?: Array<string>;
  /**
   * Task name filter
   */
  task_name?: string;
  /**
   * Data source type
   */
  datasource_type?: ListIntelligentThresholdTaskRequest.datasource_type;
  /**
   * Auto update switch
   */
  auto_update?: boolean;
  /**
   * Creation time range start
   */
  created_at_start?: string;
  /**
   * Creation time range end
   */
  created_at_end?: string;
  /**
   * Update time range start
   */
  updated_at_start?: string;
  /**
   * Update time range end
   */
  updated_at_end?: string;
  /**
   * Number of records to skip
   */
  skip?: number;
  /**
   * Page size
   */
  limit?: number;
};
export namespace ListIntelligentThresholdTaskRequest {
  /**
   * Data source type
   */
  export enum datasource_type {
    ZABBIX = 'Zabbix',
    ALIYUN = 'Aliyun',
    VOLCENGINE = 'Volcengine',
  }
}
