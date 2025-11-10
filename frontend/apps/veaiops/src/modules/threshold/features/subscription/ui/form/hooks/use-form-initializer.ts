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
import type { Form } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import { useCallback } from 'react';

interface UseFormInitializerParams {
  form: ReturnType<typeof Form.useForm>[0];
  visible: boolean;
  editData?: SubscribeRelationWithAttributes | null;
}

/**
 * Form initialization Hook
 */
export const useFormInitializer = ({
  form,
  visible,
  editData,
}: UseFormInitializerParams) => {
  const initializeForm = useCallback(() => {
    if (visible && editData) {
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
        inform_strategy_ids: editData.inform_strategy_ids,
        enable_webhook: editData.enable_webhook,
        webhook_endpoint: editData.webhook_endpoint,
        webhook_headers: editData.webhook_headers
          ? JSON.stringify(editData.webhook_headers, null, 2)
          : '',
      });
    } else if (visible && !editData) {
      // When creating new, reset form and set default values
      form.resetFields();
      const defaultEndTime = new Date();
      defaultEndTime.setFullYear(defaultEndTime.getFullYear() + 100);
      form.setFieldsValue({
        enable_webhook: false,
      });
    }

    // Debug log: snapshot input autocomplete attribute in development
    try {
      const el = document.querySelector('input[placeholder="请输入订阅名称"]');
      logger.debug({
        message: 'Input autocomplete snapshot',
        data: {
          autocomplete: el?.getAttribute('autocomplete') || null,
        },
        source: 'SubscribeRelationForm',
        component: 'useEffect',
      });
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.debug({
        message: 'Input autocomplete snapshot failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'SubscribeRelationForm',
        component: 'useEffect',
      });
    }
  }, [visible, editData, form]);

  return {
    initializeForm,
  };
};
