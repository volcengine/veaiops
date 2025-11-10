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

import { PROJECT_MANAGEMENT_CONFIG } from '@project';
import type {
  UseProjectTableConfigOptions,
  UseProjectTableConfigReturn,
} from '@project/types';
import { useBusinessTable } from '@veaiops/components';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
} from '@veaiops/utils';
import type { Project } from 'api-generate';
import { useMemo } from 'react';
import { useProjectCRUD } from '../../use-project-crud';
import { useTableHandlers } from './use-table-handlers';
import { useTableRequest } from './use-table-request';

/**
 * Project table configuration aggregation Hook
 *
 * 🎯 Hook aggregation pattern + auto refresh mechanism
 * - Use useBusinessTable to uniformly manage table logic
 * - Achieve auto refresh through operationWrapper
 * - Centrally manage data source, table configuration, column configuration, etc.
 */
export const useProjectTableConfig = ({
  onEdit,
  onDelete,
  onCreate,
  onImport,
  onToggleStatus,
}: UseProjectTableConfigOptions): UseProjectTableConfigReturn => {
  // 🎯 Use CRUD Hook to manage business logic
  const crud = useProjectCRUD();

  // 🎯 Data request logic
  const { request } = useTableRequest();

  // 🎯 Data source configuration - use utility function
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // 🎯 Table configuration - use utility function
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: PROJECT_MANAGEMENT_CONFIG.pageSize,
        scrollX: 1400,
      }),
    [],
  );

  // 🎯 Business operation wrapping - auto refresh
  const { customTableProps, customOperations } = useBusinessTable({
    dataSource,
    tableProps,
    refreshConfig: {
      enableRefreshFeedback: true,
      successMessage: '操作成功',
      errorMessage: '操作失败，请重试',
    },
    operationWrapper: ({ wrapUpdate, wrapDelete }) =>
      ({
        handleEdit: (editFn: () => Promise<boolean>) => async () =>
          wrapUpdate(editFn),
        handleDelete:
          (deleteFn: (id: string) => Promise<boolean>) => async (id: string) =>
            wrapDelete(() => deleteFn(id)),
        handleCreate: (createFn: () => Promise<boolean>) => async () =>
          wrapUpdate(createFn),
        handleImport: (importFn: () => Promise<boolean>) => async () =>
          wrapUpdate(importFn),
        handleToggleStatus: (toggleFn: () => Promise<boolean>) => async () =>
          wrapUpdate(toggleFn),
      }) as Record<string, (...args: unknown[]) => unknown>,
  });

  // 🎯 Table handler configuration
  const { handleColumns, handleFilters, renderActions, actions } =
    useTableHandlers({
      onEdit,
      onDelete,
      onToggleStatus,
      onCreate,
      onImport,
    });

  return {
    // Table configuration
    customTableProps,
    customOperations,
    handleColumns,
    handleFilters,
    renderActions,
    actions,

    // Business logic state
    modalVisible: crud.modalVisible,
    editingProject: crud.editingProject,
    submitting: crud.submitting,
    form: crud.form,

    // Import related state
    importDrawerVisible: crud.importDrawerVisible,
    uploading: crud.uploading,

    // Create project related state
    createDrawerVisible: crud.createDrawerVisible,
    creating: crud.creating,

    // Business logic handlers
    handleCancel: crud.handleCancel,
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    checkDeletePermission: crud.checkDeletePermission,

    // Import related handlers
    handleImport: crud.handleImport,
    handleOpenImportDrawer: crud.handleOpenImportDrawer,
    handleCloseImportDrawer: crud.handleCloseImportDrawer,

    // Create project related handlers
    handleCreate: crud.handleCreate,
    handleOpenCreateDrawer: crud.handleOpenCreateDrawer,
    handleCloseCreateDrawer: crud.handleCloseCreateDrawer,
  };
};
