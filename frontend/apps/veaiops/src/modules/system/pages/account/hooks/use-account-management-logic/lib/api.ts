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
import type { UserFormData } from '../../types';

/**
 * Create user parameter interface
 */
export interface CreateUserParams {
  userData: UserFormData;
}

/**
 * Update user parameter interface
 */
export interface UpdateUserParams {
  userId: string;
  updateData: UserFormData;
}

/**
 * Create user
 */
export const createUser = async ({
  userData,
}: CreateUserParams): Promise<boolean> => {
  try {
    // Use Users API
    const response = await apiClient.users.postApisV1ManagerUsers({
      requestBody: {
        username: userData.username,
        email: userData.email,
        password: userData.password || 'defaultPassword123', // Provide default password
        is_supervisor:
          userData.role === 'admin' || userData.is_system_admin, // Convert from role to is_supervisor
      },
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      Message.success('用户创建成功');
      return true;
    } else {
      throw new Error(response.message || 'Failed to create user');
    }
  } catch (error: unknown) {
    // ✅ Correct: Extract actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || 'Failed to create user';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Update user
 */
export const updateUser = async ({
  userId,
  updateData,
}: UpdateUserParams): Promise<boolean> => {
  try {
    // Use Users API
    const response = await apiClient.users.putApisV1ManagerUsers({
      userId,
      requestBody: {
        is_active: updateData.status === 'active',
        is_supervisor:
          updateData.role === 'admin' || updateData.is_system_admin,
      },
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success('用户更新成功');
      return true;
    }

    throw new Error(response.message || 'Failed to update user');
  } catch (error: unknown) {
    // ✅ Correct: Extract actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || 'Failed to update user';
    Message.error(errorMessage);
    return false;
  }
};

/**
 * Delete user
 */
export const deleteUser = async ({
  userId,
}: {
  userId: string;
}): Promise<boolean> => {
  try {
    // Use Users API
    const response = await apiClient.users.deleteApisV1ManagerUsers({
      userId,
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success('用户删除成功');
      return true;
    }

    throw new Error(response.message || 'Failed to delete user');
  } catch (error: unknown) {
    // ✅ Correct: Extract actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || 'Failed to delete user';
    Message.error(errorMessage);
    return false;
  }
};
