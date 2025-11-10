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

import type { BotCreateRequest, BotTableRef, BotUpdateRequest } from '@bot';
import { useBot } from '@bot/hooks';
import type React from 'react';
import { useRef } from 'react';
import { BotAttributesDrawer } from './components/bot/attributes-drawer';
import { BotCompleteModal } from './components/bot/complete-modal';
import { ChatManagementDrawer } from './components/chat/management-drawer';
import { BotTable } from './table';

/**
 * Bot management page
 * Provides CRUD functionality for Bot - uses CustomTable and Zustand state management
 *
 * Architecture features:
 * - Uses custom Hook to encapsulate business logic
 * - Single responsibility components, easy to maintain
 * - State management separated from UI rendering
 * - Supports configuration and extension
 * - Uses CustomTable to provide advanced table functionality
 */
const BotManagement: React.FC = () => {
  // BotTable ref, used to refresh table
  const tableRef = useRef<BotTableRef>(null);

  // Use custom Hook to get all business logic, pass table refresh method
  const {
    // State
    modalVisible,
    editingBot,
    loading,

    // Attribute management state
    selectedBot,
    attributesDrawerVisible,

    // Chat management state
    chatManagementDrawerVisible,
    selectedBotForChat,

    // Event handlers
    handleEdit,
    handleAdd,
    handleCancel,
    handleSubmit,
    handleDelete,
    handleViewAttributes,
    handleCloseAttributesDrawer,
    handleChatManagement,
    handleCloseChatManagementDrawer,
  } = useBot(tableRef);

  // Submit handler: forward to handleSubmit and return result
  const handleCompleteSubmit = async (
    values: BotCreateRequest | BotUpdateRequest,
  ): Promise<boolean> => {
    // handleSubmit already accepts BotCreateRequest | BotUpdateRequest type, no type assertion needed
    return await handleSubmit(values);
  };

  return (
    <>
      {/* Bot table component - uses CustomTable */}
      <BotTable
        ref={tableRef}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onAdd={handleAdd}
        onViewAttributes={handleViewAttributes}
        onGroupManagement={handleChatManagement}
      />

      {/* Bot modal component */}
      <BotCompleteModal
        visible={modalVisible}
        editingBot={editingBot}
        onCancel={handleCancel}
        onSubmit={handleCompleteSubmit}
        loading={loading}
      />

      {/* Bot attributes drawer */}
      <BotAttributesDrawer
        visible={attributesDrawerVisible}
        onClose={handleCloseAttributesDrawer}
        bot={selectedBot}
      />

      {/* Chat management drawer */}
      <ChatManagementDrawer
        visible={chatManagementDrawerVisible}
        onClose={handleCloseChatManagementDrawer}
        selectedBot={selectedBotForChat || undefined}
      />
    </>
  );
};

export default BotManagement;
export { BotManagement };
