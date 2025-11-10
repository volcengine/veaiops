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

import { useAccountManagementLogic } from '@account';
import type { CustomTableActionType } from '@veaiops/components';
import type { BaseQuery, BaseRecord } from '@veaiops/types';
import { logger } from '@veaiops/utils';
import type { User as ApiUser } from 'api-generate';
import type React from 'react';
import { useCallback, useRef } from 'react';
// Import components from pages directory (pages directory is page entry, features directory is feature modules)
import { AccountModal, AccountTable } from '../../../pages/account/ui';

// Extend API User type to match AccountModal's expectations
interface ExtendedUser
  extends Omit<ApiUser, 'id' | 'created_at' | 'updated_at'> {
  id: string; // Override ApiUser's optional id to make it required
  created_at: string; // Override ApiUser's optional created_at to make it required
  updated_at: string; // Override ApiUser's optional updated_at to make it required
  role: 'admin' | 'user' | 'viewer';
  status: 'active';
  is_system_admin: boolean;
  last_login?: string;
}

// Transform function: Convert API User to ExtendedUser
export const transformApiUserToExtendedUser = (
  apiUser: ApiUser,
): ExtendedUser => {
  const now = new Date().toISOString();
  return {
    _id: apiUser._id,
    username: apiUser.username,
    email: apiUser.email,
    is_active: apiUser.is_active,
    is_supervisor: apiUser.is_supervisor,
    id: apiUser._id || `temp-${Date.now()}`, // Ensure id is not undefined
    created_at: apiUser.created_at || now,
    updated_at: apiUser.updated_at || now,
    role: apiUser.is_supervisor ? 'admin' : 'user',
    status: 'active' as const,
    is_system_admin: apiUser.is_supervisor || false,
    last_login: undefined, // This field is not available in API yet
  };
};

/**
 * Account management page
 * Provides account CRUD functionality - uses CustomTable and Zustand state management
 */
export const AccountManagement: React.FC = () => {
  // CustomTable ref for getting refresh function
  const tableRef = useRef<CustomTableActionType<BaseRecord, BaseQuery>>(null);

  // Get table refresh function
  const getRefreshTable = useCallback(async (): Promise<boolean> => {
    if (tableRef.current?.refresh) {
      const result = await tableRef.current.refresh();
      if (!result.success && result.error) {
        logger.warn({
          message: 'Account table refresh failed',
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
          },
          source: 'AccountManagement',
          component: 'getRefreshTable',
        });
        return false;
      }
      return true;
    }
    return false;
  }, []);

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
  } = useAccountManagementLogic(getRefreshTable());

  return (
    <>
      {/* Account table */}
      <AccountTable
        ref={tableRef}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      {/* Account modal */}
      <AccountModal
        visible={modalVisible}
        editingUser={
          editingUser ? transformApiUserToExtendedUser(editingUser) : null
        }
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </>
  );
};

export default AccountManagement;
