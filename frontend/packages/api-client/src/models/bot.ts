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
import type { AgentCfgPayload } from './agent-cfg-payload';
import type { VolcCfgPayload } from './volc-cfg-payload';
export type Bot = {
  /**
   * MongoDB document ID
   */
  _id?: string | null;
  /**
   * Created user
   */
  created_user?: string | null;
  /**
   * Creation time
   */
  created_at?: string;
  /**
   * Updated user
   */
  updated_user?: string | null;
  /**
   * Update time
   */
  updated_at?: string;
  /**
   * Whether active
   */
  is_active?: boolean;
  /**
   * Enterprise collaboration tool
   */
  channel?: Bot.channel;
  /**
   * Bot ID
   */
  bot_id?: string;
  /**
   * OpenID, automatically generated from bot_id
   */
  open_id?: string | null;
  /**
   * Bot name
   */
  name?: string | null;
  /**
   * Bot secret
   */
  secret?: string;
  /**
   * Webhook URL list
   */
  webhook_urls?: Array<string>;
  /**
   * Volcano Engine configuration
   */
  volc_cfg?: VolcCfgPayload;
  /**
   * Agent configuration
   */
  agent_cfg?: AgentCfgPayload;
};
export namespace Bot {
  /**
   * Enterprise collaboration tool
   */
  export enum channel {
    LARK = 'Lark',
    DING_TALK = 'DingTalk',
    WE_CHAT = 'WeChat',
    WEBHOOK = 'Webhook',
  }
}
