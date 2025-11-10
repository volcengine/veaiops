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
import { useCallback } from 'react';

/**
 * Update chat configuration parameters interface
 */
interface UpdateChatConfigParams {
  uid: string;
  config: ChatConfigFormData;
}

/**
 * Update chat configuration Hook
 */
export const useUpdateChatConfig = () => {
  const updateChatConfig = useCallback(
    async ({ uid, config }: UpdateChatConfigParams) => {
      try {
        // Call actual API to update chat configuration
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
          throw new Error(
            response.message || 'Failed to update chat configuration',
          );
        }
      } catch (error) {
        // ✅ Correct: Extract actual error information
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Failed to update chat configuration, please retry';
        Message.error(errorMessage);
        return false;
      }
    },
    [],
  );

  return {
    updateChatConfig,
  };
};
