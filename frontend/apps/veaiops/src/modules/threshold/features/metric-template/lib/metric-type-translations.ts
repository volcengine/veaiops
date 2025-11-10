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

import type { MetricType } from "api-generate";

/**
 * MetricType enum Chinese translation mapping
 * Based on backend Python enum definition
 */
export const METRIC_TYPE_TRANSLATIONS: Record<MetricType, string> = {
  SelfDefined: "自定义",
  SuccessRate: "成功率",
  SuccessRate100: "成功率(%)",
  ErrorRate: "错误率",
  ErrorRate100: "错误率(%)",
  CounterRate: "计数器速率",
  Count: "计数",
  ErrorCount: "错误计数",
  FatalErrorCount: "致命错误计数",
  Latency: "延迟(毫秒)",
  LatencySecond: "延迟(秒)",
  LatencyMicrosecond: "延迟(微秒)",
  ResourceUtilizationRate: "资源使用率",
  ResourceUtilizationRate100: "资源使用率(%)",
  CPUUsedCore: "CPU使用核心数",
  MemoryUsedBytes: "内存使用量(字节)",
  Throughput: "吞吐量",
};

/**
 * Get Chinese translation for MetricType
 */
export const getMetricTypeTranslation = (metricType: MetricType): string => {
  return METRIC_TYPE_TRANSLATIONS[metricType] || metricType;
};

/**
 * Get all MetricType options (for filters)
 */
export const getMetricTypeOptions = () => {
  return Object.entries(METRIC_TYPE_TRANSLATIONS).map(([value, label]) => ({
    label,
    value: value as MetricType,
  }));
};
