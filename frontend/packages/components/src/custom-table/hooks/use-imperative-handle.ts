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
 * CustomTable instance API Hook
 * Refactored based on pro-components excellent design pattern - modular architecture
 *
 * @date 2025-12-19
 */
import type {
  BaseRecord,
  CustomTableHelpers,
  PluginContext,
  PluginManager,
} from '@/custom-table/types';
import type { CustomTableActionType } from '@/custom-table/types/api/action-type';
import type { BaseQuery, RequestManager } from '@/custom-table/types/core';
import { createRequestManager } from '@/custom-table/types/core';
import { resetLogCollector } from '@/custom-table/utils/reset-log-collector';
import type { SorterInfo } from '@arco-design/web-react/es/Table/interface';
import { useCallback, useImperativeHandle, useRef } from 'react';
import {
  createDataActions,
  createExpandActions,
  createFilterActions,
  createPaginationActions,
  createSelectionActions,
  createStateActions,
  createUtilityActions,
} from './imperative';

/**
 * @name Create instance API handling Hook
 * @description Based on pro-components ActionRef design pattern, provides complete table operation API
 */
const useCustomTableImperativeHandle = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  ref: React.Ref<CustomTableActionType<RecordType, QueryType>>,
  context: PluginContext<RecordType, QueryType>,
  state: {
    formattedTableData: RecordType[];
    filters: Record<string, (string | number)[]>;
    sorter: SorterInfo;
    current: number;
    pageSize: number;
    tableTotal: number;
  },
  pluginManager: PluginManager,
) => {
  const { formattedTableData, filters, sorter, current, pageSize, tableTotal } =
    state;

  /** @name Request manager, used to cancel ongoing requests */
  const requestManagerRef = useRef<RequestManager>(createRequestManager());

  /** @name Get current request manager */
  const getRequestManager = useCallback(() => requestManagerRef.current, []);

  // Create operation methods for each functional module
  const dataActions = createDataActions(
    context,
    formattedTableData,
    getRequestManager,
  );
  const paginationActions = createPaginationActions(context, {
    current,
    pageSize,
    tableTotal,
  });
  const selectionActions = createSelectionActions(context, formattedTableData);
  const filterActions = createFilterActions(context, { filters, sorter });
  const stateActions = createStateActions(context);
  const expandActions = createExpandActions(context, formattedTableData);
  const utilityActions = createUtilityActions(
    context,
    formattedTableData,
    pluginManager,
    getRequestManager,
  );

  useImperativeHandle(
    ref,
    () => ({
      // Data operations module
      ...dataActions,

      // Pagination operations module
      ...paginationActions,

      // Selection operations module
      ...selectionActions,

      // Filter and query operations module
      ...filterActions,

      // State operations module
      ...stateActions,

      // Expand operations module
      ...expandActions,

      // Utility operations module
      ...utilityActions,

      // Plugin operations
      executePlugin: ({
        pluginName,
        methodName,
        args = [],
      }: { pluginName: string; methodName: string; args?: unknown[] }) => {
        // Execute plugin method through plugin manager
        const pluginManager = context?.plugins;
        if (
          pluginManager &&
          typeof pluginManager === 'object' &&
          'use' in pluginManager
        ) {
          return (
            pluginManager as {
              use: (params: {
                pluginName: string;
                method: string;
                args?: unknown[];
              }) => unknown;
            }
          ).use({ pluginName, method: methodName, args });
        }
        return undefined;
      },
      renderPlugin: ({
        pluginName,
        renderer,
        args = [],
      }: { pluginName: string; renderer: string; args?: unknown[] }) => {
        // Render plugin content through plugin manager
        const pluginManager = context?.plugins;
        if (
          pluginManager &&
          typeof pluginManager === 'object' &&
          'render' in pluginManager
        ) {
          return (
            pluginManager as {
              render: (params: {
                pluginName: string;
                renderer: string;
                args?: unknown[];
              }) => unknown;
            }
          ).render({ pluginName, renderer, args }) as React.ReactNode;
        }
        return null;
      },

      // State access
      state: context.state,
      helpers: context.helpers as unknown as CustomTableHelpers<
        RecordType,
        QueryType
      >,

      // Data snapshot access
      formattedTableData,
      loading: context.state.loading,
      current,
      pageSize,
      total: tableTotal,
      filters,
      sorter,

      // Missing methods
      setExpandedRowKeys: (keys: (string | number)[]) =>
        context.helpers.setExpandedRowKeys?.(keys),
      selectAll: () => {
        // Select all rows
        const allRowKeys = formattedTableData.map((_, index) =>
          index.toString(),
        );
        context.helpers.setSelectedRowKeys?.(allRowKeys);
      },
      invertSelection: () => {
        // Invert current selection
        const currentSelected = context.state.selectedRowKeys || [];
        const allRowKeys = formattedTableData.map((_, index) =>
          index.toString(),
        );
        const invertedKeys = allRowKeys.filter(
          (key) => !currentSelected.includes(key),
        );
        context.helpers.setSelectedRowKeys?.(invertedKeys);
      },
      clearFilters: () => context.helpers.setFilters({}),
      applyFilters: () => {
        // Apply current filters
        context.helpers.setFilters?.(context.state.filters || {});
      },
      clearSorter: () => context.helpers.resetSorter?.(),
      setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) =>
        context.helpers.setQuery(query),
      getQuery: () => context.state.query || ({} as QueryType),
      resetQuery: () => context.helpers.resetQuery?.(),
      mergeQuery: (query: Partial<QueryType>) =>
        context.helpers.setQuery((prev: QueryType) => ({
          ...prev,
          ...query,
        })),
      getSelectedData: () => selectionActions.getSelectedRows(),

      // Data source operations
      setDataSource: (_dataSource: RecordType[]) => {
        // Set data source implementation
        // Temporary implementation, directly set data
      },

      // Log export functionality
      exportResetLogs: () => {
        resetLogCollector.exportResetLogs();
      },
      getResetLogStats: () => {
        return resetLogCollector.getStats();
      },
    }),
    [
      dataActions,
      paginationActions,
      selectionActions,
      filterActions,
      stateActions,
      expandActions,
      utilityActions,
      getRequestManager,
      context.helpers,
      context?.plugins,
      context.state,
      current,
      filters,
      formattedTableData,
      pageSize,
      sorter,
      tableTotal,
    ],
  );
};

export { useCustomTableImperativeHandle as useImperativeHandle };
