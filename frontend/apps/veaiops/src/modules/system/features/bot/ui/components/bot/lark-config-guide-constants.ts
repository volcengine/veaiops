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
 * Lark bot minimum permissions configuration
 */
export const LARK_BOT_MIN_PERMISSIONS = {
  scopes: {
    tenant: [
      'contact:user.email:readonly',
      'contact:user.employee_id:readonly',
      'im:chat.members:bot_access',
      'im:chat:read',
      'im:message.group_at_msg:readonly',
      'im:message.group_msg',
      'im:message.pins:read',
      'im:message:readonly',
      'im:message:send_as_bot',
      'im:message:send_multi_users',
      'im:message:update',
    ],
    user: ['contact:user.email:readonly'],
  },
};

/**
 * Get Lark developer platform event configuration URL
 */
export const getLarkEventUrl = (botId?: string) =>
  botId
    ? `https://open.larkoffice.com/app/${botId}/event`
    : 'https://open.larkoffice.com/app';

/**
 * Get Lark developer platform permission management URL
 */
export const getLarkAuthUrl = (botId?: string) =>
  botId
    ? `https://open.larkoffice.com/app/${botId}/auth`
    : 'https://open.larkoffice.com/app';

/**
 * Get Hook URL
 */
export const getHookUrl = (domain: string) => `${domain}/apis/v1/hook/Lark`;

/**
 * Get Callback URL
 */
export const getCallbackUrl = (domain: string) =>
  `${domain}/apis/v1/callback/Lark`;

/**
 * Required event subscriptions for Lark bot
 */
export const LARK_REQUIRED_EVENTS = [
  {
    name: 'im.chat.disbanded_v1',
    description: '解散群',
  },
  {
    name: 'im.chat.member.bot.added_v1',
    description: '机器人进群',
  },
  {
    name: 'im.chat.member.bot.deleted_v1',
    description: '机器人被移出群',
  },
  {
    name: 'im.message.receive_v1',
    description: '接收消息',
  },
];

/**
 * Required callback subscriptions for Lark bot
 */
export const LARK_REQUIRED_CALLBACKS = [
  {
    name: 'card.action.trigger',
    description: '卡片回传交互',
  },
];
