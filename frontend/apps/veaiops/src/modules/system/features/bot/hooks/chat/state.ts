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

import type { Bot, Chat } from 'api-generate';
import { useState } from 'react';

/**
 * Bot chat management state management
 */
export const useBotChatState = () => {
  const [selectedBotId, setSelectedBotId] = useState<string>('');
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(false);
  const [configModalVisible, setConfigModalVisible] = useState(false);
  const [editingChat, setEditingChat] = useState<Chat | null>(null);
  const [botOptions, setBotOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);

  return {
    selectedBotId,
    setSelectedBotId,
    chats,
    setChats,
    loading,
    setLoading,
    configModalVisible,
    setConfigModalVisible,
    editingChat,
    setEditingChat,
    botOptions,
    setBotOptions,
  };
};
