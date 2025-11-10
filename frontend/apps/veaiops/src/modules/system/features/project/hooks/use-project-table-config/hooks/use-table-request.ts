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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { PROJECT_MANAGEMENT_CONFIG } from '@project';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { createTableRequestWithResponseHandler } from '@veaiops/utils';
import type { Project } from 'api-generate';

/**
 * Table request logic Hook
 */
export const useTableRequest = () => {
  // 🎯 Data request logic - use utility function
  const request = createTableRequestWithResponseHandler<Project[]>({
    apiCall: async ({ skip, limit, name }) => {
      const response =
        await apiClient.projects.getApisV1ManagerSystemConfigProjects({
          skip,
          limit,
          name: name as string | undefined,
        });

      // Force type compatibility: PaginatedAPIResponseProjectList -> StandardApiResponse<Project[]>
      // Ensure code is number, satisfy StandardApiResponse requirements
      return {
        code: response.code ?? API_RESPONSE_CODE.SUCCESS,
        data: response.data ?? [],
        total:
          response.total ??
          (Array.isArray(response.data) ? response.data.length : 0),
        message: response.message ?? '',
      };
    },
    options: {
      errorMessagePrefix: '获取项目列表失败',
      defaultLimit: PROJECT_MANAGEMENT_CONFIG.pageSize,
      onError: (error) => {
        const errorMessage =
          error instanceof Error ? error.message : '获取项目列表失败，请重试';
        Message.error(errorMessage);
      },
    },
  });

  return { request };
};
