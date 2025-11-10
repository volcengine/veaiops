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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { PROJECT_MANAGEMENT_CONFIG } from '@project';
import {
  type BaseQuery,
  type FieldItem,
  type HandleFilterProps,
  useBusinessTable,
} from '@veaiops/components';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
  logger,
} from '@veaiops/utils';
import type { Project } from 'api-generate';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import type {
  UseProjectTableConfigOptions,
  UseProjectTableConfigReturn,
} from '../types';
import { useProjectCRUD } from '../use-project-crud';
import { getProjectTableActions } from './lib/actions';
import { getProjectTableColumns } from './lib/columns';
import { getProjectTableFilters } from './lib/filters';

/**
 * Project table configuration aggregation Hook
 *
 * 🎯 Hook aggregation pattern + auto-refresh mechanism
 * - Use useBusinessTable to uniformly manage table logic
 * - Implement auto-refresh through operationWrapper
 * - Centrally manage data source, table configuration, column configuration, etc.
 *
 * @param options - Hook configuration options
 * @returns Table configuration and handlers
 */
export const useProjectTableConfig = ({
  onEdit,
  onDelete,
  onCreate,
  onImport,
  onToggleStatus,
  ref, // ✅ Receive ref parameter
}: UseProjectTableConfigOptions): UseProjectTableConfigReturn => {
  // 🎯 Use CRUD Hook to manage business logic
  const crud = useProjectCRUD();

  // 🎯 Data request logic - use utility functions
  // ✅ Key fix: Use useMemo to stabilize request function reference
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler<Project[]>({
        apiCall: async ({ skip, limit, name }) => {
          logger.debug({
            message: '[ProjectTableConfig] 🔵 API request started',
            data: {
              skip,
              limit,
              name,
              timestamp: Date.now(),
            },
            source: 'ProjectTableConfig',
            component: 'apiCall',
          });

          const response =
            await apiClient.projects.getApisV1ManagerSystemConfigProjects({
              skip,
              limit,
              name: name as string | undefined,
            });

          logger.debug({
            message: '[ProjectTableConfig] ✅ API request succeeded',
            data: {
              dataLength: response.data?.length,
              total: response.total,
              timestamp: Date.now(),
            },
            source: 'ProjectTableConfig',
            component: 'apiCall',
          });

          // Force type compatibility: PaginatedAPIResponseProjectList -> StandardApiResponse<Project[]>
          // Ensure code is number, meeting StandardApiResponse requirements
          return {
            code: response.code ?? API_RESPONSE_CODE.SUCCESS,
            data: response.data ?? [],
            total:
              response.total ??
              (Array.isArray(response.data) ? response.data.length : 0),
            message: response.message ?? '',
          };
        },
        options: {
          errorMessagePrefix: 'Failed to fetch project list',
          defaultLimit: PROJECT_MANAGEMENT_CONFIG.pageSize,
          onError: (error) => {
            const errorObj =
              error instanceof Error ? error : new Error(String(error));
            logger.error({
              message: '[ProjectTableConfig] ❌ API request failed',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
                timestamp: Date.now(),
              },
              source: 'ProjectTableConfig',
              component: 'apiCall',
            });
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to fetch project list, please try again';
            Message.error(errorMessage);
          },
        },
      }),
    [], // ✅ Empty dependency array, request function remains stable
  );

  // Add render log
  logger.debug({
    message: '[ProjectTableConfig] 🔄 Component rendering',
    data: {
      hasRequest: Boolean(request),
      timestamp: Date.now(),
    },
    source: 'ProjectTableConfig',
    component: 'useProjectTableConfig',
  });

  // 🎯 Data source configuration - use utility functions
  const dataSource = useMemo(() => {
    logger.debug({
      message: '[ProjectTableConfig] 🔧 Creating dataSource',
      data: {
        timestamp: Date.now(),
      },
      source: 'ProjectTableConfig',
      component: 'useProjectTableConfig',
    });
    return createServerPaginationDataSource({ request });
  }, [request]);

  // 🎯 Table configuration - use utility functions
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: PROJECT_MANAGEMENT_CONFIG.pageSize,
        scrollX: 1400,
      }),
    [],
  );

  // 🎯 Business operation wrapper - auto-refresh
  // ✅ Use handlers pattern, let useBusinessTable automatically wrap operation functions
  const { customTableProps, wrappedHandlers } = useBusinessTable({
    dataSource,
    tableProps,
    handlers: {
      delete: async (id: string) => {
        logger.debug({
          message: '[ProjectTableConfig] 🗑️ Executing delete operation (before wrapping)',
          data: {
            projectId: id,
            timestamp: Date.now(),
          },
          source: 'ProjectTableConfig',
          component: 'delete',
        });
        if (onDelete) {
          const result = await onDelete(id);
          logger.debug({
            message: '[ProjectTableConfig] ✅ Delete operation completed',
            data: {
              projectId: id,
              success: result,
              timestamp: Date.now(),
            },
            source: 'ProjectTableConfig',
            component: 'delete',
          });
          return result;
        }
        return false;
      },
    },
    refreshConfig: {
      enableRefreshFeedback: true,
      successMessage: 'Operation succeeded',
      errorMessage: 'Operation failed, please try again',
    },
    ref, // ✅ Pass ref to useBusinessTable
  });

  // 🎯 Use wrapped delete function
  const wrappedOnDelete = useCallback(
    async (id: string): Promise<boolean> => {
      logger.debug({
        message: '[ProjectTableConfig] 📞 Calling wrapped delete function',
        data: {
          projectId: id,
          hasWrappedDelete: Boolean(wrappedHandlers?.delete),
          timestamp: Date.now(),
        },
        source: 'ProjectTableConfig',
        component: 'wrappedOnDelete',
      });
      if (wrappedHandlers?.delete) {
        return await wrappedHandlers.delete(id);
      }
      return false;
    },
    [wrappedHandlers],
  );

  // 🎯 Column configuration - use wrapped delete function
  const handleColumns = useCallback(
    (_props?: Record<string, unknown>) =>
      getProjectTableColumns({
        onEdit,
        onDelete: wrappedOnDelete, // ✅ Use wrapped function
        onToggleStatus,
      }),
    [onEdit, wrappedOnDelete, onToggleStatus],
  );

  // 🎯 Filter configuration
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      return getProjectTableFilters(props);
    },
    [],
  );

  // 🎯 Adapt onCreate type (void -> Promise<boolean>)
  const adaptedOnCreate = useCallback(async () => {
    onCreate?.();
    return true;
  }, [onCreate]);

  // 🎯 Action configuration
  const renderActions = useCallback(
    (_props?: Record<string, unknown>) => {
      return getProjectTableActions({ onCreate, onImport });
    },
    [onCreate, onImport],
  );

  // 🎯 Convert renderActions to actions
  const actions = useMemo(() => {
    return renderActions({});
  }, [renderActions]);

  return {
    // Table configuration
    customTableProps,
    wrappedHandlers,
    handleColumns,
    handleFilters,
    renderActions,
    actions,

    // Business logic state
    modalVisible: crud.modalVisible,
    editingProject: crud.editingProject,
    submitting: crud.submitting,
    form: crud.form,

    // Import-related state
    importDrawerVisible: crud.importDrawerVisible,
    uploading: crud.uploading,

    // Create project-related state
    createDrawerVisible: crud.createDrawerVisible,
    creating: crud.creating,

    // Business logic handlers
    handleCancel: crud.handleCancel,
    handleSubmit: crud.handleSubmit,
    handleDelete: crud.handleDelete,
    checkDeletePermission: crud.checkDeletePermission,

    // Import-related handlers
    handleImport: crud.handleImport,
    handleOpenImportDrawer: crud.handleOpenImportDrawer,
    handleCloseImportDrawer: crud.handleCloseImportDrawer,

    // Create project-related handlers
    handleCreate: crud.handleCreate,
    handleOpenCreateDrawer: crud.handleOpenCreateDrawer,
    handleCloseCreateDrawer: crud.handleCloseCreateDrawer,
  };
};
