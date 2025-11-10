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
 * Column Width Persistence Plugin Implementation
 * Integrates Arco Table column width detection and persistence functionality,
 * solving the issue of column width changes when paginating
 */

import type {
  ColumnWidthPersistenceConfig,
  ColumnWidthPersistenceState,
  PluginContext,
  PluginFactory,
} from '@/custom-table/types';
import { devLog } from '@/custom-table/utils/log-utils';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import {
  DEFAULT_COLUMN_WIDTH_PERSISTENCE_CONFIG,
  PLUGIN_CONSTANTS,
} from './config';
import { createColumnWidthHelpers } from './helpers';
import { createPluginHooks } from './plugin-hooks';
import { createTableEvents } from './table-events';
import {
  generateStorageKey,
  generateTableId,
  localStorageUtils,
} from './utils';

/**
 * Column Width Persistence Plugin Factory Function
 */
export const ColumnWidthPersistencePlugin: PluginFactory<
  ColumnWidthPersistenceConfig
> = (config: ColumnWidthPersistenceConfig = {}) => {
  const finalConfig = { ...DEFAULT_COLUMN_WIDTH_PERSISTENCE_CONFIG, ...config };
  let pluginTableId = '';

  return {
    name: PLUGIN_CONSTANTS.PLUGIN_NAME,
    version: PLUGIN_CONSTANTS.VERSION,
    description: PLUGIN_CONSTANTS.DESCRIPTION,
    priority: finalConfig.priority || 'medium',
    enabled: finalConfig.enabled !== false,
    dependencies: ['table-columns'], // Depends on table-columns plugin
    conflicts: [],

    install(context: PluginContext) {
      devLog.log({
        component: PLUGIN_CONSTANTS.PLUGIN_NAME,
        message: 'Plugin installed',
      });

      // Initialize plugin state
      Object.assign(context.state, {
        columnWidthPersistence: {
          persistentWidths: {},
          isDetecting: false,
          lastDetectionTime: 0,
          widthHistory: [],
        },
      });
    },

    setup(context: PluginContext) {
      devLog.log({
        component: PLUGIN_CONSTANTS.PLUGIN_NAME,
        message: 'Plugin setup',
      });

      // Get table related information
      const { props } = context;

      // Auto-generate tableId - prioritize user-specified, then auto-generate based on title and path
      const propsWithTitle = props as { tableId?: string; title?: string };
      pluginTableId =
        propsWithTitle.tableId ||
        generateTableId({
          title: propsWithTitle.title,
          pathname:
            typeof window !== 'undefined'
              ? window.location.pathname
              : undefined,
        });

      const stateWithColumns = context.state as { columns?: ColumnProps[] };
      const baseColumns = stateWithColumns.columns || [];

      // Restore column widths from local storage
      if (
        finalConfig.enableLocalStorage &&
        localStorageUtils.isAvailable() &&
        pluginTableId
      ) {
        const storageKey = generateStorageKey({
          prefix: finalConfig.storageKeyPrefix,
          tableId: pluginTableId,
        });
        const savedWidths =
          localStorageUtils.load<Record<string, number>>(storageKey);

        if (savedWidths && Object.keys(savedWidths).length > 0) {
          const currentPersistenceState = (
            context.state as {
              columnWidthPersistence?: ColumnWidthPersistenceState;
            }
          ).columnWidthPersistence;
          Object.assign(context.state, {
            columnWidthPersistence: {
              ...currentPersistenceState,
              persistentWidths: savedWidths,
            },
          });

          // Apply to column configuration
          const updatedColumns = baseColumns.map((col: ColumnProps) => {
            const persistentWidth = savedWidths[col.dataIndex || ''];
            if (persistentWidth && col.dataIndex) {
              return {
                ...col,
                width: persistentWidth,
              };
            }
            return col;
          });

          Object.assign(context.state, { columns: updatedColumns });
        }
      }

      // Store tableId in context for use by other methods
      Object.assign(context.state, {
        columnWidthPersistence: {
          ...(
            context.state as {
              columnWidthPersistence?: Record<string, unknown>;
            }
          ).columnWidthPersistence,
          tableId: pluginTableId, // Store generated tableId
        },
      });

      // Add column width persistence related methods to context
      Object.assign(
        context.helpers,
        createColumnWidthHelpers({
          context,
          config: finalConfig,
          tableId: pluginTableId,
          baseColumns,
        }),
      );
    },

    update(_context: PluginContext) {
      // Operations when configuration or data is updated
      devLog.log({
        component: PLUGIN_CONSTANTS.PLUGIN_NAME,
        message: 'Plugin updated',
      });
    },

    uninstall(_context: PluginContext) {
      // Cleanup operations during uninstallation
      devLog.log({
        component: PLUGIN_CONSTANTS.PLUGIN_NAME,
        message: 'Plugin uninstalled',
      });
    },

    onMount(_context: PluginContext) {
      // Operations after DOM mount, mainly for auto-detection functionality
      devLog.log({
        component: PLUGIN_CONSTANTS.PLUGIN_NAME,
        message: 'Plugin mounted - DOM is ready',
      });
    },

    // Plugin hook methods
    hooks: (() => {
      // Lazy initialize hooks, ensure tableId is set
      if (!pluginTableId) {
        return {};
      }
      return createPluginHooks(finalConfig, pluginTableId);
    })(),

    // Table event handlers
    tableEvents: createTableEvents(),
  };
};
