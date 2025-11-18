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
   * 任务名称
   */
  task_name: string;
  /**
   * 数据源ID
   */
  datasource_id: string;
  /**
   * 数据源类型
   */
  datasource_type: IntelligentThresholdTaskCreateRequest.datasource_type;
  /**
   * 自动更新开关
   */
  auto_update?: boolean;
  /**
   * 项目名称列表
   */
  projects?: Array<string>;
  /**
   * 产品名称列表
   */
  products?: Array<string>;
  /**
   * 客户名称列表
   */
  customers?: Array<string>;
  /**
   * 阈值计算方向
   */
  direction: IntelligentThresholdTaskCreateRequest.direction;
  metric_template_value: MetricTemplateValue;
  /**
   * N计数
   */
  n_count: number;
  /**
   * 灵敏度
   */
  sensitivity?: number;
};
export namespace IntelligentThresholdTaskCreateRequest {
  /**
   * 数据源类型
   */
  export enum datasource_type {
    ZABBIX = 'Zabbix',
    ALIYUN = 'Aliyun',
    VOLCENGINE = 'Volcengine',
  }
  /**
   * 阈值计算方向
   */
  export enum direction {
    UP = 'up',
    DOWN = 'down',
    BOTH = 'both',
  }
}
