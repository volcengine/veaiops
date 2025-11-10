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
 * Project management related constants, configurations, and utility functions
 */

import { exportLogsToFile as utilsExportLogsToFile } from "@veaiops/utils";
import type { Project } from "api-generate";
import type { ProjectFormData, ProjectStatus, ProjectPriority } from '@project/types';
import {
  createProject as apiCreateProject,
  deleteProject as apiDeleteProject,
  importProjects as apiImportProjects,
} from "./api";
import apiClient from "@/utils/api-client";

// Export local constant definitions (module-specific)
export * from "./constants";

// Project status configuration
export const PROJECT_STATUS_CONFIG: Record<
  ProjectStatus,
  { color: string; text: string }
> = {
  planning: { color: "blue", text: "Planning" },
  active: { color: "green", text: "In Progress" },
  suspended: { color: "orange", text: "Suspended" },
  completed: { color: "gray", text: "Completed" },
  cancelled: { color: "red", text: "Cancelled" },
};

// Project priority configuration
export const PROJECT_PRIORITY_CONFIG: Record<
  ProjectPriority,
  { color: string; text: string }
> = {
  low: { color: "green", text: "Low" },
  medium: { color: "blue", text: "Medium" },
  high: { color: "orange", text: "High" },
  urgent: { color: "red", text: "Urgent" },
};

// Project status options
export const PROJECT_STATUS_OPTIONS = [
  { label: "All", value: "" },
  { label: "Planning", value: "planning" },
  { label: "In Progress", value: "active" },
  { label: "Suspended", value: "suspended" },
  { label: "Completed", value: "completed" },
  { label: "Cancelled", value: "cancelled" },
];

// Project priority options
export const PROJECT_PRIORITY_OPTIONS = [
  { label: "All", value: "" },
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent" },
];

/**
 * Get project list (mock data)
 */
export const getProjectList = async (
  _params: Record<string, any>
): Promise<{
  data: Project[];
  total: number;
}> => {
  const response =
    await apiClient.projects.getApisV1ManagerSystemConfigProjects({});
  return {
    data: response.data || [],
    total: response.data?.length || 0,
  };
};

// ✅ Split: Unified export from utils directory
export {
  formatBudget,
  formatDate,
  formatDateTime,
  formatProgress,
  formatProjectPriority,
  formatProjectStatus,
} from './utils/formatters';

export {
  validateDate,
  validateDateRange,
  validateProjectFormData,
} from './utils/validators';

export {
  transformFormDataToProject,
  transformProjectToFormData,
} from './utils/transformers';

export {
  canDeleteProject,
  exportProjectsToCSV,
  filterProjects,
  generateProjectId,
  getDeleteRestrictionReason,
  getProjectStats,
  sortProjects,
} from './utils/helpers';

/**
 * Create project - re-export implementation from api.ts
 */
export const createProject = apiCreateProject;

/**
 * Delete project - wrap implementation from api.ts
 */
export const deleteProject = async (projectId: string): Promise<boolean> => {
  const result = await apiDeleteProject(projectId);
  return result.success;
};

// transformProjectToFormData and validateProjectFormData are exported from utils/transformers and utils/validators

/**
 * Project validation rules
 */
export const PROJECT_VALIDATION_RULES = {
  name: {
    required: true,
    maxLength: 50,
  },
  description: {
    maxLength: 200,
  },
  budget: {
    min: 0,
  },
  progress: {
    min: 0,
    max: 100,
  },
};

/**
 * Export debug logs
 */
export const exportDebugLogs = (filename: string): void => {
  utilsExportLogsToFile(filename);
};

/**
 * Import projects - wrap implementation from api.ts
 */
export const importProjects = async (file: File): Promise<boolean> => {
  const result = await apiImportProjects(file);
  return result.success;
};

// Export table configuration related
export * from "./table-columns";
export * from "./table-config";
