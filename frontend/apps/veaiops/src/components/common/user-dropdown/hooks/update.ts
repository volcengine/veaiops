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

import { useLogout } from '@/hooks/use-logout';
import { Message } from '@arco-design/web-react';
import type { UpdatePasswordRequest } from '@veaiops/api-client';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';
import { updateUserPassword } from '../lib/api';
import type { ExtendedUser, UserFormData } from '../lib/types';

/**
 * Parameters for usePasswordUpdate Hook
 */
export interface UsePasswordUpdateParams {
  editingUser: ExtendedUser;
  onSuccess?: () => void;
}

/**
 * Password update logic Hook
 *
 * Features:
 * - Validate password update form data
 * - Call password update API
 * - Automatically logout after successful update
 */
export const usePasswordUpdate = ({
  editingUser,
  onSuccess,
}: UsePasswordUpdateParams) => {
  const { logout, isLoggingOut } = useLogout();

  const handleUpdate = useCallback(
    async (values: UserFormData): Promise<boolean> => {
      if (!editingUser || !editingUser.id) {
        Message.error('User ID cannot be empty');
        return false;
      }

      // Validate required fields
      if (!values.old_password || !values.new_password) {
        Message.error('Old password and new password cannot be empty');
        return false;
      }

      // UpdatePasswordRequest type includes old_password, new_password, confirm_password
      const updatePasswordData: UpdatePasswordRequest = {
        old_password: values.old_password || '',
        new_password: values.new_password || '',
        confirm_password: values.confirm_password || values.new_password || '',
      };

      try {
        const success = await updateUserPassword({
          userId: editingUser.id,
          updateData: updatePasswordData,
        });

        if (success) {
          onSuccess?.();

          // Automatically logout after successful update
          const logoutResult = await logout({
            showMessage: true,
            redirectToLogin: true,
            onBeforeLogout: () => {
              // Empty function to satisfy logout interface requirements
            },
          });

          if (!logoutResult.success && logoutResult.error) {
            // Logout failed, but does not affect the password update operation itself, only log warning
            logger.warn({
              message: 'Failed to logout after password update',
              data: {
                error: logoutResult.error.message,
                stack: logoutResult.error.stack,
                errorObj: logoutResult.error,
              },
              source: 'UserDropdown',
              component: 'handleUpdate',
            });
          }
          return true;
        }
        return false;
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage =
          errorObj.message || 'Update failed, please try again';
        Message.error(errorMessage);
        return false;
      }
    },
    [editingUser, logout, onSuccess],
  );

  return {
    handleUpdate,
    isLoggingOut,
  };
};
