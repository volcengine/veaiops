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
import { Button, Message } from '@arco-design/web-react';
import { IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { ModuleType } from '@veaiops/types';
import {
  type StandardApiResponse,
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import type { SubscribeRelationWithAttributes } from 'api-generate';

/**
 * Table configuration Hook
 */
export const useSubscribeRelationTableConfig = ({
  moduleType,
}: {
  moduleType: string;
}) => {
  /**
   * CustomTable request function
   * Use utility functions to automatically handle pagination parameters, response, and errors
   */
  const request = createTableRequestWithResponseHandler({
    apiCall: async ({
      skip,
      limit,
      name,
      agents,
      eventLevels,
      enableWebhook,
      projects,
    }) => {
      const response =
        await apiClient.subscribe.getApisV1ManagerEventCenterSubscribe({
          agents:
            (agents as string[] | undefined) ||
            (moduleType === ModuleType.EVENT_CENTER
              ? undefined
              : ['intelligent_threshold_agent']),
          skip,
          limit,
          name: name as string | undefined,
          event_levels: eventLevels as string[] | undefined,
          enable_webhook: enableWebhook as boolean | undefined,
          projects: projects as string[] | undefined,
        });
      // Type conversion: PaginatedAPIResponseSubscribeRelationList is compatible with StandardApiResponse<SubscribeRelationWithAttributes[]> structure
      return response as unknown as StandardApiResponse<
        SubscribeRelationWithAttributes[]
      >;
    },
    options: {
      errorMessagePrefix: '获取订阅关系列表失败',
      defaultLimit: 10,
      onError: (error) => {
        const errorMessage =
          error instanceof Error
            ? error.message
            : '加载订阅关系列表失败，请重试';
        Message.error(errorMessage);
      },
    },
  });

  // 🎯 Use utility function to create data source
  const dataSource = createServerPaginationDataSource({ request });

  // 🎯 Use utility function to create table properties
  const tableProps = createStandardTableProps({
    rowKey: '_id',
    pageSize: 10,
    scrollX: 1200,
  });

  return {
    dataSource,
    tableProps,
  };
};

/**
 * Action button configuration Hook
 */
export const useSubscribeRelationActionConfig = ({
  onCreate,
  onRefresh,
  loading,
}: {
  onCreate: () => void;
  onRefresh: () => void;
  loading?: boolean;
}) => {
  return {
    actions: [
      <Button
        key="create"
        type="primary"
        icon={<IconPlus />}
        onClick={onCreate}
      >
        新建订阅关系
      </Button>,
      <Button
        key="refresh"
        icon={<IconRefresh />}
        onClick={onRefresh}
        loading={loading}
      >
        刷新
      </Button>,
    ],
  };
};
