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
 * Bot-related type definitions
 * Unified management of Bot-related types, interfaces, and constants
 */

// Import generated type definitions to ensure consistency with Python interface
import type {
  AgentCfg,
  AgentCfgPayload,
  Bot,
  VolcCfg,
  VolcCfgPayload,
} from 'api-generate';

export type {
  AgentCfg,
  AgentCfgPayload,
  APIResponseBot,
  Bot,
  BotCreateRequest,
  BotUpdateRequest,
  ChannelType,
  VolcCfg,
  VolcCfgPayload,
} from 'api-generate';

/**
 * Volcengine region type (corresponds to backend tos_region enum)
 */
export type VolcRegion = VolcCfgPayload.tos_region;

/**
 * Network type (corresponds to backend NetworkType enum)
 */
export type NetworkType = VolcCfgPayload.network_type;

/**
 * Extended bot data (contains complete configuration information)
 */
export type ExtendedBot = Bot & {
  volc_cfg?: VolcCfg;
  agent_cfg?: AgentCfg;
};

/**
 * Form data type (matches form field names)
 * Field naming aligned with API: use agent_cfg instead of agent_cfg_payload
 *
 * Note: name field has been removed because:
 * 1. BotCreateRequest doesn't include name field
 * 2. name field is not used in create form
 * 3. name in table filter is a query parameter, not a form field
 */
export interface BotFormData {
  bot_id: string;
  secret: string;
  channel: Bot.channel;
  webhook_urls?: Array<string>;
  volc_cfg?: VolcCfgPayload;
  agent_cfg?: AgentCfgPayload;
}

/**
 * Volcengine region options configuration (corresponds to backend tos_region enum)
 */
export const TOS_REGION_OPTIONS = [
  { label: '华北2-北京', value: 'cn-beijing' as const },
  { label: '华东2-上海', value: 'cn-shanghai' as const },
  { label: '华南1-广州', value: 'cn-guangzhou' as const },
  { label: '中国香港', value: 'cn-hongkong' as const },
  { label: '亚太东南（柔佛）', value: 'ap-southeast-1' as const },
  { label: '亚太东南（雅加达）', value: 'ap-southeast-3' as const },
] as const;

/**
 * Network type options
 */
export const NETWORK_TYPE_OPTIONS = [
  { label: '内网', value: 'internal' },
  { label: '公网', value: 'public' },
] as const;

/**
 * Enterprise collaboration tool options have been migrated to @veaiops/constants
 * @see frontend/packages/constants/src/channel.ts
 *
 * Usage:
 * import { CHANNEL_OPTIONS } from '@veaiops/constants';
 */

/**
 * Bot table operation callbacks
 */
export interface BotTableActions {
  onEdit: (bot: Bot) => void;
  onDelete: (botId: string) => Promise<boolean>;
}

/**
 * Bot table component properties interface
 */
export interface BotTableProps {
  onEdit: (bot: Bot) => void;
  onDelete: (botId: string) => Promise<boolean>;
  onAdd: () => void;
  onViewAttributes: (bot: Bot) => void;
  onGroupManagement: (bot: Bot) => void;
}

/**
 * Bot table component ref interface
 */
export interface BotTableRef {
  refresh: () => Promise<boolean>;
}
