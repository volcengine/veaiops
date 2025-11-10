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

import type { User, UserFormData } from '@account';

/**
 * User list query parameters
 */
export interface UserListParams {
  skip?: number;
  limit?: number;
  username?: string;
  email?: string;
  role?: string;
  status?: string;
  is_system_admin?: boolean;
}

/**
 * User list response
 */
export interface UserListResponse {
  users: User[];
  total: number;
  skip: number;
  limit: number;
}

/**
 * Update user parameters interface
 */
export interface UpdateUserParams {
  id: string;
  userData: Partial<UserFormData>;
}
