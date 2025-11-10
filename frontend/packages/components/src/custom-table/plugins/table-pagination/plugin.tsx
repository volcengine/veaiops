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
 * Table pagination plugin
 */
import { PluginNames } from '@/custom-table/constants/enum';
import type {
  TablePaginationConfig as PaginationConfig,
  PluginFactory,
} from '@/custom-table/types';
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';
import { DEFAULT_TABLE_PAGINATION_CONFIG } from './config';
import {
  type ExtendedPaginationConfig,
  afterUpdate,
  getPaginationConfig,
  getPaginationInfo,
  install,
  renderPagination,
  resetPagination,
  setup,
  uninstall,
} from './core';

/**
 * Table pagination plugin factory function
 */
export const TablePaginationPlugin = (
  config: Partial<PaginationConfig> = {},
): ReturnType<PluginFactory<Partial<PaginationConfig>>> => {
  const extendedConfig = config as ExtendedPaginationConfig;
  const finalConfig: ExtendedPaginationConfig = {
    ...DEFAULT_TABLE_PAGINATION_CONFIG,
    ...config,
    defaultPageSize: extendedConfig.defaultPageSize ?? 10,
    showJumper: extendedConfig.showJumper ?? true,
    showPageSize: extendedConfig.showPageSize ?? true,
  };

  return {
    name: PluginNames.TABLE_PAGINATION,
    version: '1.0.0',
    description: 'Table pagination plugin',
    priority: finalConfig.priority || PluginPriorityEnum.MEDIUM,
    enabled: finalConfig.enabled !== false,
    dependencies: [],
    conflicts: [],

    // Lifecycle methods
    install,
    setup: (context) => setup({ context, finalConfig }),
    afterUpdate,
    uninstall,

    // Pagination hooks
    hooks: {
      getPaginationInfo,
      getPaginationConfig,
      resetPagination,
    },

    // Render methods
    render: {
      pagination: (context) => renderPagination({ context, finalConfig }),
    },
  };
};
