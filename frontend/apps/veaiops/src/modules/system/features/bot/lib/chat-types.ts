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

import { Bot, ChannelType, Chat } from "api-generate";

// Basic type definitions
/**
 * Chat-related enterprise collaboration tool type
 *
 * ✅ Single data source principle: Use ChannelType enum
 * Corresponds to backend ChannelType enum (veaiops/schema/types.py)
 * Corresponds to API-generated ChannelType enum (@veaiops/api-client/models/channel-type.ts)
 *
 * @deprecated Recommend directly using ChannelType enum
 */
export type ChatChannelType = ChannelType;

/**
 * Channel type options (chat-related only)
 *
 * ✅ Single data source principle: Uniformly use backend enum values
 * Enum value mapping:
 * - ChannelType.LARK ↔ Python ChannelType.Lark = "Lark"
 * - ChannelType.DING_TALK ↔ Python ChannelType.DingTalk = "DingTalk"
 * - ChannelType.WE_CHAT ↔ Python ChannelType.WeChat = "WeChat"
 */
export const CHAT_CHANNEL_TYPE_OPTIONS = [
  { label: "Lark", value: ChannelType.LARK },
  // { label: "DingTalk", value: ChannelType.DING_TALK },
  // { label: "WeChat", value: ChannelType.WE_CHAT },
];

/**
 * Chat type options
 */
export const CHAT_TYPE_OPTIONS = [
  { label: "群聊", value: "group" },
  { label: "私聊", value: "private" },
];

/**
 * Chat configuration update request
 */
export interface ChatConfigUpdateRequest {
  enable_func_proactive_reply: boolean;
  enable_func_interest: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedAPIResponseChatList {
  code: number;
  message: string;
  data: {
    items: Chat[];
    total: number;
    skip: number;
    limit: number;
  };
}

/**
 * Chat management query parameters
 */
export interface ChatQueryParams {
  skip?: number;
  limit?: number;
  chat_type?: "group" | "private";
  channel?: ChannelType;
  bot_id?: string;
  force_refresh?: boolean;
  is_active?: boolean;
  name?: string;
  enable_func_interest?: boolean;
  enable_func_proactive_reply?: boolean;
}

/**
 * Chat table data type
 */
/**
 * Chat table data type
 * Directly use Chat type from api-generate
 * @deprecated Recommend directly using Chat type, CustomTable will automatically handle rowKey
 */
export type ChatTableData = Chat;

/**
 * Chat management drawer properties
 */
export interface ChatManagementDrawerProps {
  visible: boolean;
  onClose: () => void;
  selectedBot?: Bot;
}

/**
 * Chat configuration edit form data
 */
export interface ChatConfigFormData {
  enable_func_proactive_reply: boolean;
  enable_func_interest: boolean;
}

/**
 * Chat management operation callbacks
 */
export interface ChatTableActions {
  onConfigEdit: (chat: Chat) => void;
  onRefresh: () => void;
}

/**
 * Type guard: Check if record is chat table data
 */
export function isChatTableData(
  record: Record<string, unknown>
): record is ChatTableData {
  return (
    typeof record === "object" &&
    record !== null &&
    typeof record.key === "string" &&
    typeof record.chat_id === "string"
  );
}
