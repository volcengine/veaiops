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
import { BOT_MESSAGES, type BotUpdateRequest } from '@bot/lib';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { useCallback } from 'react';

/**
 * Parameters interface for updating bot
 */
export interface UpdateBotParams {
  botId: string;
  updateData: BotUpdateRequest;
}

/**
 * Update bot hook
 */
export const useUpdateBot = () => {
  return useCallback(
    async ({ botId, updateData }: UpdateBotParams): Promise<boolean> => {
      try {
        const response = await apiClient.bots.putApisV1ManagerSystemConfigBots({
          uid: botId,
          requestBody: updateData,
        });

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          Message.success(BOT_MESSAGES.update.success);
          return true;
        }

        throw new Error(response.message || BOT_MESSAGES.update.error);
      } catch (error) {
        // ✅ Correct: Expose actual error information
        const errorMessage =
          error instanceof Error ? error.message : BOT_MESSAGES.update.error;
        Message.error(errorMessage);
        return false;
      }
    },
    [],
  );
};
