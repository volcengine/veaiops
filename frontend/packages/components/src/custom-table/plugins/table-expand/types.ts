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
 * Table expand plugin type definitions
 * Based on Arco Table useExpand capability
 */
import type { Key, ReactNode } from 'react';

/**
 * Expand trigger type
 */
export type ExpandTrigger = 'click' | 'doubleClick' | 'icon';

/**
 * Expand content type
 */
export type ExpandContentType = 'nested-table' | 'custom' | 'form' | 'tree';

/**
 * Nested table configuration
 */
export interface NestedTableConfig<RecordType = Record<string, unknown>> {
  /** Child table column configuration */
  columns: Array<Record<string, unknown>>;
  /** Child table data field */
  dataField: string;
  /** Child table props */
  tableProps?: Record<string, unknown>;
}

/**
 * Expand render configuration
 */
export interface ExpandRenderConfig<RecordType = Record<string, unknown>> {
  /** Expand content type */
  type: ExpandContentType;
  /** Nested table configuration */
  nestedTable?: NestedTableConfig<RecordType>;
  /** Custom render function */
  render?: (record: RecordType, index: number) => ReactNode;
  /** Expand content style */
  style?: React.CSSProperties;
  /** Expand content class name */
  className?: string;
}

/**
 * Expand icon configuration
 */
export interface ExpandIconConfig<RecordType = Record<string, unknown>> {
  /** Expand icon */
  expandIcon?: ReactNode;
  /** Collapse icon */
  collapseIcon?: ReactNode;
  /** Icon position */
  position?: 'left' | 'right';
  /** Custom render expand icon */
  render?: (expanded: boolean, record: RecordType) => ReactNode;
}

/**
 * Table expand configuration
 */
export interface TableExpandConfig<RecordType = Record<string, unknown>> {
  /** Whether to enable plugin */
  enabled?: boolean;
  /** Plugin priority */
  priority?: number;
  /** Expand trigger type */
  trigger?: ExpandTrigger;
  /** Default expanded row keys */
  defaultExpandedRowKeys?: Key[];
  /** Expand render configuration */
  renderConfig?: ExpandRenderConfig<RecordType>;
  /** Expand icon configuration */
  iconConfig?: ExpandIconConfig<RecordType>;
  /** Whether to allow expanding multiple rows */
  allowMultipleExpand?: boolean;
  /** Expand change callback */
  onExpandChange?: (
    expanded: boolean,
    record: RecordType,
    expandedRowKeys: Key[],
  ) => void;
  /** Determine if row is expandable */
  rowExpandable?: (record: RecordType) => boolean;
  /** Expanded row style class name */
  expandedRowClassName?:
    | string
    | ((record: RecordType, index: number) => string);
}

/**
 * Plugin state
 */
export interface TableExpandState {
  /** Currently expanded row keys */
  expandedRowKeys: Key[];
  /** Expand status map */
  expandedMap: Map<Key, boolean>;
  /** Whether there are expanded rows */
  hasExpandedRows: boolean;
}
