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

import type { Bot } from '@bot/lib';
import { useCallback } from 'react';

/**
 * Drawer operation handler parameters
 */
interface DrawerHandlersParams {
  selectedBot: Bot | null;
  setSelectedBot: (bot: Bot | null) => void;
  attributesDrawerVisible: boolean;
  setAttributesDrawerVisible: (visible: boolean) => void;
  selectedBotForChat: Bot | null;
  setSelectedBotForChat: (bot: Bot | null) => void;
  chatManagementDrawerVisible: boolean;
  setChatManagementDrawerVisible: (visible: boolean) => void;
}

/**
 * Drawer operation handlers
 */
export const useDrawerHandlers = ({
  selectedBot,
  setSelectedBot,
  setAttributesDrawerVisible,
  setSelectedBotForChat,
  setChatManagementDrawerVisible,
}: DrawerHandlersParams) => {
  // Handle view bot attributes
  const handleViewAttributes = useCallback(
    (bot: Bot) => {
      setSelectedBot(bot);
      setAttributesDrawerVisible(true);
    },
    [setSelectedBot, setAttributesDrawerVisible],
  );

  // Close attributes drawer
  const handleCloseAttributesDrawer = useCallback(() => {
    setAttributesDrawerVisible(false);
    setSelectedBot(null);
  }, [setAttributesDrawerVisible, setSelectedBot]);

  // Open chat management drawer
  const handleChatManagement = useCallback(
    (bot: Bot) => {
      setSelectedBotForChat(bot);
      setChatManagementDrawerVisible(true);
    },
    [setSelectedBotForChat, setChatManagementDrawerVisible],
  );

  // Close chat management drawer
  const handleCloseChatManagementDrawer = useCallback(() => {
    setChatManagementDrawerVisible(false);
    setSelectedBotForChat(null);
  }, [setChatManagementDrawerVisible, setSelectedBotForChat]);

  return {
    handleViewAttributes,
    handleCloseAttributesDrawer,
    handleChatManagement,
    handleCloseChatManagementDrawer,
  };
};
