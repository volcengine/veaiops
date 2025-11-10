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

import { useCrudOperations, useFormHandlers, useModalState } from './hooks';

/**
 * Account management logic Hook
 * Provides all business logic for account management page
 */
export const useAccountManagementLogic = (
  refreshTable?: () => Promise<boolean>,
) => {
  const { createUser, updateUser, deleteUser } = useCrudOperations();
  const {
    form,
    editingUser,
    modalVisible,
    setModalVisible,
    setEditingUser,
    handleEdit,
    handleAdd,
    handleCancel,
  } = useModalState();

  const { handleDelete, handleSubmit } = useFormHandlers({
    form,
    editingUser,
    setEditingUser,
    setModalVisible,
    createUser,
    updateUser,
    deleteUser,
    refreshTable,
  });

  return {
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
  };
};

// ✅ Note: useAccountTableConfig and useAccountActionConfig have been split into separate files
// - useAccountTableConfig: ./use-account-table-config.ts
// - useAccountActionConfig: ./use-account-action-config.ts

// Export types and utility functions
export type { UserFormData, UpdateUserParams } from './types';
export { transformUserToTableData } from './utils';
