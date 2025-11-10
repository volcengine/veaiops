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
import { formatDateTime } from '../formatters';

/**
 * Filter project list
 */
export const filterProjects = (
  projects: Project[],
  filters: {
    name?: string;
    is_active?: boolean;
  },
): Project[] => {
  return projects.filter((project) => {
    // Name filter
    if (
      filters.name &&
      !project.name.toLowerCase().includes(filters.name.toLowerCase())
    ) {
      return false;
    }

    // Status filter (based on is_active)
    if (
      filters.is_active !== undefined &&
      project.is_active !== filters.is_active
    ) {
      return false;
    }

    return true;
  });
};

/**
 * Sort project list
 */
export const sortProjects = (
  projects: Project[],
  sortField: keyof Project,
  sortOrder: 'asc' | 'desc',
): Project[] => {
  return [...projects].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (aValue === undefined || aValue === null) {
      return 1;
    }
    if (bValue === undefined || bValue === null) {
      return -1;
    }

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else {
      comparison = JSON.stringify(aValue).localeCompare(JSON.stringify(bValue));
    }

    return sortOrder === 'desc' ? -comparison : comparison;
  });
};

/**
 * Get project statistics
 */
export const getProjectStats = (projects: Project[]) => {
  const stats = {
    total: projects.length,
    active: 0,
    inactive: 0,
  };

  projects.forEach((project) => {
    // Status statistics (based on is_active)
    if (project.is_active) {
      stats.active++;
    } else {
      stats.inactive++;
    }
  });

  return stats;
};

/**
 * Export project data as CSV
 */
export const exportProjectsToCSV = (projects: Project[]): void => {
  const headers = [
    'MongoDB ID',
    '项目ID',
    '项目名称',
    '状态',
    '创建时间',
    '更新时间',
  ];

  const csvContent = [
    headers.join(','),
    ...projects.map((project) =>
      [
        project._id || '',
        `"${project.project_id}"`,
        `"${project.name}"`,
        project.is_active ? '活跃' : '非活跃',
        formatDateTime(project.created_at || ''),
        formatDateTime(project.updated_at || ''),
      ].join(','),
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `projects-${Date.now()}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
