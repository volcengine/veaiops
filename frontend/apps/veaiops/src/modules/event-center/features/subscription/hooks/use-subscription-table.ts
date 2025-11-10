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
 * Subscription relation table complete logic Hook
 *
 * Aggregates all state management, event handling, and table configuration into one Hook
 */

import type { ModuleType } from '@/types/module';
import {
  getSubscriptionColumns,
  getSubscriptionFilters,
  useSubscriptionActionConfig,
  useSubscriptionTableConfig,
} from '@ec/subscription';
import type {
  BaseQuery,
  CustomTableActionType,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
} from '@veaiops/components';
import type { BaseRecord } from '@veaiops/types';
import { logger } from '@veaiops/utils';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { useCallback, useEffect, useRef } from 'react';

export type RenderActionsType = (
  props: Record<string, unknown>,
) => React.ReactNode[];

export interface UseSubscriptionTableOptions {
  moduleType?: ModuleType;
  onEdit: (subscription: SubscribeRelationWithAttributes) => void;
  onDelete: (subscriptionId: string) => Promise<boolean>;
  onAdd: () => void;
  onView: (subscription: SubscribeRelationWithAttributes) => void;
  onTableRefReady?: (refresh: () => Promise<boolean>) => void;
}

export interface UseSubscriptionTableReturn {
  // Table configuration
  customTableProps: Record<string, unknown>;
  handleColumns: (
    props: Record<string, unknown>,
  ) => ModernTableColumnProps<SubscribeRelationWithAttributes>[];
  handleFilters: (props: HandleFilterProps<BaseQuery>) => FieldItem[];
  renderActions: RenderActionsType;

  // Operation handler functions
  handleEdit: (subscription: SubscribeRelationWithAttributes) => void;
  handleAdd: () => void;
  handleDelete: (subscriptionId: string) => Promise<boolean>;

  // Loading state
  loading: boolean;
}

/**
 * Subscription relation table complete logic Hook
 *
 * Aggregates all state management and business logic into one Hook, making components more concise
 */
export const useSubscriptionTable = ({
  moduleType,
  onEdit,
  onDelete,
  onAdd,
  onView,
  onTableRefReady,
}: UseSubscriptionTableOptions): UseSubscriptionTableReturn => {
  const tableRef = useRef<CustomTableActionType<BaseRecord, BaseQuery>>(null);

  // Create refresh function
  const refreshTable = useCallback(async () => {
    if (tableRef.current?.refresh) {
      const result = await tableRef.current.refresh();
      if (!result.success && result.error) {
        logger.warn({
          message: '订阅表格刷新失败',
          data: {
            error: result.error.message,
            stack: result.error.stack,
            errorObj: result.error,
          },
          source: 'SubscriptionTable',
          component: 'refreshTable',
        });
      }
    }
  }, []);

  // Expose tableRef via forwardRef
  const refCallback = useCallback(
    (node: CustomTableActionType<BaseRecord, BaseQuery> | null) => {
      tableRef.current = node;
    },
    [],
  );

  // Notify parent component when tableRef is ready
  useEffect(() => {
    if (onTableRefReady) {
      onTableRefReady(refreshTable);
    }
  }, []);

  // Table configuration
  const { dataSource, tableProps } = useSubscriptionTableConfig({
    handleEdit: onEdit,
    handleDelete: onDelete,
  });

  // Action button configuration
  const { actions } = useSubscriptionActionConfig(onAdd);

  // Create handleColumns function, pass operation callbacks to column configuration
  const handleColumns = useCallback(
    (props: Record<string, unknown>) => {
      return getSubscriptionColumns({
        ...props,
        onEdit,
        onDelete,
        onView,
      });
    },
    [onEdit, onDelete, onView],
  );

  // Create handleFilters function
  const handleFilters = useCallback(
    (props: HandleFilterProps<BaseQuery>) => {
      return getSubscriptionFilters({
        query: props.query,
        handleChange: props.handleChange,
        moduleType,
      });
    },
    [moduleType],
  );

  // Wrap renderActions
  const renderActions = useCallback(
    (_props: Record<string, unknown>) => actions,
    [actions],
  );

  return {
    // Table configuration
    customTableProps: {
      ref: refCallback,
      dataSource,
      tableProps,
    },
    handleColumns,
    handleFilters,
    renderActions,

    // Operation handler functions
    handleEdit: onEdit,
    handleAdd: onAdd,
    handleDelete: onDelete,

    // Loading state (can be extended later)
    loading: false,
  };
};
