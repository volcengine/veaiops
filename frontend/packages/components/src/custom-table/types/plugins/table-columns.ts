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
 * Table column management plugin type definition
 */

import type { ColumnProps } from '@arco-design/web-react/es/Table';
import type { PluginBaseConfig } from './core';

/**
 * Table column configuration
 */
export interface TableColumnsConfig extends PluginBaseConfig {
  enabled?: boolean;
  resizable?: boolean;
  sortable?: boolean;
  hideable?: boolean;
  defaultHiddenColumns?: string[];
}

/**
 * Column item configuration
 */
export interface ColumnItem<RecordType = Record<string, unknown>>
  extends Omit<ColumnProps<RecordType>, 'fixed'> {
  key: string;
  dataIndex: string;
  title: string;
  hidden?: boolean;
  fixed?: 'left' | 'right';
  width?: number;
  minWidth?: number;
  maxWidth?: number;
}

/**
 * Table column state
 */
export interface TableColumnsState<RecordType = Record<string, unknown>> {
  columns: ColumnItem<RecordType>[];
  hiddenColumns: string[];
  columnWidths: Record<string, number>;
  columnOrder: string[];
}

/**
 * Table column methods
 */
export interface TableColumnsMethods<RecordType = Record<string, unknown>> {
  showColumn: (columnKey: string) => void;
  hideColumn: (columnKey: string) => void;
  toggleColumn: (columnKey: string) => void;
  setColumnWidth: (columnKey: string, width: number) => void;
  resetColumns: () => void;
  getVisibleColumns: () => ColumnItem<RecordType>[];
  getHiddenColumns: () => ColumnItem<RecordType>[];
}
