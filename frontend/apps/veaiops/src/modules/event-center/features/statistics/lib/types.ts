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
 * Usage overview statistics related type definitions
 */

export interface UsageStatistics {
  id: string;
  date: string;
  total_events: number;
  processed_events: number;
  failed_events: number;
  total_subscriptions: number;
  active_subscriptions: number;
  total_notifications: number;
  successful_notifications: number;
  failed_notifications: number;
  avg_processing_time: number;
  peak_events_per_hour: number;
  created_at: string;
}

export interface UsageStatisticsTableData extends UsageStatistics {
  key: string;
  success_rate: number;
  notification_success_rate: number;
}

export interface UsageStatisticsQuery {
  start_date?: string;
  end_date?: string;
  current?: number;
  pageSize?: number;
}

export interface UsageOverview {
  today: DailyStats;
  yesterday: DailyStats;
  this_week: WeeklyStats;
  this_month: MonthlyStats;
  trend_data: TrendData[];
}

export interface DailyStats {
  total_events: number;
  processed_events: number;
  failed_events: number;
  success_rate: number;
  total_notifications: number;
  notification_success_rate: number;
  avg_processing_time: number;
}

export interface WeeklyStats extends DailyStats {
  peak_day: string;
  peak_events: number;
}

export interface MonthlyStats extends WeeklyStats {
  peak_week: string;
  growth_rate: number;
}

export interface TrendData {
  date: string;
  events: number;
  notifications: number;
  success_rate: number;
}

export interface SystemHealth {
  status: "healthy" | "warning" | "critical";
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  active_connections: number;
  queue_size: number;
  last_updated: string;
}
