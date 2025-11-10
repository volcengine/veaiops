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

import type {
  IntelligentThresholdTask,
  MetricThresholdResult,
} from 'api-generate';

/**
 * useTimeseriesData Hook parameters interface
 */
export interface UseTimeseriesDataOptions {
  metric?: MetricThresholdResult;
  task?: IntelligentThresholdTask;
  timeRange: [Date, Date];
}

/**
 * Validate input parameters parameters interface
 */
export interface ValidateInputsParams {
  metric?: MetricThresholdResult;
  task?: IntelligentThresholdTask;
}

/**
 * Validate time range parameters interface
 */
export interface ValidateTimeRangeParams {
  timeRange: [Date, Date];
}

/**
 * Validate time range return result
 */
export interface TimeRangeValidationResult {
  startTime: number;
  endTime: number;
}

/**
 * Process metric labels parameters interface
 */
export interface ProcessMetricLabelsParams {
  metric?: MetricThresholdResult;
}

/**
 * Prepare request parameters result
 */
export interface RequestParams {
  startTime: number;
  endTime: number;
  datasourceTypeNormalized: string;
  datasourceId: string;
  instances: Array<Record<string, string>> | undefined;
}
