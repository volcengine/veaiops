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

import type { ModernTableColumnProps } from '@/shared/types';

// Create type alias for backward compatibility
type CustomTableColumnProps<T = any> = ModernTableColumnProps<T>;

/**
 * Get data indices of tree columns
 * @param columns Base column configuration
 * @param condition Judgment function to determine if dataIndex can be selected
 * @returns Array of all dataIndex that meet the condition
 */
export const getTreeColumnsDataIndex = (
  columns: CustomTableColumnProps[],
  condition?: (dataIndex: string) => boolean,
): string[] => {
  const fields: string[] = [];

  const getColumnDataIndex = (column: CustomTableColumnProps) => {
    const { dataIndex, children } = column;

    if (Array.isArray(children)) {
      // If there is a next level, continue recursively
      children.forEach(getColumnDataIndex);
    } else if (dataIndex) {
      // Determine whether to add to fields based on condition
      if (typeof condition === 'function') {
        if (condition(dataIndex)) {
          fields.push(dataIndex);
        }
      } else {
        // No condition function, add directly
        fields.push(dataIndex);
      }
    }
  };

  columns.forEach(getColumnDataIndex);
  return fields;
};

/**
 * Sort column configuration by fields
 * @param columns Column configuration
 * @param fields Sorting field array
 * @param addNoSelected Whether to add unselected fields
 * @returns Sorted column configuration
 */
export const sortColumnsByFields = <T>({
  columns,
  fields,
  addNoSelected = false,
}: {
  columns: CustomTableColumnProps<T>[];
  fields: string[];
  addNoSelected?: boolean;
}): CustomTableColumnProps<T>[] => {
  const sortedColumns: CustomTableColumnProps<T>[] = [];
  const remainingColumns: CustomTableColumnProps<T>[] = [];

  // First add columns for specified fields
  fields.forEach((field) => {
    const column = columns.find((col) => col.dataIndex === field);
    if (column) {
      sortedColumns.push(column);
    }
  });

  // If need to add unselected fields
  if (addNoSelected) {
    columns.forEach((column) => {
      if (!fields.includes(column.dataIndex as string)) {
        remainingColumns.push(column);
      }
    });
  }

  return [...sortedColumns, ...remainingColumns];
};
