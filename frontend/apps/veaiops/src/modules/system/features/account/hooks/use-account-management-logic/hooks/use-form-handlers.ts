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
import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import type { User } from 'api-generate';
import { useCallback } from 'react';
import type { UserFormData } from '../types';

interface UseFormHandlersParams {
  form: FormInstance;
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  setModalVisible: (visible: boolean) => void;
  createUser: (userData: UserFormData) => Promise<boolean>;
  updateUser: (params: {
    userId: string;
    updateData: UserFormData;
  }) => Promise<boolean>;
  deleteUser: (userId: string) => Promise<boolean>;
  refreshTable?: () => Promise<boolean>;
}

/**
 * Form handler Hook
 */
export const useFormHandlers = ({
  form,
  editingUser,
  setEditingUser,
  setModalVisible,
  createUser,
  updateUser,
  deleteUser,
  refreshTable,
}: UseFormHandlersParams) => {
  // Use management refresh Hook
  // ✅ Note: Refresh for delete operation is automatically handled by useBusinessTable, no need for afterDelete
  // Only keep afterCreate and afterUpdate for refreshing after form submission
  const { afterCreate, afterUpdate } = useManagementRefresh(refreshTable);

  // Delete user
  // ✅ Note: Refresh after deletion is automatically handled by useBusinessTable, no need to manually call afterDelete
  const handleDelete = useCallback(
    async (userId: string) => {
      try {
        const success = await deleteUser(userId);
        // ✅ Refresh is automatically handled by useBusinessTable, no need to manually refresh
        return success;
      } catch (error) {
        // ✅ Correct: expose actual error information
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
            // Refresh failed, but doesn't affect the create operation itself
            // ✅ Correct: use logger to record warning, pass complete error information
            const errorObj = refreshResult.error;
            logger.warn({
              message: '创建后刷新表格失败',
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
        // ✅ Correct: expose actual error information
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
            // Refresh failed, but doesn't affect the update operation itself
            // ✅ Correct: use logger to record warning, pass complete error information
            const errorObj = refreshResult.error;
            logger.warn({
              message: '更新后刷新表格失败',
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
        // ✅ Correct: expose actual error information
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

  return {
    handleDelete,
    handleCreate,
    handleUpdate,
    handleSubmit,
  };
};
