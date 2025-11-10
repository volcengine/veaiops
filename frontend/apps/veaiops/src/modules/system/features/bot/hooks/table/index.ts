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

import type { BotTableRef } from '@bot/lib';
import type { RefObject } from 'react';
import { useCreateBot, useDeleteBot, useUpdateBot } from './crud';
import { useBotHandlers } from './handlers';
import { useRefreshBotTable } from './refresh';
import { useBotState } from './state';

/**
 * Bot management related Hooks unified export
 */
export { useBotTableConfig } from './config';
export { useBotActionConfig } from './action-config';

// CRUD related type exports
export type { UpdateBotParams } from './crud';

/**
 * Bot management logic Hook
 * Provides all business logic for Bot management page
 *
 * @param tableRef - BotTable ref, used to refresh table
 */
export const useBot = (tableRef?: RefObject<BotTableRef>) => {
  // Refresh table function
  const refreshTable = useRefreshBotTable(tableRef);

  // State management
  const state = useBotState();

  // CRUD operations
  const createBotFn = useCreateBot();
  const updateBotFn = useUpdateBot();
  const deleteBotFn = useDeleteBot();

  // Event handlers
  const handlers = useBotHandlers({
    state,
    createBot: createBotFn,
    updateBot: updateBotFn,
    deleteBot: deleteBotFn,
    refreshTable,
  });

  return {
    // State
    modalVisible: state.modalVisible,
    editingBot: state.editingBot,
    form: state.form,
    loading: state.loading,

    // Attribute management state
    selectedBot: state.selectedBot,
    attributesDrawerVisible: state.attributesDrawerVisible,

    // Chat management state
    chatManagementDrawerVisible: state.chatManagementDrawerVisible,
    selectedBotForChat: state.selectedBotForChat,

    // Event handlers
    ...handlers,
  };
};
