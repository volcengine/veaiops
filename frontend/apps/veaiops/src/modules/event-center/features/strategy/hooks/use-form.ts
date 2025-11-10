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

import { Form, Message } from '@arco-design/web-react';
import { adaptStrategyForEdit, strategyApi } from '@ec/strategy';
import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import type {
  InformStrategy,
  InformStrategyCreate,
  InformStrategyUpdate,
} from 'api-generate';
import { useCallback, useState } from 'react';

/**
 * Strategy form management Hook parameters
 */
export interface UseStrategyFormParams {
  refreshTable?: () => Promise<boolean>;
}

/**
 * Strategy form management Hook return value
 */
export interface UseStrategyFormResult {
  // State
  modalVisible: boolean;
  editingStrategy: InformStrategy | null;
  form: ReturnType<typeof Form.useForm>[0];

  // Event handlers
  handleEdit: (strategy: InformStrategy) => void;
  handleAdd: () => void;
  handleCancel: () => void;
  handleSubmit: (
    values: InformStrategyCreate | InformStrategyUpdate,
  ) => Promise<boolean>;
  handleDelete: (strategyId: string) => Promise<boolean>;
}

/**
 * Strategy form management Hook
 *
 * Provides state management and business logic for strategy form:
 * - Form state management (modalVisible, editingStrategy, form)
 * - Form operation handlers (handleEdit, handleAdd, handleCancel, handleSubmit, handleDelete)
 * - Automatic table refresh (using useManagementRefresh)
 *
 * Based on Python source code analysis:
 * - InformStrategyVO contains bot: BotVO and group_chats: List[GroupChatVO]
 * - Form requires flattened bot_id and chat_ids, uses adaptStrategyForEdit adapter for conversion
 */
export const useStrategyForm = ({
  refreshTable,
}: UseStrategyFormParams): UseStrategyFormResult => {
  // Use management refresh Hook
  const { afterCreate, afterUpdate, afterDelete } =
    useManagementRefresh(refreshTable);

  const [form] = Form.useForm();
  // ✅ Fix: Based on Python source code analysis, API returns InformStrategyVO (corresponds to InformStrategy)
  // Unified use of InformStrategy (from api-generate), conforms to single source of truth principle
  const [editingStrategy, setEditingStrategy] = useState<InformStrategy | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);

  // Delete strategy handler
  const handleDelete = useCallback(
    async (strategyId: string) => {
      try {
        const result = await strategyApi.deleteStrategy(strategyId);
        if (result.success) {
          // Refresh table after successful deletion
          const refreshResult = await afterDelete();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: 'Failed to refresh table after deletion',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'StrategyForm',
              component: 'handleDelete',
            });
          }
          return true;
        }
        return false;
      } catch (error: unknown) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || 'Deletion failed, please try again';
        Message.error(errorMessage);
        return false;
      }
    },
    [afterDelete],
  );

  // Create strategy handler
  const handleCreate = useCallback(
    async (values: InformStrategyCreate) => {
      try {
        const result = await strategyApi.createStrategy(values);
        if (result.success) {
          setModalVisible(false);
          form.resetFields();
          // Refresh table after successful creation
          const refreshResult = await afterCreate();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: 'Failed to refresh table after creation',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'StrategyForm',
              component: 'handleCreate',
            });
          }
          return true;
        }
        return false;
      } catch (error: unknown) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || 'Creation failed, please try again';
        Message.error(errorMessage);
        return false;
      }
    },
    [form, afterCreate],
  );

  // Update strategy handler
  const handleUpdate = useCallback(
    async (values: InformStrategyUpdate) => {
      if (!editingStrategy || !editingStrategy.id) {
        Message.error('Strategy ID cannot be empty');
        return false;
      }

      try {
        const result = await strategyApi.updateStrategy(
          editingStrategy.id,
          values,
        );
        if (result.success) {
          setModalVisible(false);
          setEditingStrategy(null);
          form.resetFields();
          // Refresh table after successful update
          const refreshResult = await afterUpdate();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: 'Failed to refresh table after update',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'StrategyForm',
              component: 'handleUpdate',
            });
          }
          return true;
        }
        return false;
      } catch (error: unknown) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || 'Update failed, please try again';
        Message.error(errorMessage);
        return false;
      }
    },
    [editingStrategy, form, afterUpdate],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: InformStrategyCreate | InformStrategyUpdate) => {
      // Check for duplicate name
      if (values.name) {
        const checkResult = await strategyApi.checkNameDuplicate(
          values.name,
          editingStrategy?.id,
        );
        if (checkResult.isDuplicate) {
          Message.error('Strategy name cannot be duplicated');
          return false;
        }
      }

      if (editingStrategy) {
        return await handleUpdate(values as InformStrategyUpdate);
      } else {
        return await handleCreate(values as InformStrategyCreate);
      }
    },
    [editingStrategy, handleUpdate, handleCreate],
  );

  // Open edit modal
  // ✅ Fix: Use InformStrategy type, extract form fields via adapter
  // According to Python source code: InformStrategyVO contains bot: BotVO and group_chats: List[GroupChatVO]
  // Form requires flattened bot_id and chat_ids, uses adaptStrategyForEdit adapter for conversion
  const handleEdit = useCallback(
    (strategy: InformStrategy) => {
      setEditingStrategy(strategy);
      // ✅ Use type adapter function (conforms to .cursorrules specification)
      // adaptStrategyForEdit extracts values from InformStrategy.bot.bot_id and InformStrategy.group_chats[].open_chat_id
      const adaptedStrategy = adaptStrategyForEdit(strategy);
      form.setFieldsValue({
        name: strategy.name,
        description: strategy.description,
        channel: strategy.channel || 'Lark',
        // ✅ Type safe: Use bot_id and chat_ids extracted by adapter
        bot_id: adaptedStrategy.bot_id || '',
        chat_ids: adaptedStrategy.chat_ids || [],
      });
      setModalVisible(true);
    },
    [form],
  );

  // Open add modal
  const handleAdd = useCallback(() => {
    setEditingStrategy(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  // Close modal
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingStrategy(null);
    form.resetFields();
  }, [form]);

  return {
    // State
    modalVisible,
    editingStrategy,
    form,

    // Event handlers
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
    handleDelete,
  };
};
