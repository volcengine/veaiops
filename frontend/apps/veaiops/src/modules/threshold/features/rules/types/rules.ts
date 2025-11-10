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

/**
 * Intelligent threshold rule type definitions
 */

export interface ThresholdConfig {
  warning_threshold: number;
  critical_threshold: number;
  comparison_operator: string;
}

export interface NotificationConfig {
  channels: string[];
  recipients: string[];
  suppress_duration: number;
}

export interface ThresholdRule {
  id?: string;
  name: string;
  description: string;
  metric: string;
  operator: string;
  threshold: number;
  aggregation: string;
  timeWindow: string;
  status: string;
  priority: string;
  channels: string[];
  threshold_config: ThresholdConfig;
  notification_config: NotificationConfig;
  template_id?: string;
  metric_query?: string;
  is_active?: boolean;
  trigger_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface RuleFormData {
  name: string;
  description: string;
  metric: string;
  operator: string;
  threshold: number;
  aggregation: string;
  timeWindow: string;
  status: string;
  priority: string;
  channels: string[];
  threshold_config: ThresholdConfig;
  notification_config: NotificationConfig;
}
