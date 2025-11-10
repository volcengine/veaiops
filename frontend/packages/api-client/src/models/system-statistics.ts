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

/* generated using openapi-typescript-codegen -- do not edit */
export type SystemStatistics = {
  /**
   * Number of active bots
   */
  active_bots: number;
  /**
   * Number of active chats
   */
  active_chats: number;
  /**
   * Number of active inform strategies
   */
  active_inform_strategies: number;
  /**
   * Number of active subscriptions
   */
  active_subscribes: number;
  /**
   * Number of active users
   */
  active_users: number;
  /**
   * Number of active products
   */
  active_products: number;
  /**
   * Number of active projects
   */
  active_projects: number;
  /**
   * Number of active customers
   */
  active_customers: number;
  /**
   * Number of active intelligent threshold tasks
   */
  active_intelligent_threshold_tasks: number;
  /**
   * Number of active intelligent threshold auto-update tasks
   */
  active_intelligent_threshold_autoupdate_tasks: number;
  /**
   * Number of successful intelligent threshold tasks in the last 1 day
   */
  latest_1d_intelligent_threshold_success_num: number;
  /**
   * Number of failed intelligent threshold tasks in the last 1 day
   */
  latest_1d_intelligent_threshold_failed_num: number;
  /**
   * Number of successful intelligent threshold tasks in the last 7 days
   */
  latest_7d_intelligent_threshold_success_num: number;
  /**
   * Number of failed intelligent threshold tasks in the last 7 days
   */
  latest_7d_intelligent_threshold_failed_num: number;
  /**
   * Number of successful intelligent threshold tasks in the last 30 days
   */
  latest_30d_intelligent_threshold_success_num: number;
  /**
   * Number of failed intelligent threshold tasks in the last 30 days
   */
  latest_30d_intelligent_threshold_failed_num: number;
  /**
   * Number of events in the last 24 hours
   */
  latest_24h_events: number;
  /**
   * Number of events in the last 1 day
   */
  last_1d_events: number;
  /**
   * Number of events in the last 7 days
   */
  last_7d_events: number;
  /**
   * Number of events in the last 30 days
   */
  last_30d_events: number;
  /**
   * Number of messages in the last 24 hours
   */
  latest_24h_messages: number;
  /**
   * Number of messages in the last 1 day
   */
  last_1d_messages: number;
  /**
   * Number of messages in the last 7 days
   */
  last_7d_messages: number;
  /**
   * Number of messages in the last 30 days
   */
  last_30d_messages: number;
};
