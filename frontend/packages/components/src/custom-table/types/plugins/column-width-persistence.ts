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
 * Column width persistence plugin type definition - in types module
 *

 *
 */

import type { ColumnProps } from '@arco-design/web-react/es/Table';
import type { RowCallbackProps } from '@arco-design/web-react/es/Table/interface';
import type React from 'react';
import type { PluginBaseConfig } from './core';

/**
 * Column width persistence plugin configuration
 */
export interface ColumnWidthPersistenceConfig extends PluginBaseConfig {
  /** Whether column width persistence is enabled */
  enabled?: boolean;

  /** Whether to enable automatic detection of column width changes */
  enableAutoDetection?: boolean;

  /** Debounce time for column width detection (ms) */
  detectionDelay?: number;

  /** Storage key prefix */
  storageKeyPrefix?: string;

  /** Whether to enable local storage persistence */
  enableLocalStorage?: boolean;

  /** Minimum column width limit */
  minColumnWidth?: number;

  /** Maximum column width limit */
  maxColumnWidth?: number;
}

/**
 * Resize event
 */
export interface ResizeEvent {
  size: { width: number; height: number };
}

/**
 * Enhanced row callback properties
 */
export interface EnhancedRowCallbackProps extends RowCallbackProps {
  onResize?: (event: React.SyntheticEvent, data: ResizeEvent) => void;
}

/**
 * Column width helper function interface
 */
export interface ColumnWidthHelpers {
  setPersistentColumnWidth: (dataIndex: string, width: number) => void;
  setBatchPersistentColumnWidths: (widths: Record<string, number>) => void;
  getAllPersistentColumnWidths: () => Record<string, number>;
  detectAndSaveColumnWidths: (tableRef: HTMLElement) => void;
}

/**
 * Column width persistence state
 */
export interface ColumnWidthPersistenceState {
  /** Persistent column width mapping */
  persistentWidths: Record<string, number>;
  /** Table ID */
  tableId?: string;
  /** Whether currently detecting column width */
  isDetecting?: boolean;
  /** Last detection time */
  lastDetectionTime?: number;
  /** Column width history */
  widthHistory?: Array<{ timestamp: number; widths: Record<string, number> }>;
}

/**
 * Table properties with column width
 */
export interface TablePropsWithColumnWidth {
  onHeaderCell?: (column: ColumnProps, index?: number) => RowCallbackProps;
  scroll?: { x?: string | number; y?: string | number };
  [key: string]: unknown;
}

/**
 * Column width persistence plugin methods
 */
export interface ColumnWidthPersistenceMethods {
  /** Set persistent width for a single column */
  setPersistentColumnWidth: (params: {
    dataIndex: string;
    width: number;
  }) => void;

  /** Batch set persistent column widths */
  setBatchPersistentColumnWidths: (widthsMap: Record<string, number>) => void;

  /** Get persistent column width */
  getPersistentColumnWidth: (dataIndex: string) => number | undefined;

  /** Get all persistent column widths */
  getAllPersistentColumnWidths: () => Record<string, number>;

  /** Clear persistent width for a single column */
  clearPersistentColumnWidth: (dataIndex: string) => void;

  /** Clear all persistent column widths */
  clearAllPersistentColumnWidths: () => void;

  /** Detect current column widths from DOM */
  detectCurrentColumnWidths: () => Promise<Record<string, number>>;

  /** Save current column widths to persistent storage */
  saveCurrentColumnWidths: () => Promise<void>;

  /** Restore column widths from persistent storage */
  restoreColumnWidths: () => Promise<void>;

  /** Apply column widths to table */
  applyColumnWidths: (widthsMap: Record<string, number>) => void;
}
