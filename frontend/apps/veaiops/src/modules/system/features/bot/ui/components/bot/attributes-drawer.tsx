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

import { Drawer } from '@arco-design/web-react';
import { type Bot, ChannelType } from 'api-generate';
import type React from 'react';
import { BotAttributesTable } from '../../attributes-table';
import { BotDrawerTitle } from './drawer-title';

interface BotAttributesDrawerProps {
  visible: boolean;
  onClose: () => void;
  bot: Bot | null;
}

/**
 * Bot special attention drawer component
 * Displays Bot's special attention information (corresponds to v2 branch implementation)
 *
 * Refactoring notes (aligned with origin/feat/web-v2 branch):
 * - Use BotDrawerTitle component to display title and Bot information (App ID, name)
 * - Set drawer width to 1000 (v2 branch is 1000, current branch originally was 800)
 * - Remove footer (footer={null})
 * - Add focusLock={false}
 * - Remove onOk property (v2 branch uses footer={null}, no need for onOk)
 * - Use ui/bot-attributes-table as table component (consistent with v2 branch path)
 *
 * Naming notes:
 * - Technical implementation level: Use BotAttribute as data model name
 *   (Chinese term: "Bot属性")
 * - User interface level: Use "特别关注" (Special Attention) as display name
 *   (Note: "特别关注" is the Chinese UI text, should remain in Chinese)
 * - Maintain consistent user experience with origin/feat/web-v2 branch
 */
export const BotAttributesDrawer: React.FC<BotAttributesDrawerProps> = ({
  visible,
  onClose,
  bot,
}) => {
  if (!bot) {
    return null;
  }

  // Get channel type from Bot object
  // Bot.channel and ChannelType enum values are the same, convert through string value
  const channelType =
    (bot.channel as string as ChannelType) || ChannelType.LARK;

  return (
    <Drawer
      width={1000}
      title={<BotDrawerTitle bot={bot} title="特别关注" />}
      visible={visible}
      onCancel={onClose}
      footer={null}
      focusLock={false}
    >
      <BotAttributesTable botId={bot.bot_id || ''} channel={channelType} />
    </Drawer>
  );
};
