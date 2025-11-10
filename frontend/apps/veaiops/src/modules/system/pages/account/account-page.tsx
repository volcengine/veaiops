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

import type { CustomTableActionType } from '@veaiops/components';
import type { BaseQuery, BaseRecord } from '@veaiops/types';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useRef } from 'react';
import { useAccountManagementLogic } from './hooks/use-account-management-logic';
import { AccountModal, AccountTable } from './ui';

/**
 * System configuration - Account management page
 * Provides account CRUD functionality - Uses CustomTable and Zustand state management
 *
 * Architecture features:
 * - Uses custom Hooks to encapsulate business logic
 * - Single responsibility components, easy to maintain
 * - State management separated from UI rendering
 * - Supports configuration and extension
 * - Uses CustomTable to provide advanced table functionality
 * - Supports system admin (password change login) and non-admin member (CRUD) permission control
 */
const AccountManagement: React.FC = () => {
  // Table ref, used to get refresh function
  const tableRef = useRef<CustomTableActionType<BaseRecord, BaseQuery>>(null);

  // ✅ Fix: Get table refresh function, returns Promise<boolean>
  const getRefreshTable = async (): Promise<boolean> => {
    logger.debug({
      message: '[AccountPage] 🔄 准备刷新表格',
      data: {
        hasTableRef: Boolean(tableRef.current),
        hasRefresh: Boolean(tableRef.current?.refresh),
        timestamp: Date.now(),
      },
      source: 'AccountPage',
      component: 'getRefreshTable',
    });

    if (tableRef.current?.refresh) {
      try {
        await tableRef.current.refresh();
        logger.info({
          message: '[AccountPage] ✅ 表格刷新成功',
          data: { timestamp: Date.now() },
          source: 'AccountPage',
          component: 'getRefreshTable',
        });
        return true;
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '[AccountPage] ❌ 表格刷新失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            timestamp: Date.now(),
          },
          source: 'AccountPage',
          component: 'getRefreshTable',
        });
        return false;
      }
    } else {
      logger.warn({
        message: '[AccountPage] ⚠️ 无法刷新表格：tableRef.current 不可用',
        data: { timestamp: Date.now() },
        source: 'AccountPage',
        component: 'getRefreshTable',
      });
      return false;
    }
  };

  // Use custom Hook to get all business logic, pass refresh function
  const {
    // State
    modalVisible,
    editingUser,
    form,

    // Event handlers
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
    handleDelete,
  } = useAccountManagementLogic(getRefreshTable);

  return (
    <>
      {/* Account table component - Uses CustomTable */}
      <AccountTable
        ref={tableRef}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      {/* Account modal component */}
      <AccountModal
        visible={modalVisible}
        editingUser={editingUser}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </>
  );
};

export default AccountManagement;
