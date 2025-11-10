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
import type { BotAttribute } from 'api-generate';
import type React from 'react';
import { useBotAttributesTableDeleteHandler } from './delete-handler';
import { useBotAttributesTableFormHandlers } from './form-handlers';
import { useBotAttributesTableModalHandlers } from './modal-handlers';

/**
 * Event handler parameters
 */
interface HandlersParams {
  modalType: ModalType;
  editingAttribute: BotAttribute | null;
  setIsModalVisible: (visible: boolean) => void;
  setEditingAttribute: (attribute: BotAttribute | null) => void;
  setModalType: (type: ModalType) => void;
  setViewModalVisible: (visible: boolean) => void;
  setViewingAttribute: (attribute: BotAttribute | null) => void;
  createAttribute: (params: {
    name: string;
    values: string[];
  }) => Promise<boolean>;
  updateAttribute: (params: { id: string; value: string }) => Promise<boolean>;
  deleteAttribute: (attribute: BotAttribute) => Promise<boolean>;
  refreshTable: (
    tableRef: React.RefObject<
      CustomTableActionType<BotAttribute, BotAttributeFiltersQuery>
    > | null,
  ) => Promise<boolean>;
}

/**
 * Event handler Hook
 *
 * Split explanation:
 * - modal-handlers.ts: Modal-related handlers (handleOpenCreateModal, handleCloseModal, handleCloseViewModal)
 * - form-handlers.ts: Form submission handlers (handleFormSubmit)
 * - delete-handler.ts: Delete operation handlers (handleDelete)
 * - index.ts: Unified export, combines all handler functions
 */
export const useBotAttributesTableHandlers = ({
  modalType,
  editingAttribute,
  setIsModalVisible,
  setEditingAttribute,
  setModalType,
  setViewModalVisible,
  setViewingAttribute,
  createAttribute,
  updateAttribute,
  deleteAttribute,
  refreshTable,
}: HandlersParams) => {
  // Modal handlers
  const modalHandlers = useBotAttributesTableModalHandlers({
    setEditingAttribute,
    setIsModalVisible,
    setModalType,
    setViewModalVisible,
    setViewingAttribute,
  });

  // Form handlers
  const formHandlers = useBotAttributesTableFormHandlers({
    modalType,
    editingAttribute,
    createAttribute,
    updateAttribute,
    handleCloseModal: modalHandlers.handleCloseModal,
  });

  // Delete handler
  const deleteHandler = useBotAttributesTableDeleteHandler({
    deleteAttribute,
    refreshTable,
  });

  return {
    handleOpenCreateModal: modalHandlers.handleOpenCreateModal,
    handleCloseModal: modalHandlers.handleCloseModal,
    handleFormSubmit: formHandlers.handleFormSubmit,
    handleDelete: deleteHandler.handleDelete,
    handleCloseViewModal: modalHandlers.handleCloseViewModal,
  };
};
