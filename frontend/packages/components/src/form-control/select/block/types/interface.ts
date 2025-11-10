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
import type { CSSProperties, ReactNode } from 'react';

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
 * @title API select box
 */
export type FinalSelectBlockProps = {
  /**
   * @zh Whether visible
   */
  visible?: boolean;
  /**
   * @zh Async function
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
   * Debounced fetch
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
   * Fill default value, select first option by default
   */
  defaultActiveFirstOption?: boolean;
  /**
   * Options change callback
   * @param Options
   */
  onOptionsChange?: (Options: Array<SelectOption>) => void;
  /**
   * Whether to support querying option by value in pagination scenario
   */
  isCascadeRemoteSearch?: boolean;
  /**
   * Key for querying option by value in pagination scenario
   */
  remoteSearchKey?: string;
  /**
   * Search key
   */
  searchKey?: string;
  /**
   * Multi-field search configuration, supports searching multiple fields simultaneously
   * Example: [{ key: 'fatalId', valueType: 'number' }, { key: 'title', valueType: 'string' }]
   * Or shorthand: ['fatalId', 'title']
   */
  multiSearchKeys?: SearchKeyConfig[];
  /**
   * remoteSearchKey format function
   */
  formatRemoteSearchKey?: (v: string) => any;
  /**
   * Field name for pasted values, used to specify which API parameter the pasted values should be passed to
   * Example: 'accountIDs', 'userIds', 'ids', etc.
   * If not set, use searchKey or remoteSearchKey
   */
  pasteValueKey?: string;
  /**
   * Paste value processor function, used to customize conversion of pasted values
   * Example: (values) => values.map(v => String(v)) // Ensure all are strings
   * Example: (values) => values.map(v => Number(v)) // Convert to numbers
   * If not set, use default logic
   */
  pasteValueProcessor?: (values: (string | number)[]) => (string | number)[];
  /**
   * Value processor function on onChange, used to convert value types passed to form
   * Example: (values) => values.map(v => Number(v)) // Convert to number type to meet form submission requirements
   * Example: (values) => values.map(v => String(v)) // Convert to string type
   * If not set, keep original type
   */
  onChangeProcessor?: (values: (string | number)[]) => (string | number)[];
  /**
   * Whether to trigger options fetch when value is empty
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
   * @zh Wrapper layer style
   * @en Wrapper style
   */
  wrapperStyle?: CSSProperties;
  /**
   * @zh Whether to allow pasting multiple values
   * @en Allow paste multiple values
   * @defaultValue false
   */
  allowPasteMultiple?: boolean;
  /**
   * @zh Separator array for splitting pasted multiple values
   * @en Token separators for splitting pasted multiple values
   * @defaultValue ['\n', ',', ';', '\t', ' ', '|', '，', '；']
   */
  tokenSeparators?: string[];
  /**
   * @zh Paste event handler callback
   * @en Paste event handler callback
   */
  onPaste?: (pastedValues: string[], event: ClipboardEvent) => void;
  /**
   * @zh Value processor function before pasting
   * @en Value processor before adding pasted values
   */
  beforePasteProcess?: (value: string) => string;
};

export type VeArchSelectBlockProps = Partial<FinalSelectBlockProps> &
  SelectProps;

// Backward compatibility: lowercase alias
// eslint-disable-next-line @typescript-eslint/naming-convention
export type veArchSelectBlockProps = VeArchSelectBlockProps;
