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

// import { ColumnWidthPersistencePlugin } from '@/custom-table/plugins/column-width-persistence';
/**
 * CustomTable default plugin configuration
 */
import { DataSourcePlugin } from '@/custom-table/plugins/data-source';
// import { QuerySyncPlugin } from '@/custom-table/plugins/query-sync';
import { TableAlertPlugin } from '@/custom-table/plugins/table-alert';
import { TableColumnsPlugin } from '@/custom-table/plugins/table-columns';
import { TableFilterPlugin } from '@/custom-table/plugins/table-filter';
import { TablePaginationPlugin } from '@/custom-table/plugins/table-pagination';
import { TableSortingPlugin } from '@/custom-table/plugins/table-sorting';
import { PluginPriorityEnum } from '@/custom-table/types/core/enums';

/**
 * Default plugin configuration list
 */
export const DEFAULT_PLUGINS = [
  // Data source processing
  DataSourcePlugin({
    enabled: true,
    priority: PluginPriorityEnum.HIGH,
  }),

  // Column management
  TableColumnsPlugin({
    enabled: true,
    priority: PluginPriorityEnum.HIGH,
  }),

  // Column width persistence - high priority, needs to execute after column management
  // ColumnWidthPersistencePlugin({
  //   enabled: true,
  //   priority: PluginPriorityEnum.HIGH,
  // }),

  // Query parameter synchronization
  // QuerySyncPlugin,

  // Table filtering
  TableFilterPlugin({
    enabled: true,
    priority: PluginPriorityEnum.MEDIUM,
  }),

  // Sorting functionality
  TableSortingPlugin({
    enabled: true,
    priority: PluginPriorityEnum.MEDIUM,
  }),

  // Pagination functionality
  TablePaginationPlugin({
    enabled: true,
    priority: PluginPriorityEnum.MEDIUM,
  }),

  // Alert information - 🐛 Re-enabled, using simplified implementation
  TableAlertPlugin({
    enabled: true,
    priority: PluginPriorityEnum.LOW,
  }),
];
