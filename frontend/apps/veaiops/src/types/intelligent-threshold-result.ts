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
 * Intelligent threshold cleaning result related type definitions
 */

export interface ThresholdConfig {
  /** Start hour */
  start_hour: number;
  /** End hour */
  end_hour: number;
  /** Upper bound threshold */
  upper_bound: number;
  /** Lower bound threshold */
  lower_bound: number;
  /** Window size */
  window_size: number;
}

export interface IntelligentThresholdResult {
  /** Unique identifier, used as primary key */
  id?: string;
  /** Metric name */
  name: string;
  /** Threshold configuration list */
  thresholds: ThresholdConfig[];
  /** Label information */
  labels: Record<string, string>;
  /** Unique identifier */
  unique_key: string;
  /** Index signature to satisfy BaseRecord constraint */
  [key: string]: any;
}

export interface CleaningResultDrawerProps {
  /** Whether drawer is visible */
  visible: boolean;
  /** Task record */
  taskRecord?: any;
  /** Version record */
  versionRecord?: any;
  /** Close callback */
  onClose: () => void;
}
