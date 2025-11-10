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

import { useHistoryManagementLogic } from '@ec/history';
import type React from 'react';
import { useRef } from 'react';
import { HistoryDetailDrawer, HistoryTable } from '../components/table';
import type { HistoryTableRef } from '../components/table/history-table';

/**
 * History event management page
 * Provides history event viewing and filtering functionality - uses CustomTable and Zustand state management
 *
 * Architecture features:
 * - Use custom Hooks to encapsulate business logic
 * - Single responsibility components, easy to maintain
 * - Separation of state management and UI rendering
 * - Support configuration and extension
 * - Use CustomTable to provide advanced table functionality
 */
export const HistoryManagement: React.FC = () => {
  const tableRef = useRef<HistoryTableRef>(null);

  const {
    filters,
    drawerVisible,
    selectedRecord,
    handleViewDetail,
    handleCloseDetail,
    updateFilters,
  } = useHistoryManagementLogic();

  return (
    <>
      {/* History event table component - uses CustomTable */}
      <HistoryTable
        ref={tableRef}
        onViewDetail={handleViewDetail}
        filters={filters}
        updateFilters={updateFilters}
      />

      {/* Event detail drawer component */}
      <HistoryDetailDrawer
        visible={drawerVisible}
        selectedRecord={selectedRecord}
        onClose={handleCloseDetail}
      />
    </>
  );
};

export default HistoryManagement;
