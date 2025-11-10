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

import { EventLevel, EventShowStatus, EventStatus } from 'api-generate';

/**
 * Event level enum options configuration
 */
export const EVENT_LEVEL_OPTIONS = [
  { label: 'P0', value: EventLevel.P0, extra: { color: 'red' } },
  { label: 'P1', value: EventLevel.P1, extra: { color: 'orange' } },
  { label: 'P2', value: EventLevel.P2, extra: { color: 'blue' } },
];

export const EVENT_LEVEL_MAP = EVENT_LEVEL_OPTIONS.reduce(
  (acc, cur) => {
    acc[cur.value] = cur;
    return acc;
  },
  {} as Record<string, (typeof EVENT_LEVEL_OPTIONS)[0]>,
);

/**
 * Event show status options
 * Corresponds to backend EventShowStatus enum (Chinese)
 * Used for filter display
 */
export const EVENT_SHOW_STATUS_OPTIONS = [
  {
    label: '等待发送',
    value: EventShowStatus.PENDING,
    extra: { color: 'blue' },
  },
  {
    label: '发送成功',
    value: EventShowStatus.SUCCESS,
    extra: { color: 'green' },
  },
  {
    label: '未订阅',
    value: EventShowStatus.NOT_SUBSCRIBED,
    extra: { color: 'orange' },
  },
  {
    label: '未命中规则',
    value: EventShowStatus.NOT_MATCHED,
    extra: { color: 'red' },
  },
  {
    label: '命中过滤规则',
    value: EventShowStatus.FILTERED,
    extra: { color: 'purple' },
  },
  {
    label: '告警抑制',
    value: EventShowStatus.RESTRAINED,
    extra: { color: 'magenta' },
  },
];

export const EVENT_SHOW_STATUS_MAP = EVENT_SHOW_STATUS_OPTIONS.reduce(
  (acc, cur) => {
    acc[cur.value] = cur;
    return acc;
  },
  {} as Record<string, (typeof EVENT_SHOW_STATUS_OPTIONS)[0]>,
);

/**
 * Event status enum options configuration
 *
 * Status value mapping (consistent with backend Python EventStatus enum):
 * - EventStatus.INITIAL (0): Initial state
 * - EventStatus.SUBSCRIBED (1): Subscription matching completed, waiting to construct notification card
 * - EventStatus.CARD_BUILT (2): Notification card constructed, waiting to send notification card
 * - EventStatus.DISTRIBUTED (3): Notification card sent
 * - EventStatus.NO_DISTRIBUTION (4): No subscription match, do not send notification card
 * - EventStatus.CHATOPS_NO_MATCH (11): Detection rule not matched, do not send notification card
 * - EventStatus.CHATOPS_RULE_FILTERED (12): Filter rule matched, do not send notification card
 * - EventStatus.CHATOPS_RULE_LIMITED (13): Alert suppressed, do not send notification card
 *
 * @see veaiops/schema/types.py - Python EventStatus enum definition
 * @see frontend/packages/api-client/src/models/event-status.ts - Generated TypeScript enum
 */
export const EVENT_STATUS_OPTIONS = [
  { label: '初始状态', value: EventStatus.INITIAL, extra: { color: 'gray' } },
  {
    label: '订阅匹配已完成，待构造通知卡片',
    value: EventStatus.SUBSCRIBED,
    extra: { color: 'blue' },
  },
  {
    label: '通知卡片已构造，待发送通知卡片',
    value: EventStatus.CARD_BUILT,
    extra: { color: 'cyan' },
  },
  {
    label: '通知卡片已发送',
    value: EventStatus.DISTRIBUTED,
    extra: { color: 'green' },
  },
  {
    label: '无订阅匹配，不发送通知卡片',
    value: EventStatus.NO_DISTRIBUTION,
    extra: { color: 'orange' },
  },
  {
    label: '未命中检测规则，不发送通知卡片',
    value: EventStatus.CHATOPS_NO_MATCH,
    extra: { color: 'red' },
  },
  {
    label: '命中过滤规则，不发送通知卡片',
    value: EventStatus.CHATOPS_RULE_FILTERED,
    extra: { color: 'purple' },
  },
  {
    label: '告警被抑制，不发送通知卡片',
    value: EventStatus.CHATOPS_RULE_LIMITED,
    extra: { color: 'magenta' },
  },
];

export const EVENT_STATUS_MAP = EVENT_STATUS_OPTIONS.reduce(
  (acc, cur) => {
    acc[cur.value] = cur;
    return acc;
  },
  {} as Record<number, (typeof EVENT_STATUS_OPTIONS)[0]>,
);
