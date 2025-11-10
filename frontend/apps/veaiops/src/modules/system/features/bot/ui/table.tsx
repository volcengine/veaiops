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

import {
  BOT_MANAGEMENT_CONFIG,
  type BotTableProps,
  type BotTableRef,
  DEFAULT_BOT_FILTERS,
  getBotColumns,
  getBotFilters,
  useBotActionConfig,
  useBotTableConfig,
} from '@bot';
import {
  type BaseQuery,
  type BaseRecord,
  CustomTable,
  type CustomTableActionType,
  useBusinessTable,
} from '@veaiops/components';
import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
} from 'react';

/**
 * Bot table component
 * Uses CustomTable standardized implementation - Following customer management standard pattern
 * Supports refresh functionality, all operations automatically refresh table data
 */
export const BotTable = forwardRef<BotTableRef, BotTableProps>(
  ({ onEdit, onDelete, onAdd, onViewAttributes, onGroupManagement }, ref) => {
    // Internal ref, passed to useBusinessTable
    const tableActionRef =
      useRef<CustomTableActionType<BaseRecord, BaseQuery>>(null);

    // Table configuration
    const { dataSource, tableProps } = useBotTableConfig({
      handleDelete: onDelete,
    });

    // 🎯 Use useBusinessTable to automatically handle refresh logic
    const { customTableProps, wrappedHandlers, operations } = useBusinessTable({
      dataSource,
      tableProps,
      handlers: onDelete
        ? {
            delete: async (botId: string) => {
              return await onDelete(botId);
            },
          }
        : undefined,
      refreshConfig: {
        enableRefreshFeedback: true,
        successMessage: '操作成功',
        errorMessage: '操作失败，请重试',
      },
      ref: tableActionRef,
    });

    // Bridge ref: Convert BotTableRef to CustomTableActionType
    useImperativeHandle(
      ref,
      () => ({
        refresh: async () => {
          if (operations?.refresh) {
            const result = await operations.refresh();
            if (!result.success && result.error) {
              throw result.error;
            }
          }
        },
      }),
      [operations],
    );

    // Action button configuration
    const { actions } = useBotActionConfig(onAdd);

    // Create handleColumns function, pass operation callbacks to column configuration
    const handleColumns = useCallback(
      (props: Record<string, unknown>) => {
        return getBotColumns({
          onEdit,
          // ✅ Use useBusinessTable auto-wrapped delete operation
          // Delete operation will automatically refresh table
          onDelete: wrappedHandlers?.delete
            ? (botId: string) => wrappedHandlers.delete!(botId)
            : onDelete,
          onViewAttributes,
          onGroupManagement,
        });
      },
      [onEdit, onDelete, onViewAttributes, onGroupManagement, wrappedHandlers],
    );

    return (
      <div className="bot-table-container">
        <CustomTable<any>
          {...customTableProps}
          ref={tableActionRef}
          title={BOT_MANAGEMENT_CONFIG.title}
          actions={actions}
          handleColumns={handleColumns}
          handleFilters={getBotFilters}
          initQuery={DEFAULT_BOT_FILTERS}
          syncQueryOnSearchParams
        />
      </div>
    );
  },
);

BotTable.displayName = 'BotTable';

export default BotTable;
