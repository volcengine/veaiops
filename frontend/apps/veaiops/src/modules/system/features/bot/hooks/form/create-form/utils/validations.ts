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
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';

/**
 * Check if App ID is duplicate
 * @param appId - App ID to check
 * @returns Error message if duplicate, otherwise undefined
 */
export const checkAppIdDuplicate = async (
  appId: string,
): Promise<string | undefined> => {
  // If App ID is empty, skip validation
  if (!appId || appId.trim() === '') {
    return undefined;
  }

  try {
    // Call API to get bot list (limit is 1000)
    const response = await apiClient.bots.getApisV1ManagerSystemConfigBots({
      limit: 1000,
    });

    // Check if API response is successful
    if (
      response.code === API_RESPONSE_CODE.SUCCESS &&
      response.data &&
      Array.isArray(response.data)
    ) {
      // Check if there is a duplicate bot_id
      const isDuplicate = response.data.some(
        (bot) => bot.bot_id === appId.trim(),
      );

      if (isDuplicate) {
        return '该 App ID 已被使用，请使用其他 App ID';
      }
    }

    // No duplicate, return undefined
    return undefined;
  } catch (error) {
    // Error handling: log error but don't block user from continuing
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: '检查 App ID 重复失败',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
        appId,
      },
      source: 'useBotCreateForm',
      component: 'checkAppIdDuplicate',
    });
    // On network error, don't block user from continuing, return undefined
    return undefined;
  }
};
