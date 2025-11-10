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

import type { Project } from '@project/types';

/**
 * Generate project ID
 */
export const generateProjectId = (): string => {
  return `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Check if project can be deleted
 */
export const canDeleteProject = (project: Project): boolean => {
  // Projects in inactive state can be deleted
  return project.is_active === false;
};

/**
 * Get project deletion restriction reason
 */
export const getDeleteRestrictionReason = (project: Project): string | null => {
  if (project.is_active === true) {
    return '活跃状态的项目不能删除，请先停用项目';
  }
  return null;
};
