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
import { logger } from '@veaiops/utils';
import type React from 'react';
import { buildPaginationConfig } from './table-renderer.builders';
import {
  buildOptimizedTableProps as buildOptimizedTablePropsHelper,
  ensureRowKeys,
} from './table-renderer.helpers';
import type { BaseQuery, BaseRecord } from './table-renderer.types';

export interface BuildTableRendererStepsParams<RecordType extends BaseRecord> {
  pluginManager: PluginManager;
  context: PluginContext<RecordType, BaseQuery>;
  config: {
    style: {
      className?: string;
      rowKey?: string | ((record: RecordType) => string);
    };
    data: {
      formattedData: RecordType[];
      total: number;
      emptyStateElement?: React.ReactNode;
    };
    pagination: {
      current: number;
      pageSize: number;
      config?: PaginationProps;
      onPageChange?: (page: number, pageSize: number) => void;
      onPageSizeChange?: (pageSize: number) => void;
    };
    loading: { isLoading: boolean; useCustomLoader: boolean };
  };
}

export interface BuildTableRendererStepsResult<RecordType extends BaseRecord> {
  optimizedTableProps: Record<string, unknown>;
  enhancedPaginationConfig: PaginationProps | boolean;
  dataWithKeys: RecordType[];
}

export function buildTableRendererSteps<RecordType extends BaseRecord>(
  params: BuildTableRendererStepsParams<RecordType>,
): BuildTableRendererStepsResult<RecordType> {
  const { pluginManager, context, config } = params;
  const {
    style: { rowKey },
    data: { formattedData, total: tableTotal },
    pagination: {
      current,
      pageSize,
      config: paginationConfig,
      onPageChange,
      onPageSizeChange,
    },
    loading: { isLoading, useCustomLoader },
  } = config;

  logger.info({
    message: '[buildTableRendererSteps] Starting to build table renderer',
    data: {
      formattedDataCount: Array.isArray(formattedData)
        ? formattedData.length
        : 0,
      tableTotal,
      isLoading,
      useCustomLoader,
      current,
      pageSize,
    },
    source: 'CustomTable',
    component: 'buildTableRendererSteps',
  });

  const optimizedTableProps = buildOptimizedTablePropsWithErrorHandling(
    pluginManager,
    context,
    isLoading,
    useCustomLoader,
  );

  const enhancedPaginationConfig = buildPaginationConfigWithErrorHandling(
    pluginManager,
    context,
    {
      current,
      pageSize,
      total: tableTotal,
      paginationConfig,
      onPageChange,
      onPageSizeChange,
    },
  );

  const dataWithKeys = ensureRowKeysWithErrorHandling(formattedData, rowKey);

  return {
    optimizedTableProps,
    enhancedPaginationConfig,
    dataWithKeys,
  };
}

function buildOptimizedTablePropsWithErrorHandling<
  RecordType extends BaseRecord,
  QueryType extends BaseQuery,
>(
  pluginManager: PluginManager,
  context: PluginContext<RecordType, QueryType>,
  isLoading: boolean,
  useCustomLoader: boolean,
): Record<string, unknown> {
  try {
    const props = buildOptimizedTablePropsHelper({
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

function buildPaginationConfigWithErrorHandling<
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
    const config = buildPaginationConfig<RecordType, QueryType>({
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

function ensureRowKeysWithErrorHandling<RecordType extends BaseRecord>(
  formattedData: RecordType[],
  rowKey?: string | ((record: RecordType) => string),
): RecordType[] {
  try {
    const dataWithKeys = ensureRowKeys<RecordType>(formattedData, rowKey);
    logger.debug({
      message: '[ensureRowKeys] succeeded',
      data: {
        dataWithKeysCount: Array.isArray(dataWithKeys)
          ? dataWithKeys.length
          : 0,
        originalDataCount: Array.isArray(formattedData)
          ? formattedData.length
          : 0,
      },
      source: 'CustomTable',
      component: 'ensureRowKeys',
    });
    return dataWithKeys;
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[ensureRowKeys] failed',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        formattedDataType: typeof formattedData,
        formattedDataIsArray: Array.isArray(formattedData),
        rowKeyType: typeof rowKey,
      },
      source: 'CustomTable',
      component: 'ensureRowKeys',
    });
    return Array.isArray(formattedData) ? formattedData : [];
  }
}
