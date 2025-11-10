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
import type { CreateOperationWrapperParams } from './types';

/**
 * Advanced usage: custom operation wrapper
 *
 * If more complex operation logic is needed, use this function to create a custom wrapper
 *
 * @example
 * ```typescript
 * const customDelete = createOperationWrapper({
 *   operation: async (id: string) => {
 *     const result = await api.delete(id);
 *     return result;
 *   },
 *   refreshFn: async () => {
 *     await tableRef.current?.refresh();
 *   },
 *   successCondition: (result) => result.code === 0,
 * });
 * ```
 */
export const createOperationWrapper = <TArgs extends any[], TResult>({
  operation,
  refreshFn,
  successCondition,
}: CreateOperationWrapperParams<TArgs, TResult>) => {
  return async (...args: TArgs): Promise<TResult> => {
    try {
      const result = await operation(...args);

      // Check if refresh is needed (default true, or use custom condition)
      const shouldRefresh = successCondition ? successCondition(result) : true;

      if (shouldRefresh) {
        const refreshResult = await refreshFn();
        // If refresh fails, log warning but don't affect operation itself
        if (
          refreshResult &&
          typeof refreshResult === 'object' &&
          'success' in refreshResult &&
          !refreshResult.success &&
          refreshResult.error
        ) {
          logger.warn({
            message: 'Failed to refresh table after operation',
            data: {
              error: refreshResult.error.message,
              stack: refreshResult.error.stack,
              errorObj: refreshResult.error,
            },
            source: 'AutoRefreshOperations',
            component: 'createOperationWrapper',
          });
        }
      }

      return result;
    } catch (error: unknown) {
      // ✅ Correct: use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Operation failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'AutoRefreshOperations',
        component: 'createOperationWrapper',
      });
      // ✅ Correct: convert error to Error object before throwing (complies with @typescript-eslint/only-throw-error rule)
      throw errorObj;
    }
  };
};
