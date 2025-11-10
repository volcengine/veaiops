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
export type IntelligentThresholdTask = {
  /**
   * Task ID
   */
  _id?: string;
  /**
   * Task name
   */
  task_name: string;
  /**
   * Task description
   */
  description?: string;
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
  datasource_type?: IntelligentThresholdTask.datasource_type;
  /**
   * List of projects
   */
  projects?: Array<string>;
  /**
   * Whether auto update
   */
  auto_update?: boolean;
  /**
   * Task status
   */
  status?: IntelligentThresholdTask.status;
  /**
   * Task configuration
   */
  config?: {
    /**
     * Schedule expression (cron)
     */
    schedule?: string;
    /**
     * Timeout in seconds
     */
    timeout?: number;
    /**
     * Retry count
     */
    retry_count?: number;
  };
  /**
   * Last execution time
   */
  last_execution_time?: string;
  /**
   * Next execution time
   */
  next_execution_time?: string;
  /**
   * Creation time
   */
  created_at?: string;
  /**
   * Update time
   */
  updated_at?: string;
};
export namespace IntelligentThresholdTask {
  /**
   * Data source type
   */
  export enum datasource_type {
    ZABBIX = 'Zabbix',
    ALIYUN = 'Aliyun',
    VOLCENGINE = 'Volcengine',
  }
  /**
   * Task status
   */
  export enum status {
    PENDING = 'pending',
    RUNNING = 'running',
    COMPLETED = 'completed',
    FAILED = 'failed',
    CANCELLED = 'cancelled',
  }
}
