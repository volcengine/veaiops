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
 * CustomTable selection operations Hook
 * Responsible for handling all row selection-related operations
 *
 * @date 2025-12-19
 */
import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
} from '@/custom-table/types';

/**
 * @name Selection operation related instance methods
 */
export interface SelectionActionMethods<RecordType extends BaseRecord> {
  /** @name Set selection state */
  setSelection: (keys: string[]) => void;
  /** @name Clear selection state */
  clearSelection: () => void;
  /** @name Get selection state */
  getSelection: () => (string | number)[];
  /** @name Get selected row keys */
  getSelectedRowKeys: () => (string | number)[];
  /** @name Set selected rows */
  setSelectedRows: (keys: (string | number)[]) => void;
  /** @name Get selected row data */
  getSelectedRows: () => RecordType[];
  /** @name Select all */
  selectAll: () => void;
  /** @name Invert selection */
  invertSelection: () => void;
}

/**
 * @name Create selection operation methods
 * @description Based on pro-components and Arco Design selection design pattern
 */
export const createSelectionActions = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  context: PluginContext<RecordType, QueryType>,
  formattedTableData: RecordType[],
): SelectionActionMethods<RecordType> => ({
  /** @name Set selection state */
  setSelection: (keys: string[]) => {
    // Implement selected items setting based on pro-components design pattern
    // Set selected row keys through context helpers
    if (context.helpers.setSelectedRowKeys) {
      context.helpers.setSelectedRowKeys(keys);
    }
  },

  /** @name Clear selection state */
  clearSelection: () => {
    // Clear all selected items
    if (context.helpers.setSelectedRowKeys) {
      context.helpers.setSelectedRowKeys([]);
    }
  },

  /** @name Get selection state */
  getSelection: () =>
    // Get currently selected row keys
    context.state.selectedRowKeys || [],

  /** @name Get selected row keys */
  getSelectedRowKeys: () => context.state.selectedRowKeys || [],

  /** @name Set selected rows */
  setSelectedRows: (keys: (string | number)[]) => {
    if (context.helpers.setSelectedRowKeys) {
      context.helpers.setSelectedRowKeys(keys);
    }
  },

  /** @name Get selected row data */
  getSelectedRows: () => {
    const { selectedRowKeys } = context.state;
    if (!selectedRowKeys || selectedRowKeys.length === 0) {
      return [];
    }
    return formattedTableData.filter((record) => {
      const key =
        typeof context.props.rowKey === 'function'
          ? context.props.rowKey(record)
          : (record as Record<string, unknown>)[context.props.rowKey || 'id'];
      return selectedRowKeys.includes(key as string | number);
    });
  },

  /** @name Select all */
  selectAll: () => {
    const allKeys = formattedTableData.map((record) =>
      typeof context.props.rowKey === 'function'
        ? context.props.rowKey(record)
        : (record as Record<string, unknown>)[context.props.rowKey || 'id'],
    );
    if (context.helpers.setSelectedRowKeys) {
      context.helpers.setSelectedRowKeys(allKeys as (string | number)[]);
    }
  },

  /** @name Invert selection */
  invertSelection: () => {
    const { selectedRowKeys = [] } = context.state;
    const allKeys = formattedTableData.map((record) =>
      typeof context.props.rowKey === 'function'
        ? context.props.rowKey(record)
        : (record as Record<string, unknown>)[context.props.rowKey || 'id'],
    );
    const invertedKeys = allKeys.filter(
      (key) => !selectedRowKeys.includes(key as string | number),
    );
    if (context.helpers.setSelectedRowKeys) {
      context.helpers.setSelectedRowKeys(invertedKeys as (string | number)[]);
    }
  },
});
