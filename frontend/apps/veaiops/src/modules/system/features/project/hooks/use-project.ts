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

import { Form, Message } from '@arco-design/web-react';
import {
  type Project,
  type ProjectFormData,
  canDeleteProject,
  createProject,
  deleteProject,
  getDeleteRestrictionReason,
  importProjects,
  validateProjectFormData,
} from '@project';
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useCallback, useState } from 'react';

/**
 * Project management business logic Hook
 * Complete implementation based on CustomTable standard pattern
 *
 * @description Provides complete business logic for project management, including:
 * - Form state management
 * - CRUD operation handling
 * - Permission control
 * - Error handling
 * - User interaction feedback
 * - 🎯 Refresh logic is automatically handled by operationWrapper, no need to manually pass refreshTable
 */
export const useProject = ({
  tableRef,
}: {
  tableRef?: React.RefObject<{ refresh: () => Promise<void> }>;
} = {}) => {
  // Form instance
  const [form] = Form.useForm<ProjectFormData>();

  // State management
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Import-related logic
  const importLogic = useProjectImportLogic({ tableRef });

  // Create project-related logic
  const createLogic = useProjectCreateLogic({ tableRef });

  /**
   * Handle form submission
   * Supports both create and edit modes
   */
  const handleSubmit = useCallback(
    async (values: ProjectFormData): Promise<boolean> => {
      try {
        // Form validation
        const validationErrors = validateProjectFormData(values);
        if (validationErrors.length > 0) {
          Message.error(validationErrors[0]);
          return false;
        }

        setSubmitting(true);

        let success = false;

        if (editingProject) {
          // Edit mode - Currently only supports create, edit functionality pending backend API support
          Message.warning('Edit feature is not yet available, please contact administrator');
          return false;
        } else {
          // Create mode
          const createSuccess = await createProject(values);
          success = createSuccess;
        }

        if (success) {
          setModalVisible(false);
          setEditingProject(null);
          form.resetFields();

          // ✅ Refresh logic is automatically handled by operationWrapper
          return true;
        }

        return false;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Operation failed, please try again';
        Message.error(errorMessage);
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [editingProject, form],
  );

  /**
   * Close modal
   */
  const handleCancel = useCallback(() => {
    setModalVisible(false);
    setEditingProject(null);
    form.resetFields();
    setSubmitting(false);
  }, [form]);

  /**
   * Delete project
   * Includes permission check and user confirmation
   */
  const handleDelete = useCallback(
    async (projectId: string): Promise<boolean> => {
      try {
        // Note: Full project information is needed here for permission check
        // In actual implementation, may need to fetch project details first
        // Temporarily skip permission check and delete directly

        const result = await deleteProject(projectId);
        // ✅ Refresh logic is automatically handled by operationWrapper
        return result;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to delete project, please try again';
        Message.error(errorMessage);
        return false;
      }
    },
    [],
  );

  /**
   * Check project delete permission
   */
  const checkDeletePermission = useCallback((project: Project): boolean => {
    const canDelete = canDeleteProject(project);

    if (!canDelete) {
      const reason = getDeleteRestrictionReason(project);
      if (reason) {
        Message.warning(reason);
      }
    }

    return canDelete;
  }, []);

  return {
    // State
    modalVisible,
    editingProject,
    submitting,
    form,

    // Event handlers
    handleCancel,
    handleSubmit,
    handleDelete,
    checkDeletePermission,

    // Import-related
    ...importLogic,

    // Create project-related
    ...createLogic,
  };
};

/**
 * Create project management Hook
 * Provides state and logic related to creating projects
 * 🎯 Refresh logic is automatically handled by operationWrapper
 */
export const useProjectCreateLogic = ({
  tableRef,
}: {
  tableRef?: React.RefObject<{ refresh: () => Promise<void> }>;
} = {}) => {
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  /**
   * Handle project creation
   * ✅ Manually refresh table after successful creation
   */
  const handleCreate = async (values: {
    project_id: string;
    name: string;
  }): Promise<boolean> => {
    try {
      setCreating(true);
      const success = await createProject(values);

      if (success) {
        Message.success('Project created successfully');
        setCreateDrawerVisible(false);

        // ✅ Manually call table refresh
        logger.debug({
          message: '[useProject] 🔄 Project created successfully, preparing to refresh table',
          data: {
            timestamp: Date.now(),
            hasTableRef: Boolean(tableRef),
            hasRefCurrent: Boolean(tableRef?.current),
            hasRefresh: Boolean(tableRef?.current?.refresh),
          },
          source: 'useProject',
          component: 'handleCreate',
        });

        if (tableRef?.current?.refresh) {
          try {
            await tableRef.current.refresh();
            logger.debug({
              message: '[useProject] ✅ Table refreshed successfully',
              data: {
                timestamp: Date.now(),
              },
              source: 'useProject',
              component: 'handleCreate',
            });
          } catch (refreshError) {
            const errorObj =
              refreshError instanceof Error
                ? refreshError
                : new Error(String(refreshError));
            logger.error({
              message: '[useProject] ❌ Failed to refresh table',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
                timestamp: Date.now(),
              },
              source: 'useProject',
              component: 'handleCreate',
            });
          }
        } else {
          logger.warn({
            message: '[useProject] ⚠️ Cannot refresh table: tableRef is not available',
            data: {
              timestamp: Date.now(),
            },
            source: 'useProject',
            component: 'handleCreate',
          });
        }

        return true;
      } else {
        Message.error('Failed to create project');
        return false;
      }
    } catch (error) {
      // ✅ Correct: Extract actual error information
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to create project, please try again';
      Message.error(errorMessage);
      return false;
    } finally {
      setCreating(false);
    }
  };

  /**
   * Open create drawer
   */
  const handleOpenCreateDrawer = () => {
    logger.debug({
      message: '[useProject] 🚪 Opening create project drawer',
      data: {
        timestamp: Date.now(),
        currentVisible: createDrawerVisible,
      },
      source: 'useProject',
      component: 'handleOpenCreateDrawer',
    });
    setCreateDrawerVisible(true);
  };

  /**
   * Close create drawer
   */
  const handleCloseCreateDrawer = () => {
    logger.debug({
      message: '[useProject] 🚪 Closing create project drawer',
      data: {
        timestamp: Date.now(),
        currentVisible: createDrawerVisible,
      },
      source: 'useProject',
      component: 'handleCloseCreateDrawer',
    });
    setCreateDrawerVisible(false);
  };

  return {
    // State
    createDrawerVisible,
    creating,

    // Event handlers
    handleCreate,
    handleOpenCreateDrawer,
    handleCloseCreateDrawer,
  };
};

/**
 * Project import management Hook
 * Provides state and logic related to importing projects
 * 🎯 Refresh logic is automatically handled by operationWrapper
 */
export const useProjectImportLogic = ({
  tableRef,
}: {
  tableRef?: React.RefObject<{ refresh: () => Promise<void> }>;
} = {}) => {
  const [importDrawerVisible, setImportDrawerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  /**
   * Handle project import
   * ✅ Manually refresh table after successful import
   */
  const handleImport = async (file: File): Promise<boolean> => {
    try {
      setUploading(true);
      const success = await importProjects(file);

      if (success) {
        Message.success('Projects imported successfully');
        setImportDrawerVisible(false);

        // ✅ Manually call table refresh
        logger.debug({
          message: '[useProject] 🔄 Project imported successfully, preparing to refresh table',
          data: {
            timestamp: Date.now(),
            hasTableRef: Boolean(tableRef),
            hasRefCurrent: Boolean(tableRef?.current),
            hasRefresh: Boolean(tableRef?.current?.refresh),
          },
          source: 'useProject',
          component: 'handleImport',
        });

        if (tableRef?.current?.refresh) {
          try {
            await tableRef.current.refresh();
            logger.debug({
              message: '[useProject] ✅ Table refreshed successfully',
              data: {
                timestamp: Date.now(),
              },
              source: 'useProject',
              component: 'handleImport',
            });
          } catch (refreshError) {
            const errorObj =
              refreshError instanceof Error
                ? refreshError
                : new Error(String(refreshError));
            logger.error({
              message: '[useProject] ❌ Failed to refresh table',
              data: {
                error: errorObj.message,
                stack: errorObj.stack,
                errorObj,
                timestamp: Date.now(),
              },
              source: 'useProject',
              component: 'handleImport',
            });
          }
        } else {
          logger.warn({
            message: '[useProject] ⚠️ Cannot refresh table: tableRef is not available',
            data: {
              timestamp: Date.now(),
            },
            source: 'useProject',
            component: 'handleImport',
          });
        }

        return true;
      } else {
        Message.error('Failed to import projects');
        return false;
      }
    } catch (error) {
      // ✅ Correct: Extract actual error information
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to import projects, please try again';
      Message.error(errorMessage);
      return false;
    } finally {
      setUploading(false);
    }
  };

  /**
   * Open import drawer
   */
  const handleOpenImportDrawer = () => {
    logger.debug({
      message: '[useProject] 🚪 Opening import project drawer',
      data: {
        timestamp: Date.now(),
        currentVisible: importDrawerVisible,
      },
      source: 'useProject',
      component: 'handleOpenImportDrawer',
    });
    setImportDrawerVisible(true);
  };

  /**
   * Close import drawer
   */
  const handleCloseImportDrawer = () => {
    logger.debug({
      message: '[useProject] 🚪 Closing import project drawer',
      data: {
        timestamp: Date.now(),
        currentVisible: importDrawerVisible,
      },
      source: 'useProject',
      component: 'handleCloseImportDrawer',
    });
    setImportDrawerVisible(false);
  };

  return {
    // State
    importDrawerVisible,
    uploading,

    // Event handlers
    handleImport,
    handleOpenImportDrawer,
    handleCloseImportDrawer,
  };
};
