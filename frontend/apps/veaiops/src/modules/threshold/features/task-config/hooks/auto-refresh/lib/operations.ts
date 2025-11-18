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

/**
 * 创建删除操作包装器
 */
export const createDeleteOperation = (
  deleteApi: (id: string) => Promise<boolean>,
  refreshFn: () => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
) => {
  return async (id: string): Promise<boolean> => {
    try {
      const success = await deleteApi(id);

      if (success) {
        // 操作成功后自动刷新表格
        const refreshResult = await refreshFn();
        // 如果刷新失败，记录警告但不影响删除操作本身
        if (
          refreshResult &&
          typeof refreshResult === 'object' &&
          'success' in refreshResult &&
          !refreshResult.success &&
          refreshResult.error
        ) {
          logger.warn({
            message: '删除后刷新表格失败',
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
      // ✅ Use unified utility function to extract error message
      const errorMessage = extractApiErrorMessage(
        error,
        '删除操作失败',
      );
      // ✅ 正确：将错误转换为 Error 对象再抛出（符合 @typescript-eslint/only-throw-error 规则）
      throw error instanceof Error ? error : new Error(errorMessage);
    }
  };
};

/**
 * 创建更新操作包装器
 */
export const createUpdateOperation = (
  updateApi: () => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
  refreshFn: () => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
): (() => Promise<{ success: boolean; error?: Error }>) => {
  return async (): Promise<{ success: boolean; error?: Error }> => {
    try {
      const updateResult = await updateApi();
      // 检查更新操作是否成功（如果返回结果对象）
      const updateSuccess =
        updateResult &&
        typeof updateResult === 'object' &&
        'success' in updateResult
          ? updateResult.success
          : true; // 如果返回 void，默认认为成功

      if (updateSuccess) {
        // 操作成功后自动刷新表格
        const refreshResult = await refreshFn();
        // 如果刷新失败，记录警告但不影响更新操作本身
        if (
          refreshResult &&
          typeof refreshResult === 'object' &&
          'success' in refreshResult &&
          !refreshResult.success &&
          refreshResult.error
        ) {
          logger.warn({
            message: '更新后刷新表格失败',
            data: {
              error: refreshResult.error.message,
            },
            source: 'AutoRefreshOperations',
            component: 'update',
          });
        }
        return { success: true };
      } else {
        // 更新操作失败，返回失败结果
        const updateError =
          updateResult &&
          typeof updateResult === 'object' &&
          'error' in updateResult
            ? (updateResult as { error?: Error }).error
            : new Error('更新操作失败');
        return { success: false, error: updateError };
      }
    } catch (error: unknown) {
      // ✅ Use unified utility function to extract error message
      const errorMessage = extractApiErrorMessage(
        error,
        '更新操作失败',
      );
      return {
        success: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  };
};

/**
 * 创建创建操作包装器
 */
export const createCreateOperation = (
  createApi: (data: any) => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
  refreshFn: () => Promise<boolean> | Promise<{ success: boolean; error?: Error }>,
): ((data: any) => Promise<{ success: boolean; error?: Error }>) => {
  return async (data: any): Promise<{ success: boolean; error?: Error }> => {
    try {
      const createResult = await createApi(data);
      // 检查创建操作是否成功（如果返回结果对象）
      const createSuccess =
        createResult &&
        typeof createResult === 'object' &&
        'success' in createResult
          ? createResult.success
          : true; // 如果返回 void，默认认为成功

      if (createSuccess) {
        // 操作成功后自动刷新表格
        const refreshResult = await refreshFn();
        // 如果刷新失败，记录警告但不影响创建操作本身
        if (
          refreshResult &&
          typeof refreshResult === 'object' &&
          'success' in refreshResult &&
          !refreshResult.success &&
          refreshResult.error
        ) {
          logger.warn({
            message: '创建后刷新表格失败',
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
        // 创建操作失败，返回失败结果
        const createError =
          createResult &&
          typeof createResult === 'object' &&
          'error' in createResult
            ? (createResult as { error?: Error }).error
            : new Error('创建操作失败');
        return { success: false, error: createError };
      }
    } catch (error: unknown) {
      // ✅ Use unified utility function to extract error message
      const errorMessage = extractApiErrorMessage(
        error,
        '创建操作失败',
      );
      return {
        success: false,
        error: error instanceof Error ? error : new Error(errorMessage),
      };
    }
  };
};
