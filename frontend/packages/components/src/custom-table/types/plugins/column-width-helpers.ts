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
 * Column width helper utility type definitions
 * Provides type definitions for column width calculation, allocation, persistence and other utility functions
 */

import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';
import type { BaseRecord } from '../core/common';
import type { ColumnResizeEvent, ResizeEvent } from './resize-event';

/**
 * Column width information
 */
export interface ColumnWidthInfo {
  /** Column identifier */
  dataIndex: string;
  /** Current width */
  width: number;
  /** Minimum width */
  minWidth?: number;
  /** Maximum width */
  maxWidth?: number;
  /** Whether resizable */
  resizable?: boolean;
  /** Whether fixed width */
  fixed?: boolean;
  /** Width type */
  widthType?: 'auto' | 'fixed' | 'percentage' | 'flex';
  /** Percentage width (0-100) */
  percentage?: number;
  /** Flex ratio */
  flex?: number;
}

/**
 * Column width allocation strategy
 */
export type ColumnWidthStrategy =
  | 'auto'
  | 'equal'
  | 'content'
  | 'percentage'
  | 'flex'
  | 'custom';

/**
 * Column width allocation configuration
 */
export interface ColumnWidthAllocation {
  /** Allocation strategy */
  strategy: ColumnWidthStrategy;
  /** Minimum total width */
  minTotalWidth?: number;
  /** Maximum total width */
  maxTotalWidth?: number;
  /** Whether to allow overflow */
  allowOverflow?: boolean;
  /** Custom allocation function */
  customAllocator?: (
    columns: ColumnWidthInfo[],
    containerWidth: number,
  ) => ColumnWidthInfo[];
}

/**
 * Column width constraints
 */
export interface ColumnWidthConstraints {
  /** Global minimum column width */
  globalMinWidth?: number;
  /** Global maximum column width */
  globalMaxWidth?: number;
  /** Column-specific constraints */
  columnConstraints?: Record<
    string,
    {
      minWidth?: number;
      maxWidth?: number;
      fixed?: boolean;
    }
  >;
  /** Total width constraints */
  totalWidthConstraints?: {
    min?: number;
    max?: number;
    preferred?: number;
  };
}

/**
 * Column width persistence options
 */
export interface ColumnWidthPersistenceOptions {
  /** Storage key prefix */
  storageKey: string;
  /** Storage type */
  storageType?: 'localStorage' | 'sessionStorage' | 'custom';
  /** Custom storage methods */
  customStorage?: {
    get: (key: string) => string | null;
    set: (key: string, value: string) => void;
    remove: (key: string) => void;
  };
  /** Version control */
  version?: string;
  /** Expiration time (ms) */
  expireTime?: number;
}

/**
 * Column width state
 */
export interface ColumnWidthState {
  /** Current column width mapping */
  widths: Record<string, number>;
  /** Column width history */
  history: ColumnWidthInfo[][];
  /** Whether initialized */
  initialized: boolean;
  /** Last update time */
  lastUpdated: number;
  /** Container width */
  containerWidth: number;
  /** Total column width */
  totalWidth: number;
}

/**
 * Column width calculation result
 */
export interface ColumnWidthCalculation {
  /** Column width information after allocation */
  columns: ColumnWidthInfo[];
  /** Total width */
  totalWidth: number;
  /** Whether changes occurred */
  hasChanges: boolean;
  /** Changed columns */
  changedColumns: string[];
  /** Calculation metadata */
  metadata: {
    strategy: ColumnWidthStrategy;
    containerWidth: number;
    availableWidth: number;
    usedWidth: number;
    remainingWidth: number;
  };
}

/**
 * Column width helper utility function types
 */
export interface ColumnWidthHelpers {
  /** Calculate column width allocation */
  calculateColumnWidths: (
    columns: ColumnProps<BaseRecord>[],
    containerWidth: number,
    allocation: ColumnWidthAllocation,
    constraints?: ColumnWidthConstraints,
  ) => ColumnWidthCalculation;

  /** Apply column width constraints */
  applyConstraints: (
    widthInfo: ColumnWidthInfo,
    constraints: ColumnWidthConstraints,
  ) => ColumnWidthInfo;

  /** Auto-fit column widths */
  autoFitColumns: (
    columns: ColumnProps<BaseRecord>[],
    containerWidth: number,
    strategy?: ColumnWidthStrategy,
  ) => ColumnWidthInfo[];

  /** Distribute equal column widths */
  distributeEqualWidth: (
    columns: ColumnProps<BaseRecord>[],
    availableWidth: number,
  ) => ColumnWidthInfo[];

  /** Calculate column width based on content */
  calculateContentWidth: (
    column: ColumnProps<BaseRecord>,
    data: BaseRecord[],
    maxRows?: number,
  ) => number;

  /** Convert percentage to pixels */
  percentageToPixels: (percentage: number, containerWidth: number) => number;

  /** Convert pixels to percentage */
  pixelsToPercentage: (pixels: number, containerWidth: number) => number;

  /** Validate column width configuration */
  validateColumnWidths: (
    widths: ColumnWidthInfo[],
    constraints?: ColumnWidthConstraints,
  ) => {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  };

  /** Merge column width configurations */
  mergeColumnWidths: (
    defaultWidths: ColumnWidthInfo[],
    userWidths: Partial<ColumnWidthInfo>[],
  ) => ColumnWidthInfo[];

  /** Persist column widths */
  persistColumnWidths: (
    widths: ColumnWidthInfo[],
    options: ColumnWidthPersistenceOptions,
  ) => void;

  /** Restore column widths */
  restoreColumnWidths: (
    defaultWidths: ColumnWidthInfo[],
    options: ColumnWidthPersistenceOptions,
  ) => ColumnWidthInfo[];

  /** Clear persisted column widths */
  clearPersistedWidths: (options: ColumnWidthPersistenceOptions) => void;

  /** Create column width resize handler */
  createResizeHandler: (
    onResize: (event: ColumnResizeEvent) => void,
    debounceMs?: number,
  ) => (dataIndex: string, newWidth: number) => void;

  /** Get responsive column widths */
  getResponsiveColumnWidths: (
    widths: ColumnWidthInfo[],
    breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl',
  ) => ColumnWidthInfo[];

  /** Optimize column width performance */
  optimizeColumnWidths: (
    widths: ColumnWidthInfo[],
    performanceOptions?: {
      maxRenderColumns?: number;
      virtualScrolling?: boolean;
      lazyCalculation?: boolean;
    },
  ) => ColumnWidthInfo[];
}

/**
 * Extended table properties (including column width functionality)
 */
export interface TablePropsWithColumnWidth<
  RecordType extends BaseRecord = BaseRecord,
> {
  /** Column width configuration */
  columnWidth?: {
    /** Column width allocation configuration */
    allocation?: ColumnWidthAllocation;
    /** Column width constraints */
    constraints?: ColumnWidthConstraints;
    /** Persistence options */
    persistence?: ColumnWidthPersistenceOptions;
    /** Responsive breakpoint configuration */
    responsive?: Record<string, Partial<ColumnWidthAllocation>>;
    /** Resize event handling */
    onResize?: (event: ResizeEvent) => void;
  };

  /** Whether column width adjustment is enabled */
  resizable?: boolean;

  /** Default column width */
  defaultColumnWidth?: number;

  /** Minimum column width */
  minColumnWidth?: number;

  /** Maximum column width */
  maxColumnWidth?: number;
}
