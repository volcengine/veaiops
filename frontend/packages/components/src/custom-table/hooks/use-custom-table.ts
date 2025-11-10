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

import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';

import type {
  BaseQuery,
  BaseRecord,
  ColumnItem,
  CustomTablePluginProps,
  CustomTableProps,
  ModernTableColumnProps,
  PluginContext,
  ServiceRequestType,
} from '@/custom-table/types';
import type { CustomTableColumnProps } from '@/custom-table/types/components';
import { devLog } from '@/custom-table/utils/log-utils';
import { usePerformanceLogging } from '@/custom-table/utils/performance-logger';
import { logger } from '@veaiops/utils';
import React, { useMemo } from 'react';
import { useTableHelpers, useTableState } from './internal/index';
import { useDataSource } from './use-data-source';
import { useQuerySync } from './use-query-sync';
import { useTableColumns } from './use-table-columns';
import { createTypedQuery } from './utils/type-converters';
import { useColumnProcessing } from './utils/use-column-processing';
import { usePluginContext } from './utils/use-plugin-context';
import { useSideEffects } from './utils/use-side-effects';

/**
 * @name CustomTable main Hook
 * @description Refactored based on modular architecture, integrates all functional sub-modules
 */
export const useCustomTable = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
  ServiceType extends ServiceRequestType = ServiceRequestType,
  FormatRecordType extends BaseRecord = RecordType,
>(
  props: CustomTableProps<RecordType, QueryType, ServiceType, FormatRecordType>,
): PluginContext<RecordType, QueryType> => {
  // 🎯 Record useCustomTable execution start
  const hookInstanceId = React.useRef(
    `useCustomTable-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  );

  // 🚀 New: Hook mount logging
  React.useEffect(() => {
    const currentHookInstanceId = hookInstanceId.current;
    devLog.log({
      component: 'useCustomTable',
      message: '🎬 Hook mounted',
      data: {
        hookInstanceId: currentHookInstanceId,
        timestamp: new Date().toISOString(),
        initQuery: props.initQuery,
      },
    });

    return () => {
      devLog.log({
        component: 'useCustomTable',
        message: '🔚 Hook unmounted',
        data: {
          hookInstanceId: currentHookInstanceId,
        },
      });
    };
  }, [props.initQuery]);

  // 1. Table state management
  const tableState = useTableState<QueryType>(props as any);

  // 🎯 Record table state initialization completion

  // Performance monitoring
  usePerformanceLogging('useCustomTable');

  devLog.render({
    component: 'useCustomTable',
    data: {
      propsKeys: Object.keys(props),
      timestamp: Date.now(),
    },
  });

  // 🔍 Debug: Record props before destructuring
  logger.debug({
    message: '[useCustomTable] Before props destructuring',
    data: {
      hasPropsDataSource: Boolean(props.dataSource),
      propsDataSourceType: typeof props.dataSource,
      propsDataSourceKeys: props.dataSource
        ? Object.keys(props.dataSource)
        : [],
      hasRequest: Boolean((props.dataSource as any)?.request),
      requestType: typeof (props.dataSource as any)?.request,
      propsKeys: Object.keys(props),
    },
    source: 'CustomTable',
    component: 'useCustomTable/props-before',
  });

  // Destructure core configuration parameters
  const {
    handleColumns,
    handleFilters,
    handleColumnsProps = {},
    handleFiltersProps = {},
    initQuery = {},
    initFilters = {},
    queryFormat = {},
    dataSource = { ready: true, manual: false },
    onQueryChange,
    pagination = {},
    syncQueryOnSearchParams = false,
    authQueryPrefixOnSearchParams = {},
    querySearchParamsFormat = {},
    useActiveKeyHook = false,
    customReset,
    sortFieldMap = {},
    supportSortColumns = true,
    isPaginationInCache = false,
    isFilterEffective = true,
    filterResetKeys = [],
    enableCustomFields = false,
    customFieldsProps,
    // 🐛 Fix: Add Alert-related props destructuring
    isAlertShow,
    alertType,
    alertContent,
    customAlertNode,
    // 🎯 New: Reset button enabled by default
    showReset = true,
  } = props;

  // 🎯 Record data source configuration information
  const getDataSourceType = () => {
    if (dataSource?.request) {
      return 'request';
    }
    if (dataSource?.serviceInstance) {
      return 'service';
    }
    return 'unknown';
  };

  // 🔍 Debug: Record dataSource in props (record immediately after destructuring)
  logger.debug({
    message: '[useCustomTable] dataSource after props destructuring',
    data: {
      hasDataSource: Boolean(dataSource),
      dataSourceType: typeof dataSource,
      dataSourceKeys: dataSource ? Object.keys(dataSource) : [],
      hasRequest: Boolean((dataSource as any)?.request),
      requestType: typeof (dataSource as any)?.request,
      ready: (dataSource as any)?.ready,
      manual: (dataSource as any)?.manual,
      isServerPagination: (dataSource as any)?.isServerPagination,
      isDefaultValue: Boolean(
        dataSource &&
          (dataSource as any).ready === true &&
          (dataSource as any).manual === false &&
          !(dataSource as any).request &&
          !(dataSource as any).isServerPagination,
      ),
    },
    source: 'CustomTable',
    component: 'useCustomTable/props',
  });

  const { customTableColumns } = useColumnProcessing<FormatRecordType>({
    handleColumns,
    handleColumnsProps,
    query: tableState.query,
  });

  // 4. Use table column business management plugin
  const {
    columns: managedColumns,
    filters,
    query: columnQuery,
    setFilters,
  } = useTableColumns({
    baseColumns: customTableColumns,
    defaultFilters: { ...initFilters } as Record<string, (string | number)[]>,
  });

  // 🎯 Record column configuration processing completion

  // 5. Merge query conditions
  const finalQuery = useMemo(() => {
    const merged = createTypedQuery<QueryType>({
      ...(tableState.query as Record<string, unknown>),
      ...columnQuery,
    });

    // 🔍 Detailed log: Record finalQuery merge process
    logger.info({
      message: '[useCustomTable] 🔍 finalQuery merge',
      data: {
        tableStateQuery: tableState.query,
        tableStateQueryStringified: JSON.stringify(tableState.query),
        columnQuery,
        columnQueryStringified: JSON.stringify(columnQuery),
        mergedQuery: merged,
        mergedQueryStringified: JSON.stringify(merged),
        mergedQueryKeys: Object.keys(merged || {}),
      },
      source: 'CustomTable',
      component: 'useCustomTable/finalQuery',
    });

    return merged;
  }, [tableState.query, columnQuery]);

  // 🚀 New: Listen for finalQuery changes
  React.useEffect(() => {
    devLog.log({
      component: 'useCustomTable',
      message: '🔍 FinalQuery changed',
      data: {
        hookInstanceId: hookInstanceId.current,
        finalQuery,
        tableStateQuery: tableState.query,
        columnQuery,
        timestamp: new Date().toISOString(),
      },
    });
  }, [finalQuery, columnQuery, tableState.query]);

  // 5. Query parameter synchronization configuration
  const querySyncConfig = useMemo(
    () => ({
      syncQueryOnSearchParams,
      authQueryPrefixOnSearchParams,
      querySearchParamsFormat,
      queryFormat,
      useActiveKeyHook,
      initQuery: props.initQuery, // 🔧 Pass initQuery to querySyncConfig
      customReset,
    }),
    [
      syncQueryOnSearchParams,
      authQueryPrefixOnSearchParams,
      querySearchParamsFormat,
      queryFormat,
      useActiveKeyHook,
      props.initQuery, // 🔧 Add initQuery to dependency array
      customReset,
    ],
  );

  // 6. Use query synchronization plugin
  const querySync = useQuerySync(querySyncConfig, {
    query: finalQuery,
    setQuery: (query: QueryType | ((prev: QueryType) => QueryType)) => {
      if (typeof query === 'function') {
        const newQuery = query(finalQuery);
        tableState.setQuery(newQuery);
      } else {
        tableState.setQuery(query);
      }
    },
    searchParams: new URLSearchParams(),
    setSearchParams: () => {
      /* empty */
    },
    isMounted: false,
    resetRef: { current: false },
    activeKeyChangeRef: { current: {} as Record<string, unknown> },
  });

  // 7. Use data source plugin
  // Debug: Record dataSource props passed to useDataSource
  logger.debug({
    message: '[useCustomTable] dataSource passed to useDataSource',
    data: {
      hasDataSource: Boolean(dataSource),
      dataSourceType: typeof dataSource,
      dataSourceKeys: dataSource ? Object.keys(dataSource) : [],
      hasRequest: Boolean((dataSource as any)?.request),
      requestType: typeof (dataSource as any)?.request,
      ready: (dataSource as any)?.ready,
      isServerPagination: (dataSource as any)?.isServerPagination,
    },
    source: 'CustomTable',
    component: 'useCustomTable',
  });

  const dataSourceHook = useDataSource({
    props: {
      dataSource,
      query: finalQuery,
      sorter: tableState.sorter,
      filters,
      current: tableState.current,
      pageSize: tableState.pageSize,
      isFilterEffective,
      onQueryChange,
      setQuery: tableState.setQuery,
      setSearchParams: tableState.setSearchParams,
      sortFieldMap,
      supportSortColumns,
    },
  });

  // 8. Create Helper methods
  const helpers = useTableHelpers({
    state: tableState,
    config: {
      initQuery,
      filterResetKeys,
      querySync,
      dataSourceMethods: {
        setLoading: dataSourceHook.setLoading,
        setError: dataSourceHook.setError,
        loadMoreData: dataSourceHook.loadMoreData,
      },
    },
    setFilters: setFilters as (
      filters: Record<string, (string | number)[]>,
    ) => void,
  });

  // 9. Build filter configuration
  // 🔧 Key fix: Use useRef to save latest value, avoid frequent recreation caused by depending on finalQuery
  const finalQueryRef = React.useRef(finalQuery);
  const handleChangeRef = React.useRef(helpers.handleChange);

  // Always keep latest value
  finalQueryRef.current = finalQuery;
  handleChangeRef.current = helpers.handleChange;

  const configs = useMemo(() => {
    const result =
      handleFilters?.({
        query: finalQueryRef.current,
        handleChange: handleChangeRef.current,
        handleFiltersProps,
      }) || [];

    devLog.log({
      component: 'useCustomTable',
      message: '📋 Configs generated',
      data: {
        hookInstanceId: hookInstanceId.current,
        configsLength: result.length,
        query: finalQueryRef.current,
        timestamp: new Date().toISOString(),
      },
    });

    return result;
  }, [handleFilters, handleFiltersProps]);
  // ✅ Only depend on handleFilters function itself and config, not on query and handleChange

  useSideEffects<QueryType>({
    syncQueryOnSearchParams,
    queryFormat,
    tableState,
    initQuery,
    isPaginationInCache,
    finalQuery,
    filters,
    onQueryChange,
    dataSource,
    dataSourceHook,
    helpers,
  });

  React.useEffect(() => {
    props.onLoadingChange?.(dataSourceHook.loading || false);
  }, [dataSourceHook.loading, props.onLoadingChange]);

  const pluginContext = usePluginContext<
    RecordType,
    QueryType,
    FormatRecordType
  >({
    props,
    finalQuery,
    managedColumns,
    configs,
    tableState,
    filters,
    dataSourceHook,
    helpers,
    querySync,
    enableCustomFields,
    customFieldsProps,
    hookInstanceId,
  });

  return pluginContext;
};
