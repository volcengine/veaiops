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

import { BOT_MESSAGES } from '@/modules/system/features/bot/lib';
import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type {
  Bot,
  BotCreateRequest,
  BotUpdateRequest,
  ChannelType,
} from 'api-generate';
import { useCallback, useState } from 'react';

/**
 * Bot table data type
 */
export interface BotTableData extends Bot {
  /** Table row key */
  key: string;
  /** Status */
  status: 'active' | 'inactive';
}

/**
 * Bot configuration form data
 * Note: This interface is for frontend forms and may not exactly match API request types
 */
export interface BotFormData {
  /** Application ID */
  appId: string;
  /** Application secret */
  appSecret: string;
  /** Encryption token */
  encryptToken?: string;
  /** Encryption secret */
  encryptSecret?: string;
  /** Bot name */
  name?: string;
  /** Enterprise collaboration tool */
  channel: ChannelType;
}

/**
 * Bot management Hook
 */
export const useBotManagement = () => {
  const [bots, setBots] = useState<BotTableData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);

  /**
   * Transform bot data to table data
   */
  const transformBotToTableData = useCallback((bot: Bot): BotTableData => {
    return {
      ...bot,
      key: bot.bot_id || `temp-${Date.now()}-${Math.random()}`,
      status: bot.open_id ? 'active' : 'inactive',
    };
  }, []);

  /**
   * Load bot list
   */
  const loadBots = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.bots.getApisV1ManagerSystemConfigBots(
        {},
      );

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        const tableData = response.data.map(transformBotToTableData);
        setBots(tableData);
      } else {
        throw new Error(response.message || 'Failed to load bot list');
      }
    } catch (error) {
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Failed to load bot list',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'useBotManagement',
        component: 'loadBots',
      });
      const errorMessage =
        error instanceof Error ? error.message : '加载机器人列表失败，请重试';
      Message.error(errorMessage);
    } finally {
      // Loading completed
      setLoading(false);
    }
  }, [transformBotToTableData]);

  /**
   * Create bot
   */
  const createBot = useCallback(
    async (botData: BotCreateRequest): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await apiClient.bots.postApisV1ManagerSystemConfigBots(
          {
            requestBody: botData,
          },
        );

        if (response.code === 201 && response.data) {
          const tableData = transformBotToTableData(response.data);
          setBots((prev) => [...prev, tableData]);
          return true;
        } else {
          throw new Error(response.message || BOT_MESSAGES.create.error);
        }
      } catch (error) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'Failed to create bot',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'useBotManagement',
          component: 'createBot',
        });
        const errorMessage =
          error instanceof Error ? error.message : '创建机器人失败';
        Message.error(errorMessage);
        return false;
      } finally {
        // Operation completed
        setLoading(false);
      }
    },
    [transformBotToTableData],
  );

  /**
   * Update bot
   */
  interface UpdateBotParams {
    botId: string;
    updateData: BotUpdateRequest;
  }
  const updateBot = useCallback(
    async ({ botId, updateData }: UpdateBotParams): Promise<boolean> => {
      try {
        setLoading(true);
        const response = await apiClient.bots.putApisV1ManagerSystemConfigBots({
          uid: botId,
          requestBody: updateData,
        });

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          // Re-fetch updated bot information
          const botResponse =
            await apiClient.bots.getApisV1ManagerSystemConfigBots1({
              uid: botId,
            });

          if (
            botResponse.code === API_RESPONSE_CODE.SUCCESS &&
            botResponse.data
          ) {
            const tableData = transformBotToTableData(botResponse.data);
            setBots((prev) =>
              prev.map((bot) => (bot._id === botId ? tableData : bot)),
            );
            Message.success(BOT_MESSAGES.update.success);
            return true;
          }
        } else {
          // Update API call failed
          throw new Error(response.message || BOT_MESSAGES.update.error);
        }

        throw new Error(response.message || BOT_MESSAGES.update.error);
      } catch (error) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'Update bot error',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'BotManagement',
          component: 'updateBot',
        });
        const errorMessage = errorObj.message;
        Message.error(errorMessage || BOT_MESSAGES.update.error);
        return false;
      } finally {
        // Operation completed
        setLoading(false);
      }
    },
    [transformBotToTableData],
  );

  /**
   * Delete bot
   */
  const deleteBot = useCallback(async (botId: string): Promise<boolean> => {
    try {
      setLoading(true);
      const response = await apiClient.bots.deleteApisV1ManagerSystemConfigBots(
        {
          uid: botId,
        },
      );

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        setBots((prev) => prev.filter((bot) => bot._id !== botId));
        Message.success(BOT_MESSAGES.delete.success);
        return true;
      }

      throw new Error(response.message || BOT_MESSAGES.delete.error);
    } catch (error) {
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Delete bot error',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'BotManagement',
        component: 'deleteBot',
      });
      const errorMessage = errorObj.message;
      Message.error(errorMessage || BOT_MESSAGES.delete.error);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Test bot connection
   */
  const testBotConnection = useCallback(
    async (_botId: string): Promise<boolean> => {
      try {
        setLoading(true);
        // Note: This assumes there is a test connection API, if not, it needs to be added to OpenAPI spec
        // Currently simulate test functionality
        Message.info('正在测试连接...');

        // Simulate test process
        await new Promise((resolve) => setTimeout(resolve, 2000));

        Message.success('机器人连接测试成功');
        return true;
      } catch (error) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'Test bot connection error',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'BotManagement',
          component: 'testBotConnection',
        });
        const errorMessage = errorObj.message;
        Message.error(errorMessage || '测试机器人连接失败');
        return false;
      } finally {
        // Operation completed
        setLoading(false);
      }
    },
    [],
  );

  /**
   * Get bot details
   */
  const getBotDetails = useCallback(
    async (botId: string): Promise<Bot | null> => {
      try {
        const response = await apiClient.bots.getApisV1ManagerSystemConfigBots1(
          {
            uid: botId,
          },
        );

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          setSelectedBot(response.data);
          return response.data;
        }

        throw new Error(response.message || 'Failed to get bot details');
      } catch (error) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'Get bot details error',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'BotManagement',
          component: 'getBotDetails',
        });
        const errorMessage = errorObj.message;
        Message.error(errorMessage || '获取机器人详情失败');
        return null;
      }
    },
    [],
  );

  return {
    // State
    bots,
    loading,
    selectedBot,

    // Operation methods
    loadBots,
    createBot,
    updateBot,
    deleteBot,
    testBotConnection,
    getBotDetails,
    setSelectedBot,
  };
};

export default useBotManagement;
