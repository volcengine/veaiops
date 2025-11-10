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

import type { SubscriptionTableData } from './types';

/**
 * Transform subscription relation data to table data
 */
export const transformSubscriptionToTableData = (
  subscription: any,
): SubscriptionTableData => {
  return {
    ...subscription,
    id: subscription.id || `temp-${Date.now()}-${Math.random()}`,
    key: subscription.id || `temp-${Date.now()}-${Math.random()}`,
    name: subscription.name || '未命名订阅关系',
    agent_type: subscription.agent_type,
    inform_strategy_ids: subscription.inform_strategy_ids || [],
    event_level: subscription.event_level,
    start_time: subscription.start_time,
    end_time: subscription.end_time,
    created_at: subscription.created_at || new Date().toISOString(),
    updated_at: subscription.updated_at || new Date().toISOString(),
    attributes: subscription.attributes || [],
    interest_products: subscription.interest_products || [],
    interest_projects: subscription.interest_projects || [],
    interest_customers: subscription.interest_customers || [],
    enable_webhook: subscription.enable_webhook,
    webhook_endpoint: subscription.webhook_endpoint,
    webhook_headers: subscription.webhook_headers,
  };
};
