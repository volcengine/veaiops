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
 * History event module type definitions
 *
 * Note: Common types have been migrated to @veaiops/types
 * This file only retains module-specific types
 */

// Import common types from packages
import type {
  EventQueryParams,
  EventTableData,
  TableQueryParams,
  TableDataResponse,
} from "@veaiops/types";

// Re-export common types (backward compatibility)
export type {
  EventQueryParams as HistoryQueryParams,
  EventTableData as HistoryTableData,
  TableQueryParams,
  TableDataResponse,
};

// Export original types from api-generate
export type { Event, AgentType, EventLevel } from "api-generate";

// ✅ Directly export EventStatus from @veaiops/api-client (not through constants)
export { EventStatus } from "@veaiops/api-client";

// Export new type definitions (migrated from origin/feat/web-v2)
// Use origin/feat/web-v2 field definition approach
export type { EventApiParams, HistoryFilters } from "../types/event-api-params";
