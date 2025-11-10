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
 * CustomTable data source related type definitions
 */
import type {
  BaseQuery,
  BaseRecord,
  FiltersProps,
  FormTableDataProps,
  OnProcessType,
  OnSuccessResponse,
  ServiceRequestType,
} from './common';

/**
 * Table data source configuration
 */
export interface TableDataSource<
  ServiceType extends ServiceRequestType = ServiceRequestType,
  RecordType extends BaseRecord = BaseRecord,
  QueryParams extends Record<string, unknown> = Record<string, unknown>,
  FormatRecordType extends BaseRecord = RecordType,
> {
  /** Service instance */
  serviceInstance?: ServiceType;
  /** Service method name */
  serviceMethod?: keyof ServiceType;
  /** Request function */
  request?: (params: QueryParams) => Promise<unknown>;
  /** Additional request parameters */
  payload?: Record<string, unknown>;
  /** Response data item key name */
  responseItemsKey?: string;
  /** Whether server-side pagination */
  isServerPagination?: boolean;
  /** Whether to filter empty columns */
  isEmptyColumnsFilter?: boolean;
  /** Whether request can be cancelled */
  isCancel?: boolean;
  /** Whether ready */
  ready?: boolean;
  /** Whether manual trigger */
  manual?: boolean;
  /** Whether need to continue */
  needContinue?: boolean;
  /** Whether has more data */
  hasMoreData?: boolean;
  /** Whether scroll fetch data */
  scrollFetchData?: boolean;
  /** Whether to flatten data */
  flattenData?: boolean;
  /** Static data list */
  dataList?: RecordType[];
  /** Array fields */
  arrayFields?: string[];
  /** Query search key */
  querySearchKey?: string;
  /** Query search match keys */
  querySearchMatchKeys?: string[];
  /** Add row key function */
  addRowKey?: (item: RecordType, index: number) => string | number;
  /** Format data configuration */
  formatDataConfig?: Record<string, (item: RecordType) => unknown>;
  /** Pagination conversion function */
  paginationConvert?: (
    page_req: Record<string, unknown>,
  ) => Record<string, unknown>;
  /** Format payload function */
  formatPayload?: (payload: Record<string, unknown>) => Record<string, unknown>;
  /** Plugin configuration */
  pluginConfig?: {
    showNotice?: {
      stage: 'success' | 'fail' | 'all';
    };
    title?: string;
    content?: string;
  };
  /** Success callback */
  onSuccess?: (
    response: OnSuccessResponse<FormatRecordType, BaseQuery>,
  ) => void;
  /** Error callback */
  onError?: (error?: Error) => void;
  /** Finally callback */
  onFinally?: () => void;
  /** Process callback */
  onProcess?: (handler: OnProcessType) => void;
}

/**
 * Data source state
 */
export interface DataSourceState<RecordType extends BaseRecord = BaseRecord> {
  /** Loading state */
  loading: boolean;
  /** Error information */
  error: Error | null;
  /** Formatted data */
  data: RecordType[];
  /** Total count */
  total: number;
  /** Table total count */
  tableTotal: number;
  /** Whether has more data */
  hasMoreData: boolean;
}

/**
 * Data source operation methods
 */
export interface DataSourceActions {
  /** Run request */
  run: () => Promise<void>;
  /** Refresh data */
  refresh: () => Promise<void>;
  /** Cancel request */
  cancel: () => void;
  /** Load more data */
  loadMoreData?: () => void;
  /** Set reset empty data */
  setResetEmptyData?: (reset: boolean) => void;
}

/**
 * Data source hook return type
 */
export interface DataSourceHookResult<
  RecordType extends BaseRecord = BaseRecord,
> extends DataSourceState<RecordType>,
    DataSourceActions {}

/**
 * Data source configuration options
 */
export interface DataSourceConfig<
  ServiceType extends ServiceRequestType = ServiceRequestType,
  RecordType extends BaseRecord = BaseRecord,
  FormatRecordType extends BaseRecord = RecordType,
> {
  /** Debounce wait time */
  debounceWait?: number;
  /** Retry count */
  retryCount?: number;
  /** Cache key */
  cacheKey?: string;
  /** Whether to enable cache */
  enableCache?: boolean;
  /** Cache time */
  cacheTime?: number;
  /** Default data */
  defaultData?: RecordType[];
  /** Error retry interval */
  errorRetryInterval?: number;
  /** Success callback */
  onSuccess?: (data: RecordType[], extra?: Record<string, unknown>) => void;
  /** Error callback */
  onError?: (error: Error) => void;
}

/**
 * Data processing utility types
 */
export interface DataProcessor<
  RecordType extends BaseRecord = BaseRecord,
  FormatRecordType extends BaseRecord = RecordType,
> {
  /** Format table data */
  formatTableData: (
    props: FormTableDataProps<RecordType>,
  ) => FormatRecordType[];
  /** Filter table data */
  filterTableData: (
    data: FormatRecordType[],
    filters: FiltersProps,
  ) => FormatRecordType[];
  /** Filter empty data */
  filterEmptyDataByKeys: (
    data: Record<string, unknown>,
  ) => Record<string, unknown>;
}
