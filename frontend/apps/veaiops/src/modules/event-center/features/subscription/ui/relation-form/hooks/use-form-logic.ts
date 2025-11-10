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
import { ensureArray, logger } from '@veaiops/utils';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';
import { useCallback, useState } from 'react';

/**
 * Form logic Hook parameters
 */
interface UseFormLogicParams {
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
          // ✅ Correct: Expose actual error information
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          const errorMessage =
            errorObj.message || 'Webhook请求头不是有效的JSON格式';
          Message.error(errorMessage);
          setLoading(false);
          return;
        }
      }

      // ✅ Fix: Normalize strategy IDs, always pass array (even if empty)
      const normalizedStrategyIds = ensureArray(
        (values as Record<string, unknown>)?.inform_strategy_ids,
      )
        .map(String)
        .filter(Boolean);

      const formData: SubscribeRelationCreate | SubscribeRelationUpdate = {
        ...values,
        // Map UI field to API field to avoid browser autofill on "name"
        name:
          (values as Record<string, unknown>)?.subscribeName ??
          (values as Record<string, unknown>)?.name,
        // ✅ Fix: inform_strategy_ids always passes array (even if empty), not undefined
        inform_strategy_ids: normalizedStrategyIds,
        start_time,
        end_time,
        webhook_headers: webhookHeaders,
      };

      const success = await onSubmit(formData);
      if (success) {
        resetForm();
        onClose();
        Message.success(editData ? '订阅关系更新成功' : '事件订阅创建成功');
      }
    } catch (error: unknown) {
      // ✅ Note: Error has been handled in Hook, silent handling here is expected behavior
      // Use logger to record debug information (logger internally handles development environment check)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.debug({
        message: '表单提交错误（已在 Hook 中处理）',
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

/**
 * Initialize form data
 */
export const useFormInitializer = ({
  form,
  visible,
  editData,
}: {
  form: FormInstance;
  visible: boolean;
  editData?: SubscribeRelationWithAttributes | null;
}) => {
  const initializeForm = useCallback(() => {
    if (visible && editData) {
      const normalizedStrategyIds = ensureArray(editData.inform_strategy_ids)
        .map(String)
        .filter(Boolean);

      form.setFieldsValue({
        subscribeName: editData.name,
        agent_type: editData.agent_type,
        interest_products: editData.interest_products || [],
        interest_projects: editData.interest_projects || [],
        interest_customers: editData.interest_customers || [],
        event_level: editData.event_level,
        timeRange: [
          editData.start_time ? new Date(editData.start_time) : new Date(),
          editData.end_time
            ? new Date(editData.end_time)
            : new Date(new Date().setFullYear(new Date().getFullYear() + 100)),
        ],
        inform_strategy_ids: normalizedStrategyIds,
        enable_webhook: editData.enable_webhook,
        webhook_endpoint: editData.webhook_endpoint,
        webhook_headers: editData.webhook_headers
          ? JSON.stringify(editData.webhook_headers, null, 2)
          : '',
      });
    } else if (visible && !editData) {
      // Reset form and set default values when creating new
      form.resetFields();
      form.setFieldsValue({
        enable_webhook: false,
      });
    }
  }, [visible, editData, form]);

  return {
    initializeForm,
  };
};
