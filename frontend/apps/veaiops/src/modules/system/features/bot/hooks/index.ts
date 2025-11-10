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
 * Bot management custom Hooks unified export
 */

// Business logic Hooks (table-related)
export {
  useBot,
  useBotActionConfig,
  useBotTableConfig,
} from './table';

// Form-related Hooks
export { useBotForm } from './form';

// Attributes-related Hooks (types exported from @bot/types to avoid duplication)
export {
  useBotAttributes,
  useBotAttributesTable,
  useBotAttributesTableConfig,
  useBotAttributesTableLogic,
  type UseBotAttributesTableConfigParams,
  type UseBotAttributesTableConfigReturn,
  type UseBotAttributesTableLogicParams,
  type UseBotAttributesTableLogicReturn,
  type UseBotAttributesTableParams,
  type UseBotAttributesTableReturn,
} from './attributes';

// Chat-related Hooks
export { useBotChat, useChatManagementLogic, useChatTableConfig } from './chat';

// Shared Hooks - can be used by other modules
export { useBotList } from './list';
