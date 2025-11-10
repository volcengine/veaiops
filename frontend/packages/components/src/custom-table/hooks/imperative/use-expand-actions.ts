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
 * CustomTable expand operations Hook
 * Responsible for handling all row expand/collapse related operations
 *
 * @date 2025-12-19
 */
import type {
  BaseQuery,
  BaseRecord,
  PluginContext,
} from '@/custom-table/types';

/**
 * @name Expand operation related instance methods
 */
export interface ExpandActionMethods {
  /** @name Set expanded rows */
  setExpandedRows: (keys: (string | number)[]) => void;
  /** @name Get expanded row keys */
  getExpandedRowKeys: () => (string | number)[];
  /** @name Expand all rows */
  expandAll: () => void;
  /** @name Collapse all rows */
  collapseAll: () => void;
}

/**
 * @name Create expand operation methods
 * @description Based on pro-components and Arco Design expand design pattern
 */
export const createExpandActions = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  context: PluginContext<RecordType, QueryType>,
  formattedTableData: RecordType[],
): ExpandActionMethods => ({
  /** @name Set expanded rows */
  setExpandedRows: (keys: (string | number)[]) => {
    // Set expanded row keys
    if (context.helpers.setExpandedRowKeys) {
      context.helpers.setExpandedRowKeys(keys);
    }
  },

  /** @name Get expanded row keys */
  getExpandedRowKeys: () => context.state.expandedRowKeys || [],

  /** @name Expand all rows */
  expandAll: () => {
    // Expand all rows - get rowKey for all data
    const allKeys = formattedTableData.map((record) => {
      const { rowKey } = context.props;
      return typeof rowKey === 'function'
        ? rowKey(record)
        : (record as Record<string, unknown>)[rowKey || 'id'];
    });
    if (context.helpers.setExpandedRowKeys) {
      context.helpers.setExpandedRowKeys(allKeys as (string | number)[]);
    }
  },

  /** @name Collapse all rows */
  collapseAll: () => {
    // Collapse all rows - clear expanded keys array
    if (context.helpers.setExpandedRowKeys) {
      context.helpers.setExpandedRowKeys([]);
    }
  },
});
