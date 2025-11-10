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
 * Missing component type definitions
 */

import type { PaginationProps } from '@arco-design/web-react/es/Pagination/pagination';
import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';
import type { ReactNode } from 'react';
import type { BaseRecord } from '../core';
import type { TableTitleProps } from './table-title';

/**
 * Option type
 */
// Option type has been moved to @veaiops/types/components

/**
 * Custom title properties
 */
export interface CustomTitleProps {
  title?: React.ReactNode;
  actions?: React.ReactNode[];
  className?: string;
  style?: React.CSSProperties;
  [key: string]: unknown;
}

/**
 * Table column title properties (extends TableTitleProps, for custom header components)
 * Note: TableTitleProps is already defined in table-title.ts
 */
export interface TableColumnTitleProps extends TableTitleProps {
  dataIndex?: string;
  filterDataIndex?: string;
  filters?: Record<string, unknown>;
  onChange?: (type: string, value?: Record<string, unknown>) => void;
  queryOptions?: (
    params: Record<string, unknown>,
  ) => Promise<unknown> | unknown;
  tip?: string;
  sorter?: unknown;
  multiple?: boolean;
  showTip?: boolean;
  frontEnum?: unknown;
  [key: string]: unknown;
}

/**
 * Note: The following types are already defined in their corresponding source files, removed here to avoid duplicate exports:
 * - TableContentProps: already defined in table-content.ts
 * - DefaultStreamFooterProps: already defined in default-footer.ts
 * - DefaultFooterProps: already defined in default-footer.ts
 * - SimpleOptions: already defined in title-search.ts (type is string[] | number[])
 * - SelectCustomWithFooterProps: already defined in title-search.ts
 * - CustomCheckBoxProps: already defined in title-checkbox.ts
 * - TableTitleProps: already defined in table-title.ts
 * - TableHeaderConfig: already defined in table-content.ts
 * - TableContentLoadingConfig: already defined in table-content.ts
 * - TableRenderers: already defined in table-content.ts
 * - TableAlertProps: already defined in table-alert.ts
 * - StreamRetryButtonProps: already defined in stream-retry-button.ts
 * If you need to use these types, please import from the corresponding source file or unified export entry
 */

/**
 * Custom table column properties
 */
export interface CustomTableColumnProps<T = Record<string, unknown>> {
  title: React.ReactNode;
  dataIndex?: string;
  key?: string;
  width?: number | string;
  fixed?: 'left' | 'right';
  sorter?: boolean | ((a: T, b: T) => number);
  render?: (value: unknown, record: T, index: number) => React.ReactNode;
  [key: string]: unknown;
}

/**
 * Query options interface
 */
export interface IQueryOptions {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * RetryHandlerProps, RetryState, RetryOptions are already defined in retry-handler.ts, removed here to avoid duplication
 * RetryConfig is already defined in stream-retry-button.ts, removed here to avoid duplication
 * If needed, please import from '@/custom-table/types/components/retry-handler' or '@/custom-table/types'
 */

/**
 * FormTableDataProps is already defined in core/common.ts, removed here to avoid duplication
 * If needed, please import from '@/custom-table/types/core' or '@/custom-table/types'
 */

/**
 * CustomTable component property types
 * Note: CustomTableProps is already exported from props.ts, removed here to avoid duplicate definition
 * If you need to use CustomTableProps, please import from '@/custom-table/types' or '@/custom-table/types/components'
 */

/**
 * PaginationConfig is already defined in props.ts, removed here to avoid duplication
 * If needed, please import from '@/custom-table/types/components' or '@/custom-table/types'
 */

/**
 * Custom fields properties
 */
export interface CustomFieldsProps<
  T extends Record<string, unknown> = Record<string, unknown>,
> {
  disabledFields: Map<string, boolean>;
  columns: ColumnProps<T>[];
  value: string[];
  confirm: (value: string[]) => void;
}

/**
 * Custom fields state (moved to custom-fields/types.ts, kept here only for backward compatibility)
 * @deprecated Please use the definition in plugins/custom-fields/types
 */
export interface CustomFieldsState {
  showCustomFields: boolean;
  selectedFields: string[];
  availableColumns: Array<{
    dataIndex?: string;
    title?: string;
    [key: string]: unknown;
  }>;
  disabledFields: Map<string, boolean> | string[];
}

/**
 * CustomFilterSettingState is already defined in plugins/custom-filter-setting/types.ts, removed here to avoid duplication
 * If needed, please import from '@/custom-table/types/plugins' or '@/custom-table/types'
 */

/**
 * CustomEditorProps is already defined in plugins/inline-edit.ts, removed here to avoid duplication
 * If needed, please import from '@/custom-table/types/plugins' or '@/custom-table/types'
 */
