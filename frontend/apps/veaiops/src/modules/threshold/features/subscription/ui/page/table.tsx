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

import type { ModuleType } from '@/types/module';
import { CustomTable } from '@veaiops/components';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { useSubscribeRelationTable } from '../../hooks';
import SubscribeRelationForm from '../subscribe-relation/form';

/**
 * Subscribe relation table component props interface
 */
export interface SubscribeRelationTableProps {
  moduleType: ModuleType;
  title?: string;
  showModuleTypeColumn?: boolean;
  customActions?: (record: SubscribeRelationWithAttributes) => React.ReactNode;
}

/**
 * Subscribe relation table component
 *
 * Optimization notes:
 * - Co-locates business logic (CRUD operations) into useSubscribeRelationTable hook
 * - Utilizes CustomTable's auto-refresh capability, automatically refreshes table after successful operations
 * - Component only responsible for UI rendering, all business logic handled by hook
 */
export const SubscribeRelationTable: React.FC<SubscribeRelationTableProps> = ({
  moduleType,
  title = '订阅关系',
  showModuleTypeColumn = true,
  customActions,
}) => {
  // 🎯 Use unified hook to get all table logic and state
  const {
    customTableProps,
    handleColumns,
    handleFilters,
    actions,
    tableRef,
    formVisible,
    editingData,
    handleFormClose,
    handleFormSubmit,
  } = useSubscribeRelationTable({
    moduleType,
    showModuleTypeColumn,
    customActions,
  });

  return (
    <>
      <CustomTable<SubscribeRelationWithAttributes>
        ref={tableRef}
        // Use table props configuration returned by Hook
        {...customTableProps}
        // Table title
        title={title}
        // Column configuration handler function
        handleColumns={handleColumns}
        // Filter handler function
        handleFilters={handleFilters}
        // Action buttons
        actions={actions}
        // Table style
        tableClassName="subscribe-relation-table"
      />

      {/* Subscribe relation form drawer */}
      <SubscribeRelationForm
        visible={formVisible}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        editData={editingData}
        moduleType={moduleType}
      />
    </>
  );
};
