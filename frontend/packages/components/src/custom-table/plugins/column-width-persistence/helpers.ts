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

import type { PluginContext } from '@/custom-table/types';
import { devLog } from '@/custom-table/utils/log-utils';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { PLUGIN_CONSTANTS } from './config';
import type { ColumnWidthPersistenceConfig } from './types';
import {
  detectAllColumnWidthsFromDOM,
  generateStorageKey,
  localStorageUtils,
  validateColumnWidth,
} from './utils';

/**
 * Type guard: ensure tableId is string type
 */
function assertTableId(tableId: string | undefined): asserts tableId is string {
  if (!tableId) {
    throw new Error('tableId is required');
  }
}

/**
 * CreateColumnWidthHelpers parameter interface
 */
export interface CreateColumnWidthHelpersParams {
  context: PluginContext;
  config: ColumnWidthPersistenceConfig;
  tableId: string | undefined;
  baseColumns: ColumnProps[];
}

/**
 * SetPersistentColumnWidth parameter interface
 */
export interface SetPersistentColumnWidthParams {
  dataIndex: string;
  width: number;
}

/**
 * Create column width persistence plugin helper methods
 */
export function createColumnWidthHelpers({
  context,
  config,
  tableId,
  baseColumns,
}: CreateColumnWidthHelpersParams) {
  return {
    // Set persistent width for a single column
    setPersistentColumnWidth: ({
      dataIndex,
      width,
    }: SetPersistentColumnWidthParams) => {
      const validatedWidth = validateColumnWidth({
        width,
        config,
      });
      const persistenceState = (
        context.state as {
          columnWidthPersistence?: {
            tableId?: string;
            persistentWidths?: Record<string, number>;
          };
        }
      ).columnWidthPersistence;
      const resolvedTableId = persistenceState?.tableId || tableId;
      if (!resolvedTableId) {
        return;
      }
      // After type narrowing, resolvedTableId is definitely not empty
      // Use explicit type declaration to ensure TypeScript recognizes the correct type
      const currentTableId: string = resolvedTableId;
      const currentPersistentWidths = persistenceState?.persistentWidths || {};

      // Update persistence state
      Object.assign(context.state, {
        columnWidthPersistence: {
          ...persistenceState,
          persistentWidths: {
            ...currentPersistentWidths,
            [dataIndex]: validatedWidth,
          },
        },
      });

      // Update column configuration
      const currentColumns =
        (context.state as { columns?: Record<string, unknown>[] }).columns ||
        [];
      const updatedColumns = currentColumns.map(
        (col: Record<string, unknown>) =>
          col.dataIndex === dataIndex ? { ...col, width: validatedWidth } : col,
      );
      Object.assign(context.state, { columns: updatedColumns });

      // Save to local storage
      if (
        config.enableLocalStorage &&
        localStorageUtils.isAvailable() &&
        resolvedTableId
      ) {
        // Use type guard to ensure type narrowing
        assertTableId(resolvedTableId);
        // After type guard, resolvedTableId has been narrowed to string type
        const storageKey = generateStorageKey({
          prefix: config.storageKeyPrefix,
          tableId: resolvedTableId,
        });
        const currentWidths = {
          ...currentPersistentWidths,
          [dataIndex]: validatedWidth,
        };
        localStorageUtils.save(storageKey, currentWidths);
      }

      devLog.log({
        component: PLUGIN_CONSTANTS.PLUGIN_NAME,
        message: `Set persistent width for ${dataIndex}: ${validatedWidth} (tableId: ${currentTableId})`,
      });
    },

    // Batch set persistent column widths
    setBatchPersistentColumnWidths: (widthsMap: Record<string, number>) => {
      const persistenceState = (
        context.state as {
          columnWidthPersistence?: {
            tableId?: string;
            persistentWidths?: Record<string, number>;
          };
        }
      ).columnWidthPersistence;
      const resolvedTableId = persistenceState?.tableId || tableId;
      if (!resolvedTableId) {
        return;
      }
      // After type narrowing, resolvedTableId is definitely not empty
      // Use explicit type declaration to ensure TypeScript recognizes the correct type
      const currentTableId: string = resolvedTableId;
      const currentPersistentWidths = persistenceState?.persistentWidths || {};
      const validatedWidths: Record<string, number> = {};

      // Validate all width values
      Object.entries(widthsMap).forEach(([dataIndex, width]) => {
        validatedWidths[dataIndex] = validateColumnWidth({
          width,
          config,
        });
      });

      // Update persistence state
      Object.assign(context.state, {
        columnWidthPersistence: {
          ...persistenceState,
          persistentWidths: {
            ...currentPersistentWidths,
            ...validatedWidths,
          },
        },
      });

      // Update column configuration
      const currentColumns =
        (context.state as { columns?: Record<string, unknown>[] }).columns ||
        [];
      const updatedColumns = currentColumns.map(
        (col: Record<string, unknown>) => {
          const { dataIndex } = col;
          const persistentWidth =
            typeof dataIndex === 'string'
              ? validatedWidths[dataIndex]
              : undefined;
          if (persistentWidth) {
            return { ...col, width: persistentWidth };
          }
          return col;
        },
      );
      Object.assign(context.state, { columns: updatedColumns });

      // Save to local storage
      if (
        config.enableLocalStorage &&
        localStorageUtils.isAvailable() &&
        resolvedTableId
      ) {
        // Use type guard to ensure type narrowing
        assertTableId(resolvedTableId);
        // After type guard, resolvedTableId has been narrowed to string type
        const storageKey = generateStorageKey({
          prefix: config.storageKeyPrefix,
          tableId: resolvedTableId,
        });
        const currentWidths = {
          ...(persistenceState?.persistentWidths || {}),
          ...validatedWidths,
        };
        localStorageUtils.save(storageKey, currentWidths);
      }

      devLog.log({
        component: PLUGIN_CONSTANTS.PLUGIN_NAME,
        message: `Batch set persistent widths: (tableId: ${currentTableId})`,
        data: validatedWidths,
      });
    },

    // Get persistent column width
    getPersistentColumnWidth: (dataIndex: string): number | undefined => {
      const persistenceState = (
        context.state as {
          columnWidthPersistence?: {
            persistentWidths?: Record<string, number>;
          };
        }
      ).columnWidthPersistence;
      return persistenceState?.persistentWidths?.[dataIndex];
    },

    // Get all persistent column widths
    getAllPersistentColumnWidths: (): Record<string, number> => {
      const persistenceState = (
        context.state as {
          columnWidthPersistence?: {
            persistentWidths?: Record<string, number>;
          };
        }
      ).columnWidthPersistence;
      return persistenceState?.persistentWidths || {};
    },

    // Clear persistent column widths
    clearPersistentColumnWidths: () => {
      const persistenceState = (
        context.state as {
          columnWidthPersistence?: {
            tableId?: string;
            persistentWidths?: Record<string, number>;
          };
        }
      ).columnWidthPersistence;
      const resolvedTableId = persistenceState?.tableId || tableId;
      if (!resolvedTableId) {
        return;
      }
      // After type narrowing, resolvedTableId is definitely not empty
      // Use explicit type declaration to ensure TypeScript recognizes the correct type
      const currentTableId: string = resolvedTableId;

      Object.assign(context.state, {
        columnWidthPersistence: {
          ...persistenceState,
          persistentWidths: {},
        },
      });

      // Clear local storage
      if (config.enableLocalStorage && localStorageUtils.isAvailable()) {
        // resolvedTableId is guaranteed to be non-empty after if (!resolvedTableId) return
        if (!resolvedTableId) {
          return;
        }
        const storageKey = generateStorageKey({
          prefix: config.storageKeyPrefix,
          tableId: resolvedTableId,
        });
        localStorageUtils.remove(storageKey);
      }

      devLog.log({
        component: PLUGIN_CONSTANTS.PLUGIN_NAME,
        message: `Cleared persistent column widths (tableId: ${currentTableId})`,
      });
    },

    // Detect and save current column widths
    detectAndSaveColumnWidths: (tableContainer: HTMLElement) => {
      if (!tableContainer) {
        return;
      }

      const dataIndexList = baseColumns
        .map((col: Record<string, unknown>) => col.dataIndex)
        .filter(
          (index): index is string =>
            typeof index === 'string' && Boolean(index),
        );
      const detectedWidths = detectAllColumnWidthsFromDOM({
        tableContainer,
        dataIndexList,
      });

      if (Object.keys(detectedWidths).length > 0) {
        const helpers = context.helpers as {
          setBatchPersistentColumnWidths?: (
            widthsMap: Record<string, number>,
          ) => void;
        };
        helpers.setBatchPersistentColumnWidths?.(detectedWidths);
      }
    },
  };
}
