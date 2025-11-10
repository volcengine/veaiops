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

import type { BotAttributeFiltersQuery } from '@bot/lib';
import type { BotAttributeFormData, ModalType } from '@bot/types';
import type { CustomTableActionType } from '@veaiops/components';
import type { AttributeKey, BotAttribute } from 'api-generate';
import type React from 'react';
import { useBotAttributesBusinessLogic } from './logic/business';
import {
  useBotAttributesTableHandlers,
  useBotAttributesTableState,
} from './logic/index';
import { useRefreshAttributesTable } from './logic/refresh';

/**
 * Bot attributes table business logic Hook parameters
 */
export interface UseBotAttributesTableLogicParams {
  botId?: string;
  channel?: string;
}

/**
 * Bot attributes table business logic Hook return value
 */
export interface UseBotAttributesTableLogicReturn {
  // State
  editingAttribute: BotAttribute | null;
  isModalVisible: boolean;
  modalType: ModalType;
  viewModalVisible: boolean;
  viewingAttribute: BotAttribute | null;
  loading: boolean;

  // Business logic
  createAttribute: (params: {
    name: AttributeKey;
    values: string[];
  }) => Promise<boolean>;
  updateAttribute: (params: { id: string; value: string }) => Promise<boolean>;
  deleteAttribute: (attribute: BotAttribute) => Promise<boolean>;

  // Event handling
  handleOpenCreateModal: () => void;
  handleCloseModal: () => void;
  handleFormSubmit: (values: BotAttributeFormData) => Promise<boolean>; // Returns success status, used for refreshing table
  handleDelete: (
    attribute: BotAttribute,
    tableRef: React.RefObject<
      CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>
    > | null,
  ) => Promise<boolean>;
  handleCloseViewModal: () => void;
  refreshTable: (
    tableRef: React.RefObject<
      CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>
    > | null,
  ) => Promise<boolean>;
}

/**
 * Bot attributes table business logic Hook
 * Manages modal state, event handling, and business operations
 *
 * Split description:
 * - logic/state.ts: State management (editingAttribute, isModalVisible, modalType, etc.)
 * - logic/business.ts: Business logic Hook calls (useBotAttributes)
 * - logic/refresh.ts: Refresh table helper function
 * - logic/handlers.ts: Event handlers (handleOpenCreateModal, handleFormSubmit, handleDelete, etc.)
 * - logic.ts: Main entry, responsible for assembly and export
 */
export const useBotAttributesTableLogic = ({
  botId,
  channel,
}: UseBotAttributesTableLogicParams): UseBotAttributesTableLogicReturn => {
  // State management
  const state = useBotAttributesTableState();

  // Business logic Hook
  const businessLogic = useBotAttributesBusinessLogic({ botId, channel });

  // Refresh table helper function
  const { refreshTable } = useRefreshAttributesTable();

  // Event handlers
  const handlers = useBotAttributesTableHandlers({
    modalType: state.modalType,
    editingAttribute: state.editingAttribute,
    setIsModalVisible: state.setIsModalVisible,
    setEditingAttribute: state.setEditingAttribute,
    setModalType: state.setModalType,
    setViewModalVisible: state.setViewModalVisible,
    setViewingAttribute: state.setViewingAttribute,
    createAttribute: businessLogic.createAttribute,
    updateAttribute: businessLogic.updateAttribute,
    deleteAttribute: businessLogic.deleteAttribute,
    refreshTable,
  });

  return {
    // State
    editingAttribute: state.editingAttribute,
    isModalVisible: state.isModalVisible,
    modalType: state.modalType,
    viewModalVisible: state.viewModalVisible,
    viewingAttribute: state.viewingAttribute,
    loading: businessLogic.loading,

    // Business logic
    createAttribute: businessLogic.createAttribute,
    updateAttribute: businessLogic.updateAttribute,
    deleteAttribute: businessLogic.deleteAttribute,

    // Event handling
    handleOpenCreateModal: handlers.handleOpenCreateModal,
    handleCloseModal: handlers.handleCloseModal,
    handleFormSubmit: handlers.handleFormSubmit,
    handleDelete: handlers.handleDelete,
    handleCloseViewModal: handlers.handleCloseViewModal,
    refreshTable,
  };
};
