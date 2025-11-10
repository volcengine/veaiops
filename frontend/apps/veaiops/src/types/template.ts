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
 * Metric type enumeration
 */
export enum MetricType {
  /** Custom defined */
  SelfDefined = 'SelfDefined',
  /** Success rate (0-1) */
  SuccessRate = 'SuccessRate',
  /** Success rate (0-100) */
  SuccessRate100 = 'SuccessRate100',
  /** Error rate (0-1) */
  ErrorRate = 'ErrorRate',
  /** Error rate (0-100) */
  ErrorRate100 = 'ErrorRate100',
  /** Rate calculation result for Counter type metrics */
  CounterRate = 'CounterRate',
  /** Count value */
  Count = 'Count',
  /** Error count */
  ErrorCount = 'ErrorCount',
  /** Fatal error count */
  FatalErrorCount = 'FatalErrorCount',
  /** Latency (in milliseconds) */
  Latency = 'Latency',
  /** Latency (in seconds) */
  LatencySecond = 'LatencySecond',
  /** Latency (in microseconds) */
  LatencyMicrosecond = 'LatencyMicrosecond',
  /** Resource utilization rate (0-1) */
  ResourceUtilizationRate = 'ResourceUtilizationRate',
  /** Resource utilization rate (0-100) */
  ResourceUtilizationRate100 = 'ResourceUtilizationRate100',
  /** CPU cores used */
  CPUUsedCore = 'CPUUsedCore',
  /** Memory used (in bytes) */
  MemoryUsedBytes = 'MemoryUsedBytes',
  /** Throughput */
  Throughput = 'Throughput',
}

/**
 * Metric template interface
 */
export interface MetricTemplate {
  /** Template ID */
  id?: string;
  /** Template name */
  name: string;
  /** Metric type */
  metric_type: MetricType;
  /** Minimum step size */
  min_step: number;
  /** Maximum value */
  max_value: number;
  /** Minimum value */
  min_value: number;
  /** Minimum violation value */
  min_violation: number;
  /** Minimum violation ratio */
  min_violation_ratio: number;
  /** Normal range start value */
  normal_range_start: number;
  /** Normal range end value */
  normal_range_end: number;
  /** Missing value fill */
  missing_value?: string;
  /** Single anomaly elimination period */
  failure_interval_expectation: number;
  /** Display unit */
  display_unit: string;
  /** Display coefficient */
  linear_scale: number;
  /** Maximum time gap without data */
  max_time_gap: number;
  /** Minimum time series length */
  min_ts_length: number;
  /** Creation timestamp */
  created_at?: string;
  /** Last update timestamp */
  updated_at?: string;
  /** Deletion timestamp */
  deleted_at?: string;
}

/**
 * Create template request
 */
export interface CreateTemplateRequest {
  /** Template name */
  name: string;
  /** Metric type */
  metric_type: MetricType;
  /** Minimum step size */
  min_step: number;
  /** Maximum value */
  max_value: number;
  /** Minimum value */
  min_value: number;
  /** Minimum violation value */
  min_violation: number;
  /** Minimum violation ratio */
  min_violation_ratio: number;
  /** Normal range start value */
  normal_range_start: number;
  /** Normal range end value */
  normal_range_end: number;
  /** Missing value fill */
  missing_value?: string;
  /** Single anomaly elimination period */
  failure_interval_expectation: number;
  /** Display unit */
  display_unit: string;
  /** Display coefficient */
  linear_scale: number;
  /** Maximum time gap without data */
  max_time_gap: number;
  /** Minimum time series length */
  min_ts_length: number;
}

/**
 * Update template request
 */
export type UpdateTemplateRequest = Partial<CreateTemplateRequest>;

/**
 * Template query parameters
 */
export interface TemplateQueryParams {
  /** Page number */
  page?: number;
  /** Page size */
  size?: number;
  /** Template name search */
  name?: string;
  /** Metric type filter */
  metric_type?: MetricType;
}

/**
 * Template list response
 */
export interface TemplateListResponse {
  /** Template list */
  items: MetricTemplate[];
  /** Total count */
  total: number;
  /** Current page */
  page: number;
  /** Page size */
  size: number;
}

/**
 * API response wrapper
 */
export interface APIResponse<T = unknown> {
  /** Status code */
  code: number;
  /** Response message */
  message: string;
  /** Response data */
  data?: T;
}
