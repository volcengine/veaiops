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
import type { MetricType } from './metric-type';
export type MetricTemplateValue = {
  /**
   * Template name
   */
  name: string;
  /**
   * Metric type
   */
  metric_type: MetricType;
  /**
   * Minimum step
   */
  min_step: number;
  /**
   * Maximum value
   */
  max_value?: number | null;
  /**
   * Minimum value
   */
  min_value?: number | null;
  /**
   * Minimum violation value
   */
  min_violation: number;
  /**
   * Minimum violation ratio
   */
  min_violation_ratio: number;
  /**
   * Normal range start
   */
  normal_range_start?: number | null;
  /**
   * Normal range end
   */
  normal_range_end?: number | null;
  /**
   * Fill value for missing data
   */
  missing_value?: string | null;
  /**
   * Single anomaly elimination period
   */
  failure_interval_expectation: number;
  /**
   * Display unit
   */
  display_unit: string;
  /**
   * Display coefficient
   */
  linear_scale: number;
  /**
   * Maximum time gap with no data
   */
  max_time_gap: number;
  /**
   * Minimum time series length
   */
  min_ts_length: number;
};
