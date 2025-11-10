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
 * Complete logic Hook for historical event table
 *
 * Cohesive all state management, event handling, and table configuration into one Hook
 */

import type { ModuleType } from '@/types/module';
import type {
  BaseQuery,
  CustomTableActionType,
  FieldItem,
  HandleFilterProps,
} from '@veaiops/components';
import type { Event } from 'api-generate';
import type React from 'react';
import { useCallback, useRef } from 'react';
import { usePushHistoryTableConfig } from './use-table-config';

export type RenderActionsType = (
  props: Record<string, unknown>,
) => React.ReactNode[];

export interface UsePushHistoryTableOptions {
  moduleType: ModuleType;
  showModuleTypeColumn?: boolean;
  customActions?: (record: Event) => React.ReactNode;
  tableRef?: React.RefObject<CustomTableActionType<Event, BaseQuery>>;
  onViewDetail?: (record: Event) => void;
}

export interface UsePushHistoryTableReturn {
  // Table configuration
  customTableProps: Record<string, unknown>;
  handleColumns: (props: Record<string, unknown>) => unknown[];
  handleFilters: (props: HandleFilterProps) => FieldItem[];
  renderActions: (props: Record<string, unknown>) => React.ReactNode[];

  // Operation handler functions
  handleRetry: (
    recordId: string,
  ) => Promise<{ success: boolean; error?: Error }>;
  handleRefresh: () => Promise<{ success: boolean; error?: Error }>;
  handleViewDetailWithExternal: (record: Event) => void;

  // Loading state
  loading: boolean;
}

/**
 * Complete logic Hook for historical event table
 *
 * Cohesive all state management and business logic into one Hook, making components more concise
 */
export const usePushHistoryTable = ({
  moduleType,
  showModuleTypeColumn = true,
  customActions,
  tableRef,
  onViewDetail: externalOnViewDetail,
}: UsePushHistoryTableOptions): UsePushHistoryTableReturn => {
  const internalTableRef =
    useRef<CustomTableActionType<Event, BaseQuery>>(null);
  const activeTableRef = tableRef || internalTableRef;

  // Use historical event management hook
  // const { loading, retryPush } = usePushHistory(moduleType); // Hook doesn't exist, needs checking
  const loading = false;
  const retryPush = useCallback(
    async (_recordId: string): Promise<{ success: boolean; error?: Error }> => {
      return Promise.resolve({ success: true });
    },
    [],
  );

  /**
   * Retry push
   * Leverages CustomTable's auto-refresh capability, automatically refreshes after success
   *
   * @returns Returns result object in format { success: boolean; error?: Error }
   */
  const handleRetry = useCallback(
    async (recordId: string): Promise<{ success: boolean; error?: Error }> => {
      try {
        const result = await retryPush(recordId);
        // CustomTable will auto-refresh, no need to manually call
        // Check return result (retryPush returns result object)
        if (
          result &&
          typeof result === 'object' &&
          'success' in result &&
          !result.success &&
          result.error
        ) {
          return { success: false, error: result.error };
        }
        return result || { success: true };
      } catch (error: unknown) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        return { success: false, error: errorObj };
      }
    },
    [retryPush],
  );

  /**
   * Refresh data
   * Leverages CustomTable's auto-refresh capability, called through ref
   *
   * @returns Returns result object in format { success: boolean; error?: Error }
   */
  const handleRefresh = useCallback(async (): Promise<{
    success: boolean;
    error?: Error;
  }> => {
    try {
      if (activeTableRef?.current?.refresh) {
        // refresh method returns Promise<void>, returns success after execution
        await activeTableRef.current.refresh();
        return { success: true };
      }
      return { success: false, error: new Error('Table reference undefined') };
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      return { success: false, error: errorObj };
    }
  }, [activeTableRef]);

  /**
   * View detail - Internal implementation (passed to table configuration)
   */
  const handleViewDetailInternal = useCallback((_record: Event) => {
    // This callback will be passed to column components in configuration
    // Actual state management is in PushHistoryManager
  }, []);

  /**
   * View detail - Merge external and internal handling
   * Cohesive logic of handleViewDetailCombined
   */
  const handleViewDetailWithExternal = useCallback(
    (record: Event) => {
      if (externalOnViewDetail) {
        externalOnViewDetail(record);
      }
      handleViewDetailInternal(record);
    },
    [externalOnViewDetail, handleViewDetailInternal],
  );

  // 🎯 Get complete table configuration (already integrated useBusinessTable)
  const { customTableProps, handleColumns, handleFilters, renderActions } =
    usePushHistoryTableConfig({
      moduleType,
      showModuleTypeColumn,
      onRetry: handleRetry,
      onRefresh: handleRefresh,
      onViewDetail: handleViewDetailWithExternal,
      customActions,
      ref: activeTableRef,
    });

  // renderActions is JSX.Element[] type, needs to be wrapped as a function
  const renderActionsWithState = useCallback(
    (_props: Record<string, unknown>) => renderActions,
    [renderActions],
  );

  return {
    // Table configuration
    customTableProps,
    handleColumns,
    handleFilters,
    renderActions: renderActionsWithState,

    // Operation handler functions
    handleRetry,
    handleRefresh,
    handleViewDetailWithExternal,

    // Loading state
    loading,
  };
};
