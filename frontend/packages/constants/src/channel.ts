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
 * ⚠️ Note: ChannelType enum is defined in @veaiops/api-client
 *
 * ✅ Single data source principle:
 * - ChannelType enum is imported from @veaiops/api-client (not re-exported here to avoid proxying)
 * - CHANNEL_OPTIONS and other configuration constants are defined here (UI display configuration)
 *
 * Corresponding backend enum (veaiops/schema/types.py):
 * - Lark = "Lark"
 * - DingTalk = "DingTalk"
 * - WeChat = "WeChat"
 * - Webhook = "Webhook"
 */

// ✅ As a consumer, import ChannelType for type definitions and value comparisons
import { ChannelType } from '@veaiops/api-client';

/**
 * Channel type option configuration (with labels and availability status)
 *
 * Note:
 * - value uses ChannelType enum
 * - Currently only Lark is supported, other channels are marked as disabled
 */
export const CHANNEL_OPTIONS = [
  { label: 'Lark', value: ChannelType.LARK, disabled: false },
  //   { label: 'DingTalk', value: ChannelType.DING_TALK, disabled: true },
  //   { label: 'WeChat', value: ChannelType.WE_CHAT, disabled: true },
  //   { label: 'Webhook', value: ChannelType.WEBHOOK, disabled: true },
] as const;

/**
 * Channel type mapping table
 * Used for quick configuration lookup
 */
export const CHANNEL_MAP = CHANNEL_OPTIONS.reduce(
  (acc, cur) => {
    acc[cur.value] = cur;
    return acc;
  },
  {} as Record<ChannelType, (typeof CHANNEL_OPTIONS)[number]>,
);

/**
 * Get label for channel type
 */
export const getChannelLabel = (value: ChannelType | string): string => {
  const option = CHANNEL_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
};

/**
 * Available channel options (only returns non-disabled options)
 */
export const AVAILABLE_CHANNEL_OPTIONS = CHANNEL_OPTIONS.filter(
  (opt) => !opt.disabled,
);
