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

import { AttributeKey } from 'api-generate';
import type { BotAttributeFiltersQuery } from './attributes-filters';

/**
 * Bot attribute table configuration constants
 */

/**
 * Table initial query parameters
 * Default to "project" category to avoid infinite loop when setting in handleFilters
 *
 * Note: v2 branch does not have initQuery, but will set default values in getBotAttributeFilters
 * Current branch uses initQuery to avoid infinite loop, which is a safer approach
 */
export const BOT_ATTRIBUTES_TABLE_INIT_QUERY: BotAttributeFiltersQuery = {
  names: [AttributeKey.PROJECT],
};

/**
 * Feature description hint text
 */
export const BOT_ATTRIBUTES_INFO_MESSAGE =
  '为机器人添加关注项目，以便在事件中心订阅和管理相关事件。选择要关注的项目后，系统将自动为该机器人启用对应项目的事件推送和ChatOps功能。';

/**
 * Table scroll configuration
 */
export const BOT_ATTRIBUTES_TABLE_SCROLL = { x: 800 };
