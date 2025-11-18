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

import { extractApiErrorMessage, logger } from '@veaiops/utils';
import type { CreateOperationWrapperParams } from './types';

/**
 * 高级用法：自定义操作包装器
 *
 * 如果需要更复杂的操作逻辑，可以使用这个函数来创建自定义的包装器
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

      // 检查是否需要刷新（默认为true，或者使用自定义条件）
      const shouldRefresh = successCondition ? successCondition(result) : true;

      if (shouldRefresh) {
        const refreshResult = await refreshFn();
        // 如果刷新失败，记录警告但不影响操作本身
        if (
          refreshResult &&
          typeof refreshResult === 'object' &&
          'success' in refreshResult &&
          !refreshResult.success &&
          refreshResult.error
        ) {
          logger.warn({
            message: '操作后刷新表格失败',
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
      // ✅ Use unified utility function to extract error message
      const errorMessage = extractApiErrorMessage(
        error,
        '操作失败',
      );
      // ✅ 正确：将错误转换为 Error 对象再抛出（符合 @typescript-eslint/only-throw-error 规则）
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  };
};
