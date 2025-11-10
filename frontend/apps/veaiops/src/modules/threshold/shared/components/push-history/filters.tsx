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
  EVENT_LEVEL_OPTIONS,
  EVENT_SHOW_STATUS_OPTIONS,
} from '@/modules/event-center/features/subscription/constants/options';
import {
  AGENT_OPTIONS_ONCALL_HISTORY,
  AGENT_OPTIONS_THRESHOLD_FILTER,
} from '@/pages/event-center/card-template/types';
import { Message } from '@arco-design/web-react';
import type { FieldItem, HandleFilterProps } from '@veaiops/components';
import { ModuleType } from '@veaiops/types';
import type { EventShowStatus } from 'api-generate';

/**
 * Get historical event filter configuration
 *
 * 🔧 Fix notes (aligned with origin/feat/web-v2):
 * - Field names use snake_case (agent_type, event_level, show_status), consistent with backend API parameters
 * - Add show_status filter, supports filtering event status
 * - Ensure onChange passes undefined when array is empty, correctly removes field
 */
export const getPushHistoryFilters = ({
  query,
  handleChange,
  handleFiltersProps = {},
}: {
  query: Record<string, unknown>;
  handleChange: HandleFilterProps<unknown>['handleChange'];
  handleFiltersProps?: Record<string, unknown>;
}): FieldItem[] => {
  const { moduleType } = handleFiltersProps as { moduleType?: ModuleType };

  // Determine Agent options and whether required based on module type
  const agentOptions =
    moduleType === ModuleType.ONCALL
      ? AGENT_OPTIONS_ONCALL_HISTORY
      : AGENT_OPTIONS_THRESHOLD_FILTER;

  // Intelligent threshold module: Required, default select intelligent threshold Agent
  // Oncall module: Supports multiple selection, must select at least one, default select all (all 3 selected)
  const defaultAgentValue =
    moduleType === ModuleType.ONCALL
      ? AGENT_OPTIONS_ONCALL_HISTORY.map((opt) => opt.value)
      : [AGENT_OPTIONS_THRESHOLD_FILTER[0].value];

  return [
    {
      field: 'agent_type',
      label: '智能体', // ✅ Concise syntax: label automatically converted to addBefore
      type: 'Select',
      componentProps: {
        placeholder: '请选择智能体',
        mode: 'multiple',
        maxTagCount: 1,
        value: (query?.agent_type as string[] | undefined) || defaultAgentValue,
        defaultActiveFirstOption: true,
        allowClear: false,
        options: agentOptions,
        onChange: (v: string | string[]) => {
          if (Array.isArray(v) && v.length === 0) {
            Message.warning('智能体不能为空');
            return;
          }
          // 🔧 Fix: Use agent_type (snake_case) instead of agentType (camelCase)
          // Ensure consistent with field name defined in queryFormat, consistent with backend API parameters
          handleChange({ key: 'agent_type', value: v });
        },
      },
    },
    {
      field: 'event_level',
      label: '事件级别', // ✅ Concise syntax: label automatically converted to addBefore
      type: 'Select',
      componentProps: {
        placeholder: '请选择事件级别',
        mode: 'multiple',
        value: query?.event_level as string[] | undefined,
        allowClear: true,
        options: EVENT_LEVEL_OPTIONS,
        maxTagCount: 3,
        onChange: (v: string[]) => {
          // 🔧 Fix: Use event_level (snake_case) instead of eventLevel (camelCase)
          // Ensure consistent with field name defined in queryFormat, consistent with backend API parameters
          // Ensure pass undefined when array is empty, not empty array, so handleChange correctly removes the field
          handleChange({
            key: 'event_level',
            value: v && v.length > 0 ? v : undefined,
          });
        },
      },
    },
    {
      field: 'show_status',
      label: '状态', // ✅ Concise syntax: label automatically converted to addBefore
      type: 'Select',
      componentProps: {
        placeholder: '请选择状态',
        mode: 'multiple',
        value: query?.show_status as EventShowStatus[] | undefined,
        allowClear: true,
        options: EVENT_SHOW_STATUS_OPTIONS,
        maxTagCount: 1,
        onChange: (v: EventShowStatus[]) => {
          // 🔧 Fix: Ensure pass undefined when array is empty, not empty array
          // So handleChange correctly removes the field
          handleChange({
            key: 'show_status',
            value: v && v.length > 0 ? v : undefined,
          });
        },
      },
    },
  ];
};
