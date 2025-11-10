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

import type { UseBotAttributesParams } from '@bot/types';
import { AttributeKey, type BotAttribute } from 'api-generate';
import { useRef, useState } from 'react';
import {
  useCreateAttribute,
  useDeleteAttribute,
  useFetchAttributes,
  useUpdateAttribute,
} from './helpers';

/**
 * Bot special attention management Hook
 * Provides CRUD operations and state management for Bot special attention
 */
export const useBotAttributes = ({
  botId,
  channel,
}: UseBotAttributesParams) => {
  const [loading, setLoading] = useState(false);
  const [attributes, setAttributes] = useState<BotAttribute[]>([]);

  // Save the most recent request filter parameters, used to maintain filter state when refreshing after create/delete
  // Default value is [AttributeKey.PROJECT], corresponding to the filter's default value
  const lastRequestParamsRef = useRef<{
    names?: string[];
    value?: string;
  }>({
    names: [AttributeKey.PROJECT],
  });

  // Use various feature Hooks
  const fetchAttributes = useFetchAttributes({
    botId,
    channel,
    lastRequestParamsRef,
    setLoading,
    setAttributes,
  });

  const createAttribute = useCreateAttribute({
    botId,
    channel,
    lastRequestParamsRef,
    setLoading,
  });

  const updateAttribute = useUpdateAttribute({
    lastRequestParamsRef,
    setLoading,
  });

  const deleteAttribute = useDeleteAttribute({
    lastRequestParamsRef,
    setLoading,
  });

  return {
    loading,
    attributes,
    fetchAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  };
};
