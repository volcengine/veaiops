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

// ✅ Optimization: Use shortest path, merge imports from same source
import {
  STRATEGY_MANAGEMENT_CONFIG,
  getStrategyColumns,
  useBotsList,
  useChatsList,
  useStrategyActionConfig,
  useStrategyTableConfig,
} from '@ec/strategy';
import {
  type BaseQuery,
  CustomTable,
  type CustomTableActionType,
} from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type { InformStrategy } from 'api-generate';
import { forwardRef, useCallback, useImperativeHandle, useRef } from 'react';

/**
 * Strategy table ref interface
 *
 * According to .cursorrules specification:
 * - Async methods must return { success: boolean; error?: Error } format
 * - Facilitates caller judgment and handling
 */
export interface StrategyTableRef {
  refresh: () => Promise<{ success: boolean; error?: Error }>;
}

/**
 * Strategy table component props interface
 *
 * Type analysis (based on Python source code):
 * - Python InformStrategyVO (API response): bot: BotVO, group_chats: List[GroupChatVO]
 * - Python InformStrategyPayload (API request): bot_id: str, chat_ids: List[str]
 * - Frontend InformStrategy (api-generate) = InformStrategyVO
 * - When editing, need to use adapter to convert to flattened format (bot_id, chat_ids)
 *
 * According to .cursorrules specification: prioritize using types from api-generate
 * onEdit receives InformStrategy, converts to form-required format via adaptStrategyForEdit
 */
interface StrategyTableProps {
  // ✅ Fix: Unified use of InformStrategy (from api-generate), conforms to single source of truth principle
  // Edit form will extract bot_id and chat_ids via adaptStrategyForEdit adapter
  onEdit: (strategy: InformStrategy) => void;
  onDelete: (strategyId: string) => Promise<boolean>;
  onAdd: () => void;
}

const queryFormat = {};

/**
 * Strategy table component
 *
 * Refactoring notes (compared to origin/feat/web-v2):
 * - Original branch: uses useManagementRefresh to manually handle refresh
 * - Current branch: uses useBusinessTable to automatically handle refresh (conforms to .cursorrules specification)
 * - StrategyTableRef.refresh: returns Promise<{ success: boolean; error?: Error }> (conforms to specification)
 * - Functional equivalence: ✅ Already uses useBusinessTable's operations for automatic refresh
 *
 * Architecture features:
 * - Uses useStrategyTableConfig Hook (internally uses useBusinessTable)
 * - Exposes refresh interface via useImperativeHandle
 * - Uses type adapter functions to remove as any (adaptStrategyForEdit)
 * - Follows Feature-Based modular architecture
 */
export const StrategyTable = forwardRef<StrategyTableRef, StrategyTableProps>(
  ({ onEdit, onDelete, onAdd }, ref) => {
    const { data: botsOptions } = useBotsList();
    const { chatOptions: chatsOptions, fetchChats: chartRun } = useChatsList();

    // CustomTable's internal ref (using generic types)
    // Directly use InformStrategy (conforms to .cursorrules specification: prioritize types from api-generate)
    const tableRef =
      useRef<CustomTableActionType<InformStrategy, BaseQuery>>(null);

    // Table configuration (already uses useBusinessTable for automatic refresh)
    // ✅ Pass tableRef to useStrategyTableConfig, allowing useBusinessTable to use ref for refresh
    const {
      customTableProps,
      handleColumns: configHandleColumns,
      handleFilters: configHandleFilters,
      operations,
      renderActions: configRenderActions,
    } = useStrategyTableConfig({
      onEdit,
      onDelete,
      onCreate: onAdd,
      ref: tableRef, // ✅ Pass ref to Hook
    });

    // Action button configuration
    // Note: Create operation (onAdd) only opens modal, actual create submission is handled in modal
    // After modal submission, need to manually refresh table, or use useBusinessTable's afterCreate in modal component
    const { actions } = useStrategyActionConfig(onAdd);

    // Create handleColumns function, pass action callbacks to column configuration
    const handleColumns = useCallback(
      (props: Record<string, unknown>) => {
        return getStrategyColumns({
          ...props,
          onEdit,
          // ✅ Use onDelete, delete operation in useStrategyTableConfig already auto-refreshes via operationWrapper
          onDelete,
        });
      },
      [onEdit, onDelete],
    );

    // Adapt CustomTable's ref to StrategyTableRef
    // Only expose refresh method, conforms to StrategyTableRef interface definition
    // Directly call tableRef.current.refresh() to refresh table (because operations.refresh returns void, not Promise)
    useImperativeHandle(
      ref,
      () => ({
        refresh: async () => {
          // Directly call tableRef.current.refresh(), it returns Promise<void>
          // We need to convert it to Promise<{ success: boolean; error?: Error }>
          try {
            await tableRef.current?.refresh();
            return { success: true };
          } catch (error: unknown) {
            const errorObj =
              error instanceof Error ? error : new Error(String(error));
            logger.error({
              message: 'Failed to refresh strategy table',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
              },
              source: 'StrategyTable',
              component: 'refresh',
            });
            return { success: false, error: errorObj };
          }
        },
      }),
      [],
    );

    return (
      <CustomTable<InformStrategy>
        {...customTableProps}
        title={STRATEGY_MANAGEMENT_CONFIG.title}
        actions={actions}
        handleColumns={handleColumns}
        handleFilters={configHandleFilters}
        handleFiltersProps={{
          botsOptions,
          chatsOptions,
          chartRun,
        }}
        initQuery={{}} // Add initQuery parameter to ensure URL parameters sync correctly
        queryFormat={queryFormat}
        syncQueryOnSearchParams
        useActiveKeyHook
        tableClassName="strategy-management-table"
        ref={tableRef}
      />
    );
  },
);

StrategyTable.displayName = 'StrategyTable';

export default StrategyTable;
