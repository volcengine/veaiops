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

import type { ProjectPriority, ProjectStatus } from '@project/types';
import {
  PROJECT_BUDGET_CONFIG,
  PROJECT_PRIORITY_CONFIG,
  PROJECT_PROGRESS_COLORS,
  PROJECT_STATUS_CONFIG,
} from '../constants';

/**
 * Format project status display
 */
export const formatProjectStatus = (status: ProjectStatus) => {
  const config = PROJECT_STATUS_CONFIG[status];
  return {
    text: config?.text || status,
    color: config?.color || 'default',
  };
};

/**
 * Format project priority display
 */
export const formatProjectPriority = (priority: ProjectPriority) => {
  const config = PROJECT_PRIORITY_CONFIG[priority];
  return {
    text: config?.text || priority,
    color: config?.color || 'default',
  };
};

/**
 * Format date time display
 */
export const formatDateTime = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format date display (date only)
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch {
    return dateString;
  }
};

/**
 * Format budget display
 */
export const formatBudget = (budget: number): string => {
  if (!budget || budget === 0) {
    return '-';
  }

  return new Intl.NumberFormat(PROJECT_BUDGET_CONFIG.locale, {
    style: 'currency',
    currency: 'CNY',
    minimumFractionDigits: PROJECT_BUDGET_CONFIG.minimumFractionDigits,
    maximumFractionDigits: PROJECT_BUDGET_CONFIG.maximumFractionDigits,
  }).format(budget);
};

/**
 * Format progress display
 */
export const formatProgress = (
  progress: number,
): {
  text: string;
  color: string;
  percentage: number;
} => {
  const percentage = Math.max(0, Math.min(100, progress || 0));

  let color: string = PROJECT_PROGRESS_COLORS.low;
  if (percentage > 70) {
    color = PROJECT_PROGRESS_COLORS.high;
  } else if (percentage > 30) {
    color = PROJECT_PROGRESS_COLORS.medium;
  }

  return {
    text: `${percentage}%`,
    color,
    percentage,
  };
};
