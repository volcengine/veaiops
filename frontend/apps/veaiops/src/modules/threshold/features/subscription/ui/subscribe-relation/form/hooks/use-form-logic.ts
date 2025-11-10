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
import { logger } from '@veaiops/utils';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';
import { useCallback, useState } from 'react';

/**
 * Form logic Hook parameters
 */
export interface UseFormLogicParams {
  form: FormInstance;
  onSubmit: (
    data: SubscribeRelationCreate | SubscribeRelationUpdate,
  ) => Promise<boolean>;
  onClose: () => void;
  editData?: SubscribeRelationWithAttributes | null;
}

/**
 * Form logic Hook
 */
export const useFormLogic = ({
  form,
  onSubmit,
  onClose,
  editData,
}: UseFormLogicParams) => {
  const [loading, setLoading] = useState(false);

  // Reset form
  const resetForm = useCallback(() => {
    form.resetFields();
  }, [form]);

  // Handle form submission
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validate();
      setLoading(true);

      const [start_time, end_time] = values.timeRange || [];
      let webhookHeaders = {};
      if (values.enable_webhook && values.webhook_headers) {
        try {
          webhookHeaders = JSON.parse(values.webhook_headers);
        } catch (error: unknown) {
          // ✅ Correct: expose actual error information
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          const errorMessage =
            errorObj.message || 'Webhook请求头不是有效的JSON格式';
          Message.error(errorMessage);
          setLoading(false);
          return;
        }
      }

      const formData: SubscribeRelationCreate | SubscribeRelationUpdate = {
        ...values,
        // Map UI field to API field to avoid browser autofill on "name"
        name:
          (values as Record<string, unknown>)?.subscribeName ??
          (values as Record<string, unknown>)?.name,
        start_time,
        end_time,
        webhook_headers: webhookHeaders,
      };

      if (editData?._id) {
        // When updating, id is passed in URL, not in request body
      }

      const success = await onSubmit(formData);
      if (success) {
        resetForm();
        onClose();
        Message.success(editData ? '订阅关系更新成功' : '事件订阅创建成功');
      }
    } catch (error: unknown) {
      // ✅ Note: Error has been handled in Hook, silent handling here is expected behavior
      // Use logger to record debug info (logger internally handles development environment check)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.debug({
        message: 'Form submission error (already handled in Hook)',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'SubscribeRelationForm',
        component: 'handleSubmit',
      });
    } finally {
      setLoading(false);
    }
  }, [form, onSubmit, onClose, editData, resetForm]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  return {
    loading,
    handleSubmit,
    handleCancel,
    resetForm,
  };
};
