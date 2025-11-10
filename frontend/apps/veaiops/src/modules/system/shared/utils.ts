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
 * System module shared utility functions
 * @description Common utility functions and helper methods for system module
 */

import type { User } from 'api-generate';
import type { User as ExtendedUser } from '../features/account/types';

/**
 * Transform API user data to extended user data
 * @param apiUser Original user data returned from API
 * @returns Extended user data, including additional fields required by frontend business
 */
export const transformApiUserToExtendedUser = (apiUser: User): ExtendedUser => {
  return {
    id: apiUser._id || '', // Map _id to id
    username: apiUser.username,
    email: apiUser.email,
    is_active: apiUser.is_active,
    is_supervisor: apiUser.is_supervisor,
    created_at: apiUser.created_at || '',
    updated_at: apiUser.updated_at || '',
    role: apiUser.is_supervisor ? 'admin' : 'user',
    status: apiUser.is_active ? 'active' : 'inactive',
    is_system_admin: apiUser.is_supervisor || false,
  };
};
