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
import { useCallback, useState } from 'react';

import { logger } from '../logger';

/**
 * Drawer form submission configuration options
 */
export interface UseDrawerFormSubmitOptions<T = Record<string, unknown>> {
  /**
   * Form instance
   */
  form: FormInstance;

  /**
   * Submit handler function
   * @param values - Form values after validation passes
   * @returns Promise<boolean> - Returns true for success, false for failure
   */
  onSubmit: (values: T) => Promise<boolean>;

  /**
   * Callback after successful submission
   * @param values - Form values
   */
  onSuccess?: (values: T) => void;

  /**
   * Callback after failed submission
   * @param error - Error object
   */
  onError?: (error: unknown) => void;

  /**
   * Whether to reset form after success
   * @default true
   */
  resetOnSuccess?: boolean;

  /**
   * Whether to close drawer after success
   * @default false
   */
  closeOnSuccess?: boolean;

  /**
   * Callback to close drawer (only used when closeOnSuccess is true)
   */
  onClose?: () => void;
}

/**
 * Drawer form submission return value
 */
export interface UseDrawerFormSubmitReturn {
  /**
   * Submitting state
   */
  submitting: boolean;

  /**
   * Submit handler function
   */
  handleSubmit: () => Promise<void>;

  /**
   * Manually set submitting state (for external control)
   */
  setSubmitting: (loading: boolean) => void;
}

/**
 * Drawer form submission Hook
 *
 * Encapsulates drawer form submission logic, including:
 * 1. Form validation
 * 2. Loading state management
 * 3. Error handling
 * 4. Success callback handling
 *
 * @example
 * ```tsx
 * const { submitting, handleSubmit } = useDrawerFormSubmit({
 *   form,
 *   onSubmit: async (values) => {
 *     const success = await api.createProject(values);
 *     return success;
 *   },
 *   onSuccess: () => {
 *     Message.success('Created successfully');
 *   },
 *   resetOnSuccess: true,
 *   closeOnSuccess: true,
 *   onClose: handleClose,
 * });
 *
 * // Use in drawer
 * <Drawer
 *   footer={
 *     <Button onClick={handleSubmit} loading={submitting}>
 *       Submit
 *     </Button>
 *   }
 * >
 *   <DrawerFormContent loading={submitting}>
 *     <Form form={form}>...</Form>
 *   </DrawerFormContent>
 * </Drawer>
 * ```
 */
export const useDrawerFormSubmit = <T = Record<string, unknown>>({
  form,
  onSubmit,
  onSuccess,
  onError,
  resetOnSuccess = true,
  closeOnSuccess = false,
  onClose,
}: UseDrawerFormSubmitOptions<T>): UseDrawerFormSubmitReturn => {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(async () => {
    try {
      // Step 1: Validate form
      const values = await form.validate();

      // Step 2: Start submission, set loading state
      setSubmitting(true);

      // Step 3: Call submit function
      const success = await onSubmit(values as T);

      // Step 4: Handle success case
      if (success) {
        // Execute success callback
        if (onSuccess) {
          onSuccess(values as T);
        }

        // Reset form (if needed)
        if (resetOnSuccess) {
          form.resetFields();
        }

        // Close drawer (if needed)
        if (closeOnSuccess && onClose) {
          onClose();
        }
      }
    } catch (error: unknown) {
      // Handle error case
      const errorObj =
        error instanceof Error ? error : new Error(String(error));

      // If it's a form validation error, don't log (form will automatically display error message)
      if (
        errorObj.message &&
        (errorObj.message.includes('validation') ||
          errorObj.message.includes('validate') ||
          errorObj.message.includes('required'))
      ) {
        // Form validation failed, silently handle (form will automatically display error)
        return;
      }

      // Other errors, log and call error callback
      logger.error({
        message: 'Drawer form submission failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'useDrawerFormSubmit',
        component: 'handleSubmit',
      });

      // Call error callback
      if (onError) {
        onError(error);
      }
    } finally {
      // Step 5: Stop loading regardless of success or failure
      setSubmitting(false);
    }
  }, [
    form,
    onSubmit,
    onSuccess,
    onError,
    resetOnSuccess,
    closeOnSuccess,
    onClose,
  ]);

  return {
    submitting,
    handleSubmit,
    setSubmitting,
  };
};

// Export component
export { DrawerFormContent } from './content';
export type { DrawerFormContentProps } from './content';
