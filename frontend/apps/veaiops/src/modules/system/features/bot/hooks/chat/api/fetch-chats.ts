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

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import type { ChatQueryParams } from '@bot/lib';
import { API_RESPONSE_CODE, PAGINATION } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type { Chat } from 'api-generate';
import { useCallback } from 'react';

/**
 * Fetch chat list Hook
 */
export const useFetchChats = ({
  setChats,
  setLoading,
}: {
  setChats: (chats: Chat[]) => void;
  setLoading: (loading: boolean) => void;
}) => {
  const fetchChats = useCallback(
    async (params: ChatQueryParams = {}) => {
      if (!params.bot_id) {
        setChats([]);
        return;
      }

      try {
        setLoading(true);
        // Call real API to get chat list
        const response = await apiClient.chats.getApisV1ConfigChats({
          uid: params.bot_id,
          skip: params.skip || PAGINATION.DEFAULT_SKIP,
          limit: params.limit || PAGINATION.DEFAULT_LIMIT,
          forceUpdate: params.force_refresh || false,
        });

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          const apiChatList = response.data || [];

          // ✅ Use logger to record debug information (logger internally handles development environment check)
          logger.debug({
            message: '获取群聊列表响应',
            data: {
              params,
              sample: Array.isArray(apiChatList)
                ? apiChatList.slice(0, 3)
                : apiChatList,
            },
            source: 'useBotChat',
            component: 'fetchChats',
          });

          // Directly use API returned Chat data structure, explicitly preserve enable_func_* fields
          const chatList: Chat[] = apiChatList.map((apiChat: Chat) => ({
            ...apiChat,
            // Ensure required fields exist
            _id: apiChat._id,
            chat_id: apiChat.chat_id,
            name: apiChat.name,
            chat_type: apiChat.chat_type,
            channel: apiChat.channel,
            bot_id: apiChat.bot_id || params.bot_id || '',
            // Preserve and normalize feature toggle fields. Backend defaults to true, if not provided set to true to ensure UI behavior consistency.
            enable_func_proactive_reply:
              apiChat.enable_func_proactive_reply ?? false,
            enable_func_interest: apiChat.enable_func_interest ?? false,
            created_at: apiChat.created_at,
            updated_at: apiChat.updated_at,
          }));
          setChats(chatList);
          if (chatList.length === 0) {
            Message.info('该机器人暂无关联的群聊');
          }
        } else {
          throw new Error(response.message || '获取群聊列表失败');
        }
      } catch (error) {
        // ✅ Correct: Expose actual error information
        const errorMessage =
          error instanceof Error ? error.message : '获取群列表失败，请重试';
        Message.error(errorMessage);
        setChats([]);
      } finally {
        setLoading(false);
      }
    },
    [setChats, setLoading],
  );

  return {
    fetchChats,
  };
};
