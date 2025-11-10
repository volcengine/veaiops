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
import type React from 'react';
import { PLUGIN_CONSTANTS } from './config';
import { detectAllColumnWidthsFromDOM } from './utils';

/**
 * Create plugin hooks methods
 */
export function createPluginHooks(
  config: { enableAutoDetection?: boolean },
  tableId: string | undefined,
) {
  return {
    // Get persistent column widths
    getPersistentColumnWidths(...args: unknown[]) {
      const context = args[0] as PluginContext;
      const persistenceState = (
        context.state as {
          columnWidthPersistence?: {
            persistentWidths?: Record<string, number>;
          };
        }
      ).columnWidthPersistence;
      return persistenceState?.persistentWidths || {};
    },

    // Apply persistent column widths to column configuration
    applyPersistentWidthsToColumns(...args: unknown[]) {
      const context = args[0] as PluginContext;
      const columns = (args[1] as Record<string, unknown>[]) || [];
      const persistenceState = (
        context.state as {
          columnWidthPersistence?: {
            persistentWidths?: Record<string, number>;
          };
        }
      ).columnWidthPersistence;
      const persistentWidths = persistenceState?.persistentWidths || {};

      return columns.map((col) => {
        const persistentWidth = persistentWidths[col.dataIndex as string];
        if (persistentWidth) {
          return { ...col, width: persistentWidth };
        }
        return col;
      });
    },

    // Apply persistent configuration to table properties - default configuration method
    applyPersistentWidths: (...args: unknown[]) => {
      const context = args[0] as PluginContext;
      const originalProps = (args[1] as Record<string, unknown>) || {};

      return {
        // Default enable column width adjustment
        resizable: true,
        // Default enable horizontal scrolling
        scroll: {
          x: 'max-content',
          ...((originalProps.scroll as Record<string, unknown>) || {}),
        },
        // Preserve original properties
        ...originalProps,

        // Enhanced column width adjustment callback
        onHeaderCell: (column: Record<string, unknown>) => {
          const originalOnHeaderCell =
            (typeof originalProps.onHeaderCell === 'function'
              ? originalProps.onHeaderCell(column)
              : {}) || {};

          return {
            ...originalOnHeaderCell,
            onResize: (
              event: React.SyntheticEvent,
              { size }: { size?: { width?: number } },
            ) => {
              // Handle column width adjustment
              if (size?.width && column.dataIndex) {
                const helpers = context.helpers as {
                  setPersistentColumnWidth?: (params: {
                    dataIndex: string;
                    width: number;
                  }) => void;
                };
                if (
                  helpers &&
                  typeof helpers.setPersistentColumnWidth === 'function'
                ) {
                  helpers.setPersistentColumnWidth({
                    dataIndex: column.dataIndex as string,
                    width: size.width,
                  });
                }
              }

              // Call original callback
              if (
                originalOnHeaderCell &&
                typeof originalOnHeaderCell.onResize === 'function'
              ) {
                originalOnHeaderCell.onResize(event, { size });
              }
            },
          };
        },

        // Enhanced table reference callback for DOM detection
        ref: (tableRef: HTMLElement) => {
          if (tableRef && config.enableAutoDetection) {
            // Delay detection to ensure DOM is fully rendered and helpers methods are ready
            setTimeout(() => {
              const helpers = context.helpers as unknown as {
                detectAndSaveColumnWidths?: (ref: HTMLElement) => void;
                setBatchPersistentColumnWidths?: (
                  widths: Record<string, number>,
                ) => void;
              };
              if (
                helpers &&
                typeof helpers.detectAndSaveColumnWidths === 'function'
              ) {
                helpers.detectAndSaveColumnWidths(tableRef);
              } else {
                // Fallback: directly perform column width detection and save here to avoid loss when helpers are not injected
                try {
                  const stateWithBaseColumns = context.state as unknown as {
                    baseColumns?: Array<{ dataIndex?: string }>;
                  };
                  const columnsForDetect =
                    stateWithBaseColumns.baseColumns || [];
                  const dataIndexList = Array.isArray(columnsForDetect)
                    ? columnsForDetect
                        .map(
                          (col) =>
                            col && (col as { dataIndex?: string }).dataIndex,
                        )
                        .filter(Boolean)
                    : [];
                  if (
                    dataIndexList.length > 0 &&
                    typeof detectAllColumnWidthsFromDOM === 'function'
                  ) {
                    const detectedWidths = detectAllColumnWidthsFromDOM({
                      tableContainer: tableRef,
                      dataIndexList: dataIndexList as string[],
                    });
                    if (
                      helpers &&
                      typeof helpers.setBatchPersistentColumnWidths ===
                        'function' &&
                      detectedWidths &&
                      Object.keys(detectedWidths).length > 0
                    ) {
                      helpers.setBatchPersistentColumnWidths(detectedWidths);
                      devLog.log({
                        component: PLUGIN_CONSTANTS.PLUGIN_NAME,
                        message:
                          'Fallback applied: detected widths saved via setBatchPersistentColumnWidths',
                        data: detectedWidths,
                      });
                      // Also supplement helpers.detectAndSaveColumnWidths at this time to avoid missing it again later
                      (
                        helpers as unknown as {
                          detectAndSaveColumnWidths?: (
                            container: HTMLElement,
                          ) => void;
                        }
                      ).detectAndSaveColumnWidths = (
                        container: HTMLElement,
                      ) => {
                        const againDetected = detectAllColumnWidthsFromDOM({
                          tableContainer: container,
                          dataIndexList: dataIndexList as string[],
                        });
                        if (
                          againDetected &&
                          Object.keys(againDetected).length > 0
                        ) {
                          helpers.setBatchPersistentColumnWidths?.(
                            againDetected,
                          );
                        }
                      };
                    }
                  }
                } catch (_fallbackError) {
                  // Silently handle errors
                }
              }
            }, 100);
          }

          // Call original ref
          if (typeof originalProps.ref === 'function') {
            originalProps.ref(tableRef);
          } else if (
            originalProps.ref &&
            typeof originalProps.ref === 'object' &&
            'current' in originalProps.ref
          ) {
            (originalProps.ref as { current: unknown }).current = tableRef;
          }
        },
      };
    },

    // Create enhanced Table component props, integrate column width detection (compatible with old method name)
    enhanceTableProps(...args: unknown[]) {
      const _context = args[0] as PluginContext;
      const originalProps = (args[1] as Record<string, unknown>) || {};

      return {
        // Default enable column width adjustment
        resizable: true,
        // Default enable horizontal scrolling
        scroll: {
          x: 'max-content',
          ...((originalProps.scroll as Record<string, unknown>) || {}),
        },
        // Preserve original properties
        ...originalProps,
      };
    },
  };
}
