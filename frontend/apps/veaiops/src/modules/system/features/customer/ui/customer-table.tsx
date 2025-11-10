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

import { Button, Popconfirm, Space } from '@arco-design/web-react';
// import { exportLogsToFile } from '@veaiops/utils'; // Temporarily not used
import type { ColumnProps } from '@arco-design/web-react/es/Table';
import { IconDelete, IconUpload } from '@arco-design/web-react/icon';
import {
  type CustomerTableData,
  type CustomerTableProps,
  type CustomerTableRef,
  useCustomerActionConfig,
  useCustomerTableConfig,
} from '@customer';
import {
  CellRender,
  CustomTable,
  type FieldItem,
  type HandleFilterProps,
  useBusinessTable,
} from '@veaiops/components';
import { queryBooleanFormat } from '@veaiops/utils';
import type React from 'react';
import { forwardRef, useCallback, useMemo } from 'react';

// Destructure CellRender components to avoid repeated calls
const { InfoWithCode, Ellipsis, StampTime, CustomOutlineTag } = CellRender;

const queryFormat = {
  is_active: queryBooleanFormat,
};
/**
 * Customer table component
 * Uses CustomTable standardized implementation - Following model management standard pattern
 */
export const CustomerTable = forwardRef<CustomerTableRef, CustomerTableProps>(
  ({ onDelete, onImport }, ref) => {
    const { dataSource } = useCustomerTableConfig();
    const { getAvailableActions } = useCustomerActionConfig();

    // 🎯 First use useBusinessTable to get wrapped handlers
    const { customTableProps, wrappedHandlers } = useBusinessTable({
      dataSource,
      tableProps: {
        rowKey: '_id',
        pagination: {
          pageSize: 10,
          showTotal: (total: number) => `共 ${total} 条记录`,
          showJumper: true,
          sizeCanChange: true,
          sizeOptions: [10, 20, 50, 100],
        },
        scroll: { x: 1000 },
      },
      handlers: onDelete
        ? {
            delete: async (customerId: string) => {
              return await onDelete(customerId);
            },
          }
        : undefined,
      refreshConfig: {
        enableRefreshFeedback: true,
        successMessage: '操作成功',
        errorMessage: '操作失败，请重试',
      },
      ref,
    });

    // Column configuration function - Use wrapped handlers
    const handleColumns = useCallback(
      (): ColumnProps<CustomerTableData>[] => [
        {
          title: '客户ID',
          dataIndex: 'customer_id',
          key: 'customer_id',
          width: 150,
          render: (customerId: string, record: CustomerTableData) => (
            <InfoWithCode
              name={record.name}
              code={customerId}
              isCodeShow={true}
            />
          ),
        },
        {
          title: '客户名称',
          dataIndex: 'name',
          key: 'name',
          width: 200,
          render: (name: string, record: CustomerTableData) => (
            <InfoWithCode
              name={name}
              code={record.customer_id}
              isCodeShow={true}
            />
          ),
        },
        {
          title: '脱敏名称',
          dataIndex: 'desensitized_name',
          key: 'desensitized_name',
          width: 200,
          render: (name: string) => (
            <Ellipsis text={name || '-'} options={{ rows: 1 }} />
          ),
        },
        {
          title: '状态',
          dataIndex: 'is_active',
          key: 'is_active',
          width: 100,
          render: (isActive: boolean) => (
            <CustomOutlineTag>{isActive ? '激活' : '未激活'}</CustomOutlineTag>
          ),
        },
        {
          title: '创建时间',
          dataIndex: 'created_at',
          key: 'created_at',
          width: 180,
          render: (time: string) => (
            <StampTime
              time={new Date(time).getTime()}
              template="YYYY-MM-DD HH:mm:ss"
            />
          ),
        },
        {
          title: '更新时间',
          dataIndex: 'updated_at',
          key: 'updated_at',
          width: 180,
          render: (time: string) => (
            <StampTime
              time={new Date(time).getTime()}
              template="YYYY-MM-DD HH:mm:ss"
            />
          ),
        },
        {
          title: '操作',
          key: 'actions',
          width: 120,
          fixed: 'right',
          render: (_: unknown, record: CustomerTableData) => {
            const availableActions = getAvailableActions(record);

            return (
              <Space>
                {availableActions.includes('delete') && (
                  <Popconfirm
                    title="确认删除"
                    content={`确定要删除客户"${record.name}"吗？删除后无法恢复。`}
                    onOk={async () => {
                      // ✅ Use useBusinessTable auto-wrapped delete operation
                      // Delete operation will automatically refresh table
                      if (wrappedHandlers?.delete) {
                        await wrappedHandlers.delete(record.customer_id);
                      } else if (onDelete) {
                        // Compatibility: If no wrapped handler, use original handler
                        await onDelete(record.customer_id);
                      }
                    }}
                    okText="确认"
                    cancelText="取消"
                  >
                    <Button
                      size="small"
                      type="text"
                      status="danger"
                      icon={<IconDelete />}
                    >
                      删除
                    </Button>
                  </Popconfirm>
                )}
              </Space>
            );
          },
        },
      ],
      [getAvailableActions, wrappedHandlers, onDelete],
    );

    // Filter configuration function
    const handleFilters = useCallback(
      (props: HandleFilterProps<Record<string, unknown>>): FieldItem[] => [
        {
          field: 'name',
          label: '客户名称',
          type: 'Input',
          componentProps: {
            placeholder: '请输入客户名称',
            value: props.query?.name as string | undefined,
            allowClear: true,
            onChange: (v: string) => {
              props.handleChange({ key: 'name', value: v });
            },
          },
        },
        {
          field: 'is_active',
          label: '状态',
          type: 'Select',
          componentProps: {
            placeholder: '请选择状态',
            value: props.query?.is_active as boolean | undefined,
            allowClear: true,
            options: [
              { label: '激活', value: true },
              { label: '未激活', value: false },
            ],
            onChange: (v: boolean) => {
              props.handleChange({ key: 'is_active', value: v });
            },
          },
        },
      ],
      [],
    );

    return (
      <CustomTable<CustomerTableData>
        {...customTableProps}
        handleColumns={handleColumns}
        title="客户管理"
        handleFilters={handleFilters}
        syncQueryOnSearchParams
        useActiveKeyHook
        queryFormat={queryFormat}
        actions={[
          <Button key="import" icon={<IconUpload />} onClick={onImport}>
            导入客户
          </Button>,
        ]}
      />
    );
  },
);

CustomerTable.displayName = 'CustomerTable';

export default CustomerTable;
