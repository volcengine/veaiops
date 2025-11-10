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

import { useBotAttributes } from '@bot/hooks';
import type { AttributeKey, ChannelType } from 'api-generate';

/**
 * Bot attribute business logic Hook
 */
export const useBotAttributesBusinessLogic = ({
  botId,
  channel,
}: {
  botId?: string;
  channel?: string;
}) => {
  // Business logic Hook
  // Note: botId and channel may be undefined, but useBotAttributes requires non-undefined values
  // If not provided, use empty string as default value (will be validated by API in actual use)
  const { loading, createAttribute, updateAttribute, deleteAttribute } =
    useBotAttributes({
      botId: botId || '',
      channel: (channel || 'lark') as ChannelType,
    });

  return {
    loading,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  };
};
