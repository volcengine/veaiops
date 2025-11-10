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
 * Table operations Hook - Automatically wraps business operations + refresh
 *
 * Further simplified, automatically wraps delete/update/create operations, no manual refresh call needed
 *
 * @example
 * ```tsx
 * const operations = useTableOperations(onRefreshHandlers);
 *
 * // Auto wrap: auto refresh after delete
 * const handleDelete = operations.wrapDelete(async (id) => {
 *   await deleteById(id);
 * });
 *
 * // Usage
 * <CustomTable onRefreshHandlers={operations.onRefreshHandlers} />
 * ```
 */

import { useCallback } from 'react';
import type { RefreshHandlers } from './use-table-refresh-handlers';

/**
 * Operation wrapper
 */
export interface TableOperations {
  /** CustomTable injected callback */
  onRefreshHandlers: (handlers: RefreshHandlers) => void;

  /** Wrap create operation (auto refresh after success) */
  wrapCreate: <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) => T;

  /** Wrap update operation (auto refresh after success) */
  wrapUpdate: <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) => T;

  /** Wrap delete operation (auto refresh after success) */
  wrapDelete: <T extends (...args: unknown[]) => Promise<boolean>>(
    fn: T,
  ) => (...args: Parameters<T>) => Promise<boolean>;

  /** Wrap import operation (auto refresh after success) */
  wrapImport: <T extends (...args: unknown[]) => Promise<unknown>>(fn: T) => T;

  /** Wrap batch operation (auto refresh after success) */
  wrapBatchOperation: <T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
  ) => T;

  /** Direct refresh method */
  refresh: () => Promise<void>;
}

/**
 * Hook return value
 */
export interface UseTableOperationsReturn {
  /** Operation wrapper */
  operations: TableOperations;
}

/**
 * Use table operations Hook
 * Automatically wraps business operations, auto refreshes table after operation success
 */
export const useTableOperations = (
  onRefreshHandlersFromHook: (handlers: RefreshHandlers) => void,
): UseTableOperationsReturn => {
  // Store refresh methods
  let refreshHandlers: RefreshHandlers | null = null;

  // Handle injected refresh methods
  const onRefreshHandlers = useCallback(
    (handlers: RefreshHandlers) => {
      refreshHandlers = handlers;
      onRefreshHandlersFromHook(handlers);
    },
    [onRefreshHandlersFromHook],
  );

  // Wrap create operation
  const wrapCreate = useCallback(
    <T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T => {
      return (async (...args: Parameters<T>) => {
        const result = await fn(...args);
        await refreshHandlers?.afterCreate?.();
        return result;
      }) as T;
    },
    [],
  );

  // Wrap update operation
  const wrapUpdate = useCallback(
    <T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T => {
      return (async (...args: Parameters<T>) => {
        const result = await fn(...args);
        await refreshHandlers?.afterUpdate?.();
        return result;
      }) as T;
    },
    [],
  );

  // Wrap delete operation (special handling for return value)
  const wrapDelete = useCallback(
    <T extends (...args: unknown[]) => Promise<boolean>>(
      fn: T,
    ): ((...args: Parameters<T>) => Promise<boolean>) => {
      return async (...args: Parameters<T>): Promise<boolean> => {
        const success = await fn(...args);
        if (success && refreshHandlers?.afterDelete) {
          await refreshHandlers.afterDelete();
        }
        return success;
      };
    },
    [],
  );

  // Wrap import operation
  const wrapImport = useCallback(
    <T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T => {
      return (async (...args: Parameters<T>) => {
        const result = await fn(...args);
        await refreshHandlers?.afterImport?.();
        return result;
      }) as T;
    },
    [],
  );

  // Wrap batch operation
  const wrapBatchOperation = useCallback(
    <T extends (...args: unknown[]) => Promise<unknown>>(fn: T): T => {
      return (async (...args: Parameters<T>) => {
        const result = await fn(...args);
        await refreshHandlers?.afterBatchOperation?.();
        return result;
      }) as T;
    },
    [],
  );

  // Direct refresh
  const refresh = useCallback(async () => {
    await refreshHandlers?.refresh?.();
  }, []);

  const operations: TableOperations = {
    onRefreshHandlers,
    wrapCreate,
    wrapUpdate,
    wrapDelete,
    wrapImport,
    wrapBatchOperation,
    refresh,
  };

  return { operations };
};
