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

import { PluginNames } from '@/custom-table/constants/enum';
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import type {
  PluginContext,
  PluginFactory,
} from '@/custom-table/types/plugins';
import type { TableFilterConfig } from '@/custom-table/types/plugins/table-filter';
import { Filters } from '@/filters';
import type { FieldItem } from '@/filters';
/**
 * Table Filter Plugin
 */
// Use the new Filters component (plugin-based filter)
import { logger } from '@veaiops/utils';
import { DEFAULT_TABLE_FILTER_CONFIG } from './config';
import { readFiltersPluginProps } from './props';

// 🔍 TableFilter log collector
interface TableFilterLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: any;
}

interface TableFilterLogParams {
  level: TableFilterLogEntry['level'];
  component: string;
  message: string;
  data?: any;
}

class TableFilterLogger {
  private logs: TableFilterLogEntry[] = [];
  private enabled = true;

  log({ level, component, message, data }: TableFilterLogParams): void {
    if (!this.enabled) {
      return;
    }

    const entry: TableFilterLogEntry = {
      timestamp: Date.now(),
      level,
      component,
      message,
      data,
    };

    this.logs.push(entry);

    // ✅ Unified use of @veaiops/utils logger (logger internally handles console output)
    const logData = data ? { data } : undefined;
    switch (level) {
      case 'error':
        logger.error({
          message,
          data: logData,
          source: 'CustomTable',
          component: `TableFilterPlugin/${component}`,
        });
        break;
      case 'warn':
        logger.warn({
          message,
          data: logData,
          source: 'CustomTable',
          component: `TableFilterPlugin/${component}`,
        });
        break;
      case 'debug':
        logger.debug({
          message,
          data: logData,
          source: 'CustomTable',
          component: `TableFilterPlugin/${component}`,
        });
        break;
      default:
        logger.info({
          message,
          data: logData,
          source: 'CustomTable',
          component: `TableFilterPlugin/${component}`,
        });
        break;
    }
  }

  info({
    component,
    message,
    data,
  }: { component: string; message: string; data?: any }): void {
    this.log({ level: 'info', component, message, data });
  }

  warn({
    component,
    message,
    data,
  }: { component: string; message: string; data?: any }): void {
    this.log({ level: 'warn', component, message, data });
  }

  error({
    component,
    message,
    data,
  }: { component: string; message: string; data?: any }): void {
    this.log({ level: 'error', component, message, data });
  }

  debug({
    component,
    message,
    data,
  }: { component: string; message: string; data?: any }): void {
    this.log({ level: 'debug', component, message, data });
  }

  getLogs(): TableFilterLogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

const tableFilterLogger = new TableFilterLogger();

// Expose to global for log export system
if (typeof window !== 'undefined') {
  (window as any).getTableFilterLogs = () => tableFilterLogger.getLogs();
}

export const TableFilterPlugin: PluginFactory<TableFilterConfig> = (
  config: TableFilterConfig = {},
) => {
  const finalConfig = { ...DEFAULT_TABLE_FILTER_CONFIG, ...config };

  // 🔧 Cache handleChangeAdapter and configs to avoid recreating on each render
  let cachedHandleChange: any = null;
  let cachedHandleChangeAdapter: any = null;
  let cachedConfigs: any = null;
  let cachedQuery: any = null;
  let cachedHandleFilters: any = null; // 🔥 New: Cache handleFilters function reference

  // 🚀 New: Plugin instance ID for tracking the lifecycle of the same plugin instance
  const pluginInstanceId = `TableFilterPlugin-${Date.now()}-${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  return {
    name: PluginNames.TABLE_FILTER,
    version: '1.0.0',
    description: 'Table Filter Plugin',
    priority: finalConfig.priority || PluginPriorityEnum.MEDIUM,
    enabled: finalConfig.enabled !== false,
    dependencies: [],
    conflicts: [],

    install(_context: PluginContext) {
      // 🔧 Critical fix: Clear cache on installation to avoid using old page cache during route switching
      const hadCache = cachedConfigs !== null;
      const oldCacheSnapshot = hadCache
        ? cachedConfigs?.map((c: any) => ({
            type: c.type,
            label: c.componentProps?.addBefore,
          }))
        : null;

      // Clear cache
      cachedHandleChange = null;
      cachedHandleChangeAdapter = null;
      cachedConfigs = null;
      cachedQuery = null;

      tableFilterLogger.info({
        component: 'Plugin',
        message: '🎬 Plugin installation',
        data: {
          pluginInstanceId,
          hadOldCache: hadCache,
          oldCacheSnapshot,
          cacheCleared: true,
          timestamp: new Date().toISOString(),
        },
      });
    },

    setup(context: PluginContext) {
      // Initialize filter logic
      const {
        props: {
          // 🎯 Get showReset from props, prioritize props value
          showReset: propsShowReset,
        },
      } = context;

      // 🎯 Prioritize showReset from props, otherwise use config default value
      const effectiveShowReset =
        propsShowReset !== undefined ? propsShowReset : finalConfig.showReset;

      // Plugin setup logic - Don't call Hooks, only configure
      // Hook calls have been moved to component level
      // Directly use values from props to set state
      Object.assign(context.state, {
        filterConfigs: finalConfig.filterConfigs || [],
        isFilterShow: finalConfig.isFilterShow,
        isFilterAffixed: finalConfig.isFilterAffixed,
        isFilterCollection: finalConfig.isFilterCollection,
        filterStyleCfg: finalConfig.filterStyleCfg || {},
        showReset: effectiveShowReset,
      });

      Object.assign(context.helpers, {
        resetFilterValues: () => {
          // Filter reset implementation based on Arco Table
          // Reset all filter values to initial state
          Object.assign(context.state, {
            filters: {},
            filterValues: {},
            activeFilters: {},
          });
          // Trigger data reload
          if (context.helpers.reload) {
            context.helpers.reload();
          }
        },
      });
    },

    update(_context: PluginContext) {
      // Operations when configuration or data is updated
    },

    uninstall(_context: PluginContext) {
      // Cleanup operations during uninstallation
      tableFilterLogger.info({
        component: 'Plugin',
        message: '🔚 Plugin uninstallation',
        data: {
          pluginInstanceId,
          hadCachedConfigs: cachedConfigs !== null,
          cachedConfigsLength: cachedConfigs?.length || 0,
          cachedConfigsSnapshot: cachedConfigs?.map((c: any) => ({
            type: c.type,
            label: c.componentProps?.addBefore,
          })),
          timestamp: new Date().toISOString(),
        },
      });

      // 🚀 Clear cache - This is critical! Must clear to allow new page to regenerate configs
      cachedHandleChange = null;
      cachedHandleChangeAdapter = null;
      cachedConfigs = null;
      cachedQuery = null;

      tableFilterLogger.info({
        component: 'Plugin',
        message: '✅ Cache cleared',
        data: {
          pluginInstanceId,
          timestamp: new Date().toISOString(),
        },
      });
    },

    // Filter hooks
    hooks: {
      resetFilters: (...args: unknown[]) => {
        const context = args[0] as PluginContext;
        return context.helpers.resetFilterValues?.();
      },
    },

    // Render methods
    render: {
      // Render filter
      filter(context: PluginContext) {
        tableFilterLogger.info({
          component: 'Plugin',
          message: '🎨 render.filter called',
          data: {
            pluginInstanceId,
            timestamp: new Date().toISOString(),
          },
        });

        const {
          state: { query },
          helpers: { reset, handleChange },
        } = context;

        tableFilterLogger.info({
          component: 'Plugin',
          message: '📊 Context state',
          data: {
            pluginInstanceId,
            query,
            queryKeys: Object.keys(query || {}),
            hasReset: typeof reset === 'function',
            hasHandleChange: typeof handleChange === 'function',
          },
        });

        // Source fix: Use strong typing to read extended props, avoid loose assertions
        const {
          handleFilters,
          handleFiltersProps = {},
          isFilterShow = true,
          filterStyleCfg,
          showReset: propsShowReset,
          operations = [],
          customActions = [],
          customActionsStyle,
          tableFilterProps = {},
          tableFilterWrapperClassName = '',
          finalQuery,
        } = readFiltersPluginProps(context);

        // 🎯 Prioritize showReset from props, default to true if not provided
        const effectiveShowReset =
          propsShowReset !== undefined ? propsShowReset : true;

        if (
          !isFilterShow ||
          !handleFilters ||
          typeof handleFilters !== 'function'
        ) {
          return null;
        }

        // Dynamically generate filter configuration
        // 🔧 Critical fix: Cache handleChangeAdapter to avoid creating new function on each render
        if (cachedHandleChange !== handleChange) {
          cachedHandleChange = handleChange;
          cachedHandleChangeAdapter = (k: unknown, v: unknown) => {
            tableFilterLogger.info({
              component: 'handleChangeAdapter',
              message: '📥 handleChangeAdapter called',
              data: {
                key: k,
                value: v,
                timestamp: new Date().toISOString(),
              },
            });
            // context.helpers.handleChange accepts (keyOrObject, value?, handleFilter?, ctx?)
            cachedHandleChange?.(k as any, v);
          };
        }

        // 🔧 Critical fix: Check if query or handleFilters function has changed
        const queryChanged =
          JSON.stringify(cachedQuery) !== JSON.stringify(query);
        const handleFiltersChanged = cachedHandleFilters !== handleFilters;

        if (queryChanged || handleFiltersChanged || !cachedConfigs) {
          let changeReason = 'first render';
          if (queryChanged) {
            changeReason = 'query changed';
          } else if (handleFiltersChanged) {
            changeReason = 'handleFilters function changed';
          }

          tableFilterLogger.info({
            component: 'Plugin',
            message: '🔄 Regenerating configs',
            data: {
              pluginInstanceId,
              reason: changeReason,
              queryChanged,
              handleFiltersChanged,
              oldQuery: cachedQuery,
              newQuery: query,
              oldQueryString: JSON.stringify(cachedQuery),
              newQueryString: JSON.stringify(query),
              timestamp: new Date().toISOString(),
            },
          });

          cachedQuery = query;
          cachedHandleFilters = handleFilters;
          cachedConfigs =
            handleFilters({
              query,
              handleChange: cachedHandleChangeAdapter,
              handleFiltersProps,
            }) || [];

          tableFilterLogger.info({
            component: 'Plugin',
            message: '✨ Configs generation completed',
            data: {
              pluginInstanceId,
              configsLength: cachedConfigs?.length || 0,
              configFields:
                cachedConfigs?.map((c: any) => ({
                  field: c.field,
                  type: c.type,
                  label: c.label || c.componentProps?.addBefore || c.addBefore,
                  placeholder: c.componentProps?.placeholder || c.placeholder,
                  optionsLength: c.componentProps?.options?.length || 0, // 🔥 New: Display options length
                  hasOptions: Boolean(c.componentProps?.options),
                })) || [],
            },
          });
        } else {
          tableFilterLogger.debug({
            component: 'Plugin',
            message: '✅ Using cached configs',
            data: {
              pluginInstanceId,
              configsLength: cachedConfigs?.length || 0,
              cachedQueryString: JSON.stringify(cachedQuery),
              currentQueryString: JSON.stringify(query),
              handleFiltersSame: cachedHandleFilters === handleFilters,
            },
          });
        }

        const configs = cachedConfigs;

        // Debug log: Confirm filter configuration
        if (process.env.NODE_ENV === 'development') {
          logger.info({
            message: 'Rendering filter with configs',
            data: {
              configsLength: configs.length,
              query,
              hasHandleChange: typeof handleChange === 'function',
            },
            source: 'CustomTable',
            component: 'TableFilterPlugin',
          });
        }

        if (!configs.length) {
          return null;
        }

        // Legacy CustomFields dynamic nodes are no longer used in this plugin, removed to avoid unused variable warnings

        // Normalize filterStyle to ensure it meets Filters' FilterStyle type requirements
        const filterStyleSafe: {
          isWithBackgroundAndBorder: boolean;
          style?: React.CSSProperties;
        } =
          typeof filterStyleCfg === 'object' && filterStyleCfg !== null
            ? {
                isWithBackgroundAndBorder:
                  (filterStyleCfg as any).isWithBackgroundAndBorder ?? true,
                style: (filterStyleCfg as any).style,
              }
            : { isWithBackgroundAndBorder: true };

        // Aggregate legacy TableFilter props into intermediate object
        // And explicitly assert configs as FieldItem[] to satisfy Filters' type requirements
        const configsTyped = configs as unknown as FieldItem[];

        const filterProps = {
          config: configsTyped, // FieldItem[] configuration
          query: finalQuery || query,
          // Legacy boolean switches remain at plugin level, not passed to Filters
          resetFilterValues: (props?: { resetEmptyData?: boolean }) => {
            reset?.(props || { resetEmptyData: false });
          },
          showReset: effectiveShowReset,
          actions: operations || [],
          customActions: customActions || [],
          customActionsStyle,
          className: tableFilterWrapperClassName || '',
          filterStyle: filterStyleSafe,
          ...tableFilterProps,
        };

        // Debug log: Confirm props passed to Filters (migration)
        if (process.env.NODE_ENV === 'development') {
          logger.info({
            message: 'Mapped Filters props',
            data: {
              configLength: configs.length,
              isFilterShow,
              query,
              hasResetFunction:
                typeof filterProps.resetFilterValues === 'function',
              tableFilterWrapperClassName,
              filterStyleCfg,
            },
            source: 'CustomTable',
            component: 'TableFilterMigration',
          });
        }

        // Map legacy TableFilter props to new Filters component Props
        const mappedProps = {
          config: filterProps.config,
          query: filterProps.query,
          showReset: Boolean(filterProps.showReset),
          // Wrap reset, add before/after snapshot logs to help locate "default values cleared" issue
          resetFilterValues: (props?: { resetEmptyData?: boolean }) => {
            if (process.env.NODE_ENV === 'development') {
              logger.info({
                message: 'TableFilter reset click',
                data: {
                  queryBefore: context.state?.query,
                  resetProps: props,
                },
                source: 'CustomTable',
                component: 'TableFilterPlugin',
              });
            }
            // Always trigger table reset in non-clearing mode (restore defaults)
            reset?.(props || { resetEmptyData: false });
            // Read query snapshot in next macro task
            setTimeout(() => {
              if (process.env.NODE_ENV === 'development') {
                logger.info({
                  message: 'TableFilter reset after',
                  data: {
                    queryAfter: context.state?.query,
                  },
                  source: 'CustomTable',
                  component: 'TableFilterPlugin',
                });
              }
            }, 0);
          },
          // Convert original actions/customActions to ReactNode type to match FiltersProps
          actions: (filterProps.actions || []) as React.ReactNode[],
          customActions: (filterProps.customActions || []) as
            | React.ReactNode[]
            | React.ReactNode,
          customActionsStyle: filterProps.customActionsStyle as
            | React.CSSProperties
            | undefined,
          // New component supports wrapperClassName, legacy component uses className as outer wrapper class name
          className: '',
          wrapperClassName: filterProps.className || '',
          // Normalized filterStyle that meets FilterStyle requirements
          filterStyle: filterProps.filterStyle as {
            isWithBackgroundAndBorder: boolean;
            style?: React.CSSProperties;
          },
        };

        return <Filters {...mappedProps} />;
      },
    },
  };
};
