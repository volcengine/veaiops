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

// Directly use API generated User type
import type { FormInstance } from '@arco-design/web-react';
import type { User as ApiUser } from 'api-generate';

/**
 * User role type
 */
export type UserRole = 'admin' | 'user' | 'viewer';

/**
 * User status type
 */
export type UserStatus = 'active' | 'inactive' | 'locked';

/**
 * Extended user type, includes locally required fields
 */
export interface User extends Omit<ApiUser, '_id'> {
  id: string; // Map _id to id
  role: UserRole;
  status: UserStatus;
  is_system_admin: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

/**
 * User form data interface
 */
export interface UserFormData {
  /** Username */
  username: string;
  /** Email */
  email: string;
  /** Password */
  password?: string;
  /** Old password (used when changing password) */
  old_password?: string;
  /** New password (used when changing password) */
  new_password?: string;
  /** Confirm new password (used when changing password) */
  confirm_password?: string;
  /** Whether active */
  is_active?: boolean;
  /** Whether administrator */
  is_supervisor?: boolean;
}

/**
 * User table data type
 */
export type UserTableData = User;

/**
 * User table component props interface
 */
export interface UserTableProps {
  onEdit: (user: User) => void;
  onDelete: (userId: string) => Promise<boolean>;
  onAdd: () => void;
}

/**
 * User modal component props interface
 */

export interface UserModalProps {
  visible: boolean;
  editingUser: User | null;
  onCancel: () => void;
  onSubmit: (values: UserFormData) => Promise<boolean>;
  /** Arco Design Form instance type */
  form: FormInstance;
}
