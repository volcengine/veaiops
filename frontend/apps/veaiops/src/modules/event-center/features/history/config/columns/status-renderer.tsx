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

import { Badge } from '@arco-design/web-react';
import { EVENT_SHOW_STATUS_MAP, EVENT_STATUS_MAP } from '@ec/subscription';
import { EMPTY_CONTENT_TEXT } from '@veaiops/constants';
import type { EventShowStatus } from 'api-generate';
import { EventStatus } from 'api-generate';

/**
 * Status display mapping configuration - Convert EVENT_STATUS_MAP to format required by Badge component
 */
const getStatusDisplayConfig = (statusCode: number) => {
  const statusOption = EVENT_STATUS_MAP[statusCode];
  if (!statusOption) {
    return { status: 'default' as const, text: `Unknown Status(${statusCode})` };
  }

  // Determine Badge status type based on status code
  let badgeStatus: 'success' | 'error' | 'processing' | 'default';
  switch (statusCode) {
    case EventStatus.INITIAL: // Initial state
      badgeStatus = 'default';
      break;
    case EventStatus.SUBSCRIBED: // Subscription matching completed, waiting to construct notification card
    case EventStatus.CARD_BUILT: // Notification card constructed, waiting to send notification card
      badgeStatus = 'processing';
      break;
    case EventStatus.DISTRIBUTED: // Notification card sent
      badgeStatus = 'success';
      break;
    case EventStatus.NO_DISTRIBUTION: // No subscription match, do not send notification card
    case EventStatus.CHATOPS_NO_MATCH: // Detection rule not matched, do not send notification card
    case EventStatus.CHATOPS_RULE_FILTERED: // Filter rule matched, do not send notification card
    case EventStatus.CHATOPS_RULE_LIMITED: // Alert suppressed, do not send notification card
      badgeStatus = 'error';
      break;
    default:
      badgeStatus = 'default';
  }

  return {
    status: badgeStatus,
    text: statusOption.label,
  };
};

/**
 * Render event status enum value - Display using Badge
 * Fix: Use unified status mapping, consistent with filter options
 *
 * Edge case handling:
 * - null/undefined: Display empty content
 * - string: Convert to number
 * - NaN: Display unknown status
 * - negative/decimal: Round and display
 * - unknown enum value: Display "Unknown Status(value)"
 */
export const renderEventStatus = (value?: number | string | null) => {
  // Edge case 1: Handle null/undefined
  if (value === undefined || value === null) {
    return EMPTY_CONTENT_TEXT;
  }

  // Edge case 2: Ensure value is number type
  let statusCode: number;
  if (typeof value === 'string') {
    statusCode = parseInt(value, 10);
    // Edge case 3: Handle NaN
    if (Number.isNaN(statusCode)) {
      return <Badge status="default" text={`Invalid Status(${value})`} />;
    }
  } else if (typeof value === 'number') {
    // Edge case 4: Handle decimals, round down
    statusCode = Math.floor(value);
  } else {
    // Edge case 5: Handle other types
    return <Badge status="default" text={`Invalid Status(${String(value)})`} />;
  }

  // Use unified status mapping configuration
  const config = getStatusDisplayConfig(statusCode);

  return <Badge status={config.status} text={config.text} />;
};

/**
 * Render event status - Display Chinese status
 * Uses show_status field (EventShowStatus enum)
 *
 * Edge case handling:
 * - null/undefined/empty string: Display empty content
 * - unknown enum value: Display original value (fault-tolerant handling)
 * - non-string type: Convert to string then process
 */
export const renderEventShowStatus = (value?: EventShowStatus | null) => {
  // Edge case 1: Handle null/undefined
  if (!value) {
    return EMPTY_CONTENT_TEXT;
  }

  // Edge case 2: Ensure value is string type and trim whitespace
  const statusValue = String(value).trim();
  if (!statusValue) {
    return EMPTY_CONTENT_TEXT;
  }

  // Get configuration from mapping
  const config = EVENT_SHOW_STATUS_MAP[statusValue as EventShowStatus];

  // Edge case 3: Handle unknown status (backend added but frontend not synced)
  if (!config) {
    return <Badge status="default" text={statusValue} />;
  }

  // Determine Badge style based on status
  let badgeStatus: 'success' | 'error' | 'processing' | 'warning' | 'default';
  switch (statusValue as EventShowStatus) {
    case '等待发送':
      badgeStatus = 'processing';
      break;
    case '发送成功':
      badgeStatus = 'success';
      break;
    case '未订阅':
    case '未命中规则':
      badgeStatus = 'warning';
      break;
    case '命中过滤规则':
    case '告警抑制':
      badgeStatus = 'error';
      break;
    default:
      badgeStatus = 'default';
  }

  return <Badge status={badgeStatus} text={config.label} />;
};
