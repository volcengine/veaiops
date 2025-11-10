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

import type { PluginContext, PluginManager } from '@/custom-table/types';
import type { PaginationProps } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { buildPaginationDebug } from './table-renderer.debug';
import {
  buildOptimizedTableProps,
  createOnChangeHandler,
  getColumnWidthPersistenceId,
} from './table-renderer.helpers';
import type { BaseQuery, BaseRecord } from './table-renderer.types';

export interface BuildTablePropsParams<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
> {
  pluginManager: PluginManager;
  context: PluginContext<RecordType, QueryType>;
  processedColumns: ColumnProps<RecordType>[];
  dataWithKeys: RecordType[];
  rowKey: string | ((record: RecordType) => React.Key);
  tableClassName: string;
  isLoading: boolean;
  useCustomLoader: boolean;
  current: number;
  pageSize: number;
  tableTotal: number;
  emptyStateElement: React.ReactNode;
  enhancedPaginationConfig: PaginationProps | boolean;
}

export function buildTableProps<
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>({
  pluginManager,
  context,
  processedColumns,
  dataWithKeys,
  rowKey,
  tableClassName,
  isLoading,
  useCustomLoader,
  current,
  pageSize,
  tableTotal,
  emptyStateElement,
  enhancedPaginationConfig,
}: BuildTablePropsParams<RecordType, QueryType>): Record<string, unknown> {
  let onChangeHandler:
    | ((pagination: unknown, sorter: unknown) => void)
    | undefined;
  try {
    onChangeHandler = createOnChangeHandler<RecordType, QueryType>({
      pluginManager,
      context,
    });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[createTableRenderer] createOnChangeHandler failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'CustomTable',
      component: 'createTableRenderer/createOnChangeHandler',
    });
  }

  let optimizedTableProps: Record<string, unknown>;
  try {
    optimizedTableProps = buildOptimizedTableProps<RecordType, QueryType>({
      pluginManager,
      context,
      isLoading,
      useCustomLoader,
    });
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[createTableRenderer] buildOptimizedTableProps failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'CustomTable',
      component: 'createTableRenderer/buildOptimizedTableProps',
    });
    optimizedTableProps = {};
  }

  const finalTableProps: Record<string, unknown> = {
    ...optimizedTableProps,
    'data-cwp-id': getColumnWidthPersistenceId<RecordType, QueryType>(context),
    className: tableClassName,
    rowKey,
    columns: processedColumns,
    data: dataWithKeys,
    loading: isLoading && !useCustomLoader,
    pagination: enhancedPaginationConfig,
    noDataElement: emptyStateElement,
  };

  if (onChangeHandler) {
    finalTableProps.onChange = onChangeHandler;
  }

  logger.log({
    message: 'Table finalTableProps',
    data: {
      columnsCount: processedColumns.length,
      columnsWithSorter: processedColumns.filter(
        (col: ColumnProps<RecordType>) => col.sorter,
      ).length,
      columns: processedColumns.map((col: ColumnProps<RecordType>) => ({
        title: col.title,
        dataIndex: col.dataIndex,
        key: col.key,
        sorter: col.sorter,
        hasSorter: Boolean(col.sorter),
      })),
      hasOnChange: Boolean(finalTableProps.onChange),
      dataCount: dataWithKeys.length,
      optimizedTablePropsKeys: Object.keys(optimizedTableProps),
      optimizedTableProps,
    },
    source: 'CustomTable',
    component: 'createTableRenderer',
  });

  return finalTableProps;
}
