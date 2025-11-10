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
import type { BotAttributeFiltersQuery, ModalType } from '@bot/types';
import { type BotAttribute, ChannelType } from 'api-generate';
import { useCallback, useRef, useState } from 'react';

/**
 * Bot attributes table state management Hook
 */
export const useAttributesTableLogicState = ({
  botId,
  channel,
}: {
  botId?: string;
  channel?: string | ChannelType;
}) => {
  // State management
  const [editingAttribute, setEditingAttribute] = useState<BotAttribute | null>(
    null,
  );
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('create');

  // Convert channel to ChannelType (if channel is string type)
  const channelType =
    (typeof channel === 'string' ? (channel as ChannelType) : channel) ||
    ChannelType.LARK;

  // Business logic Hook
  const {
    loading,
    fetchAttributes,
    createAttribute,
    updateAttribute,
    deleteAttribute,
  } = useBotAttributes({
    botId: botId || '',
    channel: channelType,
  });

  // Use ref to stabilize fetchAttributes function reference to avoid infinite loop
  const fetchAttributesRef = useRef(fetchAttributes);
  fetchAttributesRef.current = fetchAttributes;

  // Create a stable request function
  const stableFetchAttributes = useCallback(
    (params?: BotAttributeFiltersQuery & { skip?: number; limit?: number }) => {
      return fetchAttributesRef.current(params);
    },
    [], // Empty dependency array to ensure function reference is stable
  );

  return {
    editingAttribute,
    setEditingAttribute,
    isModalVisible,
    setIsModalVisible,
    modalType,
    setModalType,
    loading,
    createAttribute,
    updateAttribute,
    deleteAttribute,
    stableFetchAttributes,
  };
};
