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
export type SyncAlarmRulesPayload = {
  /**
   * Intelligent threshold task ID
   */
  task_id: string;
  /**
   * Intelligent threshold task version ID
   */
  task_version_id: string;
  /**
   * List of contact group IDs (required for Volcengine and Aliyun)
   */
  contact_group_ids?: Array<string>;
  /**
   * Alarm notification methods (only valid for Volcengine)
   */
  alert_methods?: Array<'Email' | 'Phone' | 'SMS'>;
  /**
   * List of media type IDs (only required for Zabbix, corresponds to Zabbix alarm notification methods)
   */
  mediatype_ids?: Array<string>;
  /**
   * List of user group IDs (only required for Zabbix, corresponds to Zabbix alarm groups)
   */
  usergroup_ids?: Array<string>;
  /**
   * Webhook URL (optional)
   */
  webhook?: string;
  /**
   * Alarm level (valid for all alarm sources)
   */
  alarm_level: SyncAlarmRulesPayload.alarm_level;
  /**
   * Maximum number of concurrent worker threads
   */
  max_workers?: number;
  /**
   * Rate limit period in seconds
   */
  rate_limit_period?: number;
  /**
   * Maximum number of requests per period
   */
  rate_limit_count?: number;
};
export namespace SyncAlarmRulesPayload {
  /**
   * Alarm level (valid for all alarm sources)
   */
  export enum alarm_level {
    P0 = 'P0',
    P1 = 'P1',
    P2 = 'P2',
  }
}
