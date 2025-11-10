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

import type { UserListParams } from './types';

/**
 * Export user data
 */
export const exportUsers = async (
  _params: UserListParams = {},
): Promise<Blob> => {
  try {
    // TODO: Replace with actual API call
    // const response = await apiClient.get('/api/users/export', { params });

    // Mock CSV data
    const csvData = `用户名,邮箱,角色,状态,系统管理员,创建时间
admin,admin@volcaiops.com,管理员,正常,是,2024-01-01 00:00:00
user1,user1@volcaiops.com,普通用户,正常,否,2024-01-02 00:00:00
viewer1,viewer1@volcaiops.com,只读用户,未激活,否,2024-01-03 00:00:00`;

    return new Blob([csvData], { type: 'text/csv;charset=utf-8' });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to export user data';
    throw new Error(errorMessage);
  }
};
