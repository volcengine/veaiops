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

import {
  Button,
  Modal,
  Space,
  Table,
  Typography,
} from '@arco-design/web-react';
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { useMemo } from 'react';
import type { ActionConfig, ColumnConfig, DataTableProps } from './types';

const { Text } = Typography;

/**
 * Generic data table component
 * @description Provides standardized data table functionality, supports action columns, pagination, selection, etc.
 */
export const DataTable = <T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  pagination,
  actions = [],
  actionTitle = 'Actions',
  actionWidth = 200,
  showIndex = false,
  indexTitle = 'No.',
  rowSelection,
  rowKey = 'id',
  emptyText = 'No data',
  size = 'default',
  border = true,
  stripe = true,
  title,
  footer,
  ...tableProps
}: DataTableProps<T>) => {
  // Convert column configuration to Arco Table column configuration
  const tableColumns = useMemo<ColumnProps[]>(() => {
    const cols: ColumnProps[] = [];

    // Add index column
    if (showIndex) {
      cols.push({
        title: indexTitle,
        width: 80,
        render: (_: any, __: any, index: number) => {
          const current =
            pagination && typeof pagination === 'object'
              ? pagination.current || 1
              : 1;
          const pageSize =
            pagination && typeof pagination === 'object'
              ? pagination.pageSize || 10
              : 10;
          return (current - 1) * pageSize + index + 1;
        },
      });
    }

    // Add data columns
    columns.forEach((col: ColumnConfig<T>) => {
      const tableCol: ColumnProps = {
        title: col.title,
        dataIndex: col.dataIndex as string,
        width: col.width,
        align: col.align,
        fixed: col.fixed,
        render: col.render,
      };

      // Add sorting
      if (col.sortable) {
        tableCol.sorter = true;
      }

      // Add filtering
      if (col.filterable && col.dataIndex) {
        // Extract unique values from data as filter options
        const uniqueValues = Array.from(
          new Set(data.map((item) => item[col.dataIndex as keyof T])),
        ).filter(Boolean);

        tableCol.filters = uniqueValues.map((value) => ({
          text: String(value),
          value,
        }));

        tableCol.onFilter = (value, record) => {
          return record[col.dataIndex as keyof T] === value;
        };
      }

      cols.push(tableCol);
    });

    // Add action column
    if (actions.length > 0) {
      cols.push({
        title: actionTitle,
        width: actionWidth,
        fixed: 'right',
        render: (_: any, record: T, index: number) => (
          <Space size="small">
            {actions.map((action: ActionConfig<T>, actionIndex: number) => {
              // Check if should show
              if (action.visible && !action.visible(record)) {
                return null;
              }

              // Check if disabled
              const disabled = action.disabled
                ? action.disabled(record)
                : false;

              const button = (
                <Button
                  key={actionIndex}
                  type={action.type || 'text'}
                  status={action.status}
                  size="small"
                  icon={action.icon}
                  disabled={disabled}
                  onClick={() => {
                    if (action.confirm) {
                      Modal.confirm({
                        title: action.confirm.title,
                        content: action.confirm.content,
                        onOk: () => action.onClick(record, index),
                      });
                    } else {
                      action.onClick(record, index);
                    }
                  }}
                >
                  {action.text}
                </Button>
              );

              return button;
            })}
          </Space>
        ),
      });
    }

    return cols;
  }, [
    columns,
    actions,
    data,
    showIndex,
    indexTitle,
    actionTitle,
    actionWidth,
    pagination,
  ]);

  // Handle pagination configuration
  const paginationConfig = useMemo(() => {
    if (pagination === false) {
      return false;
    }

    if (typeof pagination === 'object') {
      return {
        current: pagination.current || 1,
        pageSize: pagination.pageSize || 10,
        total: pagination.total || data.length,
        showTotal: pagination.showTotal
          ? (total: number, range: number[]): string =>
              `Items ${range[0]}-${range[1]} of ${total}`
          : undefined,
        showJumper: pagination.showJumper,
        sizeCanChange: pagination.sizeCanChange,
        pageSizeOptions: pagination.pageSizeOptions || [10, 20, 50, 100],
        onChange: pagination.onChange,
        onPageSizeChange: pagination.onChange,
      };
    }

    // Default pagination configuration
    return {
      pageSize: 10,
      showTotal: (total: number, range: number[]): string =>
        `Items ${range[0]}-${range[1]} of ${total}`,
      showJumper: true,
      sizeCanChange: true,
      pageSizeOptions: [10, 20, 50, 100],
    };
  }, [pagination, data.length]);

  // Handle row selection configuration
  const rowSelectionConfig = useMemo(() => {
    if (!rowSelection) {
      return undefined;
    }

    return {
      type: rowSelection.type || 'checkbox',
      selectedRowKeys: rowSelection.selectedRowKeys || [],
      onChange: rowSelection.onChange as any,
      checkboxProps: rowSelection.checkboxProps,
    };
  }, [rowSelection]);

  return (
    <div>
      {title && (
        <div style={{ marginBottom: 16, fontSize: 16, fontWeight: 'bold' }}>
          {title}
        </div>
      )}
      <Table
        {...tableProps}
        columns={tableColumns}
        data={data}
        loading={loading}
        pagination={paginationConfig}
        rowSelection={rowSelectionConfig}
        rowKey={rowKey}
        size={size}
        border={border}
        stripe={stripe}
        footer={footer ? () => footer : undefined}
        noDataElement={
          <div style={{ padding: '40px 0', textAlign: 'center' }}>
            <Text type="secondary">{emptyText}</Text>
          </div>
        }
      />
    </div>
  );
};

export type {
  ActionConfig,
  ColumnConfig,
  DataTableProps,
  PaginationConfig,
} from './types';
