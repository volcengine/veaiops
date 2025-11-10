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

import type {
  BaseQuery,
  BaseRecord,
  CustomTablePluginProps,
  PluginContext,
} from '@/custom-table/types';
import { devLog } from '@/custom-table/utils/log-utils';
import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';
import type React from 'react';
import { convertColumnsType, createTypedQuery } from './type-converters';

export const usePluginContext = <
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
  FormatRecordType extends BaseRecord,
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
}: {
  props: any;
  finalQuery: QueryType;
  managedColumns: ColumnProps<FormatRecordType>[];
  configs: any;
  tableState: any;
  filters: Record<string, (string | number)[]>;
  dataSourceHook: any;
  helpers: any;
  querySync: any;
  enableCustomFields?: boolean;
  customFieldsProps?: any;
  hookInstanceId: React.RefObject<string>;
}): PluginContext<RecordType, QueryType> => {
  const {
    tableProps: propsTableProps,
    baseColumns: propsBaseColumns,
    pagination,
    showReset = true,
    isAlertShow,
    alertType,
    alertContent,
    customAlertNode,
    sortFieldMap,
    supportSortColumns,
    isPaginationInCache,
    isFilterEffective,
    filterResetKeys,
    ...restProps
  } = props;

  const pluginProps: CustomTablePluginProps<RecordType, QueryType> = {
    ...restProps,
    finalQuery,
    baseColumns:
      propsBaseColumns ||
      convertColumnsType<FormatRecordType, RecordType>(managedColumns),
    configs: Array.isArray(configs) ? {} : configs,
    tableProps: propsTableProps,
    pagination,
    showReset,
    isAlertShow,
    alertType,
    alertContent,
    customAlertNode,
    sortFieldMap,
    supportSortColumns,
    isPaginationInCache,
    isFilterEffective,
    filterResetKeys,
    enableCustomFields,
    customFieldsProps,
  } as CustomTablePluginProps<RecordType, QueryType>;

  const pluginContext: PluginContext<RecordType, QueryType> = {
    props: pluginProps,
    state: {
      current: tableState.current,
      pageSize: tableState.pageSize,
      query: createTypedQuery<QueryType>(finalQuery),
      sorter: tableState.sorter,
      filters,
      formattedTableData: (dataSourceHook.data as RecordType[]) || [],
      loading: dataSourceHook.loading || false,
      tableTotal: dataSourceHook.tableTotal || 0,
      error: dataSourceHook.error || null,
      resetEmptyData: tableState.resetEmptyData,
      expandedRowKeys: tableState.expandedRowKeys,
      enableCustomFields: enableCustomFields || false,
      customFieldsProps,
      baseColumns:
        (pluginProps.baseColumns as unknown as ColumnProps<RecordType>[]) || [],
    },
    helpers: {
      updateQuery: (newQuery: Partial<QueryType>) => {
        tableState.setQuery(
          (prev: QueryType) => ({ ...prev, ...newQuery }) as QueryType,
        );
      },
      ...helpers,
      handleChange: helpers.handleChange as unknown as (
        keyOrObject: string | Record<string, unknown>,
        value?: unknown,
        handleFilter?: () => Record<string, (string | number)[]>,
        ctx?: Record<string, unknown>,
      ) => void,
      run: helpers.loadMoreData,
      querySync,
      manualSyncQuery: () => querySync.syncQueryToUrl(finalQuery),
      resetQuery: querySync.resetQuery,
    },
  };

  devLog.log({
    component: 'usePluginContext',
    message: 'Alert Props passing debug',
    data: {
      originalProps: {
        isAlertShow,
        alertType,
        alertContent: Boolean(alertContent),
        customAlertNode: Boolean(customAlertNode),
      },
      pluginPropsAlert: {
        isAlertShow: pluginProps.isAlertShow,
        alertType: pluginProps.alertType,
        alertContent: Boolean(pluginProps.alertContent),
        customAlertNode: Boolean(pluginProps.customAlertNode),
      },
      restPropsKeys: Object.keys(restProps),
      hasAlertInRestProps: 'isAlertShow' in restProps,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    devLog.log({
      component: 'usePluginContext',
      message: 'Hook result:',
      data: {
        hasDataSource: Boolean(pluginContext.props.dataSource),
        dataLength: pluginContext.state.formattedTableData?.length,
        loading: pluginContext.state.loading,
        total: pluginContext.state.tableTotal,
        hasBaseColumns: Boolean(pluginContext.props.baseColumns),
        baseColumnsLength: pluginContext.props.baseColumns?.length,
        currentPage: pluginContext.state.current,
        pageSize: pluginContext.state.pageSize,
      },
    });
  }

  return pluginContext;
};
