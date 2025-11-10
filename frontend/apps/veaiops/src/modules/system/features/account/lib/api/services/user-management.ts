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

/**
 * Reset user password
 *
 * @returns Returns result object in format { success: boolean; error?: Error; data?: string }
 */
export const resetUserPassword = async (
  id: string,
  newPassword?: string,
): Promise<{ success: boolean; error?: Error; data?: string }> => {
  try {
    // TODO: Backend needs to provide admin reset user password API interface
    // Current /apis/v1/manager/users/{user_id}/password interface requires old password, not suitable for admin reset
    // const response = await apiClient.users.putApisV1ManagerUsersPassword({...});

    // Temporarily return generated password
    const generatedPassword = newPassword || 'TempPass123!';

    return { success: true, data: generatedPassword };
  } catch (error: unknown) {
    // ✅ Correct: expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};

/**
 * Lock user
 *
 * @returns Returns result object in format { success: boolean; error?: Error }
 */
export const lockUser = async (
  _id: string,
): Promise<{ success: boolean; error?: Error }> => {
  try {
    // TODO: Replace with actual API call
    // await apiClient.post(`/api/users/${id}/lock`);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  } catch (error: unknown) {
    // ✅ Correct: expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};

/**
 * Unlock user
 *
 * @returns Returns result object in format { success: boolean; error?: Error }
 */
export const unlockUser = async (
  _id: string,
): Promise<{ success: boolean; error?: Error }> => {
  try {
    // TODO: Replace with actual API call
    // await apiClient.post(`/api/users/${id}/unlock`);

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { success: true };
  } catch (error: unknown) {
    // ✅ Correct: expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};

/**
 * Batch delete users
 *
 * @returns Returns result object in format { success: boolean; error?: Error }
 */
export const batchDeleteUsers = async (
  _ids: string[],
): Promise<{ success: boolean; error?: Error }> => {
  try {
    // TODO: Replace with actual API call
    // await apiClient.post('/api/users/batch-delete', { ids });

    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    return { success: true };
  } catch (error: unknown) {
    // ✅ Correct: expose actual error information
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};
