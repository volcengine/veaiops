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

// Optimization: prioritize using type definitions from api-generate
/**
 * Metric template table data type
 * Based on MetricTemplate from api-generate, only adds frontend-specific fields
 * Note: Directly use backend's snake_case naming, keep consistent with API
 */
import type { MetricTemplate } from "api-generate";

export type { MetricTemplate } from "api-generate";
export type { MetricTemplateCreateRequest } from "api-generate";
export type { MetricTemplateUpdateRequest } from "api-generate";
export type { APIResponseMetricTemplate } from "api-generate";
export type { PaginatedAPIResponseMetricTemplateList } from "api-generate";

export interface MetricTemplateTableData extends MetricTemplate {
  key?: string; // Unique identifier for table row, used for frontend rendering
}

/**
 * Metric template filter parameters
 */
export interface MetricTemplateFilterParams {
  name?: string;
  metricType?: string;
  skip?: number;
  limit?: number;
}

/**
 * Metric template operation type
 */
export type MetricTemplateAction = "create" | "edit" | "delete" | "view";

/**
 * Metric template modal state
 */
export interface MetricTemplateModalState {
  visible: boolean;
  action: MetricTemplateAction;
  template?: MetricTemplate;
}
