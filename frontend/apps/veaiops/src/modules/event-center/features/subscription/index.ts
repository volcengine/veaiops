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
 * Subscription management feature unified export
 *
 * ✅ Layered export principle: Export all subdirectory contents through feature module index.ts
 * - Import from feature module index.ts, shortest path (e.g., `@ec/subscription`)
 * - Each subdirectory exports through its own index.ts
 */

// ==================== Constants Export ====================
export {
  EVENT_LEVEL_OPTIONS,
  EVENT_LEVEL_MAP,
  EVENT_SHOW_STATUS_OPTIONS,
  EVENT_SHOW_STATUS_MAP,
  EVENT_STATUS_OPTIONS,
  EVENT_STATUS_MAP,
} from './constants';

// ==================== Hooks Export ====================
export {
  useSubscribeRelationFormLogic,
  useSubscriptionActionConfig,
  useSubscriptionForm,
  useSubscriptionManagementLogic,
  useSubscriptionTable,
  useSubscriptionTableConfig,
  useWebhookManagement,
  type SubscriptionQueryParams,
  type UseSubscriptionTableConfigOptions,
  type UseSubscriptionTableConfigReturn,
} from './hooks';

// ==================== Config Export ====================
export { getSubscriptionColumns, getSubscriptionFilters } from './config';

// ==================== Lib Export ====================
export { subscriptionService, SubscriptionService } from './lib';

// ==================== UI Components Export ====================
export { default as SubscriptionTable } from './ui/subscription-table';
export { default as SubscriptionModal } from './ui/subscription-modal';
export { default as SubscriptionManagement } from './ui/subscription-management';
export { SubscribeRelationForm, SubscribeRelationManager } from './ui';

// ==================== Default Export ====================
export { default } from './ui/subscription-management';
