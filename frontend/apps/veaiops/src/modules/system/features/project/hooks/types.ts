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
 * Project Hook 类型定义
 */

import type { Form } from '@arco-design/web-react';
import type { ProjectFormData } from '@project/types';
import type {
  BaseQuery,
  CustomTableActionType,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
  useBusinessTable,
} from '@veaiops/components';
import type { Project } from 'api-generate';
import type React from 'react';

/**
 * Project query parameters type (extends BaseQuery)
 */
export interface ProjectQueryParams extends BaseQuery {
  skip?: number;
  limit?: number;
  name?: string;
}

/**
 * Project table configuration Hook options type
 */
export interface UseProjectTableConfigOptions {
  onEdit?: (record: Project) => Promise<boolean>;
  onDelete?: (projectId: string) => Promise<boolean>;
  onCreate?: () => void;
  onImport?: () => void;
  onToggleStatus?: (projectId: string, status: boolean) => Promise<boolean>;
  ref?: React.Ref<CustomTableActionType<Project, BaseQuery>>;
}

/**
 * Project 表格配置 Hook 的返回值类型
 */
export interface UseProjectTableConfigReturn {
  // 表格配置
  customTableProps: ReturnType<typeof useBusinessTable>['customTableProps'];
  wrappedHandlers: ReturnType<typeof useBusinessTable>['wrappedHandlers'];
  handleColumns: (
    props?: Record<string, unknown>,
  ) => ModernTableColumnProps<Project>[];
  handleFilters: (props: HandleFilterProps<BaseQuery>) => FieldItem[];
  renderActions: (props?: Record<string, unknown>) => React.ReactNode[];
  actions: React.ReactNode[];

  // 业务逻辑状态
  modalVisible: boolean;
  editingProject: Project | null;
  submitting: boolean;
  form: ReturnType<typeof Form.useForm<ProjectFormData>>[0];

  // 导入相关状态
  importDrawerVisible: boolean;
  uploading: boolean;

  // 新建项目相关状态
  createDrawerVisible: boolean;
  creating: boolean;

  // 业务逻辑处理器
  handleCancel: () => void;
  handleSubmit: (values: ProjectFormData) => Promise<boolean>;
  handleDelete: (projectId: string) => Promise<boolean>;
  checkDeletePermission: (project: Project) => boolean;

  // 导入相关处理器
  handleImport: (file: File) => Promise<boolean>;
  handleOpenImportDrawer: () => void;
  handleCloseImportDrawer: () => void;

  // 新建项目相关处理器
  handleCreate: (values: {
    project_id: string;
    name: string;
  }) => Promise<boolean>;
  handleOpenCreateDrawer: () => void;
  handleCloseCreateDrawer: () => void;
}
