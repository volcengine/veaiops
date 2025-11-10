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

import { Form } from '@arco-design/web-react';
import { useEffect, useState } from 'react';
import { initializeForm } from './form-initializer';
import { createSubmitHandler } from './form-submit-handler';
import type {
  UseSubscriptionFormConfig,
  UseSubscriptionFormReturn,
} from './types';

// Export types
export type {
  StrategyIdItem,
  UseSubscriptionFormConfig,
  UseSubscriptionFormReturn,
  WebhookHeader,
} from './types';

// Export utility functions (for use by other modules)
export { normalizeStrategyIds } from './strategy-id-normalizer';
export { createDefaultTimeRange, parseTimeRange } from './time-range-utils';

/**
 * Subscription form management Hook
 *
 * Provides complete state management and interaction logic for subscription forms, including:
 * - Form initialization (new/edit mode)
 * - Data normalization
 * - Form submission handling
 * - Loading state management
 *
 * @param config - Hook configuration parameters
 * @returns Hook return value
 *
 * @example
 * ```tsx
 * function SubscriptionModal({ visible, initialData, onSubmit, onCancel }) {
 *   const { form, loading, handleSubmit } = useSubscriptionForm({
 *     visible,
 *     initialData,
 *     moduleType: 'oncall',
 *   });
 *
 *   const handleFormSubmit = async () => {
 *     const success = await handleSubmit(
 *       onSubmit,
 *       onCancel,
 *       webhookHeaders,
 *       enableWebhook
 *     );
 *
 *     // Can perform subsequent operations based on return value
 *     if (success) {
 *       // Submission successful, can perform other operations
 *     } else {
 *       // Submission failed
 *     }
 *   };
 *
 *   return (
 *     <Drawer visible={visible}>
 *       <Form form={form}>
 *         // ... form fields
 *       </Form>
 *       <Button
 *         loading={loading}
 *         onClick={handleFormSubmit}
 *       >
 *         Submit
 *       </Button>
 *     </Drawer>
 *   );
 * }
 * ```
 *
 * @remarks
 * This Hook will reinitialize the form in the following cases:
 * - visible state changes
 * - initialData changes
 * - moduleType changes
 *
 * @see {@link UseSubscriptionFormConfig} Configuration parameter details
 * @see {@link UseSubscriptionFormReturn} Return value details
 */
export const useSubscriptionForm = ({
  visible,
  initialData,
  moduleType,
}: UseSubscriptionFormConfig): UseSubscriptionFormReturn => {
  // Create form instance
  const [form] = Form.useForm();
  // Submission loading state
  const [loading, setLoading] = useState(false);

  // Form initialization: when modal is shown or data changes
  // 🔧 Note: form instance is stable (created by Form.useForm()), reference remains unchanged throughout component lifecycle
  useEffect(() => {
    if (visible) {
      initializeForm(form, initialData, moduleType);
    }
  }, [visible, initialData, moduleType]);

  // Create submission handler function
  const handleSubmit = createSubmitHandler(form, setLoading);

  return {
    form,
    loading,
    handleSubmit,
  };
};

export default useSubscriptionForm;
