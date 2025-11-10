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

import { logger } from '@veaiops/utils';

/**
 * Create delete operation wrapper
 */
export const createDeleteOperation = (
  deleteApi: (id: string) => Promise<boolean>,
  refreshFn: () => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
) => {
  return async (id: string): Promise<boolean> => {
    try {
      const success = await deleteApi(id);

      if (success) {
        // Automatically refresh table after successful operation
        const refreshResult = await refreshFn();
        // If refresh fails, log warning but don't affect delete operation itself
        if (
          refreshResult &&
          typeof refreshResult === 'object' &&
          'success' in refreshResult &&
          !refreshResult.success &&
          refreshResult.error
        ) {
          logger.warn({
            message: 'Failed to refresh table after delete',
            data: {
              error: refreshResult.error.message,
              stack: refreshResult.error.stack,
              errorObj: refreshResult.error,
            },
            source: 'AutoRefreshOperations',
            component: 'delete',
          });
        }
        return true;
      }
      return false;
    } catch (error: unknown) {
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Delete operation failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          id,
        },
        source: 'AutoRefreshOperations',
        component: 'delete',
      });
      // ✅ Correct: Convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
      throw errorObj;
    }
  };
};

/**
 * Create update operation wrapper
 */
export const createUpdateOperation = (
  updateApi: () => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
  refreshFn: () => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
): (() => Promise<{ success: boolean; error?: Error }>) => {
  return async (): Promise<{ success: boolean; error?: Error }> => {
    try {
      const updateResult = await updateApi();
      // Check if update operation succeeded (if returns result object)
      const updateSuccess =
        updateResult &&
        typeof updateResult === 'object' &&
        'success' in updateResult
          ? updateResult.success
          : true; // If returns void, default to success

      if (updateSuccess) {
        // Automatically refresh table after successful operation
        const refreshResult = await refreshFn();
        // If refresh fails, log warning but don't affect update operation itself
        if (
          refreshResult &&
          typeof refreshResult === 'object' &&
          'success' in refreshResult &&
          !refreshResult.success &&
          refreshResult.error
        ) {
          logger.warn({
            message: 'Failed to refresh table after update',
            data: {
              error: refreshResult.error.message,
            },
            source: 'AutoRefreshOperations',
            component: 'update',
          });
        }
        return { success: true };
      } else {
        // Update operation failed, return failure result
        const updateError =
          updateResult &&
          typeof updateResult === 'object' &&
          'error' in updateResult
            ? (updateResult as { error?: Error }).error
            : new Error('Update operation failed');
        return { success: false, error: updateError };
      }
    } catch (error: unknown) {
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Update operation failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'AutoRefreshOperations',
        component: 'update',
      });
      return { success: false, error: errorObj };
    }
  };
};

/**
 * Create create operation wrapper
 */
export const createCreateOperation = (
  createApi: (data: any) => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
  refreshFn: () => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
): ((data: any) => Promise<{ success: boolean; error?: Error }>) => {
  return async (data: any): Promise<{ success: boolean; error?: Error }> => {
    try {
      const createResult = await createApi(data);
      // Check if create operation succeeded (if returns result object)
      const createSuccess =
        createResult &&
        typeof createResult === 'object' &&
        'success' in createResult
          ? createResult.success
          : true; // If returns void, default to success

      if (createSuccess) {
        // Automatically refresh table after successful operation
        const refreshResult = await refreshFn();
        // If refresh fails, log warning but don't affect create operation itself
        if (
          refreshResult &&
          typeof refreshResult === 'object' &&
          'success' in refreshResult &&
          !refreshResult.success &&
          refreshResult.error
        ) {
          logger.warn({
            message: 'Failed to refresh table after create',
            data: {
              error: refreshResult.error.message,
              data,
            },
            source: 'AutoRefreshOperations',
            component: 'create',
          });
        }
        return { success: true };
      } else {
        // Create operation failed, return failure result
        const createError =
          createResult &&
          typeof createResult === 'object' &&
          'error' in createResult
            ? (createResult as { error?: Error }).error
            : new Error('Create operation failed');
        return { success: false, error: createError };
      }
    } catch (error: unknown) {
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Create operation failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          data,
        },
        source: 'AutoRefreshOperations',
        component: 'create',
      });
      return { success: false, error: errorObj };
    }
  };
};
