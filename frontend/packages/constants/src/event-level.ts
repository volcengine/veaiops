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
 * ⚠️ Note: EventLevel enum is defined in @veaiops/api-client
 *
 * ✅ Single source of truth principle:
 * - EventLevel enum is imported from @veaiops/api-client (not re-exported here to avoid intermediary)
 * - Configuration constants like EVENT_LEVEL_OPTIONS are defined here (UI display configuration)
 *
 * Usage:
 * ```typescript
 * // Import enum
 * import { EventLevel } from '@veaiops/api-client';
 * // Import configuration constants
 * import { EVENT_LEVEL_OPTIONS } from '@veaiops/constants';
 *
 * // Use enum value
 * const level = EventLevel.P0;
 * // Find configuration
 * const config = EVENT_LEVEL_OPTIONS.find(opt => opt.value === EventLevel.P0);
 * ```
 */

// ✅ As a consumer, import EventLevel for type definitions and value comparisons
import { EventLevel } from '@veaiops/api-client';

/**
 * Event level option configuration (with color and Chinese labels)
 *
 * Note: value uses EventLevel enum
 */
export const EVENT_LEVEL_OPTIONS = [
  { label: 'P0', value: EventLevel.P0, extra: { color: 'red' } },
  { label: 'P1', value: EventLevel.P1, extra: { color: 'orange' } },
  { label: 'P2', value: EventLevel.P2, extra: { color: 'blue' } },
] as const;

/**
 * Event level mapping table
 * Used for quick configuration lookup
 */
export const EVENT_LEVEL_MAP = EVENT_LEVEL_OPTIONS.reduce(
  (acc, cur) => {
    acc[cur.value] = cur;
    return acc;
  },
  {} as Record<EventLevel, (typeof EVENT_LEVEL_OPTIONS)[number]>,
);

/**
 * Event level color mapping
 */
export const EVENT_LEVEL_COLOR_MAP: Record<EventLevel, string> = {
  [EventLevel.P0]: 'red',
  [EventLevel.P1]: 'orange',
  [EventLevel.P2]: 'blue',
};

/**
 * Event level text mapping
 */
export const EVENT_LEVEL_TEXT_MAP: Record<EventLevel, string> = {
  [EventLevel.P0]: 'P0',
  [EventLevel.P1]: 'P1',
  [EventLevel.P2]: 'P2',
};
