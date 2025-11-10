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

import { type CustomerTableRef, useCustomerManagementLogic } from '@customer';
import { useManagementRefresh } from '@veaiops/hooks';
import type React from 'react';
import { useRef } from 'react';
import { CustomerImportDrawer } from '../customer-import-drawer';
import { CustomerTable } from './customer-table';

/**
 * Customer management page
 * Provides customer CRUD functionality - Uses CustomTable and standardized architecture
 *
 * Architecture features:
 * - Uses custom Hooks to encapsulate business logic
 * - Single responsibility components, easy to maintain
 * - State management separated from UI rendering
 * - Supports configuration and extension
 * - Uses CustomTable to provide advanced table functionality
 * - Implements standard model management pattern
 */
export const CustomerManagement: React.FC = () => {
  // Table ref, used to get refresh function (required for import operation)
  const tableRef = useRef<CustomerTableRef>(null);

  // Get table refresh function (used for refresh after import)
  const getRefreshTable = async () => {
    if (tableRef.current?.refresh) {
      await tableRef.current.refresh();
    }
  };

  // Use management refresh Hook, provides refresh functionality after import
  // Note: Delete operation refresh is automatically handled by useBusinessTable
  const { afterImport } = useManagementRefresh(getRefreshTable);

  // Use custom Hook to get all business logic, pass refresh function (only for import)
  const {
    // State
    importDrawerVisible,
    uploading,

    // Event handlers
    handleDelete,
    handleImport,
    handleOpenImportDrawer,
    handleCloseImportDrawer,
  } = useCustomerManagementLogic(afterImport);

  return (
    <>
      {/* Customer table component - Uses CustomTable */}
      <CustomerTable
        ref={tableRef}
        onDelete={handleDelete}
        onImport={handleOpenImportDrawer}
      />

      {/* Customer import drawer */}
      <CustomerImportDrawer
        visible={importDrawerVisible}
        onClose={handleCloseImportDrawer}
        onImport={handleImport}
        loading={uploading}
      />
    </>
  );
};

export default CustomerManagement;
