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
 * Bot form management Hook
 * Integrates all form-related logic
 */

import { Form, Message } from '@arco-design/web-react';
import type { Bot, BotCreateRequest, BotUpdateRequest } from '@bot';
import { logger } from '@veaiops/utils';
import { useCallback, useState } from 'react';

/**
 * Bot form Hook
 */
export const useBotForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [editingBot, setEditingBot] = useState<Bot | null>(null);

  const handleEdit = useCallback(
    (bot: Bot) => {
      setEditingBot(bot);
      form.setFieldsValue(bot);
    },
    [form],
  );

  const handleAdd = useCallback(() => {
    setEditingBot(null);
    form.resetFields();
  }, [form]);

  const handleCancel = useCallback(() => {
    setEditingBot(null);
    form.resetFields();
  }, [form]);

  const handleSubmit = useCallback(
    async (values: BotCreateRequest | BotUpdateRequest) => {
      setLoading(true);
      try {
        // Should call actual API here
        logger.debug({
          message: 'Submit bot',
          data: { values, editingBot },
          source: 'useBotForm',
          component: 'handleSubmit',
        });
        Message.success(editingBot ? '更新成功' : '创建成功');
        handleCancel();
      } catch (error) {
        // ✅ Correct: Extract actual error information
        let errorMessage: string;
        if (error instanceof Error) {
          errorMessage = error.message;
        } else {
          errorMessage = editingBot ? '更新失败，请重试' : '创建失败，请重试';
        }
        Message.error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [editingBot, handleCancel],
  );

  return {
    form,
    loading,
    editingBot,
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
  };
};
