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
 * Monitor module constant definitions (migrated from injection module)
 */

export const sourceTypeOptions = [
  { label: "Prometheus", value: "Prometheus" },
  { label: "InfluxDB", value: "InfluxDB" },
  { label: "Zabbix", value: "Zabbix" },
  { label: "Aliyun", value: "Aliyun" },
  { label: "Volcengine", value: "Volcengine" },
];

export const authTypeOptions = [
  { label: "无认证", value: "none" },
  { label: "基础认证", value: "basic" },
  { label: "Token认证", value: "token" },
  { label: "API Key", value: "api_key" },
];

export const statusLabels = {
  active: { text: "活跃", color: "green" },
  inactive: { text: "非活跃", color: "gray" },
  pending: { text: "待处理", color: "orange" },
  error: { text: "错误", color: "red" },
};

export const statusColors = {
  active: "green",
  inactive: "gray",
  pending: "orange",
  error: "red",
};

// Import data source type configuration from constants package
export { DATA_SOURCE_CONFIG as DATA_SOURCE_TYPES } from "@veaiops/constants";

/**
 * Module configuration
 */
export const MODULE_CONFIG = {
  timeseries: {
    title: "时序监控",
    description: "时序数据监控配置",
    features: ["metric_collection", "alert_rules", "dashboard"],
  },
  threshold: {
    title: "阈值监控",
    description: "阈值告警监控配置",
    features: ["threshold_rules", "alert_notification", "escalation"],
  },
  common: {
    title: "通用监控",
    description: "通用监控配置",
    features: ["basic_monitoring", "logging"],
  },
} as const;

/**
 * Status configuration
 */
export const STATUS_CONFIG = {
  active: {
    label: "活跃",
    color: "green",
    emoji: "🟢",
  },
  inactive: {
    label: "非活跃",
    color: "gray",
    emoji: "⚪",
  },
  pending: {
    label: "待处理",
    color: "orange",
    emoji: "🟡",
  },
  disabled: {
    label: "已禁用",
    color: "red",
    emoji: "🔴",
  },
  error: {
    label: "错误",
    color: "red",
    emoji: "❌",
  },
} as const;

/**
 * Tab key constants
 */
export const TAB_KEYS = {
  ZABBIX: "zabbix",
  ALIYUN: "aliyun",
  VOLCENGINE: "volcengine",
} as const;
