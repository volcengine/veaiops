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
import { API_RESPONSE_CODE } from '@veaiops/constants';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
  logger,
} from '@veaiops/utils';
import type { User } from 'api-generate';
import { useMemo } from 'react';

/**
 * Account table configuration Hook
 * Provides data source configuration, etc. (column configuration has been moved to component for handling)
 *
 * ✅ Utility functions used:
 * - createTableRequestWithResponseHandler: Automatically handles pagination parameters and responses
 * - createServerPaginationDataSource: Creates server-side pagination data source
 * - createStandardTableProps: Creates standard table properties
 */
export const useAccountTableConfig = ({
  handleEdit: _handleEdit,
  handleDelete: _handleDelete,
}: {
  handleEdit: (user: User) => void;
  handleDelete: (userId: string) => Promise<boolean>;
}) => {
  /**
   * CustomTable's request function
   * Uses utility function to automatically handle pagination parameters, responses, and errors, includes data transformation
   */
  // ✅ Key fix: Use useMemo to stabilize request function reference
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler<User[]>({
        apiCall: async ({ skip, limit, username }) => {
          logger.debug({
            message: '[AccountTableConfig] 🔵 API 请求开始',
            data: { skip, limit, username, timestamp: Date.now() },
            source: 'AccountTableConfig',
            component: 'request',
          });

          const response = await apiClient.users.getApisV1ManagerUsers({
            skip,
            limit,
            username: username as string | undefined,
          });

          logger.debug({
            message: '[AccountTableConfig] ✅ API 请求成功',
            data: {
              dataLength: response.data?.length,
              total: response.total,
              timestamp: Date.now(),
            },
            source: 'AccountTableConfig',
            component: 'request',
          });

          // ✅ Force type compatibility: PaginatedAPIResponseUserList -> StandardApiResponse<User[]>
          // Ensure code is number, satisfies StandardApiResponse requirements
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
          errorMessagePrefix: '获取用户列表失败',
          defaultLimit: 10,
          onError: (error) => {
            logger.error({
              message: '[AccountTableConfig] ❌ API 请求失败',
              data: {
                error: error instanceof Error ? error.message : String(error),
                timestamp: Date.now(),
              },
              source: 'AccountTableConfig',
              component: 'request',
            });
            const errorMessage =
              error instanceof Error
                ? error.message
                : '加载用户列表失败，请重试';
            Message.error(errorMessage);
          },
        },
      }),
    [], // ✅ Empty dependency array, request function remains stable
  );

  // Add render log
  logger.debug({
    message: '[AccountTableConfig] 🔄 组件渲染',
    data: { hasRequest: Boolean(request), timestamp: Date.now() },
    source: 'AccountTableConfig',
    component: 'useAccountTableConfig',
  });

  // ✅ Use utility function to create data source
  const dataSource = useMemo(() => {
    logger.debug({
      message: '[AccountTableConfig] 🔧 创建 dataSource',
      data: { timestamp: Date.now() },
      source: 'AccountTableConfig',
      component: 'dataSource',
    });
    return createServerPaginationDataSource({ request });
  }, [request]);

  // ✅ Use utility function to create table properties
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 1000,
      }),
    [],
  );

  return {
    dataSource,
    tableProps,
  };
};
