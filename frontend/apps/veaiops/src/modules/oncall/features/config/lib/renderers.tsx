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

import { Message } from "@arco-design/web-react";
import { CellRender, CustomOutlineTag } from "@veaiops/components";
import { EMPTY_CONTENT } from "@veaiops/constants";
import { formatDateTime } from "@veaiops/utils";
import { Interest } from "api-generate";

/**
 * Action category configuration mapping
 *
 * Three-way cross-validation:
 * - Python backend: veaiops/schema/types.py InterestActionType (Filter, Detect)
 * - OpenAPI spec: frontend/packages/openapi-specs/src/specs/modules/oncall.json (Detect, Filter)
 * - TypeScript: api-generate/models/interest.ts Interest.action_category (DETECT, FILTER)
 */
const ACTION_CATEGORY_CONFIG = {
  [Interest.action_category.FILTER]: { text: '过滤', color: 'green' },
  [Interest.action_category.DETECT]: { text: '检测', color: 'blue' },
} as const;

/**
 * Format action category
 */
export const formatActionCategory = (category: Interest.action_category) => {
  if (!category) {
    return EMPTY_CONTENT;
  }

  const config = ACTION_CATEGORY_CONFIG[category];
  if (!config) {
    return EMPTY_CONTENT;
  }

  return <CustomOutlineTag>{config.text}</CustomOutlineTag>;
};

/**
 * Inspect category configuration mapping
 *
 * Three-way cross-validation:
 * - Python backend: veaiops/schema/types.py InterestInspectType (Semantic, RE)
 * - OpenAPI spec: frontend/packages/openapi-specs/src/specs/modules/oncall.json (Semantic, RE)
 * - TypeScript: api-generate/models/interest.ts Interest.inspect_category (SEMANTIC, RE)
 */
const INSPECT_CATEGORY_CONFIG = {
  [Interest.inspect_category.SEMANTIC]: { text: '语义分析', color: 'green' },
  [Interest.inspect_category.RE]: { text: '正则表达式', color: 'orange' },
} as const;

/**
 * Format inspect category
 */
export const formatInspectCategory = (category: Interest.inspect_category) => {
  if (!category) {
    return EMPTY_CONTENT;
  }

  const config = INSPECT_CATEGORY_CONFIG[category];
  if (!config) {
    return EMPTY_CONTENT;
  }

  return <CustomOutlineTag>{config.text}</CustomOutlineTag>;
};

/**
 * Format alert silence interval
 * Supports two formats:
 * 1. Number (seconds) - for table display
 * 2. Time string (e.g., "6h", "30m", "1d", "1d12h") - for form input and preview
 */
export const formatSilenceDelta = (delta: number | string | undefined): string => {
  // Edge case 1: Handle empty values
  if (!delta || (typeof delta === 'number' && delta === 0)) {
    return '-';
  }

  // If string format (time string), parse and format
  if (typeof delta === 'string') {
    return formatSilenceDeltaString(delta);
  }

  // If number (seconds), convert to readable format
  const seconds = delta;
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts: string[] = [];
  if (hours) {
    parts.push(`${hours}小时`);
  }
  if (minutes) {
    parts.push(`${minutes}分钟`);
  }
  if (secs) {
    parts.push(`${secs}秒`);
  }

  return parts.length > 0 ? parts.join('') : '-';
};

/**
 * Format silence interval in time string format (for form preview)
 * Supports formats: 6h, 30m, 1d, 1w, 1d12h, PT6H (ISO 8601)
 */
export const formatSilenceDeltaString = (duration: string): string => {
  const trimmedDuration = duration.trim();

  // First try to parse ISO 8601 duration format (PT6H, PT30M, P1D, PT1H30M, etc.)
  const iso8601Match = trimmedDuration.match(
    /^P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/,
  );

  if (iso8601Match) {
    const [, days, hours, minutes, seconds] = iso8601Match;
    const parts: string[] = [];

    if (days) {
      parts.push(`${days}天`);
    }
    if (hours) {
      parts.push(`${hours}小时`);
    }
    if (minutes) {
      parts.push(`${minutes}分钟`);
    }
    if (seconds) {
      parts.push(`${seconds}秒`);
    }

    return parts.length > 0 ? parts.join('') : '-';
  }

  // Try to parse simplified format (6h, 30m, 1d, 1w, 60s, 1d12h)
  const simpleMatch = trimmedDuration.match(/^(\d+)([dhms])(\d+)([dhms])?$/i);

  if (simpleMatch && simpleMatch[4]) {
    // Compound format: 1d12h
    const [, num1, unit1, num2, unit2] = simpleMatch;
    const parts: string[] = [];

    const unitMap: Record<string, string> = {
      d: '天',
      h: '小时',
      m: '分钟',
      s: '秒',
      w: '周',
    };

    parts.push(`${num1}${unitMap[unit1.toLowerCase()] || unit1}`);
    parts.push(`${num2}${unitMap[unit2?.toLowerCase()] || unit2}`);

    return parts.join('');
  }

  // Single unit format: 6h, 30m, 1d, 1w
  const singleMatch = trimmedDuration.match(/^(\d+)([dhmsw])$/i);

  if (singleMatch) {
    const [, number, unit] = singleMatch;
    const num = parseInt(number, 10);

    if (num === 0) {
      return '0秒';
    }

    const unitMap: Record<string, string> = {
      d: '天',
      h: '小时',
      m: '分钟',
      s: '秒',
      w: '周',
    };

    return `${num}${unitMap[unit.toLowerCase()] || unit}`;
  }

  // If unable to parse, return original value
  return trimmedDuration;
};

/**
 * Format rule information
 */
export interface FormatRuleInfoParams {
  name: string;
  record: Interest;
}

export const formatRuleInfo = ({ name, record }: FormatRuleInfoParams) => {
  return <CellRender.InfoWithCode name={name} code={record.uuid} />;
};

/**
 * Format description
 */
export const formatDescription = (description: string) => {
  return <CellRender.Ellipsis text={description || "-"} />;
};

/**
 * Format regex pattern
 */
export const formatRegex = (regex: string) => {
  return <CellRender.Ellipsis text={regex || "-"} />;
};

/**
 * Format inspect history
 */
export const formatInspectHistory = (count: number) => {
  return count ? `${count} 条` : "-";
};

/**
 * Format created time
 */
export const formatCreatedAt = (date: string) => {
  return formatDateTime(date);
};

/**
 * Format updated time
 */
export const formatUpdatedAt = (date: string) => {
  return formatDateTime(date);
};

/**
 * Toggle status parameters interface
 */
interface HandleToggleStatusParams {
  ruleUuid: string;
  isActive: boolean;
}

/**
 * Create status toggle handler
 * Adapter function: converts object parameters to positional parameters for StatusColumn component
 */
interface CreateStatusToggleHandlerParams {
  onToggleStatus: (params: HandleToggleStatusParams) => Promise<boolean>;
}

export const createStatusToggleHandler = ({
  onToggleStatus,
}: CreateStatusToggleHandlerParams): (ruleUuid: string, checked: boolean) => Promise<boolean> => {
  return async (ruleUuid: string, checked: boolean) => {
    try {
      // Adapter: convert positional parameters to object parameters
      const result = await onToggleStatus({ ruleUuid, isActive: checked });
      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '操作失败，请重试';
      Message.error({ content: errorMessage, duration: 20000 });
      return false;
    }
  };
};
