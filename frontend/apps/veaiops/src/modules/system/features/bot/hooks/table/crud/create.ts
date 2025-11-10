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
import { BOT_MESSAGES, type BotCreateRequest } from '@bot/lib';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';

/**
 * Create bot hook
 */
export const useCreateBot = () => {
  return useCallback(async (botData: BotCreateRequest): Promise<boolean> => {
    logger.debug({
      message: '开始创建机器人',
      data: {
        botId: botData.bot_id,
        channel: botData.channel,
        source: 'useBot',
        action: 'createBot',
      },
      source: 'BotManagement',
      component: 'createBot',
    });

    try {
      const response = await apiClient.bots.postApisV1ManagerSystemConfigBots({
        requestBody: botData,
      });
      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        logger.info({
          message: '机器人创建成功',
          data: {
            botId: botData.bot_id,
            channel: botData.channel,
            responseCode: response.code,
            source: 'useBot',
            action: 'createBot',
          },
          source: 'BotManagement',
          component: 'createBot',
        });
        return true;
      } else {
        throw new Error(response.message || BOT_MESSAGES.create.error);
      }
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || BOT_MESSAGES.create.error;
      logger.error({
        message: '机器人创建失败',
        data: {
          error: errorMessage,
          stack: errorObj.stack,
          errorObj,
          botId: botData.bot_id,
          channel: botData.channel,
          source: 'useBot',
          action: 'createBot',
        },
        source: 'BotManagement',
        component: 'createBot',
      });
      Message.error(errorMessage);
      return false;
    }
  }, []);
};
