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
  type ButtonConfiguration,
  ButtonGroupRender,
  CellRender,
  CustomTable,
  useBusinessTable,
} from '@veaiops/components';

import { authConfig } from '@/config/auth';
import { Message } from '@arco-design/web-react';
import { IconDelete } from '@arco-design/web-react/icon';
import type { User } from 'api-generate';
import { forwardRef, useCallback } from 'react';
import {
  useAccountActionConfig,
  useAccountTableConfig,
} from '../hooks/use-account-management-logic';

// ✅ Use User type from api-generate (single data source principle)
type UserTableData = User;

// Column configuration function - use wrapped handlers
const getUserColumns = (
  props: any,
  wrappedHandlers?: { delete?: (id: string) => Promise<boolean> },
) => [
  {
    title: '用户名',
    dataIndex: 'username',
    key: 'username',
    width: 150,
  },
  {
    title: '邮箱',
    dataIndex: 'email',
    key: 'email',
    width: 200,
  },
  // {
  //   title: 'Is Active',
  //   dataIndex: 'is_active',
  //   key: 'is_active',
  //   width: 100,
  //   render: (isActive: boolean) => <CellRender.Boolean data={isActive} />,
  // },
  {
    title: '管理员',
    dataIndex: 'is_supervisor',
    key: 'is_supervisor',
    width: 100,
    render: (isSupervisor: boolean) => (
      <CellRender.Boolean data={isSupervisor} />
    ),
  },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    key: 'created_at',
    width: 150,
    render: (time: string) => (
      <CellRender.StampTime time={new Date(time).getTime()} />
    ),
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    render: (_: any, record: User) => {
      const buttonConfigurations: ButtonConfiguration[] = [
        // {
        //   text: 'Change Password',
        //   disabled: !props?.isSupervisor,
        //   buttonProps: {
        //     icon: <IconEdit />,
        //   },
        //   onClick: () => {
        //     props.onEdit?.(record);
        //   },
        // },
        {
          text: '删除',
          disabled: !props?.isSupervisor,
          supportPopConfirm: true,
          popConfirmContent: '确认删除此账号？',
          buttonProps: {
            icon: <IconDelete />,
            status: 'danger',
            // Note: Using as any because Arco Design Button's BaseButtonProps type definition doesn't include data-testid
            // But data-testid is a standard HTML attribute, will be correctly passed at runtime
            // TODO: Check Arco Design source code to confirm if type definition needs to be extended
            'data-testid': 'delete-account-btn',
          } as any,
          onClick: async () => {
            // ✅ Use useBusinessTable auto-wrapped delete operation
            // Delete operation will automatically refresh table
            if (!record._id) {
              Message.error('用户 ID 不存在');
              return;
            }
            if (wrappedHandlers?.delete) {
              await wrappedHandlers.delete(record._id);
            } else if (props.onDelete) {
              // Compatibility: If no wrapped handler, use original handler
              await props.onDelete(record._id);
            }
          },
        },
      ];

      return (
        <ButtonGroupRender
          buttonConfigurations={buttonConfigurations}
          className="flex-nowrap"
          style={{ gap: '8px' }}
        />
      );
    },
  },
];

// Temporary configuration object
const ACCOUNT_MANAGEMENT_CONFIG = {
  title: '账号管理',
};

/**
 * Account table component properties interface
 */
interface AccountTableProps {
  onEdit: (user: User) => void;
  onDelete: (userId: string) => Promise<boolean>;
  onAdd: () => void;
}

/**
 * Account table component
 * Encapsulates table rendering logic, provides clear interface
 */
export const AccountTable = forwardRef<any, AccountTableProps>(
  ({ onEdit, onDelete, onAdd }, ref) => {
    // Authentication
    const isSupervisor =
      localStorage.getItem(authConfig.storageKeys.isSupervisor) === 'true';

    // Table configuration
    const { dataSource, tableProps } = useAccountTableConfig({
      handleEdit: onEdit,
      handleDelete: onDelete,
    });

    // 🎯 Use useBusinessTable to automatically handle refresh logic
    const { customTableProps, wrappedHandlers } = useBusinessTable({
      dataSource,
      tableProps,
      handlers: onDelete
        ? {
            delete: async (userId: string) => {
              return await onDelete(userId);
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

    // Action button configuration
    const { actions } = useAccountActionConfig(onAdd, isSupervisor);

    // Create handleColumns function, pass operation callbacks to column configuration
    const handleColumns = useCallback(
      (props: Record<string, unknown>) => {
        return getUserColumns(
          {
            ...props,
            onEdit,
            onDelete,
            isSupervisor,
          },
          wrappedHandlers,
        );
      },
      [onEdit, onDelete, isSupervisor, wrappedHandlers],
    );

    return (
      <CustomTable<UserTableData>
        ref={ref}
        {...customTableProps}
        title={ACCOUNT_MANAGEMENT_CONFIG.title}
        actions={actions}
        handleColumns={handleColumns}
        handleColumnsProps={{ isSupervisor }}
        syncQueryOnSearchParams
        useActiveKeyHook
      />
    );
  },
);

// Set displayName for debugging
AccountTable.displayName = 'AccountTable';

export default AccountTable;
