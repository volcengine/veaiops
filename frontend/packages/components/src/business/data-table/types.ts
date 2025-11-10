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

import type { TableProps } from '@arco-design/web-react';
import type { ReactNode } from 'react';

/**
 * Column configuration interface
 */
export interface ColumnConfig<T = any> {
  /** Column title */
  title: string;
  /** Data field */
  dataIndex?: keyof T;
  /** Column width */
  width?: number;
  /** Whether sortable */
  sortable?: boolean;
  /** Whether filterable */
  filterable?: boolean;
  /** Custom render */
  render?: (value: any, record: T, index: number) => ReactNode;
  /** Column alignment */
  align?: 'left' | 'center' | 'right';
  /** Whether fixed column */
  fixed?: 'left' | 'right';
  /** Whether resizable */
  resizable?: boolean;
}

/**
 * Action button configuration
 */
export interface ActionConfig<T = any> {
  /** Button text */
  text: string;
  /** Button type */
  type?: 'primary' | 'secondary' | 'outline' | 'text';
  /** Button status */
  status?: 'default' | 'warning' | 'danger' | 'success';
  /** Icon */
  icon?: ReactNode;
  /** Click event */
  onClick: (record: T, index: number) => void;
  /** Whether to show */
  visible?: (record: T) => boolean;
  /** Whether disabled */
  disabled?: (record: T) => boolean;
  /** Confirm prompt */
  confirm?: {
    title: string;
    content?: string;
  };
}

/**
 * Pagination configuration
 */
export interface PaginationConfig {
  /** Current page */
  current?: number;
  /** Page size */
  pageSize?: number;
  /** Total count */
  total?: number;
  /** Whether to show total */
  showTotal?: boolean;
  /** Whether to show quick jumper */
  showJumper?: boolean;
  /** Whether page size can be changed */
  sizeCanChange?: boolean;
  /** Page size options */
  pageSizeOptions?: number[];
  /** Page change callback */
  onChange?: (page: number, pageSize: number) => void;
}

/**
 * Data table properties
 */
export interface DataTableProps<T = any>
  extends Omit<TableProps, 'columns' | 'data' | 'footer' | 'title'> {
  /** Table data */
  data: T[];
  /** Column configuration */
  columns: ColumnConfig<T>[];
  /** Loading state */
  loading?: boolean;
  /** Pagination configuration */
  pagination?: PaginationConfig | false;
  /** Action column configuration */
  actions?: ActionConfig<T>[];
  /** Action column title */
  actionTitle?: string;
  /** Action column width */
  actionWidth?: number;
  /** Whether to show index column */
  showIndex?: boolean;
  /** Index column title */
  indexTitle?: string;
  /** Whether rows can be selected */
  rowSelection?: {
    /** Selection type */
    type?: 'checkbox' | 'radio';
    /** Selected rows */
    selectedRowKeys?: (string | number)[];
    /** Selection change callback */
    onChange?: (
      selectedRowKeys: (string | number)[],
      selectedRows: T[],
    ) => void;
    /** Whether selectable */
    checkboxProps?: (record: T) => { disabled?: boolean };
  };
  /** Row unique identifier field */
  rowKey?: string | ((record: T) => string);
  /** Empty data prompt */
  emptyText?: ReactNode;
  /** Table size */
  size?: 'mini' | 'small' | 'default' | 'middle';
  /** Whether to show border */
  border?: boolean;
  /** Whether to show stripe */
  stripe?: boolean;
  /** Table title */
  title?: ReactNode;
  /** Table footer */
  footer?: ReactNode;
}
