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
 * Schema table type definitions
 * @description Type definitions for configurable tables

 * @date 2025-12-19
 */

import type { TableColumnProps } from '@arco-design/web-react';
import type { BaseRecord } from '@veaiops/types';
import type { ReactNode } from 'react';

// Re-export BaseRecord for use in schema-table preset
export type { BaseRecord };

// Field value type enumeration
export type FieldValueType =
  | 'text'
  | 'number'
  | 'date'
  | 'dateTime'
  | 'dateRange'
  | 'select'
  | 'multiSelect'
  | 'boolean'
  | 'money'
  | 'percent'
  | 'image'
  | 'link'
  | 'tag'
  | 'status'
  | 'progress'
  | 'rate'
  | 'color'
  | 'json'
  | 'custom';

// Filter type
export type FilterType =
  | 'input'
  | 'select'
  | 'multiSelect'
  | 'dateRange'
  | 'numberRange'
  | 'cascader'
  | 'treeSelect'
  | 'custom';

// Filter configuration (Schema Table specific, avoid conflict with FilterConfig in components)
export interface SchemaFilterConfig {
  type: FilterType;
  label?: string;
  placeholder?: string;
  options?: Array<{ label: string; value: unknown; children?: unknown[] }>;
  multiple?: boolean;
  allowClear?: boolean;
  showSearch?: boolean;
  request?: <TParams = unknown>(params: TParams) => Promise<unknown[]>;
  dependencies?: string[]; // Dependent filter fields
  transform?: <TValue = unknown, TResult = unknown>(value: TValue) => TResult; // Value transformation function
  rules?: Array<{
    required?: boolean;
    message?: string;
    validator?: <TValue = unknown>(value: TValue) => boolean | string;
  }>;
}

// Column schema definition
export interface ColumnSchema<T = BaseRecord> {
  // Basic properties
  key: string;
  title: string;
  dataIndex: string;
  valueType?: FieldValueType;

  // Display control
  width?: number | string;
  fixed?: 'left' | 'right';
  align?: 'left' | 'center' | 'right';
  ellipsis?: boolean;
  tooltip?: boolean | string;
  copyable?: boolean;

  // Sorting
  sortable?: boolean;
  sorter?: boolean | ((a: T, b: T) => number);
  defaultSortOrder?: 'ascend' | 'descend';

  // Filtering
  filterable?: boolean;
  filterConfig?: SchemaFilterConfig;
  hideInSearch?: boolean;

  // Rendering
  render?: <TValue = unknown>(
    value: TValue,
    record: T,
    index: number,
  ) => ReactNode;
  renderText?: <TValue = unknown>(value: TValue, record: T) => string;

  // Editing
  editable?: boolean;
  editConfig?: {
    type: 'input' | 'select' | 'date' | 'number';
    options?: Array<{ label: string; value: unknown }>;
    rules?: Array<Record<string, unknown>>;
  };

  // Value enumeration (for select type)
  valueEnum?: Record<
    string,
    {
      text: string;
      status?: 'success' | 'processing' | 'error' | 'warning' | 'default';
      color?: string;
      disabled?: boolean;
    }
  >;

  // Formatting
  format?: {
    precision?: number; // Number precision
    prefix?: string;
    suffix?: string;
    dateFormat?: string;
    moneySymbol?: string;
  };

  // Show/hide
  hideInTable?: boolean;
  hideInForm?: boolean;
  hideInDetail?: boolean;

  // Other Arco Table column properties
  [key: string]: unknown;
}

// Action button configuration (Schema Table specific, avoid conflict with ActionConfig in components)
export interface SchemaActionConfig {
  key: string;
  label: string;
  type?: 'primary' | 'secondary' | 'dashed' | 'text' | 'outline';
  status?: 'warning' | 'danger' | 'success' | 'default';
  icon?: ReactNode;
  disabled?: boolean | ((record: BaseRecord) => boolean);
  visible?: boolean | ((record: BaseRecord) => boolean);
  onClick: (record: BaseRecord, index: number) => void;
  confirm?: {
    title: string;
    content?: string;
  };
}

// Toolbar configuration (Schema Table specific, avoid conflict with ToolbarConfig in components)
export interface SchemaToolbarConfig {
  title?: string;
  subTitle?: string;
  actions?: Array<{
    key: string;
    label: string;
    type?: 'primary' | 'secondary' | 'dashed' | 'text' | 'outline';
    icon?: ReactNode;
    onClick: () => void;
  }>;
  settings?: {
    density?: boolean; // Density adjustment
    columnSetting?: boolean; // Column settings
    fullScreen?: boolean; // Full screen
    reload?: boolean; // Refresh
  };
}

// Pagination configuration (Schema Table specific, avoid conflict with PaginationConfig in components)
export interface SchemaPaginationConfig {
  current?: number;
  pageSize?: number;
  total?: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: boolean | ((total: number, range: [number, number]) => ReactNode);
  pageSizeOptions?: string[];
  simple?: boolean;
  size?: 'default' | 'small';
  position?:
    | 'topLeft'
    | 'topCenter'
    | 'topRight'
    | 'bottomLeft'
    | 'bottomCenter'
    | 'bottomRight';
}

// Request configuration
export interface RequestConfig<T = BaseRecord> {
  url?: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  params?: Record<string, unknown>;
  transform?: <TData = unknown>(
    data: TData,
  ) => {
    data: T[];
    total?: number;
    success?: boolean;
  };
  onError?: (error: Error) => void;
  onSuccess?: (data: T[]) => void;
}

// Table schema main configuration
export interface TableSchema<T = BaseRecord> {
  // Basic information
  title?: string;
  description?: string;

  // Column definitions
  columns: ColumnSchema<T>[];

  // Data source
  dataSource?: T[];
  request?:
    | RequestConfig<T>
    | (<TParams = unknown>(
        params: TParams,
      ) => Promise<{
        data: T[];
        total?: number;
        success?: boolean;
      }>);

  // Feature configuration
  features?: {
    // Basic features
    pagination?: boolean | SchemaPaginationConfig;
    search?:
      | boolean
      | {
          layout?: 'horizontal' | 'vertical' | 'inline';
          collapsed?: boolean;
          collapseRender?: (collapsed: boolean) => ReactNode;
          resetText?: string;
          searchText?: string;
        };
    toolbar?: boolean | SchemaToolbarConfig;

    // Advanced features
    rowSelection?:
      | boolean
      | {
          type?: 'checkbox' | 'radio';
          fixed?: boolean;
          columnWidth?: number;
          onChange?: (selectedRowKeys: React.Key[], selectedRows: T[]) => void;
        };
    expandable?:
      | boolean
      | {
          expandedRowRender?: (record: T, index: number) => ReactNode;
          rowExpandable?: (record: T) => boolean;
        };

    // Interactive features
    draggable?: boolean;
    resizable?: boolean;
    editable?: boolean;

    // Style features
    bordered?: boolean;
    size?: 'default' | 'middle' | 'small';
    loading?: boolean;
    empty?: ReactNode;
  };

  // Action column
  actions?: {
    width?: number;
    fixed?: 'left' | 'right';
    items: SchemaActionConfig[];
  };

  // Event callbacks
  events?: {
    onRow?: <TReturn = Record<string, unknown>>(
      record: T,
      index: number,
    ) => TReturn;
    onHeaderRow?: <TReturn = Record<string, unknown>>(
      columns: ColumnSchema<T>[],
      index: number,
    ) => TReturn;
    onChange?: (
      pagination: Record<string, unknown>,
      filters: Record<string, unknown>,
      sorter: Record<string, unknown>,
    ) => void;
    onSearch?: (values: Record<string, unknown>) => void;
    onReset?: () => void;
  };

  // Style configuration
  style?: {
    className?: string;
    tableClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
  };

  // Preset templates
  preset?:
    | 'basic'
    | 'advanced'
    | 'editable'
    | 'readonly'
    | 'mobile'
    | 'dashboard';

  // Extended configuration
  plugins?: string[];
  customConfig?: Record<string, unknown>;
}

// Schema builder interface
export interface TableSchemaBuilder<T = BaseRecord> {
  // Basic methods
  setTitle: (title: string) => this;
  setDescription: (description: string) => this;

  // Column management
  addColumn: (column: ColumnSchema<T>) => this;
  removeColumn: (key: string) => this;
  updateColumn: (params: {
    key: string;
    updates: Partial<ColumnSchema<T>>;
  }) => this;

  // Feature configuration
  enablePagination: (config?: SchemaPaginationConfig) => this;
  enableSearch: (config?: boolean | object) => this;
  enableToolbar: (config?: SchemaToolbarConfig) => this;
  enableRowSelection: (config?: boolean | object) => this;

  // Data source
  setDataSource: (dataSource: T[]) => this;
  setRequest: (
    request:
      | RequestConfig<T>
      | (<TParams = unknown>(
          params: TParams,
        ) => Promise<{
          data: T[];
          total?: number;
          success?: boolean;
        }>),
  ) => this;

  // Operations
  addAction: (action: SchemaActionConfig) => this;

  // Build
  build: () => TableSchema<T>;

  // Validate
  validate: () => { valid: boolean; errors: string[] };
}

// Preset template type
export interface PresetTemplate {
  name: string;
  description: string;
  schema: Partial<TableSchema>;
  preview?: string; // Preview image URL
}

// Schema validation result
export interface ValidationResult {
  valid: boolean;
  errors: Array<{
    field: string;
    message: string;
    severity: 'error' | 'warning';
  }>;
}

// Table instance methods
export interface SchemaTableInstance<T = BaseRecord> {
  // Data operations
  reload: () => Promise<void>;
  getDataSource: () => T[];
  setDataSource: (data: T[]) => void;

  // Filter operations
  getFilters: () => Record<string, unknown>;
  setFilters: (filters: Record<string, unknown>) => void;
  resetFilters: () => void;

  // Selection operations
  getSelectedRows: () => T[];
  getSelectedRowKeys: () => React.Key[];
  setSelectedRows: (keys: React.Key[]) => void;
  clearSelection: () => void;

  // Pagination operations
  getCurrentPage: () => number;
  getPageSize: () => number;
  setPage: (page: number, pageSize?: number) => void;

  // Sorting operations
  getSorter: () => { field: string; order: 'ascend' | 'descend' } | null;
  setSorter: (field: string, order: 'ascend' | 'descend' | null) => void;

  // Export functionality
  exportData: (format?: 'csv' | 'excel' | 'json') => void;

  // Refresh
  refresh: () => void;
}

// Component props
export interface SchemaTableProps<T = BaseRecord> {
  schema: TableSchema<T>;
  className?: string;
  style?: React.CSSProperties;
  onReady?: (instance: SchemaTableInstance<T>) => void;
}
