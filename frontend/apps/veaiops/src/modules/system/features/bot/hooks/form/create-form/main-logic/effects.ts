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
import type { BotFormData } from '@bot/lib';
import { Bot, ChannelType, VolcCfgPayload } from 'api-generate';
import { useEffect } from 'react';

/**
 * Side effects management for Bot creation form
 */
export const useBotCreateFormEffects = ({
  form,
  showAdvancedConfig,
}: {
  form: FormInstance<BotFormData>;
  showAdvancedConfig: boolean;
}) => {
  // Initialize form default values
  useEffect(() => {
    // Type-safe conversion: ChannelType enum value -> Bot.channel enum value
    // ✅ Note: ChannelType.LARK = 'Lark' (capital L), Bot.channel.LARK = 'Lark' (capital L)
    // Both enum values are actually the same: 'Lark' (capital L)
    // Using Partial to make properties optional, currently only supports LARK
    const channelMap: Partial<Record<ChannelType, Bot.channel>> = {
      [ChannelType.LARK]: Bot.channel.LARK,
      // [ChannelType.DING_TALK]: Bot.channel.DING_TALK,
      // [ChannelType.WE_CHAT]: Bot.channel.WE_CHAT,
      // [ChannelType.WEBHOOK]: Bot.channel.WEBHOOK,
    };
    form.setFieldsValue({
      channel: channelMap[ChannelType.LARK],
      bot_id: '',
      secret: '',
    });
  }, [form]);

  // Set initial values when enabling/disabling ChatOps configuration
  useEffect(() => {
    if (showAdvancedConfig) {
      form.setFieldsValue({
        volc_cfg: {
          ak: '',
          sk: '',
          tos_region: VolcCfgPayload.tos_region.CN_BEIJING,
          network_type: VolcCfgPayload.network_type.PUBLIC,
          extra_kb_collections: [],
        },
        agent_cfg: {
          name: '',
          embedding_name: '',
          api_base: 'https://ark.cn-beijing.volces.com/api/v3',
          api_key: '',
        },
        webhook_urls: [],
      });
    }
  }, [showAdvancedConfig, form]);
};
