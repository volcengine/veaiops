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

import { Form } from '@arco-design/web-react';
import type { Bot } from '@bot/lib';
import { useState } from 'react';

/**
 * Bot management related state management
 */
export const useBotState = () => {
  const [form] = Form.useForm();
  const [editingBot, setEditingBot] = useState<Bot | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // Attribute management related state
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  const [attributesDrawerVisible, setAttributesDrawerVisible] = useState(false);

  // Chat management state
  const [chatManagementDrawerVisible, setChatManagementDrawerVisible] =
    useState(false);
  const [selectedBotForChat, setSelectedBotForChat] = useState<Bot | null>(
    null,
  );

  return {
    form,
    editingBot,
    setEditingBot,
    modalVisible,
    setModalVisible,
    loading,
    setLoading,
    selectedBot,
    setSelectedBot,
    attributesDrawerVisible,
    setAttributesDrawerVisible,
    chatManagementDrawerVisible,
    setChatManagementDrawerVisible,
    selectedBotForChat,
    setSelectedBotForChat,
  };
};

/**
 * UseBotStateReturn type export
 */
export type UseBotStateReturn = ReturnType<typeof useBotState>;
