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

/**
 * Project CRUD operations Hook
 * @description Create, update, delete, import and other operations for projects
 */

import { Form, Message } from '@arco-design/web-react';
import {
  type ProjectFormData,
  canDeleteProject,
  createProject,
  deleteProject,
  getDeleteRestrictionReason,
  importProjects,
  validateProjectFormData,
} from '@project';
import type { Project } from 'api-generate';
import { useCallback, useState } from 'react';

/**
 * Project CRUD Hook return value
 */
export interface UseProjectCRUDReturn {
  // State
  form: ReturnType<typeof Form.useForm<ProjectFormData>>[0];
  editingProject: Project | null;
  modalVisible: boolean;
  submitting: boolean;

  // Import-related state
  importDrawerVisible: boolean;
  uploading: boolean;

  // Create project-related state
  createDrawerVisible: boolean;
  creating: boolean;

  // State management
  setEditingProject: (project: Project | null) => void;
  setModalVisible: (visible: boolean) => void;

  // CRUD operations
  handleSubmit: (values: ProjectFormData) => Promise<boolean>;
  handleCancel: () => void;
  handleDelete: (projectId: string) => Promise<boolean>;
  checkDeletePermission: (project: Project) => boolean;

  // Import-related operations
  handleImport: (file: File) => Promise<boolean>;
  handleOpenImportDrawer: () => void;
  handleCloseImportDrawer: () => void;

  // Create project-related operations
  handleCreate: (values: {
    project_id: string;
    name: string;
  }) => Promise<boolean>;
  handleOpenCreateDrawer: () => void;
  handleCloseCreateDrawer: () => void;
}

/**
 * Project CRUD Hook
 */
export const useProjectCRUD = (): UseProjectCRUDReturn => {
  const [form] = Form.useForm<ProjectFormData>();
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Import-related state
  const [importDrawerVisible, setImportDrawerVisible] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Create project-related state
  const [createDrawerVisible, setCreateDrawerVisible] = useState(false);
  const [creating, setCreating] = useState(false);

  // 🎯 CRUD operation functions
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
          success = await createProject(values);
        }

        if (success) {
          setModalVisible(false);
          setEditingProject(null);
          form.resetFields();
          return true;
        }

        return false;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error ? error.message : 'Operation failed, please try again';
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
        const result = await deleteProject(projectId);
        return result;
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to delete project, please try again';
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

  /**
   * Handle project import
   */
  const handleImport = useCallback(async (file: File): Promise<boolean> => {
    try {
      setUploading(true);
      const success = await importProjects(file);

      if (success) {
        Message.success('Projects imported successfully');
        setImportDrawerVisible(false);
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
  }, []);

  /**
   * Open import drawer
   */
  const handleOpenImportDrawer = useCallback(() => {
    setImportDrawerVisible(true);
  }, []);

  /**
   * Close import drawer
   */
  const handleCloseImportDrawer = useCallback(() => {
    setImportDrawerVisible(false);
  }, []);

  /**
   * Handle project creation
   */
  const handleCreate = useCallback(
    async (values: { project_id: string; name: string }): Promise<boolean> => {
      try {
        setCreating(true);
        const success = await createProject(values);

        if (success) {
          Message.success('Project created successfully');
          setCreateDrawerVisible(false);
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
    },
    [],
  );

  /**
   * Open create drawer
   */
  const handleOpenCreateDrawer = useCallback(() => {
    setCreateDrawerVisible(true);
  }, []);

  /**
   * Close create drawer
   */
  const handleCloseCreateDrawer = useCallback(() => {
    setCreateDrawerVisible(false);
  }, []);

  return {
    form,
    editingProject,
    modalVisible,
    submitting,
    importDrawerVisible,
    uploading,
    createDrawerVisible,
    creating,
    setEditingProject,
    setModalVisible,
    handleSubmit,
    handleCancel,
    handleDelete,
    checkDeletePermission,
    handleImport,
    handleOpenImportDrawer,
    handleCloseImportDrawer,
    handleCreate,
    handleOpenCreateDrawer,
    handleCloseCreateDrawer,
  };
};
