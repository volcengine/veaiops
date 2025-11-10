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
 * Column width persistence plugin type definitions
 * Types have been migrated to ../../types/plugins/column-width-persistence.ts
 * This file is kept for backward compatibility with existing references, actual types should be imported from types directory
 */

// Re-export core types
export type {
  ColumnWidthPersistenceConfig,
  ColumnWidthPersistenceState,
  ResizeEvent,
  EnhancedRowCallbackProps,
  ColumnWidthHelpers,
  TablePropsWithColumnWidth,
} from '@/custom-table/types/plugins/column-width-persistence';

// Keep unique interfaces
/**
 * Column width information
 */
export interface ColumnWidthInfo {
  /** Column identifier */
  dataIndex: string;
  /** Column width */
  width: number;
  /** Detection timestamp */
  timestamp: number;
}

/**
 * Column width persistence plugin methods
 */
export interface ColumnWidthPersistenceMethods {
  /** Set persistent width for single column */
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

  /** Clear persistent width for specific column */
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
