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
 * CustomTable 表格渲染函数
 */
import type { PluginContext, PluginManager } from '@/custom-table/types';
import { logger } from '@veaiops/utils';
import type React from 'react';
import {
  buildPaginationConfig,
  getProcessedColumns,
} from './table-renderer.builders';
import {
  buildOptimizedTableProps,
  createOnChangeHandler,
  ensureRowKeys,
  getColumnWidthPersistenceId,
} from './table-renderer.helpers';
import type {
  BaseQuery,
  BaseRecord,
  TableRenderConfig,
} from './table-renderer.types';

/**
 * 表格渲染配置参数
 */
// moved to table-renderer.types.ts

/**
 * 创建表格组件渲染器
 * 基于语义化配置创建高性能表格组件
 */
export const createTableRenderer = <
  RecordType extends BaseRecord = BaseRecord,
  QueryType extends BaseQuery = BaseQuery,
>(
  pluginManager: PluginManager,
  context: PluginContext<RecordType, QueryType>,
  config: TableRenderConfig<RecordType>,
): React.ReactNode => {
  // ✅ 添加错误捕获和详细日志
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

    logger.info({
      message: '[createTableRenderer] 开始构建表格渲染器',
      data: {
        baseColumnsCount: Array.isArray(baseColumns) ? baseColumns.length : 0,
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
      component: 'createTableRenderer',
    });

    // 🎯 构建最终表格属性配置
    let optimizedTableProps: Record<string, unknown>;
    try {
      optimizedTableProps = buildOptimizedTableProps<RecordType, QueryType>({
        pluginManager,
        context,
        isLoading,
        useCustomLoader,
      });
      logger.debug({
        message: '[createTableRenderer] buildOptimizedTableProps 成功',
        data: {
          optimizedTablePropsKeys: Object.keys(optimizedTableProps || {}),
        },
        source: 'CustomTable',
        component: 'createTableRenderer',
      });
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '[createTableRenderer] buildOptimizedTableProps 失败',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'CustomTable',
        component: 'createTableRenderer/buildOptimizedTableProps',
      });
      // 使用默认值
      optimizedTableProps = {};
    }

    // 🎯 获取插件处理后的列配置
    let processedColumns: ColumnProps<RecordType>[];
    try {
      processedColumns = getProcessedColumns<RecordType, QueryType>({
        pluginManager,
        context,
        baseColumns,
      });
      logger.debug({
        message: '[createTableRenderer] getProcessedColumns 成功',
        data: {
          processedColumnsCount: Array.isArray(processedColumns)
            ? processedColumns.length
            : 0,
        },
        source: 'CustomTable',
        component: 'createTableRenderer',
      });
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '[createTableRenderer] getProcessedColumns 失败',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          baseColumnsCount: Array.isArray(baseColumns) ? baseColumns.length : 0,
        },
        source: 'CustomTable',
        component: 'createTableRenderer/getProcessedColumns',
      });
      // 使用 baseColumns 作为降级方案
      processedColumns = Array.isArray(baseColumns) ? baseColumns : [];
    }

    // 🎯 构建分页器配置
    let enhancedPaginationConfig: PaginationProps | boolean;
    try {
      enhancedPaginationConfig = buildPaginationConfig<RecordType, QueryType>({
        pluginManager,
        context,
        fallback: {
          current,
          pageSize,
          total: tableTotal,
          paginationConfig,
          onPageChange,
          onPageSizeChange,
        },
      });
      logger.debug({
        message: '[createTableRenderer] buildPaginationConfig 成功',
        data: {
          paginationConfigType: typeof enhancedPaginationConfig,
        },
        source: 'CustomTable',
        component: 'createTableRenderer',
      });
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '[createTableRenderer] buildPaginationConfig 失败',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'CustomTable',
        component: 'createTableRenderer/buildPaginationConfig',
      });
      // 使用默认分页配置
      enhancedPaginationConfig = {
        current,
        pageSize,
        total: tableTotal,
      };
    }

    // 🎯 确保数据项有唯一的 key
    let dataWithKeys: RecordType[];
    try {
      dataWithKeys = ensureRowKeys<RecordType>(formattedData, rowKey);
      logger.debug({
        message: '[createTableRenderer] ensureRowKeys 成功',
        data: {
          dataWithKeysCount: Array.isArray(dataWithKeys)
            ? dataWithKeys.length
            : 0,
          originalDataCount: Array.isArray(formattedData)
            ? formattedData.length
            : 0,
        },
        source: 'CustomTable',
        component: 'createTableRenderer',
      });
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '[createTableRenderer] ensureRowKeys 失败',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          formattedDataType: typeof formattedData,
          formattedDataIsArray: Array.isArray(formattedData),
          rowKeyType: typeof rowKey,
        },
        source: 'CustomTable',
        component: 'createTableRenderer/ensureRowKeys',
      });
      // 使用原始数据作为降级方案
      dataWithKeys = Array.isArray(formattedData) ? formattedData : [];
    }

    // 🎯 记录 Table 组件入参日志
    // Fix: prevent optimizedTableProps.pagination from overriding enhancedPaginationConfig
    // Place optimized props first, then set authoritative pagination last.
    let finalTableProps: Record<string, unknown>;
    try {
      let onChangeHandler: any;
      try {
        onChangeHandler = createOnChangeHandler<RecordType, QueryType>({
          pluginManager,
          context,
        });
        logger.debug({
          message: '[createTableRenderer] createOnChangeHandler 成功',
          data: {
            hasOnChangeHandler: Boolean(onChangeHandler),
          },
          source: 'CustomTable',
          component: 'createTableRenderer',
        });
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '[createTableRenderer] createOnChangeHandler 失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'CustomTable',
          component: 'createTableRenderer/createOnChangeHandler',
        });
        // onChange 失败时，使用空函数作为降级方案
        onChangeHandler = () => {};
      }

      finalTableProps = {
        ...optimizedTableProps,
        'data-cwp-id': getColumnWidthPersistenceId<RecordType, QueryType>(
          context,
        ),
        className: tableClassName,
        rowKey,
        columns: processedColumns,
        data: dataWithKeys,
        noDataElement: emptyStateElement,
        loading: isLoading && !useCustomLoader,
        onChange: onChangeHandler,
        // Authoritative pagination (must include total/current/pageSize/showTotal renderer)
        pagination: enhancedPaginationConfig,
      };

      logger.debug({
        message: '[createTableRenderer] finalTableProps 构建成功',
        data: {
          finalTablePropsKeys: Object.keys(finalTableProps || {}),
          hasColumns: Boolean(finalTableProps.columns),
          columnsCount: Array.isArray(finalTableProps.columns)
            ? finalTableProps.columns.length
            : 0,
          hasData: Boolean(finalTableProps.data),
          dataCount: Array.isArray(finalTableProps.data)
            ? finalTableProps.data.length
            : 0,
        },
        source: 'CustomTable',
        component: 'createTableRenderer',
      });
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '[createTableRenderer] finalTableProps 构建失败',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'CustomTable',
        component: 'createTableRenderer/finalTableProps',
      });
      // 使用最小化的降级配置
      finalTableProps = {
        className: tableClassName,
        rowKey,
        columns: processedColumns,
        data: dataWithKeys,
        loading: isLoading && !useCustomLoader,
        pagination: enhancedPaginationConfig,
      };
    }

    // 记录详细的 Table 入参日志（包含最终分页配置）
    const paginationDebug = (() => {
      const p = (finalTableProps as any)?.pagination;
      if (!p) {
        return { hasPagination: false };
      }
      const showTotalType = typeof p.showTotal;
      let showTotalPreview: string | undefined;
      try {
        if (showTotalType === 'function') {
          // Attempt preview using current props
          showTotalPreview = p.showTotal(p.total ?? 0, [
            (current - 1) * pageSize + 1,
            Math.min(current * pageSize, p.total ?? 0),
          ]);
        }
      } catch (error: unknown) {
        // ✅ 静默处理预览函数错误（避免阻塞表格渲染）
        // 不需要记录警告，因为预览失败不影响核心功能
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        // 仅在开发环境记录警告
        // ✅ Silent mode: Preview function execution failed (error logged internally)
      }
      return {
        hasPagination: true,
        current: p.current,
        pageSize: p.pageSize,
        total: p.total,
        showJumper: p.showJumper,
        sizeCanChange: p.sizeCanChange,
        showTotalType,
        showTotalPreview,
      };
    })();

    logger.log({
      message: 'Table finalTableProps',
      data: {
        columnsCount: processedColumns.length,
        columnsWithSorter: processedColumns.filter((col: any) => col.sorter)
          .length,
        columns: processedColumns.map((col: any) => ({
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
        // 新增：最终分页配置
        paginationDebug,
      },
      source: 'CustomTable',
      component: 'table-renderer',
    });

    // 🎯 渲染最终的表格组件
    try {
      return <Table {...finalTableProps} />;
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '[createTableRenderer] Table 组件渲染失败',
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
      // 降级方案：返回错误提示
      return (
        <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
          表格渲染失败: {errorObj.message}
        </div>
      );
    }
  } catch (error: unknown) {
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '[createTableRenderer] 表格渲染器创建失败',
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
    // 返回错误提示
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
        表格初始化失败: {errorObj.message}
      </div>
    );
  }
};
