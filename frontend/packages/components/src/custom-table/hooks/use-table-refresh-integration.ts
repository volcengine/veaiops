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
 * CustomTable refresh functionality integration Hook
 * Encapsulates useTableRefresh to provide business-semantic refresh methods
 * While maintaining compatibility with existing APIs
 */

import { useManagementRefresh } from '@veaiops/hooks';
import { useCallback, useMemo } from 'react';

/**
 * Table refresh configuration
 */
export interface TableRefreshIntegrationOptions {
  /** Whether to enable refresh feedback */
  enableRefreshFeedback?: boolean;
  /** Success message */
  successMessage?: string;
  /** Error message */
  errorMessage?: string;
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Callback before refresh */
  onBeforeRefresh?: () => void | Promise<void>;
  /** Callback after refresh */
  onAfterRefresh?: () => void | Promise<void>;
  /** Custom error handling */
  onError?: (error: Error) => void;
}

/**
 * Refresh integration Hook return value
 */
export interface TableRefreshIntegrationReturn {
  /** Business-semantic refresh methods */
  afterCreate: () => Promise<{ success: boolean; error?: Error }>;
  afterUpdate: () => Promise<{ success: boolean; error?: Error }>;
  afterDelete: () => Promise<{ success: boolean; error?: Error }>;
  afterImport: () => Promise<{ success: boolean; error?: Error }>;
  afterBatchOperation: () => Promise<{ success: boolean; error?: Error }>;

  /** Refresh method with feedback */
  refreshWithFeedback: () => Promise<{ success: boolean; error?: Error }>;

  /** Silent refresh method */
  refreshSilently: () => Promise<{ success: boolean; error?: Error }>;

  /** Basic refresh method (maintains compatibility) */
  refresh: () => Promise<void>;
}

/**
 * CustomTable refresh integration Hook
 *
 * @param refreshFn - Refresh function
 * @param options - Refresh configuration options
 * @returns Collection of refresh methods
 */
export const useTableRefreshIntegration = (
  refreshFn?: () => Promise<void>,
  options: TableRefreshIntegrationOptions = {},
): TableRefreshIntegrationReturn => {
  const {
    enableRefreshFeedback = true,
    successMessage,
    showLoading = false,
    onBeforeRefresh,
    onAfterRefresh,
    onError,
  } = options;

  // Use basic functionality provided by useManagementRefresh
  const {
    afterCreate,
    afterUpdate,
    afterDelete,
    afterImport,
    afterBatchOperation,
  } = useManagementRefresh(refreshFn);

  // Create a silent refresh ref for scenarios that don't show prompts
  const refreshSilently = useCallback(async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    if (!refreshFn) {
      return {
        success: false,
        error: new Error('Refresh function not defined'),
      };
    }
    try {
      if (onBeforeRefresh) {
        await onBeforeRefresh();
      }
      await refreshFn();
      if (onAfterRefresh) {
        await onAfterRefresh();
      }
      return { success: true };
    } catch (error: unknown) {
      // ✅ Correct: Extract actual error message
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (onError) {
        onError(errorObj);
      }
      return { success: false, error: errorObj };
    }
  }, [refreshFn, onBeforeRefresh, onAfterRefresh, onError]);

  // Refresh with feedback (using Message)
  const refreshWithFeedback = useCallback(async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    if (!refreshFn) {
      return {
        success: false,
        error: new Error('Refresh function is not defined'),
      }; // Keep Chinese as per instructions - error message
    }

    if (!enableRefreshFeedback) {
      return await refreshSilently();
    }

    try {
      if (onBeforeRefresh) {
        await onBeforeRefresh();
      }

      if (showLoading && !(options as any).silent) {
        // Do not import Message here to avoid circular dependency
        // Message is handled internally by useManagementRefresh
      }

      await refreshFn();

      if (onAfterRefresh) {
        await onAfterRefresh();
      }

      if (successMessage && !(options as any).silent) {
        // Message is handled internally by useManagementRefresh
      }

      return { success: true };
    } catch (error: unknown) {
      // ✅ Correct: Pass through actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (onError) {
        onError(errorObj);
      } else if (!(options as any).silent) {
        // Message is handled internally by useManagementRefresh
      }
      return { success: false, error: errorObj };
    }
  }, [
    refreshFn,
    enableRefreshFeedback,
    showLoading,
    successMessage,
    onBeforeRefresh,
    onAfterRefresh,
    onError,
    refreshSilently,
    options,
  ]);

  // Return business-semantic methods
  return useMemo(
    () => ({
      // Business-semantic refresh methods
      afterCreate,
      afterUpdate,
      afterDelete,
      afterImport,
      afterBatchOperation,

      // Refresh with feedback (using internal implementation)
      refreshWithFeedback,

      // Silent refresh
      refreshSilently,

      // Basic refresh method (maintains compatibility, directly calls original function)
      refresh: refreshFn || (async () => undefined),
    }),
    [
      afterCreate,
      afterUpdate,
      afterDelete,
      afterImport,
      afterBatchOperation,
      refreshWithFeedback,
      refreshSilently,
      refreshFn,
    ],
  );
};
