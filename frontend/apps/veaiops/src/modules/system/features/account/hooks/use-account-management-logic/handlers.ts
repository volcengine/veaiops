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
import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import type { User } from 'api-generate';
import { useCallback } from 'react';
import type { UpdateUserParams } from './crud';
import { useCreateUser, useDeleteUser, useUpdateUser } from './crud';
import type { UseAccountStateReturn } from './state';
import type { UserFormData } from './types';

/**
 * Event handler Hook parameters
 */
interface UseAccountHandlersParams {
  state: UseAccountStateReturn;
  createUser: (data: UserFormData) => Promise<boolean>;
  updateUser: (params: UpdateUserParams) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  refreshTable?: () => Promise<boolean>;
}

/**
 * Account management event handler Hook
 */
export const useAccountHandlers = ({
  state,
  createUser,
  updateUser,
  deleteUser,
  refreshTable,
}: UseAccountHandlersParams) => {
  const { form, editingUser, setEditingUser, modalVisible, setModalVisible } =
    state;

  // Use management refresh Hook
  // ✅ Note: Delete operation refresh is automatically handled by useBusinessTable, no need for afterDelete
  // Only keep afterCreate and afterUpdate for refresh after form submission
  const { afterCreate, afterUpdate } = useManagementRefresh(refreshTable);

  // Delete user
  // ✅ Note: Refresh after delete is automatically handled by useBusinessTable, no need to manually call afterDelete
  const handleDelete = useCallback(
    async (userId: string) => {
      try {
        const success = await deleteUser(userId);
        // ✅ Refresh is automatically handled by useBusinessTable, no need to manually refresh
        return success;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error ? error.message : '删除失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [deleteUser],
  );

  // Create user
  const handleCreate = useCallback(
    async (values: UserFormData) => {
      try {
        const success = await createUser(values);
        if (success) {
          setModalVisible(false);
          form.resetFields();
          // Refresh table after successful creation
          const refreshResult = await afterCreate();
          if (!refreshResult.success && refreshResult.error) {
            // Refresh failed, but does not affect the create operation itself
            // ✅ Correct: Use logger to record warning, pass complete error information
            const errorObj = refreshResult.error;
            logger.warn({
              message: 'Failed to refresh table after creation',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
                userValues: values,
              },
              source: 'AccountManagement',
              component: 'handleCreate',
            });
          }
          return true;
        }
        return false;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error ? error.message : '创建失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [createUser, form, afterCreate, setModalVisible],
  );

  // Update user
  const handleUpdate = useCallback(
    async (values: UserFormData) => {
      if (!editingUser || !editingUser._id) {
        Message.error('用户 ID 不能为空');
        return false;
      }

      try {
        const success = await updateUser({
          userId: editingUser._id,
          updateData: values,
        });
        if (success) {
          setModalVisible(false);
          setEditingUser(null);
          form.resetFields();
          // Refresh table after successful update
          const refreshResult = await afterUpdate();
          if (!refreshResult.success && refreshResult.error) {
            // Refresh failed, but does not affect the update operation itself
            // ✅ Correct: Use logger to record warning, pass complete error information
            const errorObj = refreshResult.error;
            logger.warn({
              message: 'Failed to refresh table after update',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
                userId: editingUser._id,
                userValues: values,
              },
              source: 'AccountManagement',
              component: 'handleUpdate',
            });
          }
          return true;
        }
        return false;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error ? error.message : '更新失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [
      editingUser,
      updateUser,
      form,
      afterUpdate,
      setModalVisible,
      setEditingUser,
    ],
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (values: UserFormData) => {
      if (editingUser) {
        return await handleUpdate(values);
      } else {
        return await handleCreate(values);
      }
    },
    [editingUser, handleUpdate, handleCreate],
  );

  // Open edit modal
  const handleEdit = useCallback(
    (user: User) => {
      setEditingUser(user);
      form.setFieldsValue({
        username: user.username,
        email: user.email,
        is_active: user.is_active,
        is_supervisor: user.is_supervisor,
      });
      setModalVisible(true);
    },
    [form, setEditingUser, setModalVisible],
  );

  // Open add modal
  const handleAdd = useCallback(() => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  }, [form, setEditingUser, setModalVisible]);

  // Close modal
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  }, [form, setModalVisible, setEditingUser]);

  return {
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
    handleDelete,
  };
};
