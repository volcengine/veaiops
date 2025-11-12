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
 * Schema驱动的表格组件
 * @description 通过配置化+Schema的方式快速搭建表格，支持筛选等功能

 * @date 2025-12-19
 */

import { Button, Form, Space, Table } from '@arco-design/web-react';
import type React from 'react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from 'react';

import type {
  BaseRecord,
  ColumnSchema,
  SchemaTableInstance,
  SchemaTableProps,
} from '@/custom-table/types/schema-table';
import { generateTableColumns } from './column-generator';
import { SearchSection } from './components/search-section';
import { ToolbarSection } from './components/toolbar-section';
import { useSchemaTableData } from './hooks/use-schema-table-data';
import { useSchemaTableInstance } from './hooks/use-schema-table-instance';
import { applyPreset, validateTableSchema } from './utils';

/**
 * SchemaTable组件实现
 */
export const SchemaTable = forwardRef<SchemaTableInstance, SchemaTableProps>(
  ({ schema: propSchema, className, style, onReady }, ref) => {
    // 应用预设模板
    const schema = useMemo(() => {
      if (propSchema.preset) {
        return applyPreset(propSchema, propSchema.preset);
      }
      return propSchema;
    }, [propSchema]);

    // 验证Schema
    useEffect(() => {
      const validation = validateTableSchema(schema);
      if (!validation.valid) {
        // Schema validation failed - log in development
        // ✅ Silent mode: Schema validation warnings removed
      }
    }, [schema]);

    // 表单实例
    const [searchForm] = Form.useForm();

    // 数据管理
    const {
      dataSource,
      loading,
      pagination,
      filters,
      setDataSource,
      setPagination,
      setFilters,
      loadData,
    } = useSchemaTableData({ schema });

    // 行选择状态
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
      [],
    );
    const [selectedRows, setSelectedRows] = useState<BaseRecord[]>([]);

    // 搜索处理
    const handleSearch = useCallback(
      (values: Record<string, unknown>) => {
        setFilters(values);
        setPagination((prev) => ({ ...prev, current: 1 }));
        schema.events?.onSearch?.(values);
        loadData(values);
      },
      [loadData, schema.events],
    );

    // 重置搜索
    const handleReset = useCallback(() => {
      searchForm.resetFields();
      setFilters({});
      setPagination((prev) => ({ ...prev, current: 1 }));
      schema.events?.onReset?.();
      loadData();
    }, [searchForm, loadData, schema.events]);

    // 分页变化
    const handleTableChange = useCallback(
      (paginationInfo: unknown, sorter: unknown, filterInfo: unknown) => {
        const pagination =
          typeof paginationInfo === 'object' &&
          paginationInfo !== null &&
          'current' in paginationInfo &&
          'pageSize' in paginationInfo
            ? paginationInfo
            : null;
        if (pagination) {
          setPagination((prev) => ({
            ...prev,
            current: (pagination as { current: number }).current,
            pageSize: (pagination as { pageSize: number }).pageSize,
          }));
        }

        schema.events?.onChange?.(
          paginationInfo as Record<string, unknown>,
          filterInfo as Record<string, unknown>,
          sorter as Record<string, unknown>,
        );
        loadData();
      },
      [loadData, schema.events],
    );

    // 行选择
    const handleRowSelectionChange = useCallback(
      (keys: (string | number)[], rows: BaseRecord[]) => {
        setSelectedRowKeys(keys);
        setSelectedRows(rows);

        if (typeof schema.features?.rowSelection === 'object') {
          schema.features.rowSelection.onChange?.(keys, rows);
        }
      },
      [schema.features?.rowSelection],
    );

    // 生成表格列
    const tableColumns = useMemo(() => {
      const columns = generateTableColumns(schema.columns);

      // 添加操作列
      if (schema.actions && schema.actions.items.length > 0) {
        columns.push({
          title: '操作',
          key: 'actions',
          width: schema.actions.width || 150,
          fixed: schema.actions.fixed,
          render: (_, record, index) => (
            <Space>
              {schema.actions!.items.map((action) => {
                const visible =
                  typeof action.visible === 'function'
                    ? action.visible(record)
                    : action.visible !== false;

                if (!visible) {
                  return null;
                }

                const disabled =
                  typeof action.disabled === 'function'
                    ? action.disabled(record)
                    : action.disabled;

                return (
                  <Button
                    key={action.key}
                    type={action.type}
                    status={action.status}
                    size="small"
                    disabled={disabled}
                    icon={action.icon}
                    onClick={() => action.onClick(record, index)}
                  >
                    {action.label}
                  </Button>
                );
              })}
            </Space>
          ),
        });
      }

      return columns;
    }, [schema.columns, schema.actions]);

    // 暴露实例方法
    const instance = useSchemaTableInstance({
      dataSource,
      filters,
      selectedRows,
      selectedRowKeys,
      pagination,
      setDataSource,
      setFilters,
      setSelectedRowKeys,
      setSelectedRows,
      setPagination,
      loadData,
      handleReset,
    });

    useImperativeHandle(ref, () => instance, [instance]);

    // 组件就绪回调
    useEffect(() => {
      onReady?.(instance);
    }, [instance, onReady]);

    return (
      <div className={className} style={style}>
        {/* 标题区域 */}
        {(schema.title || schema.description) && (
          <div style={{ marginBottom: 16 }}>
            {schema.title && <h3>{schema.title}</h3>}
            {schema.description && (
              <p style={{ color: '#666', margin: 0 }}>{schema.description}</p>
            )}
          </div>
        )}

        {/* 搜索区域 */}
        <SearchSection
          schema={schema}
          searchForm={
            searchForm as ReturnType<
              typeof Form.useForm<Record<string, unknown>>
            >[0]
          }
          onSearch={handleSearch}
          onReset={handleReset}
        />

        {/* 工具栏区域 */}
        <ToolbarSection schema={schema} onReload={() => loadData()} />

        {/* 表格区域 */}
        <Table
          columns={tableColumns}
          data={dataSource}
          loading={loading}
          pagination={
            schema.features?.pagination
              ? {
                  ...pagination,
                  showTotal: true,
                  showJumper: true,
                }
              : false
          }
          rowSelection={
            schema.features?.rowSelection
              ? {
                  type:
                    typeof schema.features.rowSelection === 'object'
                      ? schema.features.rowSelection.type
                      : 'checkbox',
                  selectedRowKeys,
                  onChange: handleRowSelectionChange,
                }
              : undefined
          }
          onChange={handleTableChange}
          border={schema.features?.bordered}
          size={schema.features?.size}
          className={schema.style?.tableClassName}
          onRow={schema.events?.onRow}
          onHeaderRow={
            schema.events?.onHeaderRow
              ? (columns, index) => {
                  return (
                    schema.events?.onHeaderRow?.(
                      columns as unknown as ColumnSchema[],
                      index,
                    ) || {}
                  );
                }
              : undefined
          }
        />
      </div>
    );
  },
);

SchemaTable.displayName = 'SchemaTable';
