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

import type { BotCreateRequest, BotUpdateRequest } from '@bot/lib';
import type { UpdateBotParams } from './crud';
import {
  useCrudHandlers,
  useDrawerHandlers,
  useModalHandlers,
} from './handlers/index';
import type { UseBotStateReturn } from './state';

/**
 * Event handler Hook parameters
 */
interface UseBotHandlersParams {
  state: UseBotStateReturn;
  createBot: (data: BotCreateRequest) => Promise<boolean>;
  updateBot: (params: UpdateBotParams) => Promise<boolean>;
  deleteBot: (botId: string) => Promise<boolean>;
  refreshTable: () => Promise<boolean>;
}

/**
 * Bot management event handler Hook
 *
 * Split explanation:
 * - handlers/crud-handlers.ts: CRUD operation handlers (create, update, delete, submit)
 * - handlers/modal-handlers.ts: Modal operation handlers (edit, add, cancel)
 * - handlers/drawer-handlers.ts: Drawer operation handlers (viewAttributes, chatManagement, etc.)
 * - handlers.ts: Main entry point, responsible for assembly and export
 */
export const useBotHandlers = ({
  state,
  createBot,
  updateBot,
  deleteBot,
  refreshTable,
}: UseBotHandlersParams) => {
  const {
    form,
    editingBot,
    setEditingBot,
    modalVisible,
    setModalVisible,
    selectedBot,
    setSelectedBot,
    attributesDrawerVisible,
    setAttributesDrawerVisible,
    chatManagementDrawerVisible,
    setChatManagementDrawerVisible,
    selectedBotForChat,
    setSelectedBotForChat,
  } = state;

  // CRUD operation handlers
  const { handleDelete, handleCreate, handleUpdate, handleSubmit } =
    useCrudHandlers({
      state,
      createBot,
      updateBot,
      deleteBot,
      refreshTable,
    });

  // Modal operation handlers
  const { handleEdit, handleAdd, handleCancel } = useModalHandlers({
    form,
    editingBot,
    setEditingBot,
    modalVisible,
    setModalVisible,
  });

  // Drawer operation handlers
  const {
    handleViewAttributes,
    handleCloseAttributesDrawer,
    handleChatManagement,
    handleCloseChatManagementDrawer,
  } = useDrawerHandlers({
    selectedBot,
    setSelectedBot,
    attributesDrawerVisible,
    setAttributesDrawerVisible,
    selectedBotForChat,
    setSelectedBotForChat,
    chatManagementDrawerVisible,
    setChatManagementDrawerVisible,
  });

  return {
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
    handleDelete,
    handleViewAttributes,
    handleCloseAttributesDrawer,
    handleChatManagement,
    handleCloseChatManagementDrawer,
  };
};
