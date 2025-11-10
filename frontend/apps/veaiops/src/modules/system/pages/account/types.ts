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
 * Shared type definitions for account management module
 */

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'locked';
  last_login?: string;
  created_at: string;
  updated_at: string;
  is_active?: boolean;
  is_supervisor?: boolean;
  is_system_admin: boolean;
  [key: string]: any; // Add index signature to satisfy BaseRecord constraint
}

export interface UserFormData {
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'user' | 'viewer';
  status: 'active' | 'inactive' | 'locked';
  is_system_admin: boolean;
}

export type UserTableData = User;
