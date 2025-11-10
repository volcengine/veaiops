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

import { Message } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';

/**
 * Delete handler parameters
 */
interface DeleteHandlerParams {
  deleteBot: (botId: string) => Promise<boolean>;
}

/**
 * Bot delete handler
 *
 * ✅ Note: Refresh is automatically handled by useBusinessTable's wrappedHandlers.delete
 * According to .cursorrules specification: Must use useBusinessTable to automatically handle refresh, manual refresh logic is prohibited
 */
export const useDeleteHandler = ({ deleteBot }: DeleteHandlerParams) => {
  const handleDelete = useCallback(
    async (botId: string): Promise<boolean> => {
      logger.debug({
        message: '开始处理机器人删除',
        data: {
          botId,
          source: 'useBot',
          action: 'handleDelete',
        },
        source: 'BotManagement',
        component: 'handleDelete',
      });

      try {
        const success = await deleteBot(botId);
        if (success) {
          logger.debug({
            message: '机器人删除成功，将由 wrappedHandlers.delete 自动刷新表格',
            data: {
              botId,
              source: 'useBot',
              action: 'handleDelete',
            },
            source: 'BotManagement',
            component: 'handleDelete',
          });
          return true;
        }
        return false;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '删除失败，请重试';
        logger.error({
          message: '处理机器人删除失败',
          data: {
            error: errorMessage,
            stack: errorObj.stack,
            errorObj,
            botId,
            source: 'useBot',
            action: 'handleDelete',
          },
          source: 'BotManagement',
          component: 'handleDelete',
        });
        Message.error(errorMessage);
        return false;
      }
    },
    [deleteBot],
  );

  return { handleDelete };
};
