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

/* generated using openapi-typescript-codegen -- do not edit */
import type { BotVO } from './bot-vo';
import type { ChannelType } from './channel-type';
import type { GroupChatVO } from './group-chat-vo';
/**
 * Inform strategy response object (InformStrategyVO)
 */
export type InformStrategy = {
  /**
   * Message card notification strategy ID
   */
  id: string;
  /**
   * Message card notification strategy name
   */
  name: string;
  /**
   * Message card notification strategy description
   */
  description?: string;
  /**
   * Notification channel type
   */
  channel: ChannelType;
  /**
   * Bot information
   */
  bot: BotVO;
  /**
   * Group chat list
   */
  group_chats: Array<GroupChatVO>;
};
