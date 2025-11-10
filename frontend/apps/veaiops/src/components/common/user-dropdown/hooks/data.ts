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

import { authConfig } from '@/config/auth';
import { logger } from '@veaiops/utils';
import { useRequest } from 'ahooks';
import { getUserInfo } from '../lib/api';
import type { ExtendedUser } from '../lib/types';

/**
 * Parameters for useUserData Hook
 */
export interface UseUserDataParams {
  username?: string;
}

/**
 * User data management Hook
 *
 * Features:
 * - Read user data from localStorage
 * - Get user's supervisor status based on username
 * - Cache user data to localStorage
 */
export const useUserData = ({ username }: UseUserDataParams) => {
  // Read user data from localStorage
  const getStoredUserData = (): ExtendedUser => {
    try {
      const raw = localStorage.getItem(authConfig.storageKeys.userData) || '{}';
      return JSON.parse(raw) as ExtendedUser;
    } catch (e) {
      logger.warn({
        message: 'Failed to parse user data, fallback to empty object',
        data: {
          error: e instanceof Error ? e.message : String(e),
          stack: e instanceof Error ? e.stack : undefined,
          errorObj: e,
        },
        source: 'UserDropdown',
        component: 'getStoredUserData',
      });
      return {};
    }
  };

  const editingUser = getStoredUserData();

  // Get user supervisor status
  const { data: isSupervisor } = useRequest(
    async () => {
      if (!username) {
        return undefined;
      }

      // Read cache from localStorage first
      const cachedSupervisor = localStorage.getItem(
        authConfig.storageKeys.isSupervisor,
      );
      if (cachedSupervisor) {
        return cachedSupervisor;
      }

      // Get user information from API
      const data = await getUserInfo({ username });
      if (!data) {
        return undefined;
      }

      // Type-safe access: is_supervisor is a boolean type
      const isSupervisorValue = data.is_supervisor ?? false;
      const supervisorString = isSupervisorValue ? 'true' : 'false';

      // Cache to localStorage
      localStorage.setItem(
        authConfig.storageKeys.isSupervisor,
        supervisorString,
      );
      localStorage.setItem(
        authConfig.storageKeys.userData,
        JSON.stringify({
          ...data,
          id: data._id,
          role: isSupervisorValue ? 'admin' : 'user',
        }),
      );

      return supervisorString;
    },
    {
      refreshDeps: [username],
    },
  );

  return {
    editingUser,
    isSupervisor,
  };
};
