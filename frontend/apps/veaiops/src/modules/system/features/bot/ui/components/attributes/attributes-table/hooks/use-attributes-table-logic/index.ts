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

import { logger } from '@veaiops/utils';
import type { ChannelType } from 'api-generate';
import type React from 'react';
import { useCallback } from 'react';
import { useAttributesTableLogicHandlers } from './handlers';
import { useAttributesTableLogicState } from './state';

/**
 * Bot attributes table business logic Hook parameters
 */
interface UseAttributesTableLogicParams {
  botId?: string;
  channel?: string | ChannelType;
  tableRef?: React.RefObject<{
    refresh?: () => Promise<void>;
  }>;
}

/**
 * Bot attributes table business logic Hook return value
 */
export interface UseAttributesTableLogicReturn {
  // State
  editingAttribute: ReturnType<
    typeof useAttributesTableLogicState
  >['editingAttribute'];
  isModalVisible: ReturnType<
    typeof useAttributesTableLogicState
  >['isModalVisible'];
  modalType: ReturnType<typeof useAttributesTableLogicState>['modalType'];
  loading: ReturnType<typeof useAttributesTableLogicState>['loading'];

  // Business logic
  createAttribute: ReturnType<
    typeof useAttributesTableLogicState
  >['createAttribute'];
  updateAttribute: ReturnType<
    typeof useAttributesTableLogicState
  >['updateAttribute'];
  deleteAttribute: ReturnType<
    typeof useAttributesTableLogicState
  >['deleteAttribute'];

  // Event handling
  handleOpenCreateModal: ReturnType<
    typeof useAttributesTableLogicHandlers
  >['handleOpenCreateModal'];
  handleCloseModal: ReturnType<
    typeof useAttributesTableLogicHandlers
  >['handleCloseModal'];
  handleFormSubmit: ReturnType<
    typeof useAttributesTableLogicHandlers
  >['handleFormSubmit'];
  handleDelete: ReturnType<
    typeof useAttributesTableLogicHandlers
  >['handleDelete'];
  handleEdit: ReturnType<typeof useAttributesTableLogicHandlers>['handleEdit'];
  stableFetchAttributes: ReturnType<
    typeof useAttributesTableLogicState
  >['stableFetchAttributes'];
}

/**
 * Bot attributes table business logic Hook
 *
 * Split description:
 * - state.ts: State management and business logic Hook calls
 * - handlers.ts: Event handler functions (handleOpenCreateModal, handleCloseModal, handleFormSubmit, handleDelete, handleEdit)
 * - index.ts: Main entry, combines all logic
 */
export const useAttributesTableLogic = ({
  botId,
  channel,
  tableRef,
}: UseAttributesTableLogicParams): UseAttributesTableLogicReturn => {
  // State management
  const state = useAttributesTableLogicState({ botId, channel });

  // Helper function to refresh table
  const refreshTable = useCallback(async () => {
    logger.info({
      message: '[refreshTable] 🔄 refreshTable called',
      data: {
        hasTableRef: Boolean(tableRef),
        hasTableRefCurrent: Boolean(tableRef?.current),
        hasRefreshMethod: Boolean(tableRef?.current?.refresh),
      },
      source: 'BotAttributesTable',
      component: 'refreshTable',
    });

    if (tableRef?.current?.refresh) {
      logger.info({
        message: '[refreshTable] ✅ Ready to call tableRef.current.refresh()',
        data: {},
        source: 'BotAttributesTable',
        component: 'refreshTable',
      });
      await tableRef.current.refresh();
      logger.info({
        message: '[refreshTable] ✅ tableRef.current.refresh() completed',
        data: {},
        source: 'BotAttributesTable',
        component: 'refreshTable',
      });
    } else {
      logger.warn({
        message: '[refreshTable] ⚠️ tableRef.current.refresh does not exist',
        data: {
          tableRefKeys: tableRef?.current ? Object.keys(tableRef.current) : [],
        },
        source: 'BotAttributesTable',
        component: 'refreshTable',
      });
    }
  }, [tableRef]);

  // Event handling
  const handlers = useAttributesTableLogicHandlers({
    editingAttribute: state.editingAttribute,
    setEditingAttribute: state.setEditingAttribute,
    isModalVisible: state.isModalVisible,
    setIsModalVisible: state.setIsModalVisible,
    modalType: state.modalType,
    setModalType: state.setModalType,
    createAttribute: state.createAttribute,
    updateAttribute: state.updateAttribute,
    deleteAttribute: state.deleteAttribute,
    refreshTable,
  });

  return {
    // State
    editingAttribute: state.editingAttribute,
    isModalVisible: state.isModalVisible,
    modalType: state.modalType,
    loading: state.loading,

    // Business logic
    createAttribute: state.createAttribute,
    updateAttribute: state.updateAttribute,
    deleteAttribute: state.deleteAttribute,

    // Event handling
    handleOpenCreateModal: handlers.handleOpenCreateModal,
    handleCloseModal: handlers.handleCloseModal,
    handleFormSubmit: handlers.handleFormSubmit,
    handleDelete: handlers.handleDelete,
    handleEdit: handlers.handleEdit,
    stableFetchAttributes: state.stableFetchAttributes,
  };
};
