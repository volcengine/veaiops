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

import { Form, type FormInstance } from '@arco-design/web-react';
import { useBotsList, useChatsList } from '@ec/strategy';
import type { Bot } from 'api-generate';
import { useEffect, useMemo } from 'react';

/**
 * Form logic Hook return value interface
 */
export interface UseFormLogicResult {
  botsOptions: Array<{ label: string; value: string; extra?: Bot }>;
  chatOptions: Array<{ label: string; value: string }>;
  selectedBotName: string | null;
}

/**
 * Form logic Hook
 * Handles bot list, chat list fetching and selected state
 */
export const useFormLogic = (form: FormInstance): UseFormLogicResult => {
  const { data: botsOptions = [] } = useBotsList();
  const { chatOptions = [], fetchChats } = useChatsList();

  const bot_id = Form.useWatch('bot_id', form);

  // Get selected bot name (label)
  const selectedBotName = useMemo(() => {
    if (!bot_id) {
      return null;
    }
    const selectedBot = botsOptions.find((item) => item.value === bot_id);
    return selectedBot?.label || null;
  }, [bot_id, botsOptions]);

  // Re-fetch chat list when bot changes
  useEffect(() => {
    if (bot_id) {
      const botExtra = botsOptions.find((item) => item.value === bot_id)?.extra;
      if (botExtra?._id) {
        fetchChats(botExtra._id);
      }
    }
  }, [bot_id, fetchChats, botsOptions]);

  return {
    botsOptions,
    chatOptions,
    selectedBotName,
  };
};
