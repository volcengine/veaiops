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

import type { MetricThresholdResult } from 'api-generate';
import type { TimeseriesDataPoint } from '../types';

/**
 * Backend returned timeseries data item structure
 * Supports common format for multiple data sources (Volcengine, Aliyun, Zabbix)
 */
export interface TimeseriesBackendItem {
  timestamps: Array<string | number>;
  values: Array<number | string | null>;
  labels?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Parameter interface for converting backend returned timeseries data to chart required format
 */
export interface ConvertTimeseriesDataParams {
  backendData: TimeseriesBackendItem[];
  metric: MetricThresholdResult;
}

/**
 * Conversion statistics
 */
export interface ConversionStats {
  totalSamples: number;
  skippedValueCount: number;
  skippedTimestampCount: number;
  invalidItemCount: number;
}

/**
 * Parameter interface for getting label value
 */
export interface GetLabelValueParams {
  obj: Record<string, unknown>;
  key: string;
}
