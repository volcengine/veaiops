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

import type { User, UserFormData } from '@account';
import type { FormInstance } from '@arco-design/web-react';
import type { CustomTableActionType } from '@veaiops/components';
import type { BaseQuery, BaseRecord } from '@veaiops/types';
import type React from 'react';
import { useCallback, useRef } from 'react';
// Import components from pages directory (pages directory is page entry, features directory is feature modules)
import { AccountModal, AccountTable } from '../../../pages/account/ui';
// // Note: useAccount Hook has been removed, using local logic
// import { useAccount } from '../hooks'; // Temporarily removed, waiting for implementation

/**
 * Account management page
 * Provides account CRUD functionality - uses CustomTable and Zustand state management
 */
export const Account: React.FC = () => {
  // CustomTable ref for getting refresh function
  const tableRef = useRef<CustomTableActionType<BaseRecord, BaseQuery>>(null);

  // Use custom Hook to get all business logic, pass refresh function
  // Temporarily using empty implementation
  const modalVisible = false;
  const editingUser: User | null = null;
  const form: FormInstance | null = null;
  const handleEdit = () => {};
  const handleAdd = () => {};
  const handleCancel = () => {};
  const handleSubmit = async () => false;
  const handleDelete = async () => false;

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
        editingUser={editingUser}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </>
  );
};

export default Account;
