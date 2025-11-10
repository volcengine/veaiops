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
 * Subscribe relation table complete logic Hook
 *
 * Co-locates all state management, event handling, and table configuration into a single Hook
 */

import type { ModuleType } from '@/types/module';
import type {
  BaseQuery,
  CustomTableActionType,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
} from '@veaiops/components';
import type { SubscribeRelationWithAttributes } from 'api-generate';
import type React from 'react';
import { useCallback } from 'react';
import { useSubscribeRelationTableConfig } from './use-table-config';

export interface UseSubscribeRelationTableOptions {
  moduleType: ModuleType;
  showModuleTypeColumn?: boolean;
  customActions?: (record: SubscribeRelationWithAttributes) => React.ReactNode;
  // Use specific SubscribeRelationWithAttributes type instead of BaseRecord to ensure type safety
  tableRef?: React.RefObject<
    CustomTableActionType<SubscribeRelationWithAttributes, BaseQuery>
  >;
  onCreate?: () => Promise<boolean>;
  onEdit?: (record: SubscribeRelationWithAttributes) => Promise<boolean>;
  onDelete?: (recordId: string) => Promise<boolean>;
  onRefresh?: () => void;
  loading?: boolean;
}

export interface UseSubscribeRelationTableReturn {
  // Table configuration
  customTableProps: Record<string, unknown>;
  handleColumns: (
    props: Record<string, unknown>,
  ) => ModernTableColumnProps<SubscribeRelationWithAttributes>[];
  handleFilters: (props: HandleFilterProps<BaseQuery>) => FieldItem[];
  renderActions: (props: Record<string, unknown>) => React.ReactNode[];

  // Operation handler functions
  handleCreate: () => void;
  handleEdit: (record: SubscribeRelationWithAttributes) => void;
  handleDelete: (recordId: string) => void;

  // Loading state
  loading: boolean;
}

/**
 * Subscribe relation table complete logic Hook
 *
 * Co-locates all state management and business logic into a single Hook, making components more concise
 */
export const useSubscribeRelationTable = ({
  moduleType,
  showModuleTypeColumn = true,
  customActions,
  tableRef,
  onCreate,
  onEdit,
  onDelete,
  onRefresh,
  loading = false,
}: UseSubscribeRelationTableOptions): UseSubscribeRelationTableReturn => {
  // 🎯 Get complete table configuration
  const { customTableProps, handleColumns, handleFilters, renderActions } =
    useSubscribeRelationTableConfig({
      moduleType,
      showModuleTypeColumn,
      customActions,
      onCreate,
      onEdit,
      onDelete,
      onRefresh,
      loading,
      ref: tableRef,
    });

  /**
   * Handle create subscription relation
   */
  const handleCreate = useCallback(() => {
    if (onCreate) {
      onCreate();
    }
  }, [onCreate]);

  /**
   * Handle edit subscription relation
   */
  const handleEdit = useCallback(
    (record: SubscribeRelationWithAttributes) => {
      if (onEdit) {
        onEdit(record);
      }
    },
    [onEdit],
  );

  /**
   * Handle delete subscription relation
   */
  const handleDelete = useCallback(
    (recordId: string): void => {
      if (onDelete) {
        onDelete(recordId);
        // CustomTable will automatically refresh, no need to manually call
      }
    },
    [onDelete],
  );

  return {
    // Table configuration
    customTableProps,
    handleColumns,
    handleFilters,
    renderActions,

    // Operation handler functions
    handleCreate,
    handleEdit,
    handleDelete,

    // Loading state
    loading,
  };
};
