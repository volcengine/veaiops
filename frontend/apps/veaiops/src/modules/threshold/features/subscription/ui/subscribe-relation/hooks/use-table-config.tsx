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
import type {
  BaseQuery,
  CustomTableActionType,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
} from '@veaiops/components';
import { useBusinessTable } from '@veaiops/components';
import { ModuleType } from '@veaiops/types';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
  createTableRequestWithResponseHandler,
} from '@veaiops/utils';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { useCallback, useMemo } from 'react';
// import { getSubscribeRelationFilters } from '../filters'; // filters file does not exist, temporarily commented
import { useTableColumns } from '../table-columns';

/**
 * Subscribe relation table configuration Hook
 * Provides complete table configuration
 *
 * ✅ Utility functions used:
 * - createTableRequestWithResponseHandler: Automatically handles pagination parameters and responses
 * - createServerPaginationDataSource: Creates server-side pagination data source
 * - createStandardTableProps: Creates standard table property configuration
 * - useBusinessTable: Automatically handles refresh logic
 */
export const useSubscribeRelationTableConfig = ({
  moduleType,
  showModuleTypeColumn = true,
  customActions,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  loading = false,
  ref: _ref,
}: {
  moduleType: ModuleType;
  showModuleTypeColumn?: boolean;
  customActions?: (record: SubscribeRelationWithAttributes) => React.ReactNode;
  onCreate?: () => void;
  onEdit?: (record: SubscribeRelationWithAttributes) => void;
  onDelete?: (recordId: string) => void;
  onRefresh?: () => void;
  loading?: boolean;
  ref?: React.Ref<
    CustomTableActionType<SubscribeRelationWithAttributes, BaseQuery>
  >;
}) => {
  /**
   * CustomTable request function
   * Uses utility functions to automatically handle pagination parameters, responses, and errors
   */
  const request = useMemo(
    () =>
      createTableRequestWithResponseHandler({
        apiCall: async ({ skip, limit, name }) => {
          return await apiClient.subscribe.getApisV1ManagerEventCenterSubscribe(
            {
              agents:
                moduleType === ModuleType.EVENT_CENTER
                  ? undefined
                  : ['intelligent_threshold_agent'],
              skip,
              limit,
              name: name as string | undefined,
            },
          );
        },
        options: {
          errorMessagePrefix: 'Failed to fetch subscribe relation list',
          defaultLimit: 10,
          onError: (error) => {
            const errorMessage =
              error instanceof Error
                ? error.message
                : 'Failed to load subscribe relation list, please retry';
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

  // 🎯 Get column configuration
  // Note: useTableColumns needs to be called at component top level, so use closure directly here
  const columns = useTableColumns({
    showModuleTypeColumn,
    customActions,
    onEdit: onEdit!,
    onDelete: onDelete!,
  });

  const handleColumns = useCallback(
    (
      _props: Record<string, unknown>,
    ): ModernTableColumnProps<SubscribeRelationWithAttributes>[] => {
      return columns;
    },
    [columns],
  );

  // 🎯 Get filter configuration
  const handleFilters = useCallback(
    (_props: HandleFilterProps<BaseQuery>): FieldItem[] => {
      // Temporarily return empty array because getSubscribeRelationFilters function doesn't exist
      return [];
    },
    [],
  );

  // 🎯 Use useBusinessTable to automatically handle refresh logic
  // ✅ Fix: Explicitly specify generic parameters to ensure complete type matching
  // Reference Modern.js using as unknown as pattern, avoid directly using as any
  const { customTableProps: baseCustomTableProps, operations } =
    useBusinessTable<
      Record<string, unknown>,
      SubscribeRelationWithAttributes,
      BaseQuery
    >({
      dataSource,
      tableProps,
      handlers: onDelete
        ? {
            delete: async (recordId: string) => {
              if (onDelete) {
                onDelete(recordId);
              }
              return true;
            },
          }
        : undefined,
      refreshConfig: {
        enableRefreshFeedback: true,
        successMessage: '操作成功',
        errorMessage: '操作失败，请重试',
      },
      // ✅ Type-safe conversion: RefObject<CustomTableActionType<SubscribeRelationWithAttributes>> -> Ref<CustomTableActionType<BaseRecord>>
      // Use as unknown as pattern (reference Modern.js), avoid using as any
      // SubscribeRelationWithAttributes extends BaseRecord, types are compatible but need explicit conversion
      // Note: Use unknown intermediate conversion to avoid TypeScript type check errors
      // SubscribeRelationWithAttributes extends BaseRecord, types are compatible but need explicit conversion
      ref: _ref
        ? (_ref as unknown as React.Ref<
            CustomTableActionType<Record<string, unknown>, BaseQuery>
          >)
        : undefined,
    });

  // 🎯 Merge custom configuration into customTableProps
  const customTableProps = useMemo(
    () => ({
      ...baseCustomTableProps,
      handleColumns,
      handleFilters,
      tableClassName: 'subscribe-relation-table',
    }),
    [baseCustomTableProps, handleColumns, handleFilters],
  );

  // 🎯 Get action buttons
  const renderActions = useCallback(
    (_props: Record<string, unknown>) => {
      if (!onCreate && !onRefresh) {
        return [];
      }

      const actions = [];

      if (onCreate) {
        actions.push(
          <Button
            key="create"
            type="primary"
            icon={<IconPlus />}
            onClick={onCreate}
          >
            新建订阅关系
          </Button>,
        );
      }

      if (onRefresh) {
        actions.push(
          <Button
            key="refresh"
            icon={<IconRefresh />}
            onClick={onRefresh}
            loading={loading}
          >
            刷新
          </Button>,
        );
      }

      return actions;
    },
    [onCreate, onRefresh, loading],
  );

  return {
    customTableProps,
    handleColumns,
    handleFilters,
    renderActions,
    operations,
  };
};
