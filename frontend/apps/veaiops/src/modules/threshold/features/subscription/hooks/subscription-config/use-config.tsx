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
 * Subscribe relation table configuration Hook
 *
 * Integrates useBusinessTable and various configuration hooks
 */

import { ModuleType } from '@/types/module';
import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import {
  type BaseQuery,
  type CustomTableActionType,
  type FieldItem,
  type HandleFilterProps,
  type ModernTableColumnProps,
  type OperationWrappers,
  useBusinessTable,
} from '@veaiops/components';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { getSubscribeRelationActions } from './lib/actions';
import { getSubscribeRelationColumns } from './lib/columns';
import { getSubscribeRelationFilters } from './lib/filters';
import type {
  SubscribeRelationTableConfigResult,
  UseSubscribeRelationTableConfigParams,
} from './lib/types';

/**
 * Subscribe relation table configuration Hook
 *
 * Optimization notes:
 * - Fully integrated useBusinessTable, leveraging its refresh capability
 * - All CRUD operations will automatically trigger table refresh
 * - Unified business operation wrapping through operationWrapper
 */
export const useSubscribeRelationTableConfig = ({
  moduleType,
  showModuleTypeColumn = true,
  onEdit,
  onDelete,
  onCreate,
  customActions,
  ref,
}: UseSubscribeRelationTableConfigParams): SubscribeRelationTableConfigResult => {
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler<SubscribeRelationWithAttributes[]>({
        apiCall: async ({ skip, limit, name }) => {
          const response =
            await apiClient.subscribe.getApisV1ManagerEventCenterSubscribe({
              agents:
                moduleType === ModuleType.EVENT_CENTER
                  ? undefined
                  : ['intelligent_threshold_agent'],
              skip: skip || 0,
              limit: limit || 10,
              name: name as string | undefined,
            });

          // Force type compatibility: PaginatedAPIResponseSubscribeRelationList -> StandardApiResponse<SubscribeRelationWithAttributes[]>
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
      }),
    [moduleType],
  );

  // 🎯 Use utility function to create data source
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // 🎯 Use utility function to create table props
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 1200,
      }),
    [],
  );

  // 🎯 Custom operation wrapper logic, all operations automatically refresh after success
  const operationWrapper = useCallback(
    ({ wrapDelete }: OperationWrappers) =>
      ({
        // Wrap delete operation, automatically refresh table after success
        handleDelete: wrapDelete(onDelete || (async () => true)),
      }) as Record<string, (...args: unknown[]) => unknown>,
    [onDelete],
  );

  // 🎯 Use useBusinessTable to integrate all logic, leveraging auto-refresh capability
  const { customTableProps, operations } = useBusinessTable({
    dataSource,
    tableProps,
    ref: ref as React.Ref<CustomTableActionType> | undefined,
    refreshConfig: {
      enableRefreshFeedback: true,
      successMessage: '操作成功',
      errorMessage: '操作失败，请重试',
    },
    // Use stable operationWrapper
    operationWrapper,
  });

  // Column configuration
  const handleColumns = useCallback(
    (
      _props: Record<string, unknown>,
    ): ModernTableColumnProps<SubscribeRelationWithAttributes>[] => {
      return getSubscribeRelationColumns({
        showModuleTypeColumn,
        onEdit,
        onDelete,
        customActions,
      });
    },
    [showModuleTypeColumn, onEdit, onDelete, customActions],
  );

  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      return getSubscribeRelationFilters(props);
    },
    [],
  );

  // Return actions array
  const actions: React.ReactNode[] = useMemo(() => {
    return getSubscribeRelationActions(onCreate);
  }, [onCreate]);

  // 🔧 Diagnostic fix: Disable Query synchronization for this page to prevent URL ↔ onChange feedback loop causing infinite loop
  const mergedCustomTableProps = {
    ...customTableProps,
    // Explicitly disable URL parameter synchronization
    syncQueryOnSearchParams: false,
    // Keep active key hook to maintain existing behavior
    useActiveKeyHook: true,
  };

  return {
    customTableProps: mergedCustomTableProps,
    handleColumns,
    handleFilters,
    actions, // Directly return actions array
    operations, // Expose operations for external use
  };
};
