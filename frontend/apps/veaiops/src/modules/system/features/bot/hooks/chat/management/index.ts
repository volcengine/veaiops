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

import { useChatManagementLogicApi } from './api';
import { useChatManagementLogicHandlers } from './handlers';
import { useChatManagementLogicState } from './state';

/**
 * Chat management business logic Hook
 *
 * Corresponds to origin/feat/web-v2 branch implementation, ensuring functional consistency
 *
 * Split structure:
 * - state.ts: State management (configModalVisible, editingChat)
 * - api.ts: API calls (updateChatConfig)
 * - handlers.ts: Event handling (handleConfigEdit, handleConfigSubmit, handleConfigCancel)
 * - index.ts: Main entry, responsible for logic assembly
 */
export const useChatManagementLogic = (
  afterUpdate?: () =>
    | Promise<boolean>
    | Promise<{ success: boolean; error?: Error }>,
) => {
  // State management
  const state = useChatManagementLogicState();

  // API calls
  const api = useChatManagementLogicApi();

  // Event handling
  const handlers = useChatManagementLogicHandlers({
    editingChat: state.editingChat,
    setEditingChat: state.setEditingChat,
    setConfigModalVisible: state.setConfigModalVisible,
    updateChatConfig: api.updateChatConfig,
    afterUpdate,
  });

  return {
    configModalVisible: state.configModalVisible,
    editingChat: state.editingChat,
    handleConfigEdit: handlers.handleConfigEdit,
    handleConfigSubmit: handlers.handleConfigSubmit,
    handleConfigCancel: handlers.handleConfigCancel,
  };
};
