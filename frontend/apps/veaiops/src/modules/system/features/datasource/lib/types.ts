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
 * Monitor intervention related type definitions
 */

// Import data source type from api-generate
import type { DataSourceType as ApiDataSourceType } from "api-generate";

export interface MonitorIntervention {
  id: string;
  name: string;
  description?: string;
  monitor_type: "metric" | "log" | "trace" | "event";
  data_source: string;
  query_config: Record<string, unknown>;
  alert_rules: AlertRule[];
  enabled: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface AlertRule {
  id: string;
  condition: string;
  threshold: number;
  operator: "gt" | "gte" | "lt" | "lte" | "eq" | "ne";
  severity: "critical" | "warning" | "info";
  duration: number;
}

export interface MonitorInterventionTableData extends MonitorIntervention {
  key: string;
}

/**
 * Data source type (extended version, includes more types)
 */
export type DataSourceType = ApiDataSourceType | "prometheus" | "influxdb";

// Note: DataSourceResponse interface has been removed in refactoring
// Current branch uniformly uses DataSource type from api-generate (complies with single data source principle)
// If needed in the future, should use type definitions from api-generate/models/data-source.ts

/**
 * Monitor access component properties interface
 */
export interface MonitorAccessProps {
  moduleType?: "timeseries" | "threshold" | "common";
  title?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Data source interface (migrated from injection module)
 */
export interface DataSource {
  id: string;
  name: string;
  type: DataSourceType;
  description?: string;
  status: "active" | "inactive" | "pending" | "error";
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  config?: DataSourceConfig;
  endpoint?: string;
  auth_type?: string;
  metrics_count?: number;
  last_sync_time?: string;
}

export interface DataSourceConfig {
  host?: string;
  port?: number;
  username?: string;
  password?: string;
  database?: string;
  [key: string]: unknown;
}

/**
 * Delete handler function type
 *
 * ✅ Complies with async method error handling specification:
 * - Supports returning result object in format { success: boolean; error?: Error }
 * - Also supports Promise<void> format (backward compatibility)
 */
export type DeleteHandler = (
  id: string,
) => Promise<boolean> | Promise<{ success: boolean; error?: Error }>;

/**
 * Edit handler function type
 */
export type EditHandler = (item: DataSource) => void;

/**
 * View details handler function type
 */
export type ViewHandler = (item: DataSource) => void;

/**
 * Monitor item type (alias, for backward compatibility with old code)
 */
export type MonitorItem = DataSource;
