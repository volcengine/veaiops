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
 * Column Width Persistence Plugin Utility Functions
 */

import { debounce } from 'lodash-es';
import { PLUGIN_CONSTANTS } from './config';
import type { ColumnWidthInfo, ColumnWidthPersistenceConfig } from './types';

/**
 * generateTableId parameter interface
 */
export interface GenerateTableIdParams {
  title?: string;
  pathname?: string;
}

/**
 * Auto-generate table ID
 */
export function generateTableId({
  title,
  pathname,
}: GenerateTableIdParams = {}): string {
  // Priority: use title to generate ID
  if (title && typeof title === 'string') {
    return title
      .replace(/[\s\-()（）[\]【】]/g, '-')
      .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
      .toLowerCase()
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  // Secondary: use pathname to generate ID
  if (pathname) {
    return pathname
      .split('/')
      .filter(Boolean)
      .join('-')
      .replace(/[^\w-]/g, '')
      .toLowerCase()
      .substring(0, 50);
  }

  // Fallback: use timestamp
  return `table-${Date.now()}`;
}

/**
 * Generate storage key parameter interface
 */
export interface GenerateStorageKeyParams {
  prefix?: string;
  tableId: string;
  dataIndex?: string;
}

/**
 * Generate storage key
 */
export function generateStorageKey({
  prefix,
  tableId,
  dataIndex,
}: GenerateStorageKeyParams): string {
  const parts: string[] = [];

  if (prefix) {
    parts.push(prefix);
  }

  if (tableId) {
    parts.push(tableId);
  }

  if (dataIndex) {
    parts.push(dataIndex);
  }

  return (
    parts.join(PLUGIN_CONSTANTS.STORAGE_KEY_SEPARATOR) || 'default-storage-key'
  );
}

/**
 * Validate column width value parameter interface
 */
export interface ValidateColumnWidthParams {
  width: number;
  config: ColumnWidthPersistenceConfig;
}

/**
 * Validate column width value
 */
export function validateColumnWidth({
  width,
  config,
}: ValidateColumnWidthParams): number {
  const { minColumnWidth = 50, maxColumnWidth = 800 } = config;

  if (typeof width !== 'number' || Number.isNaN(width)) {
    return minColumnWidth;
  }

  return Math.max(minColumnWidth, Math.min(maxColumnWidth, width));
}

/**
 * Detect column width from DOM element
 */
// Support Arco Table Ref objects: getRootDomElement/getRootDOMNode
type RootDomElementProvider = { getRootDomElement: () => HTMLElement };
type RootDOMNodeProvider = { getRootDOMNode: () => HTMLElement };
type TableContainerLike =
  | HTMLElement
  | RootDomElementProvider
  | RootDOMNodeProvider;

function isHTMLElement(input: unknown): input is HTMLElement {
  // Prefer native instance check when available
  if (
    typeof window !== 'undefined' &&
    typeof (window as unknown) === 'object'
  ) {
    return input instanceof HTMLElement;
  }
  // Fallback for non-DOM environments
  return (
    typeof input === 'object' &&
    input !== null &&
    'querySelector' in (input as Record<string, unknown>)
  );
}

function hasGetRootDomElement(input: unknown): input is RootDomElementProvider {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof (input as { getRootDomElement?: unknown }).getRootDomElement ===
      'function'
  );
}

function hasGetRootDOMNode(input: unknown): input is RootDOMNodeProvider {
  return (
    typeof input === 'object' &&
    input !== null &&
    typeof (input as { getRootDOMNode?: unknown }).getRootDOMNode === 'function'
  );
}

function resolveContainerElement(
  input: TableContainerLike,
): HTMLElement | null {
  try {
    if (isHTMLElement(input)) {
      return input;
    }
    if (hasGetRootDomElement(input)) {
      return input.getRootDomElement();
    }
    if (hasGetRootDOMNode(input)) {
      return input.getRootDOMNode();
    }
    return null;
  } catch (error: unknown) {
    // ✅ Silently handle DOM operation errors (avoid blocking functionality), optionally log warnings
    if (process.env.NODE_ENV === 'development') {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      console.warn(
        '[ColumnWidthPersistence] Failed to get root DOM node',
        errorObj.message,
      );
    }
    return null;
  }
}

/**
 * Detect column width from DOM element parameter interface
 */
export interface DetectColumnWidthFromDOMParams {
  tableContainer: TableContainerLike;
  dataIndex: string;
}

export function detectColumnWidthFromDOM({
  tableContainer,
  dataIndex,
}: DetectColumnWidthFromDOMParams): number | null {
  try {
    const containerEl = resolveContainerElement(tableContainer);
    if (!containerEl) {
      return null;
    }
    // Find corresponding column header element
    const headerCell = containerEl.querySelector(
      `th[data-index="${dataIndex}"]`,
    ) as HTMLElement;
    if (!headerCell) {
      return null;
    }

    // Get computed width
    const rect = headerCell.getBoundingClientRect();
    return rect.width;
  } catch (error) {
    // Column width detection failed, return null (silently handle, no logging)
    return null;
  }
}

/**
 * Batch detect all column widths parameter interface
 */
export interface DetectAllColumnWidthsFromDOMParams {
  tableContainer: TableContainerLike;
  dataIndexList: string[];
}

/**
 * Batch detect all column widths
 */
export function detectAllColumnWidthsFromDOM({
  tableContainer,
  dataIndexList,
}: DetectAllColumnWidthsFromDOMParams): Record<string, number> {
  const widths: Record<string, number> = {};

  const containerEl = resolveContainerElement(tableContainer);
  if (!containerEl) {
    return widths;
  }

  // Priority: use index mapping - all th elements under thead correspond one-to-one with dataIndexList
  const headerCells = Array.from(
    containerEl.querySelectorAll('thead th.arco-table-th, thead th'),
  );

  if (headerCells.length >= dataIndexList.length && headerCells.length > 0) {
    for (let i = 0; i < dataIndexList.length; i += 1) {
      const dataIndex = dataIndexList[i];
      const cell = headerCells[i];
      if (cell) {
        const rect = cell.getBoundingClientRect();
        if (rect && typeof rect.width === 'number') {
          widths[dataIndex] = rect.width;
          continue;
        }
      }
      // Fallback to per-column selector detection
      const fallbackWidth = detectColumnWidthFromDOM({
        tableContainer: containerEl,
        dataIndex,
      });
      if (fallbackWidth !== null) {
        widths[dataIndex] = fallbackWidth;
      }
    }
    return widths;
  }

  // Fallback solution: per-column selector detection
  dataIndexList.forEach((dataIndex) => {
    const width = detectColumnWidthFromDOM({
      tableContainer: containerEl,
      dataIndex,
    });
    if (width !== null) {
      widths[dataIndex] = width;
    }
  });

  return widths;
}

/**
 * Create debounced column width detector parameter interface
 */
export interface CreateDebouncedWidthDetectorParams {
  detectFunction: () => void;
  delay: number;
}

/**
 * Create debounced column width detector function
 */
export function createDebouncedWidthDetector({
  detectFunction,
  delay,
}: CreateDebouncedWidthDetectorParams): () => void {
  return debounce(detectFunction, delay, {
    leading: false,
    trailing: true,
  });
}

/**
 * Local storage operation utilities
 */
export const localStorageUtils = {
  /**
   * Save data to local storage
   */
  save<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      // Failed to save to local storage (may be due to insufficient storage space or permission issues)
      return false;
    }
  },

  /**
   * Load data from local storage
   */
  load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      // Failed to read from local storage (may be due to data format error)
      return null;
    }
  },

  /**
   * Remove local storage data
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      // Failed to remove from local storage (may be due to insufficient storage space or permission issues)
      return false;
    }
  },

  /**
   * Check if local storage is available
   */
  isAvailable(): boolean {
    try {
      const testKey = '__test_localStorage__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error: unknown) {
      // ✅ Silently handle localStorage test errors (this is expected when localStorage is unavailable)
      // No need to log warnings, as this is a normal detection flow
      return false;
    }
  },
};

/**
 * Create column width info object parameter interface
 */
export interface CreateColumnWidthInfoParams {
  dataIndex: string;
  width: number;
}

/**
 * Create column width info object
 */
export function createColumnWidthInfo({
  dataIndex,
  width,
}: CreateColumnWidthInfoParams): ColumnWidthInfo {
  return {
    dataIndex,
    width,
    timestamp: Date.now(),
  };
}

/**
 * Compare if two column width mappings are equal
 */
export interface CompareColumnWidthsParams {
  widths1: Record<string, number>;
  widths2: Record<string, number>;
}

export function compareColumnWidths({
  widths1,
  widths2,
}: CompareColumnWidthsParams): boolean {
  const keys1 = Object.keys(widths1);
  const keys2 = Object.keys(widths2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  return keys1.every(
    (key) => keys2.includes(key) && Math.abs(widths1[key] - widths2[key]) < 1,
  );
}

/**
 * Filter valid column width data parameter interface
 */
export interface FilterValidColumnWidthsParams {
  widths: Record<string, number>;
  config: ColumnWidthPersistenceConfig;
}

/**
 * Filter valid column width data
 */
export function filterValidColumnWidths({
  widths,
  config,
}: FilterValidColumnWidthsParams): Record<string, number> {
  const validWidths: Record<string, number> = {};

  Object.entries(widths).forEach(([dataIndex, width]) => {
    const validatedWidth = validateColumnWidth({
      width,
      config,
    });
    if (validatedWidth > 0) {
      validWidths[dataIndex] = validatedWidth;
    }
  });

  return validWidths;
}
