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
  type HistoryFilters,
  useHistoryTableConfigFromTable as useHistoryTableConfig,
} from '@ec/history';
import { CustomTable, type CustomTableActionType } from '@veaiops/components';
import { queryArrayFormat, queryNumberArrayFormat } from '@veaiops/utils';
import type { Event } from 'api-generate';
import { forwardRef, useImperativeHandle, useRef } from 'react';

/**
 * History event table component props interface
 */
interface HistoryTableProps {
  onViewDetail: (record: Event) => void;
  filters: HistoryFilters;
  updateFilters: (filters: Partial<HistoryFilters>) => void;
}

/**
 * History event table component Ref interface
 */
export interface HistoryTableRef {
  refresh: () => Promise<{ success: boolean; error?: Error }>;
}

/**
 * History event management configuration
 */
const HISTORY_MANAGEMENT_CONFIG = {
  title: '历史事件',
  description: '查看和管理历史事件记录',
};

/**
 * queryFormat: Used for handling when merging multiple parameters with the same name
 * Executed after querySearchParamsFormat
 */
const queryFormat = {
  agent_type: queryArrayFormat,
  show_status: queryArrayFormat,
  status: queryNumberArrayFormat,
  event_level: queryArrayFormat,
};
/**
 * History event table component
 * Uses CustomTable standardized implementation - following event center standard pattern
 */
export const HistoryTable = forwardRef<HistoryTableRef, HistoryTableProps>(
  ({ onViewDetail, filters, updateFilters: _updateFilters }, ref) => {
    // CustomTable internal ref
    const tableRef = useRef<CustomTableActionType<Event>>(null);

    // Table configuration (refresh is automatically handled by useBusinessTable)
    const {
      customTableProps,
      handleColumns: configHandleColumns,
      handleFilters: configHandleFilters,
      operations,
    } = useHistoryTableConfig({
      filters,
      onViewDetail, // onViewDetail type is (record: Event) => void, consistent with interface definition
      ref: tableRef,
    });

    // Expose refresh method conforming to HistoryTableRef interface
    useImperativeHandle(
      ref,
      () => ({
        refresh: async () => {
          if (operations?.refresh) {
            return await operations.refresh();
          }
          // If operations is unavailable, try using tableRef
          if (tableRef.current?.refresh) {
            await tableRef.current.refresh();
            return { success: true };
          }
          return {
            success: false,
            error: new Error('刷新方法不可用'),
          };
        },
      }),
      [operations],
    );

    return (
      <CustomTable<Event>
        {...customTableProps}
        title={HISTORY_MANAGEMENT_CONFIG.title}
        handleColumns={configHandleColumns}
        handleFilters={configHandleFilters}
        syncQueryOnSearchParams
        useActiveKeyHook
        // Table configuration
        tableClassName="history-management-table"
        queryFormat={queryFormat}
      />
    );
  },
);

HistoryTable.displayName = 'HistoryTable';

export default HistoryTable;
