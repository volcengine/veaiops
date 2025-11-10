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

import type { User } from 'api-generate';

type UserTableData = User;

/**
 * Transform user data to table data
 *
 * @param user - User data returned from API (User type from api-generate)
 * @returns Transformed user table data
 */
export const transformUserToTableData = (
  user: User,
): UserTableData => {
  const now = new Date().toISOString();
  return {
    ...user,
    id: user._id || `temp-${Date.now()}-${Math.random()}`,
    key: user._id || `temp-${Date.now()}-${Math.random()}`,
    // Map API fields to local fields
    role: user.is_supervisor ? 'admin' : 'user',
    status: user.is_active ? 'active' : 'inactive',
    is_system_admin: user.is_supervisor || false,
    // Ensure timestamp fields have default values
    created_at: user.created_at || now,
    updated_at: user.updated_at || now,
  };
};
