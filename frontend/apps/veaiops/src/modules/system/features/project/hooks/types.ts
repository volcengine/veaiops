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
 * Project Hook type definitions
 */

import type { Form } from '@arco-design/web-react';
import type { ProjectFormData } from '@project/types';
import type {
  BaseQuery,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
  useBusinessTable,
} from '@veaiops/components';
import type { Project } from 'api-generate';
import type React from 'react';

/**
 * Options type for Project table configuration Hook
 */
export interface UseProjectTableConfigOptions {
  onEdit?: (record: Project) => Promise<boolean>;
  onDelete?: (projectId: string) => Promise<boolean>;
  onCreate?: () => void;
  onImport?: () => void;
  onToggleStatus?: (projectId: string, status: boolean) => Promise<boolean>;
  ref?: React.Ref<{ refresh: () => Promise<void> }>; // ✅ Add ref parameter
}

/**
 * Return type for Project table configuration Hook
 */
export interface UseProjectTableConfigReturn {
  // Table configuration
  customTableProps: ReturnType<typeof useBusinessTable>['customTableProps'];
  wrappedHandlers: ReturnType<typeof useBusinessTable>['wrappedHandlers'];
  handleColumns: (
    props?: Record<string, unknown>,
  ) => ModernTableColumnProps<Project>[];
  handleFilters: (props: HandleFilterProps<BaseQuery>) => FieldItem[];
  renderActions: (props?: Record<string, unknown>) => React.ReactNode[];
  actions: React.ReactNode[];

  // Business logic state
  modalVisible: boolean;
  editingProject: Project | null;
  submitting: boolean;
  form: ReturnType<typeof Form.useForm<ProjectFormData>>[0];

  // Import related state
  importDrawerVisible: boolean;
  uploading: boolean;

  // Create project related state
  createDrawerVisible: boolean;
  creating: boolean;

  // Business logic handlers
  handleCancel: () => void;
  handleSubmit: (values: ProjectFormData) => Promise<boolean>;
  handleDelete: (projectId: string) => Promise<boolean>;
  checkDeletePermission: (project: Project) => boolean;

  // Import related handlers
  handleImport: (file: File) => Promise<boolean>;
  handleOpenImportDrawer: () => void;
  handleCloseImportDrawer: () => void;

  // Create project related handlers
  handleCreate: (values: {
    project_id: string;
    name: string;
  }) => Promise<boolean>;
  handleOpenCreateDrawer: () => void;
  handleCloseCreateDrawer: () => void;
}
