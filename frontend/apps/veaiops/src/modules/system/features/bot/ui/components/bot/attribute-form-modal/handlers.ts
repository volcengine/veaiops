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
import type { BotAttributeFormData } from '@bot/types';
import { logger } from '@veaiops/utils';

/**
 * Bot attribute form modal event handler functions
 */
export const useAttributeFormModalHandlers = ({
  form,
  onSubmit,
  onCancel,
  setValueOptions,
  setSelectedAttributeName,
}: {
  form: FormInstance<BotAttributeFormData>;
  onSubmit: (values: BotAttributeFormData) => Promise<boolean>;
  onCancel: () => void;
  setValueOptions: (options: Array<{ label: string; value: string }>) => void;
  setSelectedAttributeName: (name: string) => void;
}) => {
  /**
   * Handle form submission
   */
  const handleSubmit = async (): Promise<boolean> => {
    try {
      const values = await form.validate();
      // Ensure value is not undefined
      if (
        values.value === undefined ||
        (Array.isArray(values.value) && values.value.length === 0)
      ) {
        throw new Error('请选择内容');
      }
      return await onSubmit(values);
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || '提交失败，请重试';
      logger.error({
        message: 'Bot属性表单提交失败',
        data: {
          error: errorMessage,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'BotAttributeFormHandlers',
        component: 'handleSubmit',
      });
      return false;
    }
  };

  /**
   * Handle cancel operation
   */
  const handleCancel = (): void => {
    form.resetFields();
    setSelectedAttributeName('');
    setValueOptions([]);
    onCancel();
  };

  return {
    handleSubmit,
    handleCancel,
  };
};
