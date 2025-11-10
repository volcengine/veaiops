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
import type { MetricThresholdResult } from './metric-threshold-result';
export type IntelligentThresholdTaskVersion = {
  /**
   * Version ID
   */
  _id?: string;
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
  direction: IntelligentThresholdTaskVersion.direction;
  /**
   * Task status
   */
  status: IntelligentThresholdTaskVersion.status;
  /**
   * Version number
   */
  version: number;
  /**
   * Threshold result
   */
  result?: Array<MetricThresholdResult>;
  /**
   * Creation time
   */
  created_at?: string;
  /**
   * Update time
   */
  updated_at?: string;
  /**
   * Error message (if task failed)
   */
  error_message?: string;
};
export namespace IntelligentThresholdTaskVersion {
  /**
   * Threshold calculation direction
   */
  export enum direction {
    UP = 'up',
    DOWN = 'down',
    BOTH = 'both',
  }
  /**
   * Task status
   */
  export enum status {
    UNKNOWN = 'Unknown',
    LAUNCHING = 'Launching',
    RUNNING = 'Running',
    STOPPED = 'Stopped',
    SUCCESS = 'Success',
    FAILED = 'Failed',
  }
}
