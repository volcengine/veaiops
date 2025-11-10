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

import type { FormInstance } from '@arco-design/web-react';
import type {
  IntelligentThresholdTask,
  MetricThresholdResult,
  SyncAlarmRulesPayload,
} from 'api-generate';

export interface TimeseriesChartModalProps {
  visible: boolean;
  onClose: () => void;
  metric: MetricThresholdResult | null;
  task?: IntelligentThresholdTask | null;
}

export interface TimeseriesDataPoint {
  timestamp: string;
  value: number;
  type: '实际值' | '上阈值' | '下阈值';
}

export interface TimeseriesRequestBody {
  datasource_id: string;
  start_time: number;
  end_time: number;
  period: string;
  instances?: Record<string, unknown>[];
}

export interface ChartConfigData extends TimeseriesDataPoint {
  timestamp: string;
  value: number;
  type: '实际值' | '上阈值' | '下阈值';
}

/**
 * Contact group interface
 */
export interface ContactGroup {
  ContactGroupId?: string;
  ContactGroupName?: string;
  Name?: string; // Aliyun uses Name field
  id?: string;
  name?: string;
}

/**
 * Alarm rule submission result
 */
export interface AlarmSubmitResult {
  success: boolean;
  message?: string;
  data?: unknown;
}

/**
 * Alarm form fields
 */
export interface AlarmFormValues {
  alarmLevel: SyncAlarmRulesPayload['alarm_level'];
  contactGroupIds?: string[];
  alertMethods?: SyncAlarmRulesPayload['alert_methods'];
  webhook?: string;
}

/**
 * Alarm drawer component props interface
 */
export interface AlarmDrawerProps {
  visible: boolean;
  task: IntelligentThresholdTask | null;
  onCancel: () => void;
  onSubmit: (payload: SyncAlarmRulesPayload) => Promise<boolean>;
  loading: boolean;
  formInstance?: FormInstance<AlarmFormValues>;
}
