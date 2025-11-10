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

import type { ModuleType } from '@/types/module';
import type { FormInstance } from '@arco-design/web-react';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';

/**
 * Strategy ID type: may be string, number, or object containing id
 */
export type StrategyIdItem =
  | string
  | number
  | { id?: string | number }
  | null
  | undefined;

/**
 * Webhook request header configuration
 */
export interface WebhookHeader {
  key: string;
  value: string;
}

/**
 * Form management Hook configuration parameters
 */
export interface UseSubscriptionFormConfig {
  /** Whether form is visible */
  visible: boolean;
  /** Initial data (edit mode) */
  initialData?: SubscribeRelationWithAttributes | null;
  /** Module type */
  moduleType?: ModuleType;
}

/**
 * Form management Hook return value
 */
export interface UseSubscriptionFormReturn {
  /** Form instance */
  form: FormInstance;
  /** Submit loading state */
  loading: boolean;
  /**
   * Submit handler function
   * @param onSubmit - Submit callback function, returns true on success, false on failure
   * @param onCancel - Cancel callback function, called on success
   * @param webhookHeaders - Webhook request header configuration
   * @param enableWebhook - Whether Webhook is enabled
   * @returns Promise<boolean> - Returns true on successful submission, false on failed submission
   */
  handleSubmit: (
    onSubmit: (
      data: SubscribeRelationCreate | SubscribeRelationUpdate,
    ) => Promise<boolean>,
    onCancel: () => void,
    webhookHeaders: WebhookHeader[],
    enableWebhook: boolean,
  ) => Promise<boolean>;
}
