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
/**
 * CustomTable core common type definitions
 * Based on Arco Design Table type system
 */
import type {
  RowSelectionProps as ArcoRowSelectionProps,
  SorterInfo as ArcoSorterInfo,
  TableProps as ArcoTableProps,
  SorterFn,
} from '@arco-design/web-react/es/Table/interface';
import type { BaseQuery, BaseRecord } from '@veaiops/types';
import type {
  AlertTypeEnum,
  ColumnFixedEnum,
  LifecyclePhaseEnum,
  PluginPriorityEnum,
  PluginStatusEnum,
  SortDirectionEnum,
  TableActionEnum,
  TableFeatureEnum,
} from './enums';

// Import base types from @veaiops/types to avoid duplication

// Re-export ModernTableColumnProps for use by other modules
export type { ModernTableColumnProps } from '@/shared/types';
export type { BaseRecord, BaseQuery };

/**
 * Standard query interface (optional use)
 * @description Provides standard query field definitions for common components
 */
export interface StandardQuery {
  // Frontend pagination parameters (compatible with Arco Table)
  pageSize?: number;
  current?: number;

  // bam-service pagination parameters - use skip/limit format
  page_req?: {
    skip: number;
    limit: number;
  };

  // Common filter and sort parameters
  filters?: Record<string, FilterValue>;
  sortColumns?: Array<{
    column: string;
    direction: 'ASC' | 'DESC';
  }>;
}

/**
 * Filter value type
 */
export type FilterValue = string | number | boolean | null | undefined;

/**
 * Query parameter value type
 * @description Supports all possible query parameter value types
 */
export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean>
  | Record<string, unknown>;

/**
 * React Key type
 */
export type Key = string | number;

/**
 * Query format function type
 * @description Query parameter format function parameter interface
 */
export interface QueryFormatParams {
  /**
   * Previous value (for cumulative processing)
   */
  pre: unknown;
  /**
   * Current value
   */
  value: unknown;
}

// Generic query format function type, supports custom parameter types
export type QueryFormatFunction = (params: {
  pre: unknown;
  value: unknown;
}) => unknown;

// Base query format function type (backward compatible)
export type BaseQueryFormatFunction = QueryFormatFunction;

// Flexible query format object type, supports format functions with different parameter types
export type QueryFormat = Record<string, QueryFormatFunction>;

/**
 * Pagination request parameters
 */
export interface PageReq {
  skip: number;
  limit: number;
}

/**
 * Handle filter property parameters
 */
export interface HandleChangeSingleParams {
  key: string;
  value?: unknown;
}

export interface HandleChangeObjectParams {
  updates: Record<string, unknown>;
}

export interface HandleFilterProps<QueryType = BaseQuery> {
  query: QueryType;
  handleChange: (
    params: HandleChangeSingleParams | HandleChangeObjectParams,
  ) => void;
  handleFiltersProps?: Record<string, unknown>;
  [key: string]: unknown;
}

/**
 * Service request type constraint
 * @description Type constraint for service instances, supports generic configuration and method calls
 * Note: Maintain object constraint to adapt to more precise service types (e.g., LocationService<Config>)
 * Requirement is only "object", specific method signature is guaranteed by serviceMethod: keyof ServiceType
 */
export type ServiceRequestType = object;

/**
 * Handle success response type
 */
export interface OnSuccessResponse<
  RecordType = BaseRecord,
  QueryType = BaseQuery,
> {
  query: QueryType;
  v: RecordType[];
  extra?: Record<string, unknown>;
  isQueryChange: boolean;
}

/**
 * Process type
 */
export interface OnProcessType {
  run: () => void;
  stop: () => void;
  resetQuery: (params?: { resetEmptyData?: boolean }) => void;
}

/**
 * Filter property type
 */
export type FiltersProps = Record<string, (string | number)[]>;

/**
 * Format table data configuration
 */
export interface FormTableDataProps<RecordType = BaseRecord> {
  sourceData: RecordType[];
  addRowKey?: (item: RecordType, index: number) => string | number;
  arrayFields?: string[];
  formatDataConfig?: Record<string, (item: RecordType) => unknown>;
}

/**
 * Extended table properties
 */
export interface ExtendedTableProps<RecordType = BaseRecord>
  extends Omit<ArcoTableProps<RecordType>, 'columns'> {
  columns?: ModernTableColumnProps<RecordType>[];
}

/**
 * Extended sorter information
 */
export interface ExtendedSorterInfo extends ArcoSorterInfo {
  sorterFn?: SorterFn;
  priority?: number;
}

/**
 * Extended row selection properties
 */
export interface ExtendedRowSelectionProps<RecordType = BaseRecord>
  extends ArcoRowSelectionProps<RecordType> {
  checkStrictly?: boolean;
  preserveSelectedRowKeys?: boolean;
}

/**
 * Table size type
 */
export type TableSize = 'default' | 'middle' | 'small' | 'mini';

/**
 * Table border configuration
 */
export type TableBorder =
  | boolean
  | {
      wrapper?: boolean;
      headerCell?: boolean;
      bodyCell?: boolean;
      cell?: boolean;
    };

/**
 * Scroll configuration
 */
export interface ScrollConfig {
  x?: number | string | boolean;
  y?: number | string | boolean;
}

/**
 * Sort direction (based on enum)
 */
export type SortDirection = SortDirectionEnum;

/**
 * Table position
 */
export type TablePosition =
  | 'br'
  | 'bl'
  | 'tr'
  | 'tl'
  | 'topCenter'
  | 'bottomCenter';

/**
 * Table action type (based on enum)
 */
export type TableActionType = TableActionEnum;

/**
 * Column fixed position type (based on enum)
 */
export type ColumnFixed = ColumnFixedEnum;

/**
 * Alert type (based on enum)
 */
export type AlertType = AlertTypeEnum;

/**
 * Plugin priority type (based on enum)
 */
// PluginPriority has been exported from enums.ts, removed here to avoid duplication

/**
 * Plugin status type (based on enum)
 */
// PluginStatus has been exported from enums.ts, removed here to avoid duplication

/**
 * Lifecycle phase type (based on enum)
 */
// LifecyclePhase has been exported from enums.ts, removed here to avoid duplication

/**
 * Table feature type (based on enum)
 */
export type TableFeature = TableFeatureEnum;

/**
 * Table feature configuration (based on actual property names in existing source code)
 */
export interface FeatureConfig {
  enablePagination: boolean;
  enableSorting: boolean;
  enableFilter: boolean; // Note: Existing source code uses enableFilter instead of enableFiltering
  enableSelection: boolean; // Note: Existing source code uses enableSelection instead of enableRowSelection
  enableColumnResize: boolean;
  enableFullScreen: boolean;
}
