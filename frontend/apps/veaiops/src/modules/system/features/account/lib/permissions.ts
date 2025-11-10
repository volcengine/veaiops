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
 * Account management permission check functions
 * @description User permission validation related functions
 */

import type { User, UserRole } from '@account';
import { USER_PERMISSIONS } from './constants';

/**
 * Check user permissions
 */
export const checkUserPermission = (
  currentUserRole: UserRole,
  targetUser: User,
  action: keyof typeof USER_PERMISSIONS.admin,
): boolean => {
  const permissions = USER_PERMISSIONS[currentUserRole];

  if (!permissions) {
    return false;
  }

  // Check basic permissions
  if (!permissions[action]) {
    return false;
  }

  // System administrators cannot be operated by other users (except other system administrators)
  if (targetUser.is_system_admin && currentUserRole !== 'admin') {
    return false;
  }

  // Users cannot operate users with higher permissions than themselves
  const roleHierarchy = { viewer: 0, user: 1, admin: 2 };
  const currentLevel = roleHierarchy[currentUserRole];
  const targetLevel = roleHierarchy[targetUser.role];

  if (targetLevel > currentLevel) {
    return false;
  }

  return true;
};
