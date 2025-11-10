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
 * Business table unified Hook

 * Reference Arco Design's hook design patterns (e.g., useSorter, useRowSelection)
 * Unifies business-side table configurations, integrating:
 * 1. Data source configuration
 * 2. Refresh logic
 * 3. Operation wrapping
 * 4. Complex business logic handling

 * Design philosophy (referencing Arco Design):
 * - Each Hook focuses on a single responsibility
 * - Achieves complex functionality through composition
 * - Provides clear API boundaries
 * - Supports flexible extension for complex scenarios

 * @example
 * ```tsx
 * // Simple scenario
 * const { customTableProps, wrappedHandlers } = useBusinessTable({
 *   dataSource: { /* ... *\/ },
 *   tableProps: { /* ... *\/ },
 *   handlers: {
 *     delete: onDelete,
 *     update: onToggle,
 *   },
 *   ref,
 * });
 *
 * return <CustomTable {...customTableProps} />;
 *
 * // Complex scenario (MonitorTable style)
 * const { operations, customTableProps } = useBusinessTable({
 *   dataSource: dataSourceFromHook,
 *   tableProps: tablePropsFromHook,
 *   // Custom operation wrapping logic
 *   operationWrapper: ({ wrapDelete, wrapUpdate, wrapDeleteAsVoid }) => ({
 *     // Wrap delete function (returns boolean, for table configuration)
 *     wrappedDelete: wrapDelete((id) => onDelete(id, dataSourceType)),
 *     // Wrap delete function (returns void, for action column)
 *     handleDelete: wrapDeleteAsVoid((id) => onDelete(id, dataSourceType)),
 *     // Wrap update function (for toggling active state)
 *     handleToggle: async () => wrapUpdate(async () => {})(),
 *   }),
 *   ref,
 * });
 * ```
 */

import type { CustomTableActionType } from '@/custom-table/types/api/action-type';
import type {
  BaseQuery,
  BaseRecord,
  ModernTableColumnProps,
} from '@/custom-table/types/core/common';
import { useManagementRefresh } from '@veaiops/hooks';
import type { TableDataSource } from '@veaiops/types';
import { type StandardTableProps, logger } from '@veaiops/utils';
import { useMemo, useRef } from 'react';

/**
 * Operation wrapper function types
 */
export interface OperationWrappers {
  /** Wrap delete operation (returns boolean) */
  wrapDelete: (
    fn: (id: string) => Promise<boolean>,
  ) => (id: string) => Promise<boolean>;
  /** Wrap update operation (returns Promise<void>) */
  wrapUpdate: (fn: () => Promise<void>) => () => Promise<void>;
  /** Wrap delete operation (returns void) */
  wrapDeleteAsVoid: (
    fn: (id: string) => Promise<boolean>,
  ) => (id: string) => Promise<void>;
  /** Get refresh function */
  getRefresh: () => (() => Promise<void>) | undefined;
}

/**
 * Business table configuration options
 */
export interface BusinessTableConfigOptions<
  TQueryParams extends Record<string, unknown> = Record<string, unknown>,
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Data source configuration */
  dataSource: TableDataSource<RecordType, TQueryParams>;
  /** Table property configuration (supports object or function form) */
  tableProps?:
    | StandardTableProps
    | Record<string, unknown>
    | ((ctx?: { loading?: boolean }) =>
        | StandardTableProps
        | Record<string, unknown>);
  /** Column configuration function */
  handleColumns?: (
    props: Record<string, unknown>,
  ) => ModernTableColumnProps<RecordType>[];
  /** Operation handlers (simple scenario) */
  handlers?: {
    /** Delete handler */
    delete?: (id: string) => Promise<boolean>;
    /** Update handler */
    update?: () => Promise<void>;
    /** Create handler */
    create?: () => Promise<void>;
  };
  /** Operation wrapper (complex scenario, supports custom logic) */
  operationWrapper?: (
    wrappers: OperationWrappers,
  ) => Record<string, (...args: unknown[]) => unknown>;
  /** Refresh configuration */
  refreshConfig?: {
    enableRefreshFeedback?: boolean;
    successMessage?: string;
    errorMessage?: string;
    showLoading?: boolean;
  };
  /** ref reference (supports generic parameters, type-safe) */
  ref?: React.Ref<CustomTableActionType<RecordType, QueryType>>;
}

/**
 * Business table configuration return
 */
export interface BusinessTableConfigResult {
  /** Props used by CustomTable */
  customTableProps: Record<string, unknown>;
  /** Refresh wrapper (for further processing on business side, server data mode only) */
  operations: ReturnType<typeof useManagementRefresh>;
  /** Wrapped operation handlers (simple scenario) */
  wrappedHandlers?: {
    delete?: (id: string) => Promise<boolean>;
    update?: () => Promise<void>;
    create?: () => Promise<void>;
  };
  /** Custom wrapped results (complex scenarios) */
  customOperations?: Record<string, (...args: unknown[]) => unknown>;
  /** Whether it is local data mode */
  isLocalData?: boolean;
}

/**
 * Business table unified Hook

 * Supports two data modes:
 * 1. Server data mode: Get data through request function, supports refresh, pagination, etc.
 * 2. Local data mode: Provide static data through dataList, does not support refresh functionality
 *
 * Supports two usage modes:
 * 1. Simple mode: Automatically wrap standard operations
 * 2. Complex mode: Support custom wrapper logic through operationWrapper

 * @param options Configuration options
 * @returns Table configuration and operation handlers
 */
export const useBusinessTable = <
  TQueryParams extends Record<string, unknown> = Record<string, unknown>,
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  options: BusinessTableConfigOptions<TQueryParams, RecordType, QueryType>,
): BusinessTableConfigResult => {
  const {
    dataSource,
    tableProps: baseTableProps = {},
    handleColumns,
    handlers,
    operationWrapper,
    refreshConfig,
    ref,
  } = options;

  // 🎯 Destructure refreshConfig to avoid object reference issues
  const { enableRefreshFeedback, successMessage, errorMessage, showLoading } =
    refreshConfig || {};

  // 🎯 Determine if is local data mode (has dataList and manual is true)
  const isLocalData =
    (dataSource as any).dataList !== undefined &&
    (dataSource as any).manual === true;

  // Diagnostic log: Data source and refresh configuration stability (log only)
  // devLog.log('useBusinessTable', 'config_snapshot', {
  //   isLocalData,
  //   refreshConfig,
  // });

  // 🎯 Use useManagementRefresh to handle refresh logic (server data only)
  const operations = useManagementRefresh(
    isLocalData
      ? undefined
      : async () => {
          logger.debug({
            message: '[useBusinessTable] 🔄 Starting table refresh',
            data: {
              hasRef: Boolean(ref),
              refType: typeof ref,
              hasRefCurrent: Boolean(
                ref &&
                  typeof ref === 'object' &&
                  (ref as { current?: unknown }).current,
              ),
              hasRefreshMethod: Boolean(
                ref &&
                  typeof ref === 'object' &&
                  (ref as { current?: { refresh?: unknown } }).current?.refresh,
              ),
            },
            source: 'CustomTable',
            component: 'UseBusinessTable',
          });

          if (
            ref &&
            typeof ref === 'object' &&
            ref.current &&
            ref.current.refresh
          ) {
            logger.info({
              message:
                '[useBusinessTable] ✅ Preparing to call ref.current.refresh()',
              data: {
                refCurrentType: typeof ref.current,
                refCurrentKeys: Object.keys(ref.current || {}),
                refreshType: typeof ref.current.refresh,
              },
              source: 'CustomTable',
              component: 'UseBusinessTable',
            });
            const refreshStartTime = Date.now();
            await ref.current.refresh();
            const refreshEndTime = Date.now();
            logger.info({
              message:
                '[useBusinessTable] ✅ ref.current.refresh() call completed',
              data: {
                duration: refreshEndTime - refreshStartTime,
              },
              source: 'CustomTable',
              component: 'UseBusinessTable',
            });
          } else {
            logger.warn({
              message:
                '[useBusinessTable] ⚠️ Refresh failed: ref.current does not exist or has no refresh method',
              data: {
                hasRef: Boolean(ref),
                refType: typeof ref,
                hasRefCurrent: Boolean(
                  ref &&
                    typeof ref === 'object' &&
                    (ref as { current?: unknown }).current,
                ),
                hasRefreshMethod: Boolean(
                  ref &&
                    typeof ref === 'object' &&
                    (ref as { current?: { refresh?: unknown } }).current
                      ?.refresh,
                ),
              },
              source: 'CustomTable',
              component: 'UseBusinessTable',
            });
          }
        },
  );

  // 🎯 Simple scenario: Automatically wrap operation functions
  const wrappedHandlers = useMemo(() => {
    if (!handlers || operationWrapper) {
      return undefined;
    }

    return {
      ...(handlers.delete && {
        delete: async (id: string) => {
          logger.debug({
            message: '[useBusinessTable] 🗑️ wrappedHandlers.delete called',
            data: {
              id,
              isLocalData,
            },
            source: 'CustomTable',
            component: 'UseBusinessTable',
          });
          const result = await handlers.delete!(id);
          logger.debug({
            message: '[useBusinessTable] 🗑️ Delete operation completed',
            data: {
              id,
              result,
              isLocalData,
              willRefresh: result && !isLocalData,
            },
            source: 'CustomTable',
            component: 'UseBusinessTable',
          });
          if (result && !isLocalData) {
            logger.debug({
              message:
                '[useBusinessTable] 🔄 Starting to call operations.afterDelete()',
              data: {
                id,
              },
              source: 'CustomTable',
              component: 'UseBusinessTable',
            });
            const refreshResult = await operations.afterDelete();
            logger.debug({
              message:
                '[useBusinessTable] 🔄 operations.afterDelete() completed',
              data: {
                id,
                refreshResult,
              },
              source: 'CustomTable',
              component: 'UseBusinessTable',
            });
          }
          return result;
        },
      }),
      ...(handlers.update && {
        update: async () => {
          await handlers.update!();
          if (!isLocalData) {
            await operations.afterUpdate();
          }
        },
      }),
      ...(handlers.create && {
        create: async () => {
          await handlers.create!();
          if (!isLocalData) {
            await operations.afterCreate();
          }
        },
      }),
    };
  }, [handlers, operationWrapper, isLocalData, operations]);

  // 🎯 Complex scenario: Use custom operation wrapper
  const customOperations = useMemo(() => {
    if (!operationWrapper) {
      return undefined;
    }

    const wrappers: OperationWrappers = {
      wrapDelete: (fn) => async (id) => {
        const result = await fn(id);
        if (result && !isLocalData) {
          await operations.afterDelete();
        }
        return result;
      },
      wrapUpdate: (fn) => async () => {
        await fn();
        if (!isLocalData) {
          await operations.afterUpdate();
        }
      },
      wrapDeleteAsVoid: (fn) => async (id) => {
        const result = await fn(id);
        if (result && !isLocalData) {
          await operations.afterDelete();
        }
      },
      getRefresh: () => {
        if (
          ref &&
          typeof ref === 'object' &&
          ref.current &&
          ref.current.refresh
        ) {
          return ref.current.refresh;
        }
        return undefined;
      },
    };

    return operationWrapper(wrappers);
  }, [operationWrapper, isLocalData, operations, ref]);

  // 🔧 Render count log
  const renderCountRef = useRef(0);
  renderCountRef.current++;

  logger.info({
    message: '[useBusinessTable] 🔄 Hook executing',
    data: {
      renderCount: renderCountRef.current,
      hasDataSource: Boolean(dataSource),
      hasHandleColumns: Boolean(handleColumns),
    },
    source: 'CustomTable',
    component: 'UseBusinessTable',
  });

  // 🎯 Assemble props used by CustomTable
  // 🔧 Use useMemo to stabilize object references
  const customTableProps = useMemo(() => {
    logger.info({
      message: '[useBusinessTable] 📦 customTableProps recreated',
      data: {
        renderCount: renderCountRef.current,
      },
      source: 'CustomTable',
      component: 'UseBusinessTable',
    });

    return {
      dataSource,
      tableProps: baseTableProps,
      ...(Boolean(handleColumns) && { handleColumns }),
      ...(!isLocalData && {
        ...(enableRefreshFeedback !== undefined && { enableRefreshFeedback }),
        ...(successMessage !== undefined && {
          refreshSuccessMessage: successMessage,
        }),
        ...(errorMessage !== undefined && {
          refreshErrorMessage: errorMessage,
        }),
      }),
    };
  }, [
    dataSource,
    baseTableProps,
    handleColumns,
    isLocalData,
    enableRefreshFeedback,
    successMessage,
    errorMessage,
  ]);

  return {
    customTableProps,
    operations,
    wrappedHandlers,
    customOperations,
    isLocalData,
  };
};
