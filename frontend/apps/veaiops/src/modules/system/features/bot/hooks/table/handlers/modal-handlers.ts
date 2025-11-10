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
import type { Bot } from '@bot/lib';
import { useCallback } from 'react';

/**
 * Modal operation handler parameters
 */
interface ModalHandlersParams {
  form: FormInstance;
  editingBot: Bot | null;
  setEditingBot: (bot: Bot | null) => void;
  modalVisible: boolean;
  setModalVisible: (visible: boolean) => void;
}

/**
 * Modal operation handlers
 */
export const useModalHandlers = ({
  form,
  editingBot,
  setEditingBot,
  setModalVisible,
}: ModalHandlersParams) => {
  // Open edit modal
  const handleEdit = useCallback(
    (bot: Bot) => {
      setEditingBot(bot);
      form.setFieldsValue({
        name: bot.name,
        bot_id: bot.bot_id,
        secret: bot.secret,
      });
      setModalVisible(true);
    },
    [form, setEditingBot, setModalVisible],
  );

  // Open add modal
  const handleAdd = useCallback(() => {
    setEditingBot(null);
    form.resetFields();
    setModalVisible(true);
  }, [form, setEditingBot, setModalVisible]);

  // Close modal
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingBot(null);
    form.resetFields();
  }, [form, setModalVisible, setEditingBot]);

  return {
    handleEdit,
    handleAdd,
    handleCancel,
  };
};
