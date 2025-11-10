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
 * Table refresh handler Hook
 * Provides out-of-the-box refresh method management, eliminating manual tableRef configuration on business side
 *
 * @example
 * ```tsx
 * const { handlers, onRefreshHandlers } = useTableRefreshHandlers();
 *
 * return (
 *   <>
 *     <CustomTable onRefreshHandlers={onRefreshHandlers} />
 *     <Button onClick={() => handlers.afterDelete()}>Delete</Button>
 *   </>
 * );
 * ```
 */

import {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';

/**
 * Refresh handler methods collection
 */
export interface RefreshHandlers {
  /** Refresh after create operation */
  afterCreate: () => Promise<void>;
  /** Refresh after update operation */
  afterUpdate: () => Promise<void>;
  /** Refresh after delete operation */
  afterDelete: () => Promise<void>;
  /** Refresh after import operation */
  afterImport: () => Promise<void>;
  /** Refresh after batch operation */
  afterBatchOperation: () => Promise<void>;
  /** Refresh with feedback */
  refreshWithFeedback: () => Promise<void>;
  /** Silent refresh */
  refreshSilently: () => Promise<void>;
  /** Basic refresh */
  refresh: () => Promise<void>;
}

/**
 * Hook configuration options
 */
export interface UseTableRefreshHandlersOptions {
  /** Methods exposed to parent component (optional) */
  exposeMethods?: {
    /** Expose refresh method */
    refresh?: () => Promise<void>;
    /** Expose after delete refresh method */
    afterDelete?: () => Promise<void>;
  };
  /** Parent component ref (for useImperativeHandle) */
  ref?: React.Ref<{ refresh: () => Promise<void> }>;
}

/**
 * Hook return value
 */
export interface UseTableRefreshHandlersReturn {
  /** Refresh methods collection */
  handlers: RefreshHandlers | null;
  /** Callback passed to CustomTable's onRefreshHandlers */
  onRefreshHandlers: (handlers: RefreshHandlers) => void;
  /** Whether there are valid refresh methods */
  isReady: boolean;
}

/**
 * Use table refresh handlers Hook
 *
 * @param options Configuration options
 * @returns Refresh handlers and callback function
 */
export const useTableRefreshHandlers = (
  options: UseTableRefreshHandlersOptions = {},
): UseTableRefreshHandlersReturn => {
  const { exposeMethods = {}, ref } = options;

  // 🔧 Use ref to store latest handlers, avoid infinite re-renders due to reference changes
  const handlersRef = useRef<RefreshHandlers | null>(null);
  const [isReady, setIsReady] = useState(false);

  // Create stable handlers proxy object, internally use ref to get latest methods
  const stableHandlers = useMemo<RefreshHandlers>(
    () => ({
      afterCreate: async () => await handlersRef.current?.afterCreate?.(),
      afterUpdate: async () => await handlersRef.current?.afterUpdate?.(),
      afterDelete: async () => await handlersRef.current?.afterDelete?.(),
      afterImport: async () => await handlersRef.current?.afterImport?.(),
      afterBatchOperation: async () =>
        await handlersRef.current?.afterBatchOperation?.(),
      refreshWithFeedback: async () =>
        await handlersRef.current?.refreshWithFeedback?.(),
      refreshSilently: async () =>
        await handlersRef.current?.refreshSilently?.(),
      refresh: async () => await handlersRef.current?.refresh?.(),
    }),
    [],
  );

  // Handle refresh methods injected by CustomTable
  const onRefreshHandlers = useCallback(
    (injectedHandlers: RefreshHandlers) => {
      handlersRef.current = injectedHandlers;
      if (!isReady) {
        setIsReady(true);
      }
    },
    [isReady],
  );

  // Expose methods to parent component (if needed)
  useImperativeHandle(
    ref,
    () => ({
      refresh: async () => {
        if (exposeMethods.refresh) {
          await exposeMethods.refresh();
        } else {
          await handlersRef.current?.refresh?.();
        }
      },
      // Can add more exposed methods
      ...(exposeMethods.afterDelete && {
        afterDelete: async () => {
          if (exposeMethods.afterDelete) {
            await exposeMethods.afterDelete();
          } else {
            await handlersRef.current?.afterDelete?.();
          }
        },
      }),
    }),
    [exposeMethods],
  );

  return {
    handlers: isReady ? stableHandlers : null,
    onRefreshHandlers,
    isReady,
  };
};

/**
 * Simplified refresh handler Hook
 * For scenarios that don't need ref
 */
export const useSimpleTableRefresh = () => {
  const { handlers, onRefreshHandlers } = useTableRefreshHandlers();
  return { handlers, onRefreshHandlers };
};

/**
 * One-click table operations Hook
 * Automatically wraps all operations, no manual refresh needed
 *
 * @example
 * ```tsx
 * const { handlers, wrapDelete, wrapUpdate } = useTableOperationsWithRefresh({ ref });
 *
 * // Wrap delete operation (auto refresh)
 * const wrappedDelete = useMemo(() => wrapDelete((id) => onDelete(id)), []);
 *
 * // Wrap update operation (auto refresh)
 * const handleToggle = useCallback(async () => {
 *   await wrapUpdate(async () => {})();
 * }, [wrapUpdate]);
 *
 * return <CustomTable onRefreshHandlers={onRefreshHandlers} />;
 * ```
 */
export const useTableOperationsWithRefresh = (
  options: UseTableRefreshHandlersOptions = {},
) => {
  const { handlers, onRefreshHandlers } = useTableRefreshHandlers(options);

  return {
    handlers,
    onRefreshHandlers,
    isReady: handlers !== null,
    // Return wrappers for further simplification
    wrapDelete: (fn: (id: string) => Promise<boolean>) => {
      return async (id: string) => {
        const success = await fn(id);
        if (success) {
          await handlers?.afterDelete?.();
        }
        return success;
      };
    },
    wrapUpdate: (fn: () => Promise<void>) => {
      return async () => {
        await fn();
        await handlers?.afterUpdate?.();
      };
    },
    // New: Automatically wrap and convert types
    wrapDeleteAsVoid: (fn: (id: string) => Promise<boolean>) => {
      return async (id: string) => {
        const success = await fn(id);
        if (success) {
          await handlers?.afterDelete?.();
        }
        // Return void
      };
    },
  };
};
