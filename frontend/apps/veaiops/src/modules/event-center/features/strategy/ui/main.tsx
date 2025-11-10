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

import { useStrategyManagementLogic } from '@ec/strategy';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useCallback, useRef } from 'react';
import { StrategyModal } from './modal';
import { StrategyTable, type StrategyTableRef } from './table';

/**
 * Strategy management page
 * Provides CRUD functionality for strategies - uses CustomTable and Zustand state management
 *
 * Architecture features:
 * - Uses custom Hook to encapsulate business logic
 * - Single responsibility components, easy to maintain
 * - State management separated from UI rendering
 * - Supports configuration and extension
 * - Uses CustomTable to provide advanced table functionality
 */
const StrategyManagement: React.FC = () => {
  // Table reference (used to get refresh function, for refreshing after form submission)
  const tableRef = useRef<StrategyTableRef>(null);

  // Get table refresh function (for refreshing after form submission)
  const getRefreshTable = useCallback(async (): Promise<boolean> => {
    if (tableRef.current?.refresh) {
      const result = await tableRef.current.refresh();
      if (!result.success && result.error) {
        logger.warn({
          message: '策略表格刷新失败',
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
          },
          source: 'StrategyManagement',
          component: 'getRefreshTable',
        });
        return false;
      }
      return true;
    }
    return false;
  }, []);

  // Use custom Hook to get all business logic
  // Note: Refresh for delete operation is automatically handled by useBusinessTable, getRefreshTable is only used for refreshing after form submission
  const {
    // State
    modalVisible,
    editingStrategy,
    form,

    // Event handlers
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
    handleDelete,
  } = useStrategyManagementLogic({ refreshTable: getRefreshTable });

  return (
    <>
      {/* Strategy table component - uses CustomTable */}
      {/* Note: Refresh for delete operation is automatically handled by useBusinessTable, refreshTable is only used for refreshing after form submission */}
      <StrategyTable
        ref={tableRef}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
      />

      {/* Strategy modal component */}
      <StrategyModal
        visible={modalVisible}
        editingStrategy={editingStrategy}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
      />
    </>
  );
};

export default StrategyManagement;
