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
/**
 * Table sorting plugin
 */
import type {
  PluginContext,
  PluginFactory,
  TableSortingConfig,
} from '@/custom-table/types';
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import { logger } from '@veaiops/utils';
import { DEFAULT_TABLE_SORTING_CONFIG } from './config';

export const TableSortingPlugin: PluginFactory<TableSortingConfig> = (
  config: TableSortingConfig = {},
) => {
  const finalConfig = { ...DEFAULT_TABLE_SORTING_CONFIG, ...config };

  return {
    name: PluginNames.TABLE_SORTING,
    version: '1.0.0',
    description: 'Table sorting plugin',
    priority: finalConfig.priority || PluginPriorityEnum.MEDIUM,
    enabled: finalConfig.enabled !== false,
    config: finalConfig,
    dependencies: [],
    conflicts: [],

    install(_context: PluginContext) {
      // Operations during installation
    },

    setup(context: PluginContext) {
      // Initialize sorting processing
      const propsWithSortFieldMap = context.props as any;
      const sortFieldMap = propsWithSortFieldMap.sortFieldMap || {};

      // Plugin setup logic - do not call Hooks, only configure
      // Hook calls have been moved to component level
      // Sorting state is managed by external components, only set default values here
      Object.assign(context.state, {
        sorter: context.state.sorter || {},
        sortFieldMap: sortFieldMap || {},
      });

      // Add sorting-related methods to context
      Object.assign(context.helpers, {
        setSorter: context.helpers.setSorter,
        resetSorter: () => {
          // Logic for resetting sorting
          context.helpers.setSorter?.({});
        },
        getSorterParam: () =>
          // Logic for getting sorting parameters
          context.state.sorter,
      });
    },

    update(_context: PluginContext) {
      // Operations when configuration or data is updated
    },

    uninstall(_context: PluginContext) {
      // Cleanup operations during uninstallation
    },

    // Sorting hooks
    hooks: {
      // Get current sorting information
      getSorterInfo: (...args: unknown[]) => {
        const context = args[0] as PluginContext;
        return context.state.sorter || {};
      },

      // Get sorting parameters
      getSorterParam: (...args: unknown[]) => {
        const context = args[0] as PluginContext;
        return context.helpers.getSorterParam?.() || {};
      },

      // Reset sorting
      resetSorter: (...args: unknown[]) => {
        const context = args[0] as PluginContext;
        return context.helpers.resetSorter?.();
      },
    },

    // Handle table change events
    tableEvents: {
      // Handle table sorting change
      onSorterChange(
        context: PluginContext,
        sorter: unknown,
        extra: Record<string, unknown>,
      ) {
        logger.log({
          message: 'onSorterChange called',
          data: {
            action: extra?.action,
            sorter,
            hasSetter: Boolean(context.helpers.setSorter),
          },
          source: 'CustomTable',
          component: 'TableSortingPlugin',
        });
        if (extra?.action === 'sort' && context.helpers.setSorter) {
          context.helpers.setSorter(sorter as any);
          logger.log({
            message: 'setSorter called',
            data: { sorter },
            source: 'CustomTable',
            component: 'TableSortingPlugin',
          });
        }
      },
    },
  } as ReturnType<PluginFactory<TableSortingConfig>>;
};
