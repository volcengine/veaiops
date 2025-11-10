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
 * Bot attribute related type definitions
 */

import type { AttributeKey, ChannelType } from 'api-generate';

// BotAttribute type is now generated from API

export interface BotAttributeFormData {
  name: AttributeKey;
  value: string | string[]; // Supports single and multiple selection
  bot_id?: string;
  channel?: string;
}

export type ModalType = 'create' | 'edit' | 'detail';

export interface BotAttributesTableProps {
  botId?: string;
  channel?: string;
  onRefresh?: () => void;
}

/**
 * Bot special attention management Hook parameters interface
 */
export interface UseBotAttributesParams {
  botId: string;
  channel: ChannelType;
}

/**
 * Update special attention parameters interface
 */
export interface UpdateAttributeParams {
  id: string;
  value: string;
}

/**
 * Create special attention parameters interface
 */
export interface CreateAttributeParams {
  name: AttributeKey;
  values: string[];
}

/**
 * Saved request parameters interface
 */
export interface LastRequestParams {
  names?: string[];
  value?: string;
}

/**
 * Bot attribute category options
 * Currently only supports project, customer and product features are pending development
 */
export const ATTRIBUTE_OPTIONS = [
  { label: '项目', value: 'project' as AttributeKey },
  // { label: 'Customer', value: 'customer' as AttributeKey },
  // { label: 'Product', value: 'product' as AttributeKey },
];

/**
 * Category mapping table
 * Maps English category names to Chinese display names
 * Corresponds to origin/feat/web-v2 branch implementation, ensuring consistent display
 */
export const ATTRIBUTE_NAME_MAP: Record<AttributeKey, string> = {
  project: '项目',
  customer: '客户',
  product: '产品',
};
