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
 * 列宽持久化插件工具函数
 *

 *
 */

import { debounce } from 'lodash-es';
import { PLUGIN_CONSTANTS } from './config';
import type { ColumnWidthInfo, ColumnWidthPersistenceConfig } from './types';

/**
 * generateTableId 参数接口
 */
export interface GenerateTableIdParams {
  title?: string;
  pathname?: string;
}

/**
 * 自动生成表格ID
 */
export function generateTableId({
  title,
  pathname,
}: GenerateTableIdParams = {}): string {
  // 优先使用标题生成ID
  if (title && typeof title === 'string') {
    return title
      .replace(/[\s\-()（）[\]【】]/g, '-')
      .replace(/[^\w\-\u4e00-\u9fa5]/g, '')
      .toLowerCase()
      .replace(/^-+|-+$/g, '')
      .substring(0, 50);
  }

  // 其次使用路径生成ID
  if (pathname) {
    return pathname
      .split('/')
      .filter(Boolean)
      .join('-')
      .replace(/[^\w-]/g, '')
      .toLowerCase()
      .substring(0, 50);
  }

  // 最后使用时间戳
  return `table-${Date.now()}`;
}

/**
 * 生成存储键的参数接口
 */
export interface GenerateStorageKeyParams {
  prefix?: string;
  tableId: string;
  dataIndex?: string;
}

/**
 * 生成存储键
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
 * 验证列宽度值的参数接口
 */
export interface ValidateColumnWidthParams {
  width: number;
  config: ColumnWidthPersistenceConfig;
}

/**
 * 验证列宽度值
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
 * 从DOM元素检测列宽度
 */
// 支持 Arco Table Ref 对象：getRootDomElement/getRootDOMNode
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
    // ✅ 静默处理 DOM 操作错误（避免阻塞功能），可选记录警告
    if (process.env.NODE_ENV === 'development') {
      // ✅ Silent mode: Failed to get root DOM node (error logged internally)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
    }
    return null;
  }
}

/**
 * 从DOM元素检测列宽度的参数接口
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
    // 查找对应的列头元素
    const headerCell = containerEl.querySelector(
      `th[data-index="${dataIndex}"]`,
    ) as HTMLElement;
    if (!headerCell) {
      return null;
    }

    // 获取计算后的宽度
    const rect = headerCell.getBoundingClientRect();
    return rect.width;
  } catch (error) {
    // 检测列宽失败，返回 null（静默处理，不记录日志）
    return null;
  }
}

/**
 * 批量检测所有列宽度的参数接口
 */
export interface DetectAllColumnWidthsFromDOMParams {
  tableContainer: TableContainerLike;
  dataIndexList: string[];
}

/**
 * 批量检测所有列宽度
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

  // 优先使用索引映射：thead 下所有 th 与 dataIndexList 一一对应
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
      // 回退到逐列选择器检测
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

  // 回退方案：逐列选择器检测
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
 * 创建防抖的列宽检测函数的参数接口
 */
export interface CreateDebouncedWidthDetectorParams {
  detectFunction: () => void;
  delay: number;
}

/**
 * 创建防抖的列宽检测函数
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
 * 本地存储操作工具
 */
export const localStorageUtils = {
  /**
   * 保存数据到本地存储
   */
  save<T>(key: string, data: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      // 保存到本地存储失败（可能是存储空间不足或权限问题）
      return false;
    }
  },

  /**
   * 从本地存储读取数据
   */
  load<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      // 从本地存储读取失败（可能是数据格式错误）
      return null;
    }
  },

  /**
   * 删除本地存储数据
   */
  remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      // 保存到本地存储失败（可能是存储空间不足或权限问题）
      return false;
    }
  },

  /**
   * 检查本地存储是否可用
   */
  isAvailable(): boolean {
    try {
      const testKey = '__test_localStorage__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error: unknown) {
      // ✅ 静默处理 localStorage 测试错误（这是预期的，当 localStorage 不可用时）
      // 不需要记录警告，因为这是正常的检测流程
      return false;
    }
  },
};

/**
 * 创建列宽信息对象的参数接口
 */
export interface CreateColumnWidthInfoParams {
  dataIndex: string;
  width: number;
}

/**
 * 创建列宽信息对象
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
 * 比较两个列宽映射是否相等
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
 * 过滤有效的列宽数据的参数接口
 */
export interface FilterValidColumnWidthsParams {
  widths: Record<string, number>;
  config: ColumnWidthPersistenceConfig;
}

/**
 * 过滤有效的列宽数据
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
