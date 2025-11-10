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
import {
  type CreateAttributeParams,
  type LastRequestParams,
  createAttributeApi,
} from '@bot';
import { logger } from '@veaiops/utils';
import type { BotAttributePayload, ChannelType } from 'api-generate';
import { useCallback, useRef } from 'react';

/**
 * Use ref to stabilize parameter references
 */
interface UseCreateAttributeParams {
  botId: string;
  channel: ChannelType;
  lastRequestParamsRef: React.MutableRefObject<LastRequestParams>;
  setLoading: (loading: boolean) => void;
}

/**
 * Create special attention Hook
 */
export function useCreateAttribute({
  botId,
  channel,
  lastRequestParamsRef,
  setLoading,
}: UseCreateAttributeParams) {
  // Use refs to stabilize botId and channel references, avoid circular dependencies
  const botIdRef = useRef(botId);
  const channelRef = useRef(channel);

  // Update ref values without triggering re-render
  botIdRef.current = botId;
  channelRef.current = channel;

  const createAttribute = useCallback(
    async (values: CreateAttributeParams) => {
      try {
        setLoading(true);
        const payload: BotAttributePayload = {
          channel: channelRef.current,
          bot_id: botIdRef.current,
          name: values.name,
          values: values.values,
        };

        const success = await createAttributeApi(payload);

        if (success) {
          Message.success('特别关注创建成功');
          // Log: create successful, component responsible for refreshing table
          logger.info({
            message: '特别关注创建成功',
            data: {
              savedNames: Array.isArray(lastRequestParamsRef.current.names)
                ? [...lastRequestParamsRef.current.names]
                : lastRequestParamsRef.current.names,
              savedValue: lastRequestParamsRef.current.value,
            },
            source: 'useBotAttributes',
            component: 'createAttribute',
          });
          // Don't refresh here, component will refresh via CustomTable's refresh method
          return true;
        }

        return false;
      } catch (error) {
        Message.error(
          error instanceof Error ? error.message : '创建特别关注失败，请重试',
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [lastRequestParamsRef, setLoading],
  );

  return createAttribute;
}
