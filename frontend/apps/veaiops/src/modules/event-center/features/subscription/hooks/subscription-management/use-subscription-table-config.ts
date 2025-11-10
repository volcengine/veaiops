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
import { createTableRequestWrapper, logger } from '@veaiops/utils';
import type {
  PaginatedAPIResponseSubscribeRelationList,
  SubscribeRelationWithAttributes,
} from 'api-generate';
import React, { useMemo } from 'react';
import { transformSubscriptionToTableData } from './lib/utils';

/**
 * Subscription relation table configuration Hook
 * Provides data source configuration, etc. (column configuration has been moved to component handling)
 */
export const useSubscriptionTableConfig = ({
  handleEdit: _handleEdit,
  handleDelete: _handleDelete,
}: {
  handleEdit: (subscription: SubscribeRelationWithAttributes) => void;
  handleDelete: (subscriptionId: string) => Promise<boolean>;
}) => {
  // 🔍 Hook execution count (for debugging)
  const hookExecutionRef = React.useRef(0);
  hookExecutionRef.current++;

  logger.debug({
    message: '[useSubscriptionTableConfig] Hook execution',
    data: {
      executionCount: hookExecutionRef.current,
      handleEditRef: _handleEdit,
      handleDeleteRef: _handleDelete,
    },
    source: 'useSubscriptionTableConfig',
    component: 'useSubscriptionTableConfig',
  });

  /**
   * CustomTable request function
   * 🔧 Use useMemo to stabilize function reference, avoid triggering unnecessary table refresh
   * Directly call API to fetch data
   */
  const request = useMemo(
    () => {
      logger.debug({
        message: '[useSubscriptionTableConfig] Request function created',
        data: {
          executionCount: hookExecutionRef.current,
        },
        source: 'useSubscriptionTableConfig',
        component: 'useMemo',
      });

      return createTableRequestWrapper({
        apiCall: async (
          params: Record<string, unknown>,
        ): Promise<{
          data: SubscribeRelationWithAttributes[];
          total: number;
        }> => {
          try {
            // ✅ Fix: Pass all query parameters (agents, event_levels, etc.)
            const response: PaginatedAPIResponseSubscribeRelationList =
              await apiClient.subscribe.getApisV1ManagerEventCenterSubscribe({
                skip: (params.skip as number) || 0,
                limit: (params.limit as number) || 10,
                ...params, // ✅ Pass other query parameters, such as agents, event_levels, enable_webhook, etc.
              });

            if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
              const tableData = response.data.map(
                transformSubscriptionToTableData,
              );
              return {
                data: tableData,
                // response type is explicitly PaginatedAPIResponseSubscribeRelationList, has total field
                total: response.total ?? tableData.length,
              };
            } else {
              throw new Error(response.message || 'Failed to fetch subscription relation list');
            }
          } catch (error) {
            Message.error('加载订阅关系列表失败，请重试');
            return {
              data: [],
              total: 0,
            };
          }
        },
        defaultLimit: 10,
      });
    },
    [], // request function doesn't depend on any external variables, use empty dependency array
  );

  // 🔧 Use useMemo to stabilize dataSource object reference, avoid triggering unnecessary table refresh
  const dataSource = useMemo(() => {
    logger.debug({
      message: '[useSubscriptionTableConfig] DataSource object created',
      data: {
        executionCount: hookExecutionRef.current,
        requestRef: request,
      },
      source: 'useSubscriptionTableConfig',
      component: 'useMemo',
    });

    return {
      request,
      ready: true,
      isServerPagination: true,
    };
  }, [request]);

  // 🔧 Use useMemo to stabilize tableProps object reference
  const tableProps = useMemo(
    () => ({
      rowKey: '_id',
      scroll: { x: 2000 },
      pagination: {
        pageSize: 10,
        showTotal: (total: number) => `共 ${total} 条记录`,
        showJumper: true,
        sizeCanChange: true,
        sizeOptions: [10, 20, 50, 100],
      },
    }),
    [],
  );

  return {
    dataSource,
    tableProps,
  };
};
