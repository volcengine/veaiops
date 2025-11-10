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

import {
  ACTION_CATEGORY_LABELS,
  INSPECT_CATEGORY_LABELS,
} from '@oncall/shared';
import { Interest } from 'api-generate';

/**
 * Format action category display text
 */
export const formatActionCategoryText = (
  category: Interest['action_category'],
): string => {
  if (category === Interest.action_category.DETECT) {
    return ACTION_CATEGORY_LABELS[Interest.action_category.DETECT] || '检测';
  }
  if (category === Interest.action_category.FILTER) {
    return ACTION_CATEGORY_LABELS[Interest.action_category.FILTER] || '过滤';
  }
  return String(category);
};

/**
 * Format inspect category display text
 */
export const formatInspectCategoryText = (
  category: Interest['inspect_category'],
): string => {
  if (category === Interest.inspect_category.SEMANTIC) {
    return (
      INSPECT_CATEGORY_LABELS[Interest.inspect_category.SEMANTIC] || '语义分析'
    );
  }
  if (category === Interest.inspect_category.RE) {
    return (
      INSPECT_CATEGORY_LABELS[Interest.inspect_category.RE] || '正则表达式'
    );
  }
  return String(category);
};
