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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { useCallback, useEffect, useState } from 'react';
import { deleteUser as deleteUserApi } from '../lib/api';
import { MOCK_PERMISSIONS, MOCK_USERS } from '../lib/constants';
import type { User, UserPermission } from '../lib/types';

export function useUserManagement() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [permissions, setPermissions] = useState<UserPermission[]>([]);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const response = await apiClient.users.getApisV1ManagerUsers({
        skip: 0,
        limit: 100,
      });

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        const userList = Array.isArray(response.data) ? response.data : [];

        // Convert API data format to frontend format
        const formattedUsers: User[] = userList.map((item: any) => ({
          id: item._id || item.id || '',
          username: item.username || '',
          email: item.email || '',
          fullName: item.full_name || item.fullName || item.username || '',
          role: item.role || 'user',
          status: item.is_active ? 'active' : 'inactive',
          lastLogin: item.last_login || undefined,
          createdAt: item.created_at || new Date().toISOString(),
          updatedAt: item.updated_at || new Date().toISOString(),
          permissions: item.permissions || [],
          avatar:
            item.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${item.username}`,
        }));

        setUsers(formattedUsers);
      } else {
        throw new Error(response.message || '获取用户列表失败');
      }
    } catch (error) {
      // Error handling: Expose error information
      const errorMessage =
        error instanceof Error ? error.message : '加载用户列表失败，请重试';
      Message.error(errorMessage);

      // Use mock data as fallback when error occurs
      setUsers(MOCK_USERS);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPermissions = useCallback(async () => {
    try {
      // TODO: Call actual API
      // const response = await AuthenticationService.getPermissions();
      // setPermissions(response.data);

      setPermissions(MOCK_PERMISSIONS);
    } catch (error) {
      // Silent failure, use mock data
    }
  }, []);

  useEffect(() => {
    loadUsers();
    loadPermissions();
  }, [loadUsers, loadPermissions]);

  const deleteUserHandler = useCallback(
    async (id: string) => {
      const result = await deleteUserApi(id);

      if (result.success) {
        setUsers(users.filter((user) => user.id !== id));
        Message.success('删除成功');
      } else {
        // Error handling: Expose error information
        const errorMessage =
          result.error instanceof Error
            ? result.error.message
            : '删除失败，请重试';
        Message.error(errorMessage);
      }
    },
    [users],
  );

  const toggleUserStatus = useCallback(
    async (user: User) => {
      try {
        const newStatus = user.status === 'active' ? 'inactive' : 'active';
        // TODO: Call actual API
        // await AuthenticationService.updateUserStatus(user.id, newStatus);

        setUsers(
          users.map((u) =>
            u.id === user.id
              ? {
                  ...u,
                  status: newStatus,
                  updatedAt: new Date().toLocaleString(),
                }
              : u,
          ),
        );
        Message.success(newStatus === 'active' ? '用户已激活' : '用户已停用');
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '操作失败，请重试';
        Message.error(errorMessage);
      }
    },
    [users],
  );

  const resetPassword = useCallback(async (_user: User) => {
    try {
      // TODO: Call actual API
      // await AuthenticationService.resetPassword(user.id);

      Message.success('密码重置邮件已发送');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '重置密码失败，请重试';
      Message.error(errorMessage);
    }
  }, []);

  const submitUser = useCallback(
    async (values: any, editingUser: User | null) => {
      try {
        const userData = {
          ...values,
          status: values.status ? 'active' : 'inactive',
        };

        if (editingUser) {
          // TODO: Call actual API
          // await AuthenticationService.updateUser(editingUser.id, userData);

          setUsers(
            users.map((user) =>
              user.id === editingUser.id
                ? {
                    ...user,
                    ...userData,
                    updatedAt: new Date().toLocaleString(),
                  }
                : user,
            ),
          );
          Message.success('更新成功');
        } else {
          // TODO: Call actual API
          // const response = await AuthenticationService.createUser(userData);

          const newUser: User = {
            id: Date.now().toString(),
            ...userData,
            createdAt: new Date().toLocaleString(),
            updatedAt: new Date().toLocaleString(),
            permissions: [],
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`,
          };
          setUsers([...users, newUser]);
          Message.success('创建成功');
        }
      } catch (error) {
        // Error handling: Expose error information
        const errorMessage =
          error instanceof Error ? error.message : '保存失败，请重试';
        Message.error(errorMessage);
      }
    },
    [users],
  );

  const updatePermissions = useCallback(
    async (selectedUser: User, permissions: string[]) => {
      try {
        if (!selectedUser) {
          return;
        }

        // TODO: Call actual API
        // await AuthenticationService.updateUserPermissions(selectedUser.id, permissions);

        setUsers(
          users.map((user) =>
            user.id === selectedUser.id
              ? {
                  ...user,
                  permissions,
                  updatedAt: new Date().toLocaleString(),
                }
              : user,
          ),
        );

        Message.success('权限更新成功');
      } catch (error) {
        // Error handling: Expose error information
        const errorMessage =
          error instanceof Error ? error.message : '权限更新失败，请重试';
        Message.error(errorMessage);
      }
    },
    [users],
  );

  return {
    loading,
    users,
    permissions,
    loadUsers,
    deleteUser: deleteUserHandler,
    toggleUserStatus,
    resetPassword,
    submitUser,
    updatePermissions,
  };
}
