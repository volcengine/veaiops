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

import type { FormInstance } from '@arco-design/web-react';
import type { UpdateBotParams } from '@bot/hooks';
import type { Bot, BotUpdateRequest } from '@bot/lib';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';

/**
 * Update logic hook
 */
export const useUpdateLogic = ({
  editingBot,
  updateBot,
  form,
  setModalVisible,
  setEditingBot,
  afterUpdate,
  setLoading,
}: {
  editingBot: Bot | null;
  updateBot: (params: UpdateBotParams) => Promise<boolean>;
  form: FormInstance;
  setModalVisible: (visible: boolean) => void;
  setEditingBot: (bot: Bot | null) => void;
  afterUpdate: () => Promise<{ success: boolean; error?: Error }>;
  setLoading: (loading: boolean) => void;
}) => {
  const executeUpdate = useCallback(
    async (values: BotUpdateRequest) => {
      if (!editingBot?._id) {
        return false;
      }

      logger.debug({
        message: '开始处理机器人更新',
        data: {
          botId: editingBot._id,
          source: 'useBot',
          action: 'handleUpdate',
        },
        source: 'BotManagement',
        component: 'handleUpdate',
      });

      try {
        const success = await updateBot({
          botId: editingBot._id,
          updateData: values,
        });

        if (success) {
          setModalVisible(false);
          setEditingBot(null);
          form.resetFields();
          logger.debug({
            message: '机器人更新成功，开始刷新表格',
            data: {
              botId: editingBot._id,
              source: 'useBot',
              action: 'handleUpdate',
            },
            source: 'BotManagement',
            component: 'handleUpdate',
          });

          // Refresh table after update success
          const refreshResult = await afterUpdate();
          if (!refreshResult.success && refreshResult.error) {
            logger.warn({
              message: '更新后刷新表格失败',
              data: {
                error: refreshResult.error.message,
                stack: refreshResult.error.stack,
                errorObj: refreshResult.error,
                botId: editingBot._id,
                source: 'useBot',
                action: 'handleUpdate',
              },
              source: 'BotManagement',
              component: 'handleUpdate',
            });
          } else {
            logger.debug({
              message: '更新后表格刷新成功',
              data: {
                botId: editingBot._id,
                source: 'useBot',
                action: 'handleUpdate',
              },
              source: 'BotManagement',
              component: 'handleUpdate',
            });
          }
          return true;
        }
        return false;
      } catch (error) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        throw errorObj;
      }
    },
    [
      editingBot,
      updateBot,
      form,
      afterUpdate,
      setModalVisible,
      setEditingBot,
      setLoading,
    ],
  );

  return {
    executeUpdate,
  };
};
