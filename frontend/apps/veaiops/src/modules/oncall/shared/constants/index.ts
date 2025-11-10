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
 * Oncall module constant definitions
 */

/**
 * Alert level options
 */
export const ALERT_LEVEL_OPTIONS = [
  { label: 'P0', value: 'P0', color: 'red' },
  { label: 'P1', value: 'P1', color: 'orange' },
  { label: 'P2', value: 'P2', color: 'arcoblue' },
] as const;

/**
 * Action category options
 */
export const ACTION_CATEGORY_OPTIONS = [
  {
    label: '检测',
    value: 'Detect',
    color: 'blue',
    description: '检测并触发告警',
  },
  {
    label: '过滤',
    value: 'Filter',
    color: 'green',
    description: '过滤并忽略消息',
  },
] as const;

/**
 * Inspect category options
 */
export const INSPECT_CATEGORY_OPTIONS = [
  {
    label: '语义分析',
    value: 'Semantic',
    color: 'purple',
    description: '使用语义分析进行检测',
  },
  {
    label: '正则表达式',
    value: 'RE',
    color: 'orange',
    description: '使用正则表达式进行检测',
  },
] as const;

/**
 * Schedule type options
 */
export const SCHEDULE_TYPE_OPTIONS = [
  { label: '每日', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '每月', value: 'monthly' },
  { label: '自定义', value: 'custom' },
] as const;

/**
 * Action category label mapping
 */
export const ACTION_CATEGORY_LABELS = ACTION_CATEGORY_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Inspect category label mapping
 */
export const INSPECT_CATEGORY_LABELS = INSPECT_CATEGORY_OPTIONS.reduce(
  (acc, option) => {
    acc[option.value] = option.label;
    return acc;
  },
  {} as Record<string, string>,
);

/**
 * Action category options (camelCase naming)
 */
export const actionCategoryOptions = ACTION_CATEGORY_OPTIONS;

/**
 * Inspect category options (camelCase naming)
 */
export const inspectCategoryOptions = INSPECT_CATEGORY_OPTIONS;
