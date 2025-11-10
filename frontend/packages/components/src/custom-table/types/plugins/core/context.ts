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
 * Plugin context and Props type definitions
 */

import type { PaginationProps } from '@arco-design/web-react/es/Pagination/pagination';
import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';
import type { BaseQuery, BaseRecord } from '@veaiops/types';
import type { ReactNode } from 'react';
import type { ArcoScrollConfig } from './base';
import type { CustomTableHelpers, CustomTableState } from './state';

/**
 * Plugin props type
 */
export interface CustomTablePluginProps<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  finalQuery: QueryType;
  baseColumns: ColumnProps<RecordType>[];
  configs: Record<string, unknown>;
  // Base table properties
  rowKey?: string | ((record: RecordType) => string);
  dataSource?: RecordType[];
  loading?: boolean;
  pagination?: PaginationProps | boolean;
  scroll?: ArcoScrollConfig;
  size?: 'mini' | 'small' | 'default' | 'large';
  border?: boolean;
  children?: ReactNode;

  // Title-related configuration
  title?: ReactNode;
  titleClassName?: string;
  titleStyle?: React.CSSProperties;
  actions?: ReactNode;

  // Table core configuration
  tableProps?: Partial<Omit<any, 'columns' | 'data'>>;
  tableClassName?: string;

  // Loading state related configuration
  useCustomLoading?: boolean;
  loadingTip?: string;
  customLoading?: boolean;

  // Filter and Alert related configuration
  showReset?: boolean;
  isAlertShow?: boolean;
  alertType?: 'info' | 'success' | 'warning' | 'error';
  alertContent?: ReactNode;
  customAlertNode?: ReactNode;

  // Custom render configuration
  customRender?: {
    table?: (table: ReactNode) => ReactNode;
    footer?: (props: {
      hasMoreData: boolean;
      needContinue?: boolean;
      onLoadMore: () => void;
    }) => ReactNode;
    [key: string]: unknown;
  };
}

/**
 * Plugin context type (supports Props generic, improves type precision from source)
 *
 * The third generic PProps defaults to CustomTablePluginProps<RecordType, QueryType>,
 * so existing plugins don't need to change; plugins that need custom extended Props can pass a dedicated type at usage.
 */
export interface PluginContext<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
  PProps = CustomTablePluginProps<RecordType, QueryType>,
> {
  readonly props: PProps;
  readonly state: CustomTableState<RecordType, QueryType>;
  readonly helpers: CustomTableHelpers<RecordType, QueryType>;
  readonly methods?: Record<string, unknown>;
  plugins?: Record<string, unknown>;
}
