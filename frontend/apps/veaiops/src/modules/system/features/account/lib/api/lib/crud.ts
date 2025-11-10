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

import { API_RESPONSE_CODE } from '@veaiops/constants';
import type { User, UserFormData, UserRole, UserStatus } from '@account';
import type { User as ApiUser } from 'api-generate';
import apiClient from '@/utils/api-client';
import type { UpdateUserParams, UserListParams, UserListResponse } from './types';

/**
 * Get user list
 */
export const getUserList = async (
  params: UserListParams = {},
): Promise<UserListResponse> => {
  try {
    // Use real API call
    const response = await apiClient.users.getApisV1ManagerUsers({
      skip: params.skip,
      limit: params.limit,
      username: params.username,
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      const users: User[] = response.data.map((user: ApiUser) => ({
        id: user._id || `user-${Date.now()}-${Math.random()}`,
        username: user.username || '',
        email: user.email || '',
        role: (user.is_supervisor ? 'admin' : 'user') as UserRole, // Map role based on is_supervisor
        status: (user.is_active ? 'active' : 'inactive') as UserStatus, // Map status based on is_active
        last_login: user.updated_at, // Use updated_at as replacement for last_login
        created_at: user.created_at || new Date().toISOString(),
        updated_at: user.updated_at || new Date().toISOString(),
        is_system_admin: user.is_supervisor || false, // Map is_system_admin using is_supervisor
      }));

      return {
        users,
        total: response.total || users.length,
        skip: response.skip || 0,
        limit: response.limit || 10,
      };
    } else {
      // If API call fails, use mock data as fallback
      const mockUsers: User[] = [
        {
          id: '1',
          username: 'admin',
          email: 'admin@volcaiops.com',
          role: 'admin',
          status: 'active',
          last_login: new Date().toISOString(),
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z',
          is_system_admin: true,
        },
        {
          id: '2',
          username: 'user1',
          email: 'user1@volcaiops.com',
          role: 'user',
          status: 'active',
          last_login: '2024-12-18T10:30:00Z',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z',
          is_system_admin: false,
        },
      ];

      return {
        users: mockUsers,
        total: mockUsers.length,
        skip: 0,
        limit: 10,
      };
    }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to fetch user list';
        throw new Error(errorMessage);
      }
};

/**
 * Create user
 */
export const createUser = async (userData: UserFormData): Promise<User> => {
  try {
    // Use real API call
    const response = await apiClient.users.postApisV1ManagerUsers({
      requestBody: {
        username: userData.username,
        email: userData.email,
        password: userData.password || 'TempPass123!', // Temporary password
      },
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      const apiUser = response.data;
      const result: User = {
        id: apiUser._id || Date.now().toString(),
        username: apiUser.username,
        email: apiUser.email,
        role: userData.is_supervisor ? 'admin' : 'user', // Infer role from is_supervisor
        status: (apiUser.is_active ? 'active' : 'inactive') as UserStatus,
        created_at: apiUser.created_at || new Date().toISOString(),
        updated_at: apiUser.updated_at || new Date().toISOString(),
        is_system_admin: apiUser.is_supervisor || false,
        last_login: apiUser.updated_at,
      };
      return result;
    } else {
      throw new Error(response.message || '创建用户失败');
    }
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : '创建用户失败';
    throw new Error(errorMessage);
  }
};

/**
 * Update user
 */
export const updateUser = async ({
  id,
  userData,
}: UpdateUserParams): Promise<User> => {
  try {
    // Use real API call
    const response = await apiClient.users.putApisV1ManagerUsers({
      userId: id,
      requestBody: {
        is_active: userData.is_active,
        is_supervisor: userData.is_supervisor,
      },
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      // Since update endpoint returns APIResponse instead of user data, we need to re-fetch user information
      const userResponse = await apiClient.users.getApisV1ManagerUsers1({
        userId: id,
      });

      if (userResponse.code === API_RESPONSE_CODE.SUCCESS && userResponse.data) {
        const apiUser = userResponse.data;
        const result: User = {
          id: apiUser._id || id,
          username: apiUser.username,
          email: apiUser.email,
          role: userData.is_supervisor ? 'admin' : 'user',
          status: (apiUser.is_active ? 'active' : 'inactive') as UserStatus,
          created_at: apiUser.created_at || '2024-01-01T00:00:00Z',
          updated_at: apiUser.updated_at || new Date().toISOString(),
          is_system_admin: apiUser.is_supervisor || false,
          last_login: apiUser.updated_at,
        };
        return result;
      } else {
        throw new Error(userResponse.message || 'Failed to fetch updated user information');
      }
    } else {
      throw new Error(response.message || '更新用户失败');
    }
  } catch (error: unknown) {
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    throw errorObj;
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
    // Use real API call
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
