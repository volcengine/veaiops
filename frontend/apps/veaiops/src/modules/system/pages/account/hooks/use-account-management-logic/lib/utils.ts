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

import type { UserTableData } from '../../types';

/**
 * Transform user data to table data
 */
export const transformUserToTableData = (user: {
  id?: string;
  is_supervisor?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: unknown;
}): UserTableData => {
  const now = new Date().toISOString();
  return {
    ...user,
    id: user.id || `temp-${Date.now()}-${Math.random()}`,
    key: user.id || `temp-${Date.now()}-${Math.random()}`,
    // Map API fields to local fields
    role: user.is_supervisor ? 'admin' : 'user',
    status: user.is_active ? 'active' : 'inactive',
    is_system_admin: user.is_supervisor || false,
    // Ensure timestamp fields have default values
    created_at: user.created_at || now,
    updated_at: user.updated_at || now,
  } as UserTableData;
};
