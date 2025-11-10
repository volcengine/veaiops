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

import type { AffixProps } from '@arco-design/web-react/es/Affix/interface';
import type { PaginationProps } from '@arco-design/web-react/es/Pagination/pagination';
import type { TableProps } from '@arco-design/web-react/es/Table/interface';
import type { FormTableDataProps } from '@veaiops/utils';
import type Fetch from 'ahooks/lib/useRequest/src/Fetch';
import type {
  CSSProperties,
  Dispatch,
  Key,
  ReactNode,
  SetStateAction,
} from 'react';
import type { CustomTableColumnProps } from './components';
// FiltersProps type has been moved to filters/core/types
// import type { FiltersProps } from '../../../filters/core/types';
export interface FiltersProps {
  config?: unknown[];
  query?: Record<string, unknown>;
  showReset?: boolean;
  resetFilterValues?: (props: { resetEmptyData?: boolean }) => void;
  className?: string;
  wrapperClassName?: string;
  style?: CSSProperties;
  actions?: ReactNode[];
  [key: string]: unknown;
}
// Temporarily commented out to avoid import errors
// import type { CustomFieldsProps } from '../../custom-fields';
type CustomFieldsProps<T = Record<string, unknown>> = Record<string, unknown>; // Temporary generic type
// import { PluginConfig, ServiceRequestType } from '../../../../types';
// Temporarily commented, these types may be defined elsewhere or no longer needed
type PluginConfig = Record<string, unknown>;
type ServiceRequestType = Record<string, unknown>;

export type PageReq =
  | {
      page_req: {
        skip: number;
        limit: number;
      };
    }
  | {
      page_req: undefined;
    };

export interface OnProcessType<TData, TParams extends unknown[] = unknown[]> {
  run: Fetch<TData, TParams>['run'];
  stop: Fetch<TData, TParams>['cancel'];
  resetQuery: (props: { resetEmptyData?: boolean }) => void;
}

export interface QueryFormatValueProps {
  pre: unknown;
  value: unknown;
}

export type QueryFormat = Record<string, (v: QueryFormatValueProps) => unknown>;

export interface HandleFilterProps<QueryType> {
  query: QueryType;
  handleChange: (
    key: string,
    value: unknown,
    handleFilter?: () => Record<string, string[] | number[]>,
    ctx?: Record<string, unknown>,
  ) => void;
  handleFiltersProps: Record<string, unknown>;
}

export interface OnSuccessResponse<FormatRecordType> {
  query: Record<string, unknown>;
  v: Array<FormatRecordType>;
  extra: Record<string, unknown>;
  isQueryChange: boolean;
}

export type TableDataSource<
  ServiceType,
  RecordType,
  TParams extends unknown[] = unknown[],
  FormatRecordType = RecordType,
> = {
  dataList?: Array<FormatRecordType | RecordType>;
  serviceInstance?: ServiceType;
  serviceMethod?: keyof ServiceType;
  formatPayload?: (payload: Record<string, unknown>) => Record<string, unknown>;
  paginationConvert?: (req: PageReq) => Record<string, unknown>;
  scrollFetchData?: boolean;
  hasMoreData?: boolean;
  responseItemsKey?: string;
  payload?: Record<string, unknown>;
  isEmptyColumnsFilter?: boolean;
  isServerPagination?: boolean; // Default is false, frontend pagination
  querySearchKey?: string; // Frontend pagination key search key
  querySearchMatchKeys?: Array<keyof FormatRecordType>; // Frontend pagination search match fields list
  ready?: boolean; // Auto request
  manual?: boolean; // Manually trigger request
  isCancel?: boolean; // Manually cancel
  onProcess?: (props: OnProcessType<FormatRecordType, TParams>) => void;
  onSuccess?: (props: OnSuccessResponse<FormatRecordType>) => void;
  onError?: () => void;
  onFinally?: () => void;
  pluginConfig?: PluginConfig;
  flattenData?: boolean;
} & Omit<FormTableDataProps<RecordType, FormatRecordType>, 'sourceData'>;

export type QuerySearchParamsFormat = Record<
  string,
  (v: { value: unknown }) => unknown
>;

export interface CustomTableProps<
  RecordType extends { [key: string]: unknown },
  QueryType extends { [key: string]: unknown },
  ServiceType extends ServiceRequestType,
  FormatRecordType extends { [key: string]: unknown } | undefined,
> {
  title?: string; // Title
  titleClassName?: string; // Table title wrap style
  titleStyle?: CSSProperties; // Table title wrap style
  handleColumns: (
    props: Record<string, unknown>,
  ) => CustomTableColumnProps<FormatRecordType>[]; // Column handler function
  handleColumnsProps?: Record<string, unknown>;
  handleFiltersProps?: Record<string, unknown>;
  syncQueryOnSearchParams?: boolean; // Sync query to searchParams
  pagination?: PaginationProps;
  rowKey?: string | ((record: FormatRecordType) => Key);
  isAlertShow?: boolean;
  isFilterShow?: boolean;
  isFilterEffective?: boolean;
  isFilterAffixed?: boolean;
  isContainerFullWidth?: boolean;
  isRenderWrapperFullWidth?: boolean;
  tableFilterProps?: FiltersProps;
  affixProps?: AffixProps;
  isPaginationInCache?: boolean;
  isEditable?: boolean;
  alertType?: 'info' | 'success' | 'warning' | 'error';
  alertContent?: ReactNode | string;
  handleFilters?: ({
    query,
    handleChange,
    handleFiltersProps,
  }: HandleFilterProps<QueryType>) => Array<Record<string, unknown>>;
  filterStyleCfg?: {
    isWithBackgroundAndBorder: boolean; // Whether to use default background color and border
  }; // Filter style configuration
  filterResetKeys?: string[];
  tableClassName?: string;
  actions?: ReactNode[]; // Filter action items
  operations?: ReactNode[]; // Operation items in filter
  initQuery?: Partial<QueryType> | Record<string, unknown>; // Form query parameters
  initFilters?: Partial<QueryType> | Record<string, unknown>; // Table filter query parameters
  queryFormat?: QueryFormat;
  sortFieldMap?: Record<string, unknown>;
  dataSource: TableDataSource<
    ServiceType,
    RecordType,
    QueryType[],
    FormatRecordType
  >;
  customActions?: ReactNode[]; // Custom actions
  customActionsStyle?: CSSProperties; // Custom action styles
  customReset?: (props: {
    resetEmptyData: boolean;
    setQuery: Dispatch<SetStateAction<QueryType>>;
  }) => void;
  tableFilterWrapperClassName?: string;
  tableProps?: Partial<TableProps<FormatRecordType>>;
  showReset?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  onQueryChange?: ({ query }: { query: QueryType }) => void;
  isTableHeaderSticky?: boolean; // Table header sticky
  tableHeaderStickyTopOffset?: number;
  useActiveKeyHook?: boolean; // Use useActiveKeyHook
  querySearchParamsFormat?: QuerySearchParamsFormat;
  enableCustomFields?: boolean; // Enable custom fields
  customFieldsProps?: Pick<
    CustomFieldsProps<FormatRecordType>,
    'disabledFields' | 'initialFields' | 'confirm' | 'value'
  >; // Custom fields configuration
  supportSortColumns?: boolean;
}
