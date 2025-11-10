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

import type { PaginationProps } from '@arco-design/web-react';
import { Table } from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table/interface';

/**
 * CustomTable table renderer functions
 */
import type { PluginContext, PluginManager } from '@/custom-table/types';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { processColumns } from './table-renderer.columns';
import { buildPaginationDebug } from './table-renderer.debug';
import { buildTableProps } from './table-renderer.props';
import { buildTableRendererSteps } from './table-renderer.steps';
import type {
  BaseQuery,
  BaseRecord,
  TableRenderConfig,
} from './table-renderer.types';

/**
 * Table renderer configuration parameters
 */
// moved to table-renderer.types.ts

/**
 * Create table component renderer
 * Creates high-performance table component based on semantic configuration
 */
export const createTableRenderer = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  pluginManager: PluginManager,
  context: PluginContext<RecordType, QueryType>,
  config: TableRenderConfig<RecordType>,
): React.ReactNode => {
  // ✅ Add error handling and detailed logging
  try {
    const {
      style: { className: tableClassName, rowKey },
      columns: { baseColumns },
      data: { formattedData, total: tableTotal, emptyStateElement },
      pagination: {
        current,
        pageSize,
        config: paginationConfig,
        onPageChange,
        onPageSizeChange,
      },
      loading: { isLoading, useCustomLoader },
    } = config;

    const steps = buildTableRendererSteps<RecordType>({
      pluginManager,
      context,
      config: {
        style: { className: tableClassName, rowKey },
        data: { formattedData, total: tableTotal, emptyStateElement },
        pagination: {
          current,
          pageSize,
          config: paginationConfig,
          onPageChange,
          onPageSizeChange,
        },
        loading: { isLoading, useCustomLoader },
      },
    });

    const { optimizedTableProps, enhancedPaginationConfig, dataWithKeys } =
      steps;
    const processedColumns = processColumns<RecordType, QueryType>({
      pluginManager,
      context,
      baseColumns,
    });

    const finalTableProps = buildTableProps<RecordType, QueryType>({
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
    });

    const paginationDebug = buildPaginationDebug({
      finalTableProps,
      current,
      pageSize,
    });

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
        paginationDebug,
      },
      source: 'CustomTable',
      component: 'table-renderer',
    });

    // 🎯 Render final table component
    try {
      return <Table {...finalTableProps} />;
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '[createTableRenderer] Table component render failed',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          finalTablePropsKeys: Object.keys(finalTableProps || {}),
          columnsCount: Array.isArray(finalTableProps.columns)
            ? finalTableProps.columns.length
            : 0,
          dataCount: Array.isArray(finalTableProps.data)
            ? finalTableProps.data.length
            : 0,
        },
        source: 'CustomTable',
        component: 'createTableRenderer/Table',
      });
      // Fallback: Return error message
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          Table render failed: {errorObj.message}{' '}
        </div>
      );
    }
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[createTableRenderer] Table renderer creation failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        hasPluginManager: Boolean(pluginManager),
        hasContext: Boolean(context),
        configKeys: Object.keys(config || {}),
      },
      source: 'CustomTable',
      component: 'createTableRenderer',
    });
    // Return error message
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        Table initialization failed: {errorObj.message}{' '}
      </div>
    );
  }
};
