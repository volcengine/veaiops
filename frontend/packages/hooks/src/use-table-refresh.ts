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

import { Message, Modal } from '@arco-design/web-react';
import { useCallback } from 'react';

/**
 * Table refresh configuration options
 */
export interface TableRefreshOptions {
  /** Success message for refresh */
  successMessage?: string;
  /** Error message for refresh failure */
  errorMessage?: string;
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Whether to refresh silently (no prompts) */
  silent?: boolean;
  /** Custom error handler */
  onError?: (error: Error) => void;
  /** Callback before refresh */
  onBeforeRefresh?: () => void | Promise<void>;
  /** Callback after refresh */
  onAfterRefresh?: () => void | Promise<void>;
}

/**
 * Parameters interface for table refresh Hook
 */
export interface UseTableRefreshParams {
  refreshTable?: () => Promise<void> | Promise<boolean>;
  options?: TableRefreshOptions;
}

/**
 * Table refresh Hook
 * Provides unified table refresh logic with success/failure prompts, loading state, etc.
 *
 * @param params Parameter object containing refreshTable and options
 * @returns Wrapped refresh function
 *
 * @example
 * ```tsx
 * const { refreshWithFeedback } = useTableRefresh({
 *   refreshTable,
 *   options: {
 *     successMessage: '数据刷新成功',
 *     errorMessage: '数据刷新失败，请重试'
 *   }
 * });
 *
 * // Call after successful operation
 * await refreshWithFeedback();
 * ```
 */
export const useTableRefresh = ({
  refreshTable,
  options = {},
}: UseTableRefreshParams = {}) => {
  const {
    successMessage,
    errorMessage = '刷新失败，请重试',
    showLoading = false,
    silent = false,
    onError,
    onBeforeRefresh,
    onAfterRefresh,
  } = options;

  /**
   * Refresh function with feedback
   */
  const refreshWithFeedback = useCallback(async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    if (!refreshTable) {
      return { success: false, error: new Error('刷新函数未定义') };
    }

    try {
      // Callback before refresh
      if (onBeforeRefresh) {
        await onBeforeRefresh();
      }

      // Show loading state
      if (showLoading && !silent) {
        Message.loading('正在刷新数据...');
      }

      // Execute refresh
      const result = await refreshTable();

      // Callback after refresh
      if (onAfterRefresh) {
        await onAfterRefresh();
      }

      // If refreshTable returns boolean, use the return value; otherwise default to success
      const success = typeof result === 'boolean' ? result : true;

      // Show success message (only when successful)
      if (success && successMessage && !silent) {
        Message.success(successMessage);
      }

      return { success };
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      // Custom error handling
      if (onError) {
        onError(errorObj);
      } else if (!silent) {
        // ✅ Correct: Expose actual error information, not fixed message
        const errorMessageToShow =
          error instanceof Error
            ? error.message
            : errorMessage || '刷新失败，请重试';
        Message.error(errorMessageToShow);
      }
      return { success: false, error: errorObj };
    }
  }, [
    refreshTable,
    successMessage,
    errorMessage,
    showLoading,
    silent,
    onError,
    onBeforeRefresh,
    onAfterRefresh,
  ]);

  /**
   * Silent refresh function (no prompts)
   */
  const refreshSilently = useCallback(async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    if (!refreshTable) {
      return { success: false, error: new Error('刷新函数未定义') };
    }

    try {
      const result = await refreshTable();
      // If refreshTable returns boolean, use the return value; otherwise default to success
      const success = typeof result === 'boolean' ? result : true;
      return { success };
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      // In silent mode, no error prompt is shown, but can be handled via onError
      if (onError) {
        onError(errorObj);
      }
      return { success: false, error: errorObj };
    }
  }, [refreshTable, onError]);

  /**
   * Refresh function with confirmation
   */
  const refreshWithConfirm = useCallback(
    (confirmMessage = '确定要刷新数据吗？') => {
      if (!refreshTable) {
        return;
      }

      Modal.confirm({
        title: '确认操作',
        content: confirmMessage,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          await refreshWithFeedback();
        },
      });
    },
    [refreshTable, refreshWithFeedback],
  );

  return {
    /** Refresh function with feedback */
    refreshWithFeedback,
    /** Silent refresh function */
    refreshSilently,
    /** Refresh function with confirmation */
    refreshWithConfirm,
    /** Original refresh function */
    refresh: refreshTable,
  };
};

/**
 * Table refresh Hook after management operations
 * Specifically for table refresh after CRUD operations, providing unified success feedback
 *
 * @param refreshTable - Original refresh function
 * @returns Refresh functions for various operations
 *
 * @example
 * ```tsx
 * const { afterCreate, afterUpdate, afterDelete } = useManagementRefresh(refreshTable);
 *
 * // After successful creation
 * await afterCreate();
 *
 * // After successful update
 * await afterUpdate();
 *
 * // After successful deletion
 * await afterDelete();
 * ```
 */
export const useManagementRefresh = (
  refreshTable?: () => Promise<void> | Promise<boolean>,
): {
  afterCreate: () => Promise<{ success: boolean; error?: Error }>;
  afterUpdate: () => Promise<{ success: boolean; error?: Error }>;
  afterDelete: () => Promise<{ success: boolean; error?: Error }>;
  afterImport: () => Promise<{ success: boolean; error?: Error }>;
  afterBatchOperation: () => Promise<{ success: boolean; error?: Error }>;
  refresh: () => Promise<{ success: boolean; error?: Error }>;
} => {
  const { refreshSilently } = useTableRefresh({ refreshTable });

  const afterCreate = useCallback(async () => {
    return await refreshSilently();
  }, [refreshSilently]);

  const afterUpdate = useCallback(async () => {
    return await refreshSilently();
  }, [refreshSilently]);

  const afterDelete = useCallback(async () => {
    return await refreshSilently();
  }, [refreshSilently]);

  const afterImport = useCallback(async () => {
    return await refreshSilently();
  }, [refreshSilently]);

  const afterBatchOperation = useCallback(async () => {
    return await refreshSilently();
  }, [refreshSilently]);

  return {
    /** Refresh after create operation */
    afterCreate,
    /** Refresh after update operation */
    afterUpdate,
    /** Refresh after delete operation */
    afterDelete,
    /** Refresh after import operation */
    afterImport,
    /** Refresh after batch operation */
    afterBatchOperation,
    /** General refresh */
    refresh: refreshSilently,
  };
};

export default useTableRefresh;
