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
import type { UpdateUserParams, UserFormData } from '../types';

interface UseFormHandlersParams {
  form: FormInstance;
  editingUser: User | null;
  setEditingUser: (user: User | null) => void;
  setModalVisible: (visible: boolean) => void;
  createUser: (data: UserFormData) => Promise<boolean>;
  updateUser: (params: UpdateUserParams) => Promise<boolean>;
  deleteUser: (id: string) => Promise<boolean>;
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
  const { afterCreate, afterUpdate, afterDelete } =
    useManagementRefresh(refreshTable);

  // Delete user
  const handleDelete = useCallback(
    async (userId: string) => {
      try {
        const success = await deleteUser(userId);
        if (success) {
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
              source: 'AccountManagement',
              component: 'handleDelete',
            });
          }
          return true;
        }
        return false;
      } catch (error: unknown) {
        // ✅ Correct: Extract actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || 'Delete failed, please retry';
        Message.error(errorMessage);
        return false;
      }
    },
    [deleteUser, afterDelete],
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
            logger.warn({
              message: 'Failed to refresh table after creation',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'AccountManagement',
              component: 'handleCreate',
            });
          }
          return true;
        }
        return false;
      } catch (error: unknown) {
        // ✅ Correct: Extract actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || 'Create failed, please retry';
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
        Message.error('User ID cannot be empty');
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
            logger.warn({
              message: 'Failed to refresh table after update',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
              },
              source: 'AccountManagement',
              component: 'handleUpdate',
            });
          }
          return true;
        }
        return false;
      } catch (error: unknown) {
        // ✅ Correct: Extract actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || 'Update failed, please retry';
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
