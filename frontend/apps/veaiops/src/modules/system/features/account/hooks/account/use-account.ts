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
import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import type { User } from 'api-generate';
import { useCallback, useState } from 'react';
import {
  type UpdateUserParams,
  createUser,
  deleteUser,
  updateUser,
} from './lib/api';
import type { UserFormData } from './lib/types';

/**
 * Account management logic Hook
 * Provides all business logic for account management page
 */
export const useAccount = (refreshTable?: () => Promise<boolean>) => {
  // Use management refresh Hook
  const { afterCreate, afterUpdate, afterDelete } =
    useManagementRefresh(refreshTable);
  const [form] = Form.useForm();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
              message: '删除后刷新表格失败',
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
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '删除失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [afterDelete],
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
              message: '创建后刷新表格失败',
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
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '创建失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [form, afterCreate],
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
            logger.warn({
              message: '更新后刷新表格失败',
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
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '更新失败，请重试';
        Message.error(errorMessage);
        return false;
      }
    },
    [editingUser, form, afterUpdate],
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
    [form],
  );

  // Open add modal
  const handleAdd = useCallback(() => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  }, [form]);

  // Close modal
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingUser(null);
    form.resetFields();
  }, [form]);

  return {
    // State
    modalVisible,
    editingUser,
    form,

    // Event handlers
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
    handleDelete,
  };
};
