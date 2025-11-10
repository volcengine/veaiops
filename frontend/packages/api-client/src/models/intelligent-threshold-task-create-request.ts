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
import type { MetricTemplateValue } from './metric-template-value';
export type IntelligentThresholdTaskCreateRequest = {
  /**
   * Task name
   */
  task_name: string;
  /**
   * Data source ID
   */
  datasource_id: string;
  /**
   * Data source type
   */
  datasource_type: IntelligentThresholdTaskCreateRequest.datasource_type;
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
   * Threshold calculation direction
   */
  direction: IntelligentThresholdTaskCreateRequest.direction;
  metric_template_value: MetricTemplateValue;
  /**
   * N count
   */
  n_count: number;
};
export namespace IntelligentThresholdTaskCreateRequest {
  /**
   * Data source type
   */
  export enum datasource_type {
    ZABBIX = 'Zabbix',
    ALIYUN = 'Aliyun',
    VOLCENGINE = 'Volcengine',
  }
  /**
   * Threshold calculation direction
   */
  export enum direction {
    UP = 'up',
    DOWN = 'down',
    BOTH = 'both',
  }
}
