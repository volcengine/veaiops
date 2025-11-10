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
 * Pagination and sorting Hook related type definitions
 * Optimized based on Arco Design type standards
 */
import type {
  RowSelectionProps,
  SorterInfo,
} from '@arco-design/web-react/es/Table/interface';
import type { ReactNode } from 'react';

/**
 * usePagination Hook Props
 */
export interface UsePaginationProps<
  ConfigType extends Record<string, unknown> = Record<string, unknown>,
> {
  total?: number;
  current?: number;
  pageSize?: number;
  defaultCurrent?: number;
  defaultPageSize?: number;
  onChange?: (current: number, pageSize: number) => void;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?:
    | boolean
    | ((total: number, range: [number, number]) => React.ReactNode);
  pageSizeOptions?: string[];
  size?: 'mini' | 'small' | 'default' | 'large';
  disabled?: boolean;
  hideOnSinglePage?: boolean;
  simple?: boolean;
  isPaginationInCache?: boolean;
  config?: ConfigType;
}

/**
 * useSorting Hook Props
 */
export interface UseSortingProps<
  SortFieldMapType extends Record<string, string> = Record<string, string>,
  ConfigType extends Record<string, unknown> = Record<string, unknown>,
> {
  initialSorter?: SorterInfo | SorterInfo[];
  onChange?: (sorter: SorterInfo | SorterInfo[]) => void;
  sortDirections?: ('ascend' | 'descend')[];
  showSorterTooltip?: boolean;
  multiple?: boolean;
  sortFieldMap?: SortFieldMapType;
  config?: ConfigType;
}

/**
 * Pagination info
 */
export interface PaginationPageInfo {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * Sort info
 */
export interface SortInfo {
  field?: string;
  direction?: 'ascend' | 'descend';
}

/**
 * Filter configuration based on Arco Design
 */
export interface FilterItem<ValueType = unknown> {
  text?: ReactNode;
  value?: ValueType;
  [key: string]: unknown;
}

/**
 * Hooks filter configuration (renamed to avoid conflicts with FilterConfig in components/props.ts)
 */
export interface HooksFilterConfig<RecordType = Record<string, unknown>> {
  filters?: FilterItem[];
  defaultFilters?: string[];
  filteredValue?: string[];
  onFilter?: (value: unknown, record: RecordType) => boolean;
}

/**
 * Row selection configuration based on Arco Design
 */
export interface TableRowSelectionConfig<RecordType = Record<string, unknown>>
  extends RowSelectionProps<RecordType> {
  enableCrossPage?: boolean;
  enableSelectAll?: boolean;
  enableCheckStrictly?: boolean;
}

/**
 * usePagination Hook return value
 */
export interface UsePaginationResult {
  current: number;
  pageSize: number;
  total: number;
  onChange: (current: number, pageSize: number) => void;
  showSizeChanger: boolean;
  showQuickJumper: boolean;
  showTotal:
    | boolean
    | ((total: number, range: [number, number]) => React.ReactNode);
  pageSizeOptions: string[];
  size: 'mini' | 'small' | 'default' | 'large';
  disabled: boolean;
  hideOnSinglePage: boolean;
  simple: boolean;
}

/**
 * useSorting Hook return value
 */
export interface UseSortingResult {
  sorter: SorterInfo | SorterInfo[];
  onSorterChange: (sorter: SorterInfo | SorterInfo[]) => void;
  sortDirections: ('ascend' | 'descend')[];
  showSorterTooltip: boolean;
  multiple: boolean;
}
