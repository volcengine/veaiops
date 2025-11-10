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

/**
 * Strategy management type definitions
 *
 * 🎯 Type design principles:
 * 1. Prioritize using backend interface types from api-generate
 * 2. Prioritize using component types from @veaiops/components
 * 3. Define minimal extension types only when necessary
 */

import type { GroupChatVO, InformStrategy } from 'api-generate';

// ✅ Type safe: Unified import of InformStrategy from api-generate (conforms to single source of truth principle)
// Based on Python source code analysis: API returns InformStrategyVO, corresponding to TypeScript's InformStrategy

/**
 * Strategy edit form data adapter
 *
 * Converts InformStrategy (API response format) to format required by edit form
 *
 * Based on Python source code analysis (veaiops/schema/models/event/event.py):
 * - InformStrategyVO contains: id, name, description, channel, bot: BotVO, group_chats: List[GroupChatVO]
 * - BotVO contains: id, channel, bot_id, name, is_active
 * - GroupChatVO contains: id, open_chat_id, chat_name, is_active
 *
 * Edit form requires flattened bot_id and chat_ids fields, so extract these values from nested objects
 *
 * @param strategy - Message card notification strategy object (InformStrategy type, from api-generate)
 * @returns Strategy object containing bot_id and chat_ids (conforms to EventStrategy interface's flattened requirements)
 */
export function adaptStrategyForEdit(
  strategy: InformStrategy,
): InformStrategy & {
  bot_id: string;
  chat_ids: string[];
} {
  // ✅ Type safe: Extract bot_id from BotVO (Python source: BotVO.bot_id)
  // ✅ Type safe: Extract open_chat_id from GroupChatVO[] (Python source: GroupChatVO.open_chat_id)
  return {
    ...strategy,
    bot_id: strategy.bot?.bot_id || '', // BotVO's bot_id field (Python: bot_id: str = Field(...))
    chat_ids: strategy.group_chats?.map(
      (item: GroupChatVO) => item.open_chat_id, // GroupChatVO's open_chat_id field (Python: open_chat_id: str = Field(...))
    ) || [],
  };
}
