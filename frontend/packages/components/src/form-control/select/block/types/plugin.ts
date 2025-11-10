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

import type {
  DataSourceSetter,
  SearchKeyConfig,
  SelectDataSourceProps,
  SelectOption,
  veArchSelectBlockProps,
} from './interface';

/**
 * Plugin type enumeration
 * Unified management of all plugin identifiers, improving type safety and maintainability
 */
export enum PluginType {
  /** Data fetch plugin */
  DATA_FETCHER = 'data-fetcher',
  /** Search handler plugin */
  SEARCH_HANDLER = 'search-handler',
  /** Pagination plugin */
  PAGINATION = 'pagination',
  /** Paste handler plugin */
  PASTE_HANDLER = 'paste-handler',
  /** Cache handler plugin */
  CACHE_HANDLER = 'cache-handler',
}

/**
 * Plugin base interface
 */
export interface Plugin<T = any> {
  name: string;
  init?: (context: PluginContext) => void | Promise<void>;
  destroy?: () => void;
  config?: T;
}

/**
 * Plugin context, containing component state and methods
 */
export interface PluginContext {
  props: veArchSelectBlockProps;
  state: SelectBlockState;
  setState: (state: Partial<SelectBlockState>) => void;
  utils: PluginUtils;
  getPlugin?: <T extends Plugin>(pluginName: string) => T | undefined;
}

/**
 * Component state interface
 */
export interface SelectBlockState {
  fetchOptions: SelectOption[];
  initFetchOptions: SelectOption[];
  fetching: boolean;
  loading: boolean;
  skip: number;
  searchValue: string;
  canTriggerLoadMore: boolean;
  mounted: boolean;
  stateVersion?: number; // 🔧 Version number for forcing re-render
  lastDataSourceApi?: string; // 🔧 Track last dataSource API to detect dataSource changes
}

/**
 * Plugin utility functions
 */
export interface PluginUtils {
  ensureArray: <T>(value: T | T[] | null | undefined) => T[];
  removeUndefinedValues: (target: any) => any;
  splitPastedText: (text: string, separators?: string[]) => string[];
  sessionStore: {
    get: (key: string, defaultValue?: any) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
  };
}

/**
 * Data fetch plugin interface
 */
export interface DataFetcherPlugin extends Plugin<DataFetcherConfig> {
  fetchByDataSetter: (
    dataSource: DataSourceSetter,
    params: Record<string, any>,
  ) => Promise<SelectOption[]>;
  fetchByFunction: (
    dataSource: (props: SelectDataSourceProps) => Promise<any>,
    params: any,
  ) => Promise<SelectOption[]>;
  fetchData: (
    dataSource:
      | DataSourceSetter
      | ((props: SelectDataSourceProps) => Promise<any>),
    remoteSearchParams: Record<string, any>,
    externalContext?: PluginContext,
  ) => Promise<SelectOption[]>;
  processOptions: (
    options: SelectOption[],
    isAppend?: boolean,
    apiName?: string,
    externalContext?: PluginContext,
  ) => SelectOption[];
  updatePaginationState: (options: SelectOption[], apiName?: string) => void;
  setCacheHandler: (cacheHandler: CacheHandlerPlugin) => void;
}

export interface DataFetcherConfig {
  limit: number;
  handleParams: (params: any) => any;
  handleOptions: (props: {
    options: SelectOption[];
    value: any;
  }) => SelectOption[];
}

/**
 * Search handler plugin interface
 */
export interface SearchHandlerPlugin extends Plugin<SearchHandlerConfig> {
  getSearchParams: (inputValue: string) => Record<string, any>;
  createDebouncedSearch: () => (params: SearchParams) => Promise<boolean>;
  setDataFetcher: (dataFetcher: DataFetcherPlugin) => void;
  setCacheHandler: (cacheHandler: CacheHandlerPlugin) => void;
  createSearchCallback: () =>
    | ((value: string, reason: any) => void)
    | undefined;
}

export interface SearchHandlerConfig {
  searchKey?: string;
  remoteSearchKey?: string;
  multiSearchKeys?: SearchKeyConfig[];
  formatRemoteSearchKey?: (v: string) => any;
  debounceDelay?: number;
}

export interface SearchParams {
  initValue?: any;
  inputValue?: string;
  scroll?: boolean;
  isOptionAppend?: boolean;
}

/**
 * Pagination plugin interface
 */
export interface PaginationPlugin extends Plugin<PaginationConfig> {
  handlePopupScroll: (element: HTMLElement) => Promise<boolean>;
  resetPagination: () => void;
  setSearchHandler: (searchHandler: SearchHandlerPlugin) => void;
  handleVisibleChange: (visible: boolean) => void;
}

export interface PaginationConfig {
  limit: number;
  enabled: boolean;
}

/**
 * Paste handler plugin interface
 */
export interface PasteHandlerPlugin extends Plugin<PasteHandlerConfig> {
  handlePaste: (event: ClipboardEvent) => void;
  createPasteHandler: () => ((event: ClipboardEvent) => void) | undefined;
}

export interface PasteHandlerConfig {
  allowPasteMultiple: boolean;
  tokenSeparators: string[];
  onPaste?: (pastedValues: string[], event: ClipboardEvent) => void;
  beforePasteProcess?: (value: string) => string;
  mode?: string;
}

/**
 * Cache handler plugin interface
 */
export interface CacheHandlerPlugin extends Plugin<CacheHandlerConfig> {
  getFromCache: (key: string) => any;
  setToCache: (key: string, data: any) => void;
  removeFromCache: (key: string) => void;
  scheduleRemoval: (key: string, delay?: number) => void;
}

export interface CacheHandlerConfig {
  cacheKey?: string;
  dataSourceShare: boolean;
  isFirstHint: boolean;
  autoRemoveDelay?: number;
}

/**
 * Plugin manager interface
 */
export interface PluginManager {
  plugins: Map<string, Plugin>;
  context: PluginContext;

  register: <T extends Plugin>(plugin: T) => void;
  unregister: (pluginName: string) => void;
  getPlugin: <T extends Plugin>(pluginName: string) => T | undefined;
  init: () => Promise<void>;
  destroy: () => void;
}
