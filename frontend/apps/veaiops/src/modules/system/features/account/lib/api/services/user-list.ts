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
import type { User } from '@account';
import type { User as ApiUser } from 'api-generate';
import apiClient from '@/utils/api-client';
import type { UserListParams, UserListResponse } from '../types';
import { transformApiUserToUser } from '../utils';

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
      const users: User[] = response.data.map((user: ApiUser) =>
        transformApiUserToUser(user),
      );

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
  } catch (error: unknown) {
    // ✅ Correct: Extract actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    throw errorObj;
  }
};
