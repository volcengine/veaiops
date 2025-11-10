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
 * Complete logic Hook for subscribe relation table
 *
 * Cohesive all state management, CRUD operations, and table configuration into one Hook
 */

import { useSubscribeRelation } from '@/hooks';
import type { ModuleType } from '@/types/module';
import type { BaseQuery, CustomTableActionType } from '@veaiops/components';
import type {
  SubscribeRelationCreate,
  SubscribeRelationUpdate,
  SubscribeRelationWithAttributes,
} from 'api-generate';
import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import {
  type SubscribeRelationTableConfigResult,
  useSubscribeRelationTableConfig,
} from './subscription-config';

export interface UseSubscribeRelationTableOptions {
  moduleType: ModuleType;
  showModuleTypeColumn?: boolean;
  customActions?: (record: SubscribeRelationWithAttributes) => React.ReactNode;
}

export interface UseSubscribeRelationTableReturn {
  // Table configuration - Use actual types returned from useSubscribeRelationTableConfig
  customTableProps: SubscribeRelationTableConfigResult['customTableProps'];
  handleColumns: SubscribeRelationTableConfigResult['handleColumns'];
  handleFilters: SubscribeRelationTableConfigResult['handleFilters'];
  actions: React.ReactNode[];
  tableRef: React.RefObject<
    CustomTableActionType<SubscribeRelationWithAttributes, BaseQuery>
  >;

  // Form state
  formVisible: boolean;
  editingData: SubscribeRelationWithAttributes | null;

  // Form operations
  setFormVisible: (visible: boolean) => void;
  handleFormClose: () => void;
  handleFormSubmit: (
    data: SubscribeRelationCreate | SubscribeRelationUpdate,
  ) => Promise<boolean>;
}

/**
 * Complete logic Hook for subscribe relation table
 *
 * Cohesive all state management and business logic into one Hook, making components more concise
 */
export const useSubscribeRelationTable = ({
  moduleType,
  showModuleTypeColumn = true,
  customActions,
}: UseSubscribeRelationTableOptions): UseSubscribeRelationTableReturn => {
  const tableRef =
    useRef<CustomTableActionType<SubscribeRelationWithAttributes, BaseQuery>>(
      null,
    );

  // Use subscribe relation management hook
  const {
    createSubscribeRelation,
    updateSubscribeRelation,
    deleteSubscribeRelation,
  } = useSubscribeRelation(moduleType);

  // Form drawer state
  const [formVisible, setFormVisible] = useState(false);
  const [editingData, setEditingData] =
    useState<SubscribeRelationWithAttributes | null>(null);

  /**
   * Edit subscribe relation
   */
  const handleEdit = useCallback((record: SubscribeRelationWithAttributes) => {
    setEditingData(record);
    setFormVisible(true);
  }, []);

  /**
   * Delete subscribe relation
   * Leverages CustomTable's auto-refresh capability, automatically refreshes after successful deletion
   */
  const handleDelete = useCallback(
    async (id: string): Promise<boolean> => {
      try {
        await deleteSubscribeRelation(id);
        // CustomTable will auto-refresh, no need to manually call
        return true;
      } catch {
        return false;
      }
    },
    [deleteSubscribeRelation],
  );

  /**
   * Create new subscribe relation
   */
  const handleCreate = useCallback(() => {
    setEditingData(null);
    setFormVisible(true);
  }, []);

  /**
   * Handle form submission
   * Leverages CustomTable's auto-refresh capability, automatically refreshes after successful submission
   */
  const handleFormSubmit = useCallback(
    async (
      data: SubscribeRelationCreate | SubscribeRelationUpdate,
    ): Promise<boolean> => {
      try {
        if (editingData?._id) {
          // Edit mode
          await updateSubscribeRelation({ id: editingData._id, data });
        } else {
          // Create mode - Need to ensure data conforms to SubscribeRelationCreate type
          await createSubscribeRelation(data as SubscribeRelationCreate);
        }
        // Close form
        setFormVisible(false);
        setEditingData(null);
        return true;
      } catch {
        return false;
      }
    },
    [editingData, updateSubscribeRelation, createSubscribeRelation],
  );

  /**
   * Close form drawer
   */
  const handleFormClose = useCallback(() => {
    setFormVisible(false);
    setEditingData(null);
  }, []);

  // 🎯 Get complete table configuration (already integrated useBusinessTable)
  const { customTableProps, handleColumns, handleFilters, actions } =
    useSubscribeRelationTableConfig({
      moduleType,
      showModuleTypeColumn,
      onEdit: handleEdit,
      onDelete: handleDelete,
      onCreate: handleCreate,
      customActions,
      ref: tableRef,
    });

  return {
    // Table configuration
    customTableProps,
    handleColumns,
    handleFilters,
    actions,
    tableRef,

    // Form state
    formVisible,
    editingData,

    // Form operations
    setFormVisible,
    handleFormClose,
    handleFormSubmit,
  };
};
