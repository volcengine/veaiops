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

import { EventLevel } from 'api-generate';

/**
 * Data source type Chinese labels mapping
 */
export const DATASOURCE_TYPE_LABELS: Record<string, string> = {
  Volcengine: '火山引擎',
  Aliyun: '阿里云',
  Zabbix: 'Zabbix',
};

/**
 * Task status Chinese labels mapping
 */
export const TASK_STATUS_LABELS: Record<string, string> = {
  Running: '运行中',
  Success: '成功',
  Failed: '失败',
  Pending: '等待中',
  Cancelled: '已取消',
};

/**
 * Alarm level options
 */
export const ALARM_LEVEL_OPTIONS = [
  { label: 'P0', value: EventLevel.P0 },
  { label: 'P1', value: EventLevel.P1 },
  { label: 'P2', value: EventLevel.P2 },
];

/**
 * Alarm notification method options (Volcengine only)
 */
export const ALERT_METHODS_OPTIONS = [
  { label: '邮件', value: 'Email' },
  { label: '电话', value: 'Phone' },
  { label: '短信', value: 'SMS' },
];
