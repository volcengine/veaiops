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

import type { FormInstance } from '@arco-design/web-react';
import { Message } from '@arco-design/web-react';
import { ensureArray } from '@veaiops/utils';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
} from 'api-generate';
import type { WebhookHeader } from './types';

/**
 * Convert webhook header array to object
 *
 * Filters out items with empty key or value to ensure data validity
 *
 * @param webhookHeaders - Webhook header array
 * @returns Webhook header object
 *
 * @example
 * ```ts
 * convertWebhookHeaders([
 *   { key: 'Content-Type', value: 'application/json' },
 *   { key: 'Authorization', value: 'Bearer token' },
 *   { key: '', value: 'invalid' }, // Will be filtered
 * ])
 * // Returns: { 'Content-Type': 'application/json', 'Authorization': 'Bearer token' }
 * ```
 */
const convertWebhookHeaders = (
  webhookHeaders: WebhookHeader[],
): Record<string, string> => {
  const webhookHeadersObj: Record<string, string> = {};

  webhookHeaders.forEach(({ key, value }) => {
    // Only add items with both valid key and value
    if (key && value) {
      webhookHeadersObj[key] = value;
    }
  });

  return webhookHeadersObj;
};

/**
 * Extract and format submit data from form values
 *
 * Handles various data transformations:
 * 1. Convert time range to ISO string
 * 2. Normalize strategy IDs to string array
 * 3. Handle webhook configuration
 * 4. Handle event level
 *
 * @param values - Form values
 * @param webhookHeaders - Webhook header configuration
 * @param enableWebhook - Whether to enable webhook
 * @returns Formatted submit data
 */
const formatSubmitData = (
  values: Record<string, any>,
  webhookHeaders: WebhookHeader[],
  enableWebhook: boolean,
): SubscribeRelationCreate | SubscribeRelationUpdate => {
  // Handle time range
  const [startTime, endTime] = values.effective_time_range || [];

  // Handle webhook headers
  const webhookHeadersObj = enableWebhook
    ? convertWebhookHeaders(webhookHeaders)
    : {};

  // Normalize strategy IDs
  const normalizedStrategyIds = ensureArray(values.inform_strategy_ids)
    .map((id) => String(id).trim())
    .filter((id) => id.length > 0);

  // Normalize event level: convert frontend form's event_levels to backend's event_level
  // ✅ Fix: event_level is a required field in the backend, empty array represents subscribing to all levels
  // Backend definition: event_level: List[EventLevel] = Field(...) - required field
  const normalizedEventLevel = Array.isArray(values.event_levels)
    ? values.event_levels
    : [];

  // ✅ Fix: Return type matches SubscribeRelationCreate | SubscribeRelationUpdate
  // Ensure required fields are not undefined
  // ✅ Fix: Field name unified to use enable_webhook (consistent with backend definition)
  // ✅ Fix: inform_strategy_ids always passes an array (even if empty), not undefined
  return {
    name: values.name,
    agent_type: values.agent_type,
    inform_strategy_ids: normalizedStrategyIds,
    start_time: startTime?.toISOString(),
    end_time: endTime?.toISOString(),
    event_level: normalizedEventLevel,
    enable_webhook: enableWebhook || undefined,
    webhook_endpoint: enableWebhook ? values.webhook_endpoint : undefined,
    webhook_headers:
      enableWebhook && Object.keys(webhookHeadersObj).length > 0
        ? webhookHeadersObj
        : undefined,
    interest_products: values.interest_products || undefined,
    interest_projects: values.interest_projects || undefined,
    interest_customers: values.interest_customers || undefined,
  };
};

/**
 * Create form submit handler function
 *
 * Encapsulates the complete form submission flow:
 * 1. Validate form
 * 2. Format data
 * 3. Call submit callback
 * 4. Determine success/failure based on return value
 * 5. Display corresponding message
 * 6. Call onCancel to close form on success
 *
 * @param form - Form instance
 * @param setLoading - Function to set loading state
 * @returns Submit handler function, returns Promise<boolean> indicating whether submission was successful
 *
 * @example
 * ```ts
 * const handleSubmit = createSubmitHandler(form, setLoading);
 *
 * const success = await handleSubmit(
 *   async (data) => {
 *     // Execute save logic
 *     return true; // Return true for success, false for failure
 *   },
 *   () => {
 *     // Callback to close modal on success
 *   },
 *   webhookHeaders,
 *   enableWebhook
 * );
 *
 * if (success) {
 *   // Submission successful
 * }
 * ```
 */
export const createSubmitHandler = (
  form: FormInstance,
  setLoading: (loading: boolean) => void,
) => {
  return async (
    onSubmit: (
      data: SubscribeRelationCreate | SubscribeRelationUpdate,
    ) => Promise<boolean>,
    onCancel: () => void,
    webhookHeaders: WebhookHeader[],
    enableWebhook: boolean,
  ): Promise<boolean> => {
    try {
      // Validate form
      const values = await form.validate();
      setLoading(true);

      // Format submit data
      const submitData = formatSubmitData(
        values,
        webhookHeaders,
        enableWebhook,
      );

      // Call submit callback and get result
      const success = await onSubmit(submitData);

      // Determine success based on return value
      if (success) {
        onCancel();
        return true;
      }

      Message.error('Subscription save failed, please try again');
      return false;
    } catch (error) {
      // Handle validation failure or submission failure
      Message.error('Submission failed, please check form data');
      return false;
    } finally {
      setLoading(false);
    }
  };
};
