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
import type { Bot } from 'api-generate';
import { useCallback } from 'react';

/**
 * Fetch bot options Hook
 */
export const useFetchBotOptions = ({
  setBotOptions,
}: {
  setBotOptions: (options: Array<{ label: string; value: string }>) => void;
}) => {
  const fetchBotOptions = useCallback(async () => {
    try {
      const response = await apiClient.bots.getApisV1ManagerSystemConfigBots(
        {},
      );

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        const options = response.data.map((bot: Bot) => ({
          label: `${bot.name} (${bot._id})`,
          value: bot._id || '',
        }));
        setBotOptions(options);
      }
    } catch (error) {
      // Silent handling: Bot list loading failure does not affect other functionality
    }
  }, [setBotOptions]);

  return {
    fetchBotOptions,
  };
};
