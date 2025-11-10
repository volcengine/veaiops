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

import type { User, UserRole, UserStatus } from '@account';
import type { User as ApiUser } from 'api-generate';

/**
 * Transform API user data to local user data
 */
export const transformApiUserToUser = (
  apiUser: ApiUser,
  options?: {
    isSupervisor?: boolean;
  },
): User => {
  return {
    id: apiUser._id || `user-${Date.now()}-${Math.random()}`,
    username: apiUser.username || '',
    email: apiUser.email || '',
    role: (options?.isSupervisor ?? apiUser.is_supervisor
      ? 'admin'
      : 'user') as UserRole,
    status: (apiUser.is_active ? 'active' : 'inactive') as UserStatus,
    last_login: apiUser.updated_at,
    created_at: apiUser.created_at || new Date().toISOString(),
    updated_at: apiUser.updated_at || new Date().toISOString(),
    is_system_admin: apiUser.is_supervisor || false,
  };
};
