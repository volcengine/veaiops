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
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type { User } from './types';
import { MOCK_PERMISSIONS, MOCK_USERS } from './constants';

/**
 * Get user list
 */
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const response = await apiClient.users.getApisV1ManagerUsers({
      skip: 0,
      limit: 100,
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      const userList = Array.isArray(response.data) ? response.data : [];

      // Convert API data format to frontend format
      return userList.map((item: any) => ({
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
    }

    throw new Error(response.message || '获取用户列表失败');
  } catch (error) {
    // Return mock data as fallback when error occurs
    return MOCK_USERS;
  }
};

/**
 * Get permissions list
 */
export const fetchPermissions = async () => {
  try {
    // TODO: Call actual API
    // const response = await AuthenticationService.getPermissions();
    // return response.data;
    return MOCK_PERMISSIONS;
  } catch (error) {
    // Return mock data as fallback when error occurs
    return MOCK_PERMISSIONS;
  }
};

/**
 * Delete user
 *
 * @returns Returns result object in format { success: boolean; error?: Error }
 */
export const deleteUser = async (
  id: string,
): Promise<{ success: boolean; error?: Error }> => {
  try {
    const response = await apiClient.users.deleteApisV1ManagerUsers({
      userId: id,
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      return { success: true };
    }
    const errorObj = new Error(response.message || '删除用户失败');
    return { success: false, error: errorObj };
  } catch (error: unknown) {
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};
