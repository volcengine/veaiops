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
export type RerunIntelligentThresholdTaskRequest = {
  /**
   * Task ID
   */
  task_id: string;
  metric_template_value: MetricTemplateValue;
  /**
   * N count
   */
  n_count: number;
  /**
   * Threshold calculation direction
   */
  direction: RerunIntelligentThresholdTaskRequest.direction;
};
export namespace RerunIntelligentThresholdTaskRequest {
  /**
   * Threshold calculation direction
   */
  export enum direction {
    UP = 'up',
    DOWN = 'down',
    BOTH = 'both',
  }
}
