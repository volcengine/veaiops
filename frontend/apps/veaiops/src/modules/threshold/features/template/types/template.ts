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

export interface ThresholdTemplate {
  template_id: string;
  template_name: string;
  description?: string;
  usage_count: number;
  status: 'active' | 'inactive' | 'draft';
  // Inherit fields from original template (translated from Chinese comment)
  id?: string;
  name?: string;
  metric_type?: string;
  min_step?: number;
  max_value?: number;
  min_value?: number;
  min_violation?: number;
  min_violation_ratio?: number;
  normal_range_start?: number;
  normal_range_end?: number;
  missing_value?: string | null;
  failure_interval_expectation?: number;
  display_unit?: string;
  linear_scale?: number;
  max_time_gap?: number;
  min_ts_length?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TemplateFormData {
  template_name: string;
  description?: string;
  metric_type: string;
  min_step: number;
  max_value: number;
  min_value: number;
  min_violation: number;
  min_violation_ratio: number;
  normal_range_start: number;
  normal_range_end: number;
  missing_value?: string | null;
  failure_interval_expectation: number;
  display_unit: string;
  linear_scale: number;
  max_time_gap: number;
  min_ts_length: number;
  status: 'active' | 'inactive' | 'draft';
}
