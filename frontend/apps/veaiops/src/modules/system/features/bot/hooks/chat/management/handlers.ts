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

import type { ChatConfigFormData } from '@bot/lib';
import { logger } from '@veaiops/utils';
import type { Chat } from 'api-generate';
import { useCallback } from 'react';

/**
 * Chat management event handler Hook
 */
export const useChatManagementLogicHandlers = ({
  editingChat,
  setEditingChat,
  setConfigModalVisible,
  updateChatConfig,
  afterUpdate,
}: {
  editingChat: Chat | null;
  setEditingChat: (chat: Chat | null) => void;
  setConfigModalVisible: (visible: boolean) => void;
  updateChatConfig: (params: {
    uid: string;
    config: ChatConfigFormData;
  }) => Promise<boolean>;
  afterUpdate?: () =>
    | Promise<boolean>
    | Promise<{ success: boolean; error?: Error }>;
}) => {
  // Handle config edit
  const handleConfigEdit = useCallback(
    (chat: Chat) => {
      setEditingChat(chat);
      setConfigModalVisible(true);
    },
    [setEditingChat, setConfigModalVisible],
  );

  // Handle config submit
  const handleConfigSubmit = useCallback(
    async (config: ChatConfigFormData): Promise<boolean> => {
      if (!editingChat?._id) {
        return false;
      }

      const success = await updateChatConfig({
        uid: editingChat._id,
        config: {
          enable_func_proactive_reply: config.enable_func_proactive_reply,
          enable_func_interest: config.enable_func_interest,
        },
      });

      if (success) {
        setConfigModalVisible(false);
        // Refresh table after successful config update
        if (afterUpdate) {
          const result = await afterUpdate();
          // Check return result (if it's a result object)
          if (
            result &&
            typeof result === 'object' &&
            'success' in result &&
            !result.success &&
            result.error
          ) {
            // ✅ Use logger.warn when refresh fails, but does not affect the config update operation itself (object destructuring parameters)
            logger.warn({
              message: 'Failed to refresh table after config update',
              data: {
                error: result.error.message,
                stack: result.error.stack,
                errorObj: result.error,
              },
              source: 'useChatManagementLogic',
              component: 'handleConfigSubmit',
            });
          }
        }
      }
      return success;
    },
    [editingChat, updateChatConfig, afterUpdate, setConfigModalVisible],
  );

  // Handle config cancel
  const handleConfigCancel = useCallback(() => {
    setConfigModalVisible(false);
    setEditingChat(null);
  }, [setConfigModalVisible, setEditingChat]);

  return {
    handleConfigEdit,
    handleConfigSubmit,
    handleConfigCancel,
  };
};
