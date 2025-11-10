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
 * Schema-driven table component
 * @description Quickly build tables through configuration + Schema approach, supports filtering and other features

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
 * SchemaTable component implementation
 */
export const SchemaTable = forwardRef<SchemaTableInstance, SchemaTableProps>(
  ({ schema: propSchema, className, style, onReady }, ref) => {
    // Apply preset template
    const schema = useMemo(() => {
      if (propSchema.preset) {
        return applyPreset(propSchema, propSchema.preset);
      }
      return propSchema;
    }, [propSchema]);

    // Validate Schema
    useEffect(() => {
      const validation = validateTableSchema(schema);
      if (!validation.valid) {
        // Schema validation failed - log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Schema validation warnings:', validation.errors);
        }
      }
    }, [schema]);

    // Form instance
    const [searchForm] = Form.useForm();

    // Data management
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

    // Row selection state
    const [selectedRowKeys, setSelectedRowKeys] = useState<(string | number)[]>(
      [],
    );
    const [selectedRows, setSelectedRows] = useState<BaseRecord[]>([]);

    // Search handling
    const handleSearch = useCallback(
      (values: Record<string, unknown>) => {
        setFilters(values);
        setPagination((prev) => ({ ...prev, current: 1 }));
        schema.events?.onSearch?.(values);
        loadData(values);
      },
      [loadData, schema.events],
    );

    // Reset search
    const handleReset = useCallback(() => {
      searchForm.resetFields();
      setFilters({});
      setPagination((prev) => ({ ...prev, current: 1 }));
      schema.events?.onReset?.();
      loadData();
    }, [searchForm, loadData, schema.events]);

    // Pagination change
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

    // Row selection
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

    // Generate table columns
    const tableColumns = useMemo(() => {
      const columns = generateTableColumns(schema.columns);

      // Add action column
      if (schema.actions && schema.actions.items.length > 0) {
        columns.push({
          title: 'Actions',
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

    // Expose instance methods
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

    // Component ready callback
    useEffect(() => {
      onReady?.(instance);
    }, [instance, onReady]);

    return (
      <div className={className} style={style}>
        {/* Title area */}
        {(schema.title || schema.description) && (
          <div style={{ marginBottom: 16 }}>
            {schema.title && <h3>{schema.title}</h3>}
            {schema.description && (
              <p style={{ color: '#666', margin: 0 }}>{schema.description}</p>
            )}
          </div>
        )}

        {/* Search area */}
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

        {/* Toolbar area */}
        <ToolbarSection schema={schema} onReload={() => loadData()} />

        {/* Table area */}
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
