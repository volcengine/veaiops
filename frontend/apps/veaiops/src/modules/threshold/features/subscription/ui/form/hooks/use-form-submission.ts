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

import { Message } from '@arco-design/web-react';
import type { FormInstance } from '@arco-design/web-react/es/Form';
import { ensureArray } from '@veaiops/utils';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';
import { useCallback } from 'react';

/**
 * useFormSubmission Hook parameters interface
 */
export interface UseFormSubmissionParams {
  form: FormInstance;
  editData: SubscribeRelationWithAttributes | null | undefined;
  onSubmit: (
    data: SubscribeRelationCreate | SubscribeRelationUpdate,
  ) => Promise<boolean>;
  onClose: () => void;
}

/**
 * Form submission logic Hook
 */
export const useFormSubmission = ({
  form,
  editData,
  onSubmit,
  onClose,
}: UseFormSubmissionParams) => {
  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validate();

      const [start_time, end_time] = values.timeRange || [];
      let webhookHeaders = {};
      if (values.enable_webhook && values.webhook_headers) {
        try {
          webhookHeaders = JSON.parse(values.webhook_headers);
        } catch (error) {
          // ✅ Correct: expose actual error information
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'Webhook请求头不是有效的JSON格式';
          Message.error(errorMessage);
          return false;
        }
      }

      // ✅ Fix: normalize strategy IDs, always pass array (even if empty)
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
        // ✅ Fix: inform_strategy_ids always pass array (even if empty), do not pass undefined
        inform_strategy_ids: normalizedStrategyIds,
        start_time,
        end_time,
        webhook_headers: webhookHeaders,
      };

      const success = await onSubmit(formData);
      if (success) {
        form.resetFields();
        onClose();
        Message.success(editData ? '订阅关系更新成功' : '事件订阅创建成功');
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '操作失败，请重试';
      Message.error(errorMessage);
      return false;
    }
  }, [form, editData, onSubmit, onClose]);

  return { handleSubmit };
};
