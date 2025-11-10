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

import type { FormInstance } from '@arco-design/web-react';
// Import and re-export API-generated Project type
import type { Project } from 'api-generate';

export type { Project };

/**
 * Project status enum
 */
export type ProjectStatus =
  | 'planning'
  | 'active'
  | 'suspended'
  | 'completed'
  | 'cancelled';

/**
 * Project priority enum
 */
export type ProjectPriority = 'low' | 'medium' | 'high' | 'urgent';

/**
 * Project form data interface - form data for creating projects
 */
export interface ProjectFormData {
  /** Project ID */
  project_id: string;
  /** Project name */
  name: string;
  /** Owner */
  owner?: string;
  /** Project description */
  description?: string;
  /** Project status */
  status?: string;
  /** Priority */
  priority?: string;
  /** Project progress */
  progress?: number;
  /** Start date */
  start_date?: string;
  /** End date */
  end_date?: string;
  /** Budget amount */
  budget?: number;
  /** Whether active */
  is_active?: boolean;
}

/**
 * Project table component props interface
 */
export interface ProjectTableProps {
  onDelete: (projectId: string) => Promise<boolean>;
  onImport: () => void;
  onCreate: () => void;
}

/**
 * Project list table component props interface
 */
export interface ProjectListTableProps {
  data: Project[];
  loading: boolean;
  onView?: (project: Project) => void;
  onDelete: (projectId: string) => Promise<boolean>;
}

/**
 * Project table actions interface
 */
export interface ProjectTableActions {
  onView?: (project: Project) => void;
  onDelete: (projectId: string) => Promise<boolean>;
}

/**
 * Project modal component props interface
 */
export interface ProjectModalProps {
  visible: boolean;
  editingProject: Project | null;
  onCancel: () => void;
  onSubmit: (values: ProjectFormData) => Promise<boolean>;
  form: FormInstance<ProjectFormData>;
  submitting?: boolean;
}
