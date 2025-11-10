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
 * Account management formatting functions
 * @description Formatting related functions for user roles, status, time, etc.
 */

import type { UserRole, UserStatus } from '@account';
import { USER_ROLE_CONFIG, USER_STATUS_CONFIG } from './constants';

/**
 * Format user role display
 */
export const formatUserRole = (role: UserRole): string => {
  return USER_ROLE_CONFIG[role]?.text || role;
};

/**
 * Format user status display
 */
export const formatUserStatus = (status: UserStatus): string => {
  return USER_STATUS_CONFIG[status]?.text || status;
};

/**
 * Get user role color
 */
export const getUserRoleColor = (role: UserRole): string => {
  return USER_ROLE_CONFIG[role]?.color || 'gray';
};

/**
 * Get user status color
 */
export const getUserStatusColor = (status: UserStatus): string => {
  return USER_STATUS_CONFIG[status]?.color || 'gray';
};

/**
 * Format last login time
 */
export const formatLastLogin = (lastLogin?: string): string => {
  if (!lastLogin) {
    return '从未登录';
  }

  const date = new Date(lastLogin);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return '今天';
  } else if (diffDays === 1) {
    return '昨天';
  } else if (diffDays < 7) {
    return `${diffDays}天前`;
  } else {
    return date.toLocaleDateString('zh-CN');
  }
};

/**
 * Format creation time
 */
export const formatDateTime = (dateTime: string): string => {
  const date = new Date(dateTime);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};
