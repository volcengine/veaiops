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
import type { ChatConfigFormData } from '@bot/lib';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';

/**
 * Parameters interface for updating chat configuration
 */
interface UpdateChatConfigParams {
  uid: string;
  config: ChatConfigFormData;
}

/**
 * Chat management API call Hook
 */
export const useChatManagementLogicApi = () => {
  // Update chat configuration
  const updateChatConfig = useCallback(
    async ({ uid, config }: UpdateChatConfigParams): Promise<boolean> => {
      try {
        // Call real API to update chat configuration
        const response = await apiClient.chats.putApisV1ConfigChatsConfig({
          uid, // Here we pass _id
          requestBody: {
            enable_func_proactive_reply: config.enable_func_proactive_reply,
            enable_func_interest: config.enable_func_interest,
          },
        });

        if (response.code === API_RESPONSE_CODE.SUCCESS) {
          Message.success('群配置更新成功');
          return true;
        } else {
          throw new Error(response.message || '更新群配置失败');
        }
      } catch (error) {
        // ✅ Correct: Expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '更新群配置失败，请重试';
        Message.error(errorMessage);

        // ✅ Correct: Use logger to record error (object destructuring parameters)
        logger.error({
          message: '更新群配置失败',
          data: {
            error: errorMessage,
            stack: errorObj.stack,
            errorObj,
            uid,
            config,
          },
          source: 'useChatManagementLogic',
          component: 'updateChatConfig',
        });
        return false;
      }
    },
    [],
  );

  return {
    updateChatConfig,
  };
};
