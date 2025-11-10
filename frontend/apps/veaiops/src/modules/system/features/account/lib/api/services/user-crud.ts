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
import type { User, UserFormData, UserStatus } from '@account';
import type { User as ApiUser } from 'api-generate';
import apiClient from '@/utils/api-client';
import type { UpdateUserParams } from '../types';
import { transformApiUserToUser } from '../utils';

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
      const result: User = transformApiUserToUser(apiUser, {
        isSupervisor: userData.is_supervisor,
      });
      return result;
    } else {
      throw new Error(response.message || 'Failed to create user');
    }
  } catch (error: unknown) {
    // ✅ Correct: Extract actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    throw errorObj;
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

      if (
        userResponse.code === API_RESPONSE_CODE.SUCCESS &&
        userResponse.data
      ) {
        const apiUser = userResponse.data;
        const result: User = transformApiUserToUser(apiUser, {
          isSupervisor: userData.is_supervisor,
        });
        return result;
      } else {
        throw new Error(
          userResponse.message || 'Failed to fetch updated user information',
        );
      }
    } else {
      throw new Error(response.message || 'Failed to update user');
    }
  } catch (error: unknown) {
    // ✅ Correct: Extract actual error information
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
    const errorObj = new Error(response.message || 'Failed to delete user');
    return { success: false, error: errorObj };
  } catch (error: unknown) {
    // ✅ Correct: Extract actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};
