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

import { useBotChatApi } from './api';
import { useBotChatHandlers } from './handlers';
import { useBotChatState } from './state';

/**
 * Bot chat management business logic Hook
 *
 * Split explanation:
 * - state.ts: State management (selectedBotId, chats, loading, configModalVisible, etc.)
 * - api.ts: API calls (fetchBotOptions, fetchChats, updateChatConfig)
 * - handlers.ts: Event handling (handleConfigEdit, handleConfigSubmit, handleConfigCancel, handleBotChange)
 * - index.ts: Main entry, combines all logic
 */
export const useBotChat = (
  afterUpdate?: () => Promise<{ success: boolean; error?: Error }>,
) => {
  // State management
  const state = useBotChatState();

  // API calls
  const api = useBotChatApi({
    setChats: state.setChats,
    setLoading: state.setLoading,
    setBotOptions: state.setBotOptions,
  });

  // Event handling
  const handlers = useBotChatHandlers({
    editingChat: state.editingChat,
    setEditingChat: state.setEditingChat,
    setConfigModalVisible: state.setConfigModalVisible,
    setChats: state.setChats,
    chats: state.chats,
    selectedBotId: state.selectedBotId,
    setSelectedBotId: state.setSelectedBotId,
    fetchChats: api.fetchChats,
    updateChatConfig: api.updateChatConfig,
    afterUpdate,
  });

  return {
    // State
    selectedBotId: state.selectedBotId,
    chats: handlers.tableData,
    loading: state.loading,
    configModalVisible: state.configModalVisible,
    editingChat: state.editingChat,
    botOptions: state.botOptions,

    // Methods
    fetchBotOptions: api.fetchBotOptions,
    fetchChats: api.fetchChats,
    handleConfigEdit: handlers.handleConfigEdit,
    handleConfigSubmit: handlers.handleConfigSubmit,
    handleConfigCancel: handlers.handleConfigCancel,
    handleBotChange: handlers.handleBotChange,
  };
};

// Export table configuration Hook
export { useChatTableConfig } from './table-config';

// Export chat management logic Hook
export { useChatManagementLogic } from './management';
