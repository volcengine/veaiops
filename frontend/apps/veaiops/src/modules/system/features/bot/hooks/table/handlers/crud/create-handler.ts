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
import type { FormInstance } from '@arco-design/web-react';
import type { BotCreateRequest } from '@bot/lib';
import { useManagementRefresh } from '@veaiops/hooks';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';

/**
 * Create handler parameters
 */
interface CreateHandlerParams {
  createBot: (data: BotCreateRequest) => Promise<boolean>;
  form: FormInstance;
  setModalVisible: (visible: boolean) => void;
  refreshTable: () => Promise<boolean>;
  setLoading: (loading: boolean) => void;
}

/**
 * Create Bot handler
 */
export const useCreateHandler = ({
  createBot,
  form,
  setModalVisible,
  refreshTable,
  setLoading,
}: CreateHandlerParams) => {
  // Use management refresh hook
  const { afterCreate } = useManagementRefresh(refreshTable);

  const handleCreate = useCallback(
    async (values: BotCreateRequest) => {
      logger.debug({
        message: '开始处理机器人创建',
        data: {
          botId: values.bot_id,
          channel: values.channel,
          source: 'useBot',
          action: 'handleCreate',
        },
        source: 'BotManagement',
        component: 'handleCreate',
      });

      try {
        const success = await createBot(values);
        if (success) {
          setModalVisible(false);
          form.resetFields();
          logger.debug({
            message: '机器人创建成功，开始刷新表格',
            data: {
              botId: values.bot_id,
              channel: values.channel,
              source: 'useBot',
              action: 'handleCreate',
            },
            source: 'BotManagement',
            component: 'handleCreate',
          });

          // Refresh table after create success
          const refreshResult = await afterCreate();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: '创建后刷新表格失败',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
                botId: values.bot_id,
                channel: values.channel,
                source: 'useBot',
                action: 'handleCreate',
              },
              source: 'BotManagement',
              component: 'handleCreate',
            });
          } else {
            logger.debug({
              message: '创建后表格刷新成功',
              data: {
                botId: values.bot_id,
                channel: values.channel,
                source: 'useBot',
                action: 'handleCreate',
              },
              source: 'BotManagement',
              component: 'handleCreate',
            });
          }
          return true;
        }
        return false;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        const errorMessage = errorObj.message || '创建失败，请重试';
        logger.error({
          message: '处理机器人创建失败',
          data: {
            error: errorMessage,
            stack: errorObj.stack,
            errorObj,
            botId: values.bot_id,
            channel: values.channel,
            source: 'useBot',
            action: 'handleCreate',
          },
          source: 'BotManagement',
          component: 'handleCreate',
        });
        Message.error(errorMessage);
        return false;
      }
    },
    [createBot, form, afterCreate, setModalVisible, setLoading],
  );

  return { handleCreate };
};
