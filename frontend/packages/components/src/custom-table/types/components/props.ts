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
 * CustomTable component property type definitions
 */
import type { FeatureFlags } from '@/custom-table/constants/features';
import type { PaginationProps } from '@arco-design/web-react/es/Pagination/pagination';
import type { PluginContext, TableDataSource } from '@veaiops/types';
import type { CSSProperties, ReactNode } from 'react';
import type {
  BaseQuery,
  BaseRecord,
  ExtendedTableProps,
  FeatureConfig,
  HandleFilterProps,
  ModernTableColumnProps,
  QueryFormat,
  ServiceRequestType,
} from '../core/common';
// Use relative paths to avoid cross-level imports (following .cursorrules standards)
import type { LifecyclePhase } from '../hooks/lifecycle';
import type { CustomTableLifecycleConfig } from '../plugins/lifecycle';
import type { QuerySyncConfig } from '../plugins/query-sync';

import type { FieldItem } from '@/filters/core/types';
import type { SearchConfig } from '../plugins/table-toolbar';
// SearchConfig has been moved to plugins/table-toolbar.ts, remove duplicate definition here
// Re-import for use

/**
 * CustomTable base properties interface
 */
export interface CustomTableProps<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
  ServiceType extends ServiceRequestType = ServiceRequestType,
  FormatRecordType extends BaseRecord = RecordType,
> {
  // Basic table configuration
  /** Row unique identifier */
  rowKey?: string | ((record: RecordType) => string);
  /** Table base column configuration */
  baseColumns?: ModernTableColumnProps<FormatRecordType>[];
  /** Table additional properties */
  tableProps?:
    | ExtendedTableProps<FormatRecordType>
    | ((ctx: { loading: boolean }) => ExtendedTableProps<FormatRecordType>);
  /** Table style class name */
  tableClassName?: string;
  /** Table style */
  tableStyle?: CSSProperties;
  /** Sticky configuration - controls header and filter fixed behavior */
  stickyConfig?: {
    /** Whether to enable header sticky, default true */
    enableHeaderSticky?: boolean;
    /** Whether to enable filters sticky, default true */
    enableFiltersSticky?: boolean;
    /** Header sticky distance from top, default 0 */
    headerTopOffset?: number;
    /** Filters sticky distance from top, default 0 */
    filtersTopOffset?: number;
    /** Header z-index value, default 100 */
    headerZIndex?: number;
    /** Filters z-index value, default 99 */
    filtersZIndex?: number;
  };
  /** Auto calculate scroll.y configuration - enabled by default */
  autoScrollY?: {
    /** Whether to enable auto calculation, default true */
    enabled?: boolean;
    /** Fixed height offset (pixels), default 350 */
    offset?: number;
    /** Minimum height (pixels), default 300 */
    minHeight?: number;
    /** Maximum height (pixels), default undefined */
    maxHeight?: number;
  };

  // Data source configuration
  /** Data source configuration */
  dataSource?: TableDataSource<RecordType, Record<string, unknown>>;

  // Pagination configuration
  /** Pagination configuration */
  pagination?: PaginationProps | boolean;

  // Title configuration
  /** Table title */
  title?: string;
  /** Title style class name */
  titleClassName?: string;
  /** Title style */
  titleStyle?: CSSProperties;
  /** Title action buttons */
  actions?: ReactNode[];
  /** Action button style class name */
  actionClassName?: string;

  // Filter configuration
  /** Filter properties */
  tableFilterProps?: Record<string, unknown>;
  /** Whether to show filter */
  isFilterShow?: boolean;
  /** Whether filter is fixed */
  isFilterAffixed?: boolean;
  /** Whether filter is collected */
  isFilterCollection?: boolean;
  /** Filter style configuration */
  filterStyleCfg?: { isWithBackgroundAndBorder: boolean };
  /** Filter wrapper style class name */
  tableFilterWrapperClassName?: string;
  /** Custom action style */
  customActionsStyle?: CSSProperties;
  /** Enable custom fields entry (compatible with legacy) */
  enableCustomFields?: boolean;
  /** Custom fields configuration (compatible with legacy) */
  customFieldsProps?: {
    disabledFields: Map<string, string | undefined>;
    value?: string[];
    initialFields?: string[];
    confirm: (value: string[]) => void;
  };
  /** Enable filter setting feature */
  enableFilterSetting?: boolean;
  /** Filter setting configuration */
  filterSettingProps?: {
    fixedOptions?: string[];
    allOptions?: string[];
    selectedOptions?: string[];
    hiddenOptions?: string[];
    title?: string;
    mode?: Array<'select' | 'fixed'>;
    caseSelectText?: (key: string) => string;
    saveFun?: (props: {
      fixed_fields: string[];
      selected_fields: string[];
      hidden_fields: string[];
    }) => void;
    onChange?: (props: {
      fixed_fields: string[];
      hidden_fields?: string[];
    }) => void;
  };
  /** Whether to show reset button */
  showReset?: boolean;
  /** Action buttons */
  operations?: ReactNode[];
  /** Custom action buttons */
  customActions?: ReactNode[] | ReactNode;

  // Alert configuration
  /** Whether to show alert */
  isAlertShow?: boolean;
  /** Alert type */
  alertType?: 'info' | 'success' | 'warning' | 'error';
  /** Alert content */
  alertContent?: ReactNode;
  /** Custom alert node */
  customAlertNode?: ReactNode;

  // Loading configuration
  /** Whether to use custom loading */
  useCustomLoading?: boolean;
  /** Loading tip text */
  loadingTip?: string;
  /** Custom loading state */
  customLoading?: boolean;

  // Empty data configuration
  /** Element to display when there is no data */
  noDataElement?: ReactNode;

  // Query configuration
  /** Initial query parameters */
  initQuery?: QueryType;
  /** Initial filters */
  initFilters?: Record<string, unknown>;
  /** Query format configuration */
  queryFormat?: QueryFormat;
  /** Query to search format function */
  queryToSearchFormat?: (query: QueryType) => string;

  // Handler functions
  /** Column configuration handler function */
  handleColumns?: (
    props: Record<string, unknown>,
  ) => ModernTableColumnProps<FormatRecordType>[];
  /** Filter handler function (returns FieldItem[] type) */
  handleFilters?: (props: HandleFilterProps<QueryType>) => FieldItem[];
  /** Column configuration handler properties */
  handleColumnsProps?: Record<string, unknown>;
  /** Filter handler properties */
  handleFiltersProps?: Record<string, unknown>;

  // Sorting configuration
  /** Sort field mapping */
  sortFieldMap?: Record<string, string>;
  /** Whether to support multi-column sorting (compatible with legacy supportSortColumns) */
  supportSortColumns?: boolean;
  /** Whether to show refresh button */
  showRefresh?: boolean;

  // Cache configuration
  /** Whether pagination is cached */
  isPaginationInCache?: boolean;

  // Query parameter sync configuration
  /** Whether to sync query to search parameters */
  syncQueryOnSearchParams?: boolean;
  /** Auth-related query prefix configuration, used to filter sensitive parameters */
  authQueryPrefixOnSearchParams?: Record<string, string | undefined>;
  /** Query parameter to search parameter format configuration */
  querySearchParamsFormat?: Record<string, (value: unknown) => string>;
  /** Whether to use activeKey Hook */
  useActiveKeyHook?: boolean;
  /** Custom reset logic */
  customReset?: (params: {
    resetEmptyData: boolean;
    setQuery: (query: QueryType) => void;
  }) => void;

  // Filter related
  /** Whether filter is effective */
  isFilterEffective?: boolean;
  /** Filter reset keys */
  filterResetKeys?: string[];

  // Custom rendering
  /** Custom component rendering */
  customComponentRender?: (props: { table: ReactNode }) => ReactNode;
  /** Custom footer */
  customFooter?:
    | ReactNode
    | ((props: {
        hasMoreData: boolean;
        needContinue?: boolean;
        onLoadMore: () => void;
      }) => ReactNode);
  /** Custom rendering configuration */
  customRender?: {
    table?: (table: ReactNode) => ReactNode;
    footer?: (props: {
      hasMoreData: boolean;
      needContinue?: boolean;
      onLoadMore: () => void;
    }) => ReactNode;
    [key: string]: unknown;
  };

  // Event callbacks
  /** Query change callback */
  onQueryChange?: (query: QueryType) => void;
  /** Loading state change callback */
  onLoadingChange?: (loading: boolean) => void;

  // Feature flags
  /** Feature configuration */
  features?: Partial<FeatureFlags>;
  /** Plugin configuration */
  plugins?: string[];
}

/**
 * Filter configuration item type
 */
export interface FilterConfigItem {
  type: 'input' | 'select' | 'dateRange' | 'number' | 'cascader';
  key: string;
  label: string;
  placeholder?: string;
  value?: unknown;
  onChange: (value: unknown) => void;
  options?: Array<{ label: string; value: unknown }>;
  multiple?: boolean;
  [key: string]: unknown;
}

// FeatureFlags type imported from constants

/**
 * Table configuration properties
 */
export interface TableConfigProps<
  RecordType extends BaseRecord = BaseRecord,
  ServiceType extends ServiceRequestType = ServiceRequestType,
  FormatRecordType extends BaseRecord = RecordType,
> {
  /** Title configuration */
  titleConfig?: TitleConfig;
  /** Search configuration */
  searchConfig?: SearchConfig;
  /** Toolbar configuration */
  toolbarConfig?: ToolbarConfig;
  /** Filter configuration */
  filterConfig?: FilterConfig;
  /** Alert information configuration */
  alertConfig?: AlertConfig;
  /** Loading state configuration */
  loadingConfig?: LoadingConfig;
  /** Pagination configuration */
  paginationConfig?: PaginationConfig;
  /** Footer configuration */
  footerConfig?: FooterConfig;
  /** Table configuration */
  tableConfig?: TableConfig<FormatRecordType>;
  /** Data source configuration */
  dataSourceConfig?: DataSourceConfig<
    ServiceType,
    RecordType,
    Record<string, unknown>,
    FormatRecordType
  >;
  /** Feature flag configuration */
  featureConfig?: FeatureConfig;
  /** Query parameter sync configuration */
  querySyncConfig?: QuerySyncConfig;

  // ========== Lifecycle Configuration ==========
  /** Plugin lifecycle configuration */
  lifecycleConfig?: CustomTableLifecycleConfig;

  /** Callback before component mount */
  onBeforeMount?: (context: PluginContext) => void | Promise<void>;

  /** Callback after component mount */
  onAfterMount?: (context: PluginContext) => void | Promise<void>;

  /** Callback before component update */
  onBeforeUpdate?: (context: PluginContext) => void | Promise<void>;

  /** Callback after component update */
  onAfterUpdate?: (context: PluginContext) => void | Promise<void>;

  /** Callback before component unmount */
  onBeforeUnmount?: (context: PluginContext) => void | Promise<void>;

  /** Callback when plugin is uninstalled */
  onUninstall?: (context: PluginContext) => void | Promise<void>;

  /** Lifecycle execution error handling */
  onLifecycleError?: (
    error: Error,
    phase: LifecyclePhase,
    pluginName: string,
  ) => void;
}

/**
 * Title configuration
 */
export interface TitleConfig {
  title?: string;
  className?: string;
  style?: CSSProperties;
  actions?: ReactNode[];
}

/**
 * Toolbar configuration
 */
export interface ToolbarConfig {
  operations?: ReactNode[];
  customActions?: ReactNode[];
  style?: CSSProperties;
}

/**
 * Filter configuration
 */
export interface FilterConfig {
  isFilterShow?: boolean;
  isFilterAffixed?: boolean;
  isFilterCollection?: boolean;
  filterStyleCfg?: { isWithBackgroundAndBorder: boolean };
  tableFilterWrapperClassName?: string;
  customActionsStyle?: CSSProperties;
  showReset?: boolean;
  operations?: ReactNode[];
  tableFilterProps?: Record<string, unknown>;
}

/**
 * Alert configuration
 */
export interface AlertConfig {
  isAlertShow?: boolean;
  alertType?: 'info' | 'success' | 'warning' | 'error';
  alertContent?: ReactNode;
  customAlertNode?: ReactNode;
}

/**
 * Loading configuration
 */
export interface LoadingConfig {
  useCustomLoading?: boolean;
  loadingTip?: string;
  customLoading?: boolean;
}

/**
 * Pagination configuration
 */
export interface PaginationConfig extends PaginationProps {
  position?: 'top' | 'bottom' | 'both';
}

/**
 * Footer configuration
 */
export interface FooterConfig {
  customFooter?: ReactNode | ((props: Record<string, unknown>) => ReactNode);
  showLoadMore?: boolean;
  loadMoreText?: string;
}

/**
 * Table configuration
 */
export interface TableConfig<RecordType extends BaseRecord = BaseRecord> {
  rowKey?: string | ((record: RecordType) => string);
  tableClassName?: string;
  tableStyle?: CSSProperties;
  tableProps?: ExtendedTableProps<RecordType>;
}

/**
 * Data source configuration
 */
export interface ComponentDataSourceConfig<
  ServiceType extends ServiceRequestType = ServiceRequestType,
  RecordType extends BaseRecord = BaseRecord,
  QueryParams extends Record<string, unknown> = Record<string, unknown>,
  FormatRecordType extends BaseRecord = RecordType,
> extends Partial<TableDataSource<RecordType, QueryParams>> {
  /** Whether enabled */
  enabled?: boolean;
}

// Maintain backward compatibility
export type DataSourceConfig<
  ServiceType extends ServiceRequestType = ServiceRequestType,
  RecordType extends BaseRecord = BaseRecord,
  QueryParams extends Record<string, unknown> = Record<string, unknown>,
  FormatRecordType extends BaseRecord = RecordType,
> = ComponentDataSourceConfig<
  ServiceType,
  RecordType,
  QueryParams,
  FormatRecordType
>;

/**
 * Feature configuration
 */
/**
 * FeatureConfig is already defined in core/common.ts, removed here to avoid duplication
 * If needed, please import from '@/custom-table/types/core' or '@/custom-table/types'
 */

// QuerySyncConfig has been moved to plugins/query-sync.ts, removed export here to avoid duplication
// If needed, please import from '@/custom-table/types/plugins' or '@/custom-table/types'
