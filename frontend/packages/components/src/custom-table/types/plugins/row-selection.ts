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
 * Row selection plugin type definition
 * Based on Arco Table RowSelectionProps capability
 */
import type { Key, ReactNode } from 'react';
import type { BaseRecord } from '../core/common';
import type { PluginPriorityEnum } from '../core/enums';
import type { PluginBaseConfig } from './core';

/**
 * Selection strategy
 */
export type SelectionStrategy = 'page' | 'all' | 'smart';

/**
 * Batch action configuration
 */
export interface BatchActionConfig<RecordType extends BaseRecord = BaseRecord> {
  /** Action identifier */
  key: string;
  /** Action title */
  title: string;
  /** Action icon */
  icon?: ReactNode;
  /** Whether is dangerous action */
  danger?: boolean;
  /** Whether disabled */
  disabled?: boolean | ((selectedRows: RecordType[]) => boolean);
  /** Action handler function */
  handler: (
    selectedKeys: Key[],
    selectedRows: RecordType[],
  ) => void | Promise<void>;
  /** Action permission check */
  permission?: (selectedRows: RecordType[]) => boolean;
  /** Action confirmation message */
  confirmText?: string | ((selectedRows: RecordType[]) => string);
}

/**
 * Selection statistics configuration
 */
export interface SelectionStatConfig {
  /** Whether to show statistics */
  show?: boolean;
  /** Custom statistics render */
  render?: (selectedCount: number, totalCount: number) => ReactNode;
  /** Statistics position */
  position?: 'header' | 'footer' | 'both';
}

/**
 * Extended row selection configuration (based on Arco RowSelectionProps)
 */
export interface RowSelectionConfig<RecordType extends BaseRecord = BaseRecord>
  extends PluginBaseConfig {
  // === Arco Table native properties ===
  /** Selection type */
  type?: 'checkbox' | 'radio';
  /** Whether to show select all button */
  checkAll?: boolean;
  /** Whether strict mode (parent-child selection not linked) */
  checkStrictly?: boolean;
  /** Whether to maintain selection across pages */
  checkCrossPage?: boolean;
  /** Whether to preserve selection across pages (alias) */
  preserveAcrossPages?: boolean;
  /** Custom column title */
  columnTitle?: string | ReactNode;
  /** Selection column width */
  columnWidth?: number;
  /** Checkbox properties configuration */
  checkboxProps?: (record: RecordType) => Record<string, unknown>;
  /** Whether to fix selection column */
  fixed?: boolean;
  /** Selected row keys */
  selectedRowKeys?: Key[];
  /** Whether to preserve selection state of deleted data */
  preserveSelectedRowKeys?: boolean;
  /** Custom selection box render */
  renderCell?: (
    originNode: ReactNode,
    checked: boolean,
    record: RecordType,
  ) => ReactNode;

  // === Extended properties ===
  /** Selection strategy */
  strategy?: SelectionStrategy;
  /** Batch action configuration */
  batchActions?: BatchActionConfig<RecordType>[];
  /** Selection statistics configuration */
  selectionStat?: SelectionStatConfig;
  /** Maximum selection count */
  maxSelection?: number;
  /** Function to get row key */
  getRowKey?: (record: RecordType) => Key;

  // === Callback functions ===
  /** Selection change callback */
  onChange?: (selectedKeys: Key[], selectedRows: RecordType[]) => void;
  /** Manual single row selection callback */
  onSelect?: (
    selected: boolean,
    record: RecordType,
    selectedRows: RecordType[],
  ) => void;
  /** Manual select all callback */
  onSelectAll?: (selected: boolean, selectedRows: RecordType[]) => void;
  /** Confirmation before batch action execution */
  beforeBatchAction?: (
    action: BatchActionConfig<RecordType>,
    selectedRows: RecordType[],
  ) => boolean | Promise<boolean>;
}

/**
 * Plugin state
 */
export interface RowSelectionState<RecordType extends BaseRecord = BaseRecord> {
  /** Currently selected keys */
  selectedRowKeys: Key[];
  /** Currently selected row data */
  selectedRows: RecordType[];
  /** Indeterminate state keys */
  indeterminateKeys: Key[];
  /** All selected keys across pages */
  allSelectedKeys: Key[];
  /** Whether all selected */
  isAllSelected: boolean;
  /** Whether indeterminate */
  isIndeterminate: boolean;
  /** Selection statistics */
  selectionStat: {
    selectedCount: number;
    totalCount: number;
    currentPageCount: number;
    selectedPercent: number;
  };
  /** Row selection cache (for cross-page preservation) */
  selectionCache: Map<Key, RecordType>;
}
