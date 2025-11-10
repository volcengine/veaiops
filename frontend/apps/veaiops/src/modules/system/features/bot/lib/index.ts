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
 * Bot management library unified export
 * Note: Type definitions have been migrated to types/ directory, no longer exported here
 */

// Type definitions (exported from parent types directory, maintaining layered export principle)
export type { Bot, BotCreateRequest, BotFormData, BotTableRef, BotUpdateRequest } from "../types";

// API service
export * from "./api";

// Table column configuration (exported from columns/index.ts to avoid circular imports)
export * from "./chat-columns";
export * from "./columns";

// Attribute related configuration (simplified naming: removed bot- prefix)
export { getBotAttributesColumns } from "./attributes-columns";
export type { BotAttributesColumnsProps } from "./attributes-columns";
export * from "./attributes-filters";

// Utility functions
export * from "./utils";

// Configuration
export * from "./config";

// Constants re-exported from types (for UI components)
// Note: CHANNEL_TYPE_OPTIONS has been migrated to @veaiops/constants, use CHANNEL_OPTIONS uniformly
export { NETWORK_TYPE_OPTIONS, TOS_REGION_OPTIONS } from "../types/bot";

// Others
export * from "./chat-filters";
export * from "./chat-query-format";
export * from "./chat-types";
export * from "./filters";
export * from "./translations";

// Attribute table configuration
export * from "./attributes-table-config";

// Note: Bot attribute API has been merged into api.ts, no longer exported separately
