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
 * Table configuration Hook related type definitions
 */
import type { PaginationProps } from '@arco-design/web-react/es/Pagination/pagination';
import type { BaseQuery, BaseRecord } from '../core';
// Use relative paths to avoid cross-level imports (following .cursorrules standards)
import type { ColumnItem } from '../plugins/table-columns';

/**
 * useTableConfig Hook Props
 */
export interface TableConfigOptions<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  /** Base column configuration */
  baseColumns?: ColumnItem<RecordType>[];
  /** Column processing function */
  handleColumns?: (props: Record<string, unknown>) => ColumnItem<RecordType>[];
  /** Additional parameters for column processing function */
  handleColumnsProps?: Record<string, unknown>;
  /** Query parameters */
  query?: QueryType;
  /** Whether to enable column management */
  enableColumnManagement?: boolean;
  /** Whether to enable filter */
  enableFilter?: boolean;
  /** Whether to enable sorting */
  enableSorting?: boolean;
  /** Whether to enable pagination */
  enablePagination?: boolean;
}

/**
 * Table feature configuration type
 */
export interface TableFeaturesConfig {
  /** Whether column management is enabled */
  columnManagement?: boolean;
  /** Whether filter is enabled */
  filter?: boolean;
  /** Whether sorting is enabled */
  sorting?: boolean;
  /** Whether pagination is enabled */
  pagination?: boolean;
  /** Other feature configuration */
  [key: string]: boolean | undefined;
}

/**
 * useTableConfig Hook return value
 */
export interface TableConfigResult<RecordType extends BaseRecord = BaseRecord> {
  // Processed column configuration
  columns: ColumnItem<RecordType>[];

  // Table properties
  tableProps: {
    columns: ColumnItem<RecordType>[];
    loading?: boolean;
    pagination?: PaginationProps | boolean;
    onChange?: (page: number, pageSize: number) => void;
  };

  // Pagination configuration
  paginationConfig: PaginationProps | boolean;

  // Feature configuration
  features: TableFeaturesConfig;

  // Configuration information
  config: {
    enableColumnManagement: boolean;
    enableFilter: boolean;
    enableSorting: boolean;
    enablePagination: boolean;
  };

  // Update configuration
  updateConfig: (newConfig: Partial<TableConfigOptions<RecordType>>) => void;
}
