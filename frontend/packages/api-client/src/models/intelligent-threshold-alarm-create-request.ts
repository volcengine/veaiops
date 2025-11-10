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
export type IntelligentThresholdAlarmCreateRequest = {
  /**
   * Associated task ID
   */
  task_id: string;
  /**
   * Alarm type
   */
  alarm_type: IntelligentThresholdAlarmCreateRequest.alarm_type;
  /**
   * Alarm level
   */
  severity: IntelligentThresholdAlarmCreateRequest.severity;
  /**
   * Alarm title
   */
  title: string;
  /**
   * Alarm message
   */
  message: string;
  /**
   * Metric value that triggered the alarm
   */
  metric_value?: number;
  /**
   * Threshold
   */
  threshold_value?: number;
};
export namespace IntelligentThresholdAlarmCreateRequest {
  /**
   * Alarm type
   */
  export enum alarm_type {
    THRESHOLD_BREACH = 'threshold_breach',
    ANOMALY_DETECTED = 'anomaly_detected',
    SYSTEM_ERROR = 'system_error',
  }
  /**
   * Alarm level
   */
  export enum severity {
    INFO = 'INFO',
    WARNING = 'WARNING',
    ERROR = 'ERROR',
    CRITICAL = 'CRITICAL',
  }
}
