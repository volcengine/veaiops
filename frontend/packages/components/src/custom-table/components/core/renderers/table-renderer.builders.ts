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
import type { BaseQuery, BaseRecord } from './table-renderer.types';

export function buildOptimizedTableProps<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(
  pluginManager: PluginManager,
  context: PluginContext<RecordType, QueryType>,
  isLoading: boolean,
  useCustomLoader: boolean,
): Record<string, unknown> {
  try {
    const props = buildOptimizedTablePropsInternal<RecordType, QueryType>({
      pluginManager,
      context,
      isLoading,
      useCustomLoader,
    });
    logger.debug({
      message: '[buildOptimizedTableProps] succeeded',
      data: {
        optimizedTablePropsKeys: Object.keys(props || {}),
      },
      source: 'CustomTable',
      component: 'buildOptimizedTableProps',
    });
    return props;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[buildOptimizedTableProps] failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'CustomTable',
      component: 'buildOptimizedTableProps',
    });
    return {};
  }
}

function buildOptimizedTablePropsInternal<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(params: {
  pluginManager: PluginManager;
  context: PluginContext<RecordType, QueryType>;
  isLoading: boolean;
  useCustomLoader: boolean;
}): Record<string, unknown> {
  // Implementation moved from table-renderer.tsx
  // This is a placeholder - the actual implementation should be moved here
  return {};
}

export function getProcessedColumns<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(
  pluginManager: PluginManager,
  context: PluginContext<RecordType, QueryType>,
  baseColumns: ColumnProps<RecordType>[],
): ColumnProps<RecordType>[] {
  try {
    const columns = getProcessedColumnsInternal<RecordType, QueryType>({
      pluginManager,
      context,
      baseColumns,
    });
    logger.debug({
      message: '[getProcessedColumns] succeeded',
      data: {
        processedColumnsCount: Array.isArray(columns) ? columns.length : 0,
      },
      source: 'CustomTable',
      component: 'getProcessedColumns',
    });
    return columns;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[getProcessedColumns] failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        baseColumnsCount: Array.isArray(baseColumns) ? baseColumns.length : 0,
      },
      source: 'CustomTable',
      component: 'getProcessedColumns',
    });
    return Array.isArray(baseColumns) ? baseColumns : [];
  }
}

function getProcessedColumnsInternal<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(params: {
  pluginManager: PluginManager;
  context: PluginContext<RecordType, QueryType>;
  baseColumns: ColumnProps<RecordType>[];
}): ColumnProps<RecordType>[] {
  // Implementation moved from table-renderer.tsx
  // This is a placeholder - the actual implementation should be moved here
  return Array.isArray(params.baseColumns) ? params.baseColumns : [];
}

export function buildPaginationConfig<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(
  pluginManager: PluginManager,
  context: PluginContext<RecordType, QueryType>,
  fallback: {
    current: number;
    pageSize: number;
    total: number;
    paginationConfig?: PaginationProps;
    onPageChange?: (page: number, pageSize: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  },
): PaginationProps | boolean {
  try {
    const config = buildPaginationConfigInternal<RecordType, QueryType>({
      pluginManager,
      context,
      fallback,
    });
    logger.debug({
      message: '[buildPaginationConfig] succeeded',
      data: {
        paginationConfigType: typeof config,
      },
      source: 'CustomTable',
      component: 'buildPaginationConfig',
    });
    return config;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[buildPaginationConfig] failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'CustomTable',
      component: 'buildPaginationConfig',
    });
    return {
      current: fallback.current,
      pageSize: fallback.pageSize,
      total: fallback.total,
    };
  }
}

function buildPaginationConfigInternal<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(params: {
  pluginManager: PluginManager;
  context: PluginContext<RecordType, QueryType>;
  fallback: {
    current: number;
    pageSize: number;
    total: number;
    paginationConfig?: PaginationProps;
    onPageChange?: (page: number, pageSize: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  };
}): PaginationProps | boolean {
  // Implementation moved from table-renderer.tsx
  // This is a placeholder - the actual implementation should be moved here
  return {
    current: params.fallback.current,
    pageSize: params.fallback.pageSize,
    total: params.fallback.total,
  };
}
