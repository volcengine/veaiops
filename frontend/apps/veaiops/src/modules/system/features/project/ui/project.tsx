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

import { useProject } from '@project';
import type React from 'react';
import { useRef } from 'react';
import { ProjectCreateDrawer } from './project-create-drawer';
import { ProjectImportDrawer } from './project-import-drawer';
import { ProjectModal } from './project-modal';
import { ProjectTable } from './project-table';

/**
 * Project management page
 * Provides CRUD functionality for projects - uses CustomTable and standardized architecture
 *
 * Architecture features:
 * - Uses custom Hooks to encapsulate business logic
 * - Single responsibility components, easy to maintain
 * - Separation of state management and UI rendering
 * - Supports configuration and extension
 * - Uses CustomTable to provide advanced table functionality
 * - Integrates real API services
 * - 🎯 Uses useBusinessTable and operationWrapper to achieve auto refresh, no need to manually manage ref
 */
export const ProjectManagement: React.FC = () => {
  // 🎯 Create table ref for manual refresh
  const tableRef = useRef<{ refresh: () => Promise<void> }>(null);

  // 🎯 Use custom Hook to get all business logic, pass table refresh method
  const {
    // Modal state
    modalVisible,
    editingProject,
    form,

    // Import drawer state
    importDrawerVisible,
    uploading,

    // Create drawer state
    createDrawerVisible,
    creating,

    // Event handlers
    handleCancel,
    handleSubmit,
    handleDelete,
    handleImport,
    handleOpenImportDrawer,
    handleCloseImportDrawer,
    handleCreate,
    handleOpenCreateDrawer,
    handleCloseCreateDrawer,
  } = useProject({ tableRef });

  return (
    <>
      {/* Project table component - uses CustomTable, auto refresh */}
      <ProjectTable
        ref={tableRef}
        onDelete={handleDelete}
        onImport={handleOpenImportDrawer}
        onCreate={handleOpenCreateDrawer}
      />

      {/* Project modal component */}
      <ProjectModal
        visible={modalVisible}
        editingProject={editingProject}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
      />

      {/* Project import drawer */}
      <ProjectImportDrawer
        visible={importDrawerVisible}
        onClose={handleCloseImportDrawer}
        onImport={handleImport}
        loading={uploading}
      />

      {/* Create project drawer */}
      <ProjectCreateDrawer
        visible={createDrawerVisible}
        onClose={handleCloseCreateDrawer}
        onSubmit={handleCreate}
        loading={creating}
      />
    </>
  );
};
