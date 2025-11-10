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
import type { UpdatePasswordRequest, User } from '@veaiops/api-client';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';

/**
 * Parameters for getting user information
 */
export interface GetUserInfoParams {
  username: string;
}

/**
 * Parameters for updating password
 */
export interface UpdatePasswordParams {
  userId: string;
  updateData: UpdatePasswordRequest;
}

/**
 * Get user information
 *
 * @returns User information or undefined
 */
export const getUserInfo = async ({
  username,
}: GetUserInfoParams): Promise<User | undefined> => {
  try {
    const response = await apiClient.users.getApisV1ManagerUsers({
      skip: 0,
      limit: 10,
      username,
    });

    // Use the accurate User type (generated from @veaiops/api-client)
    const data: User | undefined = response?.data?.[0];
    return data;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: 'Failed to get user information',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        username,
      },
      source: 'UserDropdownAPI',
      component: 'getUserInfo',
    });
    return undefined;
  }
};

/**
 * Update user password
 *
 * @returns Whether the update was successful
 */
export const updateUserPassword = async ({
  userId,
  updateData,
}: UpdatePasswordParams): Promise<boolean> => {
  try {
    const response = await apiClient.users.putApisV1ManagerUsersPassword({
      userId,
      requestBody: {
        old_password: updateData.old_password,
        new_password: updateData.new_password,
        confirm_password: updateData.confirm_password,
      },
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS) {
      Message.success('Password updated successfully');
      return true;
    }

    throw new Error(response.message || 'Failed to update password');
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    Message.error(errorObj.message || 'Failed to update password');
    logger.error({
      message: 'Failed to update password',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        userId,
      },
      source: 'UserDropdownAPI',
      component: 'updateUserPassword',
    });
    return false;
  }
};
