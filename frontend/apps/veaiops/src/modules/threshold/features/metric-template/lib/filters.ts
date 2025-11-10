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
  BaseQuery,
  FieldItem,
  HandleFilterProps,
} from "@veaiops/components";
import type { MetricTemplateFilterParams } from "./types";
import { getMetricTypeOptions } from "./metric-type-translations";

/**
 * Metric template filter configuration - CustomTable standard format
 * @param props - Filter props parameters
 * @returns FieldItem[] - Filter configuration meeting CustomTable requirements
 */
export const getMetricTemplateFilters = (
  props: HandleFilterProps<MetricTemplateFilterParams & BaseQuery>,
): FieldItem[] => {
  const { query, handleChange } = props;
  return [
    {
      field: 'name',
      label: '模板名称',
      type: 'Input',
      componentProps: {
        placeholder: '请输入模板名称（支持模糊搜索）',
        value: query?.name,
        allowClear: true,
        onChange: (v: string) => {
          handleChange({ key: 'name', value: v });
        },
      },
    },
    {
      field: 'metricType',
      label: '模板类型',
      type: 'Select',
      componentProps: {
        placeholder: '请选择模板类型',
        value: query?.metricType,
        allowClear: true,
        options: getMetricTypeOptions(),
        onChange: (v: string) => {
          handleChange({ key: 'metricType', value: v });
        },
      },
    },
  ];
};

/**
 * Transform filter parameters to API request parameters
 */
export const transformFilterParams = (
  filters: Record<string, unknown>,
  pagination: { current: number; pageSize: number }
): MetricTemplateFilterParams => {
  const { current, pageSize } = pagination;

  return {
    name: filters.name as string | undefined,
    metricType: filters.metricType as string | undefined,
    skip: (current - 1) * pageSize,
    limit: pageSize,
  };
};

/**
 * Validate filter parameters
 */
export const validateFilterParams = (
  params: MetricTemplateFilterParams
): boolean => {
  // Basic validation
  if (params.skip !== undefined && params.skip < 0) {
    return false;
  }

  if (
    params.limit !== undefined &&
    (params.limit <= 0 || params.limit > 1000)
  ) {
    return false;
  }

  // String length validation
  if (params.name && params.name.length > 100) {
    return false;
  }

  if (
    params.metricType !== undefined &&
    typeof params.metricType !== "string"
  ) {
    return false;
  }

  return true;
};
