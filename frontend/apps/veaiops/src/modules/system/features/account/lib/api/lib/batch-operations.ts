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
    const errorObj =
      error instanceof Error ? error : new Error(String(error));
    return { success: false, error: errorObj };
  }
};
