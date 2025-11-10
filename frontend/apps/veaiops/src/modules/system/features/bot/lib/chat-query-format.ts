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

import { queryBooleanFormat } from '@veaiops/utils';

/**
 * Chat management query parameter formatting configuration
 *
 * 🔧 Optimization notes:
 * - Only need to define **non-string type** fields (arrays, booleans, etc.)
 * - String type fields (such as name) will be automatically handled by CustomTable
 * - This avoids URL synchronization issues caused by missing fields
 */
export const CHAT_TABLE_QUERY_FORMAT = {
  // Force refresh - boolean format
  force_refresh: queryBooleanFormat,
  // Joined group status - boolean format
  is_active: queryBooleanFormat,
  // Interest detection agent status - boolean format
  enable_func_interest: queryBooleanFormat,
  // Proactive reply agent status - boolean format
  enable_func_proactive_reply: queryBooleanFormat,
};
