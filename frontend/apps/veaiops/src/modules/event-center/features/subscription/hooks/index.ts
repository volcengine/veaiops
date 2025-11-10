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
 * Subscription management Hooks unified export
 */

export {
  useSubscriptionManagementLogic,
  useSubscriptionTableConfig,
  useSubscriptionActionConfig,
  transformSubscriptionToTableData,
  type SubscriptionTableData,
} from './subscription-management';

export { useSubscriptionTable } from './use-subscription-table';
export { useSubscriptionForm } from './use-subscription-form';
export { useWebhookManagement } from './use-webhook-logic';
export { useSubscribeRelationFormLogic } from './use-relation-form-logic';

// Export types
export type {
  SubscriptionQueryParams,
  UseSubscriptionTableConfigOptions,
  UseSubscriptionTableConfigReturn,
} from './use-subscription-table-config';
