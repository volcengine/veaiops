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

import { Tooltip } from '@arco-design/web-react';
import type { TableColumnProps } from '@arco-design/web-react';

import type {
  BaseRecord,
  ColumnSchema,
} from '@/custom-table/types/schema-table';
import { renderCellByValueType } from './cell-renderers';

/**
 * Generate Arco Table column configuration
 */
export const generateTableColumns = (
  columns: ColumnSchema[],
  _onEdit?: (record: BaseRecord, index: number) => Promise<boolean>,
  _onDelete?: (record: BaseRecord, index: number) => Promise<boolean>,
): TableColumnProps[] => {
  return columns
    .filter((col) => !col.hideInTable)
    .map((column) => ({
      title: column.title,
      dataIndex: column.dataIndex,
      key: column.key,
      width: column.width,
      fixed: column.fixed,
      align: column.align,
      ellipsis: column.ellipsis,
      sortable: column.sortable,
      sorter: column.sorter,
      defaultSortOrder: column.defaultSortOrder,
      render:
        column.render ||
        ((value, record, _index) => {
          const cellContent = renderCellByValueType(value, record, column);

          if (column.tooltip) {
            const tooltipContent =
              typeof column.tooltip === 'string'
                ? column.tooltip
                : String(value);
            return <Tooltip content={tooltipContent}>{cellContent}</Tooltip>;
          }

          return cellContent;
        }),
    }));
};
