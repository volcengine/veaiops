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

import type {
  BaseRecord,
  BatchActionConfig,
  RowSelectionConfig,
  RowSelectionState,
} from '@/custom-table/types';
import { devLog } from '@/custom-table/utils';
/**
 * Row selection Hook
 * Enhanced based on Arco Table's useRowSelection
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Key } from 'react';

export interface UseRowSelectionOptions<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Table data */
  data: RecordType[];
  /** Configuration */
  config: RowSelectionConfig<RecordType>;
  /** Function to get row key */
  getRowKey: (record: RecordType) => Key;
  /** Current page data */
  pageData?: RecordType[];
  /** Total data count */
  totalCount?: number;
}

export interface UseRowSelectionReturn<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Current state */
  state: RowSelectionState<RecordType>;
  /** Select row */
  selectRow: (params: { key: Key; selected: boolean }) => void;
  /** Select all / Deselect all */
  selectAll: (selected: boolean) => void;
  /** Clear selection */
  clearSelection: () => void;
  /** Get selected row data */
  getSelectedRows: () => RecordType[];
  /** Whether specified row is selected */
  isRowSelected: (key: Key) => boolean;
  /** Execute batch action */
  executeBatchAction: (action: BatchActionConfig<RecordType>) => Promise<void>;
  /** Arco Table's rowSelection configuration */
  rowSelectionProps: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys: Key[];
    onSelect: (record: RecordType, selected: boolean) => void;
    onSelectAll: (
      selected: boolean,
      selectedRows: RecordType[],
      changeRows: RecordType[],
    ) => void;
    checkboxProps?: (record: RecordType) => { disabled?: boolean };
    checkAll?: boolean;
    checkStrictly?: boolean;
    checkCrossPage?: boolean;
    columnTitle?: string | React.ReactNode;
    columnWidth?: number;
    fixed?: boolean;
    preserveSelectedRowKeys?: boolean;
    renderCell?: (
      originNode: React.ReactNode,
      checked: boolean,
      record: RecordType,
    ) => React.ReactNode;
  };
}

export const useRowSelection = <RecordType extends BaseRecord = BaseRecord>({
  data,
  config,
  getRowKey,
  pageData = data,
  totalCount = data.length,
}: UseRowSelectionOptions<RecordType>): UseRowSelectionReturn<RecordType> => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>(
    config.selectedRowKeys || [],
  );
  const [allSelectedKeys, setAllSelectedKeys] = useState<Key[]>([]);
  const selectedRowsCache = useRef<Map<Key, RecordType>>(new Map());

  // Update cache
  useEffect(() => {
    data.forEach((record) => {
      const key = getRowKey(record);
      if (selectedRowKeys.includes(key)) {
        selectedRowsCache.current.set(key, record);
      }
    });
  }, [data, selectedRowKeys, getRowKey]);

  // Calculate selection statistics
  const selectionStat = useMemo(
    () => ({
      selectedCount: selectedRowKeys.length,
      totalCount,
      currentPageCount: pageData.length,
      selectedPercent:
        totalCount > 0
          ? Math.round((selectedRowKeys.length / totalCount) * 100)
          : 0,
    }),
    [selectedRowKeys.length, totalCount, pageData.length],
  );

  // Calculate state
  const state: RowSelectionState<RecordType> = useMemo(() => {
    const isAllSelected =
      pageData.length > 0 &&
      pageData.every((record) => selectedRowKeys.includes(getRowKey(record)));
    const isIndeterminate = selectedRowKeys.length > 0 && !isAllSelected;

    return {
      selectedRowKeys,
      selectedRows: selectedRowKeys
        .map((key) => selectedRowsCache.current.get(key))
        .filter(Boolean) as RecordType[],
      indeterminateKeys: [], // TODO: Implement half-selected state for tree structure
      allSelectedKeys: config.checkCrossPage
        ? allSelectedKeys
        : selectedRowKeys,
      isAllSelected,
      isIndeterminate,
      selectionStat,
      selectionCache: selectedRowsCache.current,
    };
  }, [
    selectedRowKeys,
    allSelectedKeys,
    pageData,
    getRowKey,
    config.checkCrossPage,
    selectionStat,
  ]);

  // Select row
  interface SelectRowParams {
    key: Key;
    selected: boolean;
  }

  const selectRow = useCallback(
    ({ key, selected }: SelectRowParams) => {
      setSelectedRowKeys((prev) => {
        let newKeys: Key[];
        if (selected) {
          // Check maximum selection limit
          if (config.maxSelection && prev.length >= config.maxSelection) {
            devLog.warn({
              component: 'RowSelection',
              message: 'Maximum selection limit reached',
              data: {
                max: config.maxSelection,
              },
            });
            return prev;
          }
          newKeys = [...prev, key];
        } else {
          newKeys = prev.filter((k) => k !== key);
        }

        // Preserve selection across pages
        if (config.checkCrossPage) {
          setAllSelectedKeys((prevAll) =>
            selected ? [...prevAll, key] : prevAll.filter((k) => k !== key),
          );
        }

        return newKeys;
      });
    },
    [config.maxSelection, config.checkCrossPage],
  );

  // Select all / Deselect all
  const selectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        const pageKeys = pageData.map(getRowKey);

        // Check maximum selection limit
        if (config.maxSelection) {
          const availableSlots = config.maxSelection - selectedRowKeys.length;
          if (availableSlots <= 0) {
            devLog.warn({
              component: 'RowSelection',
              message: 'Cannot select all: maximum selection limit reached',
            });
            return;
          }
          const keysToAdd = pageKeys.slice(0, availableSlots);
          setSelectedRowKeys((prev) => [
            ...prev,
            ...keysToAdd.filter((key) => !prev.includes(key)),
          ]);
        } else {
          setSelectedRowKeys((prev) => [...new Set([...prev, ...pageKeys])]);
        }

        // Preserve selection across pages
        if (config.checkCrossPage) {
          setAllSelectedKeys((prev) => [...new Set([...prev, ...pageKeys])]);
        }
      } else {
        const pageKeys = pageData.map(getRowKey);
        setSelectedRowKeys((prev) =>
          prev.filter((key) => !pageKeys.includes(key)),
        );

        if (config.checkCrossPage) {
          setAllSelectedKeys((prev) =>
            prev.filter((key) => !pageKeys.includes(key)),
          );
        }
      }
    },
    [
      pageData,
      getRowKey,
      selectedRowKeys,
      config.maxSelection,
      config.checkCrossPage,
    ],
  );

  // Clear selection
  const clearSelection = useCallback(() => {
    setSelectedRowKeys([]);
    setAllSelectedKeys([]);
    selectedRowsCache.current.clear();
  }, []);

  // Get selected row data
  const getSelectedRows = useCallback(
    () => state.selectedRows,
    [state.selectedRows],
  );

  // Whether specified row is selected
  const isRowSelected = useCallback(
    (key: Key) => selectedRowKeys.includes(key),
    [selectedRowKeys],
  );

  // Execute batch action
  const executeBatchAction = useCallback(
    async (action: BatchActionConfig<RecordType>) => {
      const selectedRows = getSelectedRows();

      // Confirmation before execution
      const shouldExecute = await config.beforeBatchAction?.(
        action,
        selectedRows,
      );
      if (shouldExecute === false) {
        return;
      }

      try {
        await action.handler(selectedRowKeys, selectedRows);
        devLog.log({
          component: 'RowSelection',
          message: 'Batch action executed successfully',
          data: {
            action: action.key,
            count: selectedRows.length,
          },
        });
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        devLog.error({
          component: 'RowSelection',
          message: 'Batch action failed',
          data: {
            action: action.key,
            error: errorObj.message,
            errorObj,
          },
        });
        throw errorObj;
      }
    },
    [selectedRowKeys, getSelectedRows, config.beforeBatchAction],
  );

  // Selection change callback
  useEffect(() => {
    config.onChange?.(selectedRowKeys, state.selectedRows);
  }, [selectedRowKeys, state.selectedRows, config.onChange]);

  // Arco Table rowSelection configuration
  const rowSelectionProps = useMemo(
    () => ({
      type: config.type,
      selectedRowKeys,
      onSelect: (record: RecordType, selected: boolean) => {
        const key = getRowKey(record);
        selectRow({ key, selected });
        config.onSelect?.(selected, record, state.selectedRows);
      },
      onSelectAll: (
        selected: boolean,
        selectedRows: RecordType[],
        _changeRows: RecordType[],
      ) => {
        selectAll(selected);
        config.onSelectAll?.(selected, selectedRows);
      },
      checkboxProps: config.maxSelection
        ? (record: RecordType) => ({
            disabled:
              !isRowSelected(getRowKey(record)) &&
              selectedRowKeys.length >= (config.maxSelection || 0),
            ...config.checkboxProps?.(record),
          })
        : config.checkboxProps,
      checkAll: config.checkAll,
      checkStrictly: config.checkStrictly,
      checkCrossPage: config.checkCrossPage,
      columnTitle: config.columnTitle,
      columnWidth: config.columnWidth,
      fixed: config.fixed,
      preserveSelectedRowKeys: config.preserveSelectedRowKeys,
      renderCell: config.renderCell,
    }),
    [
      config,
      selectedRowKeys,
      selectRow,
      selectAll,
      getRowKey,
      isRowSelected,
      state.selectedRows,
    ],
  );

  return {
    state,
    selectRow,
    selectAll,
    clearSelection,
    getSelectedRows,
    isRowSelected,
    executeBatchAction,
    rowSelectionProps,
  };
};
