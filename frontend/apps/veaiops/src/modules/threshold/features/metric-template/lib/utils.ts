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

import type { MetricTemplate } from "api-generate";
import type { MetricTemplateTableData } from "./types";

/**
 * Transform metric template data to table data
 */
export const transformMetricTemplateToTableData = (
  template: MetricTemplate
): MetricTemplateTableData => {
  return {
    ...template,
    key: template._id || `temp-${Date.now()}-${Math.random()}`,
  };
};

/**
 * Transform metric template list to table data list
 */
export const transformMetricTemplateListToTableData = (
  templates: MetricTemplate[]
): MetricTemplateTableData[] => {
  return templates.map(transformMetricTemplateToTableData);
};

/**
 * Format threshold configuration display
 */
export const formatThresholdConfig = (
  config?: Record<string, unknown>
): string => {
  if (!config) {
    return "未配置";
  }

  const configCount = Object.keys(config).length;
  return `${configCount} 项配置`;
};

/**
 * Validate metric template data
 */
export const validateMetricTemplate = (
  template: Partial<MetricTemplate>
): string[] => {
  const errors: string[] = [];

  if (!template.name || template.name.trim().length === 0) {
    errors.push("指标模板名称不能为空");
  }

  if (template.name && template.name.length > 50) {
    errors.push("指标模板名称不能超过50个字符");
  }

  if (template.metric_type === undefined || template.metric_type === null) {
    errors.push("指标模板类型不能为空");
  }

  if (
    template.metric_type !== undefined &&
    (Number(template.metric_type) < 1 || Number(template.metric_type) > 6)
  ) {
    errors.push("指标模板类型必须在1-6之间");
  }

  if (template.min_value === undefined || template.min_value === null) {
    errors.push("指标最小值不能为空");
  }

  if (template.max_value === undefined || template.max_value === null) {
    errors.push("指标最大值不能为空");
  }

  if (
    template.min_value !== undefined &&
    template.max_value !== undefined &&
    template.min_value >= template.max_value
  ) {
    errors.push("指标最小值必须小于指标最大值");
  }

  if (
    template.normal_range_start === undefined ||
    template.normal_range_start === null
  ) {
    errors.push("默认阈值下界不能为空");
  }

  if (
    template.normal_range_end === undefined ||
    template.normal_range_end === null
  ) {
    errors.push("默认阈值上界不能为空");
  }

  if (
    template.normal_range_start !== undefined &&
    template.normal_range_end !== undefined &&
    template.normal_range_start >= template.normal_range_end
  ) {
    errors.push("默认阈值下界必须小于默认阈值上界");
  }

  return errors;
};

/**
 * Generate unique temporary ID
 */
export const generateTempId = (): string => {
  return `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Deep clone object
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map((item) => deepClone(item)) as unknown as T;
  }

  if (typeof obj === "object") {
    const clonedObj = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone(obj[key]);
      }
    }
    return clonedObj;
  }

  return obj;
};

/**
 * Safe JSON parsing
 */
export const safeJsonParse = <T = unknown>(
  jsonString: string,
  defaultValue: T
): T => {
  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return defaultValue;
  }
};

/**
 * Safe JSON stringification
 */
export const safeJsonStringify = (
  obj: unknown,
  defaultValue = "{}"
): string => {
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return defaultValue;
  }
};
