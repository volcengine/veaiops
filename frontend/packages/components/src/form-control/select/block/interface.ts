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

import type { SelectProps } from '@arco-design/web-react';
import type React from 'react';
import type { ReactNode } from 'react';

// Define multi-search field configuration type
export type SearchKeyConfig =
  | {
      key: string;
      valueType?: 'string' | 'number';
    }
  | string;

export type Option<T = Record<string, any>> = {
  label: ReactNode;
  value: string | number;
  disabled?: boolean | undefined;
  extra?: T;
};

export interface OptionsEntity {
  options: Array<Option>;
}

export interface StandardEnum {
  type: string;
  code: string;
  name: string;
  extend: string;
  label?: string;
  category?: string;
  value?: string;
}

/**
 * Optionfy input parameter type
 */
export type OptionfyProps<T> = {
  dataSet: Array<T>;
  labelKey?: string;
  valueKey?: string;
  countKey?: string;
  countKeyUnit?: string;
  isStringItem?: boolean;
  isJoin?: boolean;
  labelRender?: ({ record, _label }: { record: T; _label: any }) => any;
  valueRender?: ({ record, value }: { record: T; value: any }) => any;
  disabledList?: Array<string | number>;
  disabledCheckFunc?: (value: any) => boolean;
  filters?: Partial<T>; // Conditional filtering based on a key
};

export type SelectOption = {
  label: ReactNode | string;
  value: string | number;
  disabled?: boolean;
  extra?: any;
};

export type SelectDataSourceProps = {
  search?: any;
  remoteSearchParams?: any;
  pageReq?: {
    skip: number;
    limit: number;
  };
  value?: any;
};

export interface EnumOptionConfigs {
  key: string;
  enumCacheKey?: string;
  filterCode?: string;
  isStringItem?: boolean;
  labelRender?: ({
    record,
    _label,
  }: { record: Record<string, any>; _label: any }) => any;
  disabledList?: Array<string | number>;
  isValueToNumber?: boolean;
  isValueToBoolean?: boolean;
  disabledCheckFunc?: (value: any) => boolean;
}

/**
 * @title Data source configuration
 */
export type DataSourceSetter = {
  serviceInstance: any;
  api: string;
  payload?: any;
  responseEntityKey: string;
  isJsonParse?: boolean;
  JsonParseEntityKey?: string;
  optionCfg: Partial<OptionfyProps<any>>;
};

/**
 * @title API Select component
 */
export type FinalSelectBlockProps = {
  /**
   * Whether visible
   */
  visible?: boolean;
  /**
   * Async function
   * @defaultValue () => []
   */
  dataSource?:
    | ((props: SelectDataSourceProps) => Promise<any> | any)
    | DataSourceSetter;
  /**
   * Cache key
   */
  cacheKey?: string;
  /**
   * Data source sharing
   */
  dataSourceShare?: boolean;
  /**
   * Whether to act as data source producer
   */
  isFirstHint?: boolean;
  /**
   * Scroll pagination mode
   */
  isScrollFetching?: boolean;
  /**
   * debouncedFetch
   */
  isDebouncedFetch?: boolean;
  /**
   * Virtual scroll request pagination
   */
  pageReq: any;
  /**
   * Dependency parameters
   */
  dependency?: unknown;
  /**
   * Fill default value, default to select first option
   */
  defaultActiveFirstOption?: boolean;
  /**
   * Options change callback
   * @param Options - Updated options array
   */
  onOptionsChange?: (Options: Array<SelectOption>) => void;
  /**
   * Whether to support querying options by value in pagination scenario
   */
  isCascadeRemoteSearch?: boolean;
  /**
   * Key for querying options by value in pagination scenario
   */
  remoteSearchKey?: string;
  /**
   * Search key for query
   */
  searchKey?: string;
  /**
   * Multi-field search configuration, supports searching multiple fields simultaneously
   * @example [{ key: 'fatalId', valueType: 'number' }, { key: 'title', valueType: 'string' }]
   * @example Or shorthand: ['fatalId', 'title']
   */
  multiSearchKeys?: SearchKeyConfig[];
  /**
   * remoteSearchKey format function
   */
  formatRemoteSearchKey?: (v: string) => any;
  /**
   * Whether to trigger options fetching when value is empty
   */
  isValueEmptyTriggerOptions?: boolean;
  /**
   * Frontend enum value configuration
   */
  enumOptionConfig: EnumOptionConfigs;
  /**
   * Whether request conditions are met
   */
  canFetch?: boolean;
  /**
   * Options processing method
   * @param props
   */
  handleOptions?: (props: { options: Option[]; value: any }) => Option[];
  /**
   * Payload processing method
   * @param props
   */
  handleParams?: (params: any) => any;
  /**
   * Custom search method
   * @param props
   */
  _onSearch?: (props: { search: string | null }) => void;
  /**
   * Custom inline DOM
   */
  inlineSuffixDom?: ReactNode;
  /**
   * Wrapper style
   */
  wrapperStyle?: React.CSSProperties;
};

export type VeArchSelectBlockProps = Partial<FinalSelectBlockProps> &
  SelectProps;
