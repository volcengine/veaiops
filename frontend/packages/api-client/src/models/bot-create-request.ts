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
/**
 * Create bot request. Supports phased creation: Phase 1 only requires channel, bot_id, and secret for quick creation; Phase 2 can add ChatOps advanced configurations such as volc_cfg and agent_cfg during editing
 */
export type BotCreateRequest = {
  /**
   * Enterprise collaboration tool (required)
   */
  channel: BotCreateRequest.channel;
  /**
   * Bot App ID (required)
   */
  bot_id: string;
  /**
   * Bot App Secret (required)
   */
  secret: string;
  /**
   * Webhook URL list (optional)
   */
  webhook_urls?: Array<string>;
  volc_cfg?: VolcCfgPayload;
  agent_cfg?: AgentCfgPayload;
};
export namespace BotCreateRequest {
  /**
   * Enterprise collaboration tool (required)
   */
  export enum channel {
    LARK = 'Lark',
    DING_TALK = 'DingTalk',
    WE_CHAT = 'WeChat',
    WEBHOOK = 'Webhook',
  }
}
