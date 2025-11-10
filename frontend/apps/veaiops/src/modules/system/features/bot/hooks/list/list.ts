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
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type { Bot } from 'api-generate';
import { useCallback, useEffect, useState } from 'react';

/**
 * Bot list management custom Hook
 * @description Encapsulates bot list related state and logic
 * @note Optimization: Directly use Bot type from api-generate, avoid custom duplicate types
 */
export const useBotList = () => {
  const [bots, setBots] = useState<Bot[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch bot list
  const fetchBots = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.bots.getApisV1ManagerSystemConfigBots(
        {},
      );

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        // Directly use Bot type data returned from API, no conversion needed
        setBots(response.data);
      } else {
        Message.error({
          content: response.message || '获取机器人列表失败',
          duration: 3000,
        });
        setBots([]);
      }
    } catch (error: unknown) {
      // ✅ Correct: Extract actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Failed to fetch bot list',
        data: { error: errorObj },
        source: 'useBotList',
        component: 'fetchBots',
      });
      Message.error({ content: '获取机器人列表失败，请重试', duration: 3000 });
      setBots([]);
    } finally {
      // Operation completed
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBots();
  }, [fetchBots]);

  return {
    bots,
    loading,
    fetchBots,
  };
};
