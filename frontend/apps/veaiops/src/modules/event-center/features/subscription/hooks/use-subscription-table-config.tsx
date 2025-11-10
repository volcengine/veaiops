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
 * Subscription relation table configuration Hook
 *
 * 🎯 Implements Hook aggregation pattern + automatic refresh mechanism following best practices
 * 🎯 Prioritizes standard types: @veaiops/components and api-generate
 */

import { Button, Message } from '@arco-design/web-react';
import { IconPlus, IconRefresh } from '@arco-design/web-react/icon';
// ✅ Optimization: Use shortest path, merge imports from same source
import {
  getSubscriptionColumns,
  getSubscriptionFilters,
  subscriptionService,
} from '@ec/subscription';
import {
  type BaseQuery,
  type CustomTableActionType,
  type FieldItem,
  type HandleFilterProps,
  type ModernTableColumnProps,
  type OperationWrappers,
  type QueryValue,
  useBusinessTable,
} from '@veaiops/components';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import {
  type StandardApiResponse,
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
  logger,
} from '@veaiops/utils';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { useCallback, useMemo } from 'react';

/**
 * Subscription relation query parameter type (extends BaseQuery)
 */
export interface SubscriptionQueryParams extends BaseQuery {
  name?: string;
  agent_type?: string;
  event_level?: string;
  agents?: string[];
  event_levels?: string[];
  enable_webhook?: boolean;
  products?: string[];
  projects?: string[];
  customers?: string[];
  show_all?: boolean;
}

/**
 * Subscription relation table configuration Hook parameter type
 */
export interface UseSubscriptionTableConfigOptions {
  onEdit?: (subscription: SubscribeRelationWithAttributes) => void;
  onDelete?: (subscriptionId: string) => Promise<boolean>;
  onCreate?: () => void;
  onToggleStatus?: (
    subscriptionId: string,
    isActive: boolean,
  ) => Promise<boolean>;
  onRefresh?: () => void;
  ref?: React.Ref<
    CustomTableActionType<
      SubscribeRelationWithAttributes,
      SubscriptionQueryParams
    >
  >;
}

/**
 * Subscription relation table configuration Hook return value type
 */
export interface UseSubscriptionTableConfigReturn {
  customTableProps: ReturnType<typeof useBusinessTable>['customTableProps'];
  customOperations: ReturnType<typeof useBusinessTable>['customOperations'];
  handleColumns: (
    props?: Record<string, QueryValue>,
  ) => ModernTableColumnProps<SubscribeRelationWithAttributes>[];
  handleFilters: (
    props: HandleFilterProps<SubscriptionQueryParams>,
  ) => FieldItem[];
  renderActions: (props?: Record<string, QueryValue>) => JSX.Element[];
}

/**
 * Subscription relation table configuration Hook
 *
 * Provides complete table configuration (integrated with useBusinessTable and operationWrapper automatic refresh)
 */
export const useSubscriptionTableConfig = ({
  onEdit,
  onDelete,
  onCreate,
  onToggleStatus,
  onRefresh,
  ref,
}: UseSubscriptionTableConfigOptions): UseSubscriptionTableConfigReturn => {
  // 🎯 Request function - use utility function
  // ✅ Key fix: Use useMemo to stabilize request function reference
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({ skip, limit, ...otherParams }) => {
          logger.debug({
            message: '[SubscriptionTableConfig] API 请求开始',
            data: {
              skip,
              limit,
              otherParams,
              timestamp: Date.now(),
            },
            source: 'SubscriptionTableConfig',
            component: 'apiCall',
          });

          const response = await subscriptionService.getSubscriptions({
            ...otherParams,
            skip,
            limit,
          } as SubscriptionQueryParams);

          logger.debug({
            message: '[SubscriptionTableConfig] API 请求成功',
            data: {
              dataLength: response.data?.length,
              total: response.total,
              timestamp: Date.now(),
            },
            source: 'SubscriptionTableConfig',
            component: 'apiCall',
          });

          // Type conversion: PaginatedAPIResponseSubscribeRelationList is structurally compatible with StandardApiResponse<SubscribeRelationWithAttributes[]>
          return response as unknown as StandardApiResponse<
            SubscribeRelationWithAttributes[]
          >;
        },
        options: {
          errorMessagePrefix: '加载订阅关系列表失败',
          defaultLimit: 10,
          onError: (error) => {
            logger.error({
              message: '[SubscriptionTableConfig] API 请求失败',
              data: {
                error: error instanceof Error ? error.message : String(error),
                timestamp: Date.now(),
                errorObj: error,
              },
              source: 'SubscriptionTableConfig',
              component: 'onError',
            });
            const errorMessage =
              error instanceof Error
                ? error.message
                : '加载订阅关系列表失败，请重试';
            Message.error(errorMessage);
          },
        },
      }),
    [], // ✅ Empty dependency array, request function remains stable
  );

  // Add render log
  logger.debug({
    message: '[SubscriptionTableConfig] 组件渲染',
    data: {
      hasRequest: Boolean(request),
      timestamp: Date.now(),
    },
    source: 'SubscriptionTableConfig',
    component: 'useMemo',
  });

  // 🎯 Data source configuration - use utility function
  const dataSource = useMemo(() => {
    logger.debug({
      message: '[SubscriptionTableConfig] 创建 dataSource',
      data: {
        timestamp: Date.now(),
      },
      source: 'SubscriptionTableConfig',
      component: 'useMemo',
    });
    return createServerPaginationDataSource({ request });
  }, [request]);

  // 🎯 Table properties configuration - use utility function
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 2300,
      }) as Record<string, unknown>,
    [],
  );

  // 🎯 Use useBusinessTable to integrate all logic
  const { customTableProps, customOperations } =
    useBusinessTable<SubscriptionQueryParams>({
      dataSource,
      tableProps,
      ref: ref ? (ref as React.Ref<CustomTableActionType>) : undefined,
      refreshConfig: {
        enableRefreshFeedback: true,
        successMessage: '操作成功',
        errorMessage: '操作失败，请重试',
      },
      operationWrapper: ({ wrapUpdate, wrapDelete }: OperationWrappers) => ({
        handleEdit: (..._args: unknown[]) =>
          wrapUpdate(async () => {
            // operationWrapper doesn't need actual call, only for automatic refresh
          }),
        handleDelete: (..._args: unknown[]) =>
          wrapDelete(async (_id: string): Promise<boolean> => {
            // operationWrapper doesn't need actual call, only for automatic refresh
            return true;
          }),
      }),
    });

  // 🎯 Get column configuration
  const handleColumns = useCallback(
    (
      props?: Record<string, QueryValue>,
    ): ModernTableColumnProps<SubscribeRelationWithAttributes>[] =>
      getSubscriptionColumns({
        showModuleTypeColumn: props?.showModuleTypeColumn,
        onEdit,
        onDelete,
        onToggleStatus,
      }),
    [onEdit, onDelete, onToggleStatus],
  );

  // 🎯 Get filter configuration
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      return getSubscriptionFilters({
        query: props.query,
        handleChange: props.handleChange,
        moduleType: undefined, // Use default value
      });
    },
    [],
  );

  // 🎯 Get action button configuration
  const renderActions = useCallback(
    (_props?: Record<string, QueryValue>): JSX.Element[] =>
      [
        onCreate && (
          <Button
            key="create"
            type="primary"
            icon={<IconPlus />}
            onClick={onCreate}
          >
            新建订阅
          </Button>
        ),
        onRefresh && (
          <Button key="refresh" icon={<IconRefresh />} onClick={onRefresh}>
            刷新
          </Button>
        ),
      ].filter((item): item is JSX.Element => Boolean(item)),
    [onCreate, onRefresh],
  );

  return {
    customTableProps,
    customOperations,
    handleColumns,
    handleFilters,
    renderActions,
  };
};
