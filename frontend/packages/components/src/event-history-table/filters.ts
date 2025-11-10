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

import { AgentType, EventShowStatus } from '@veaiops/api-client';
import type {
  BaseQuery,
  HandleFilterProps,
} from '../custom-table/types/core/common';
import type { FieldItem } from '../filters/core/types';
import type { EventHistoryFilters, HistoryModuleType } from './types';
import {
  HistoryModuleType as ModuleTypeEnum,
  getAllowedAgentTypes,
} from './types';

/**
 * Get agent type options
 */
const getAgentTypeOptions = (moduleType: HistoryModuleType) => {
  const agentTypeMap: Record<AgentType, string> = {
    [AgentType.INTELLIGENT_THRESHOLD_AGENT]: 'Intelligent Threshold Agent',
    [AgentType.CHATOPS_INTEREST_AGENT]: 'Content Recognition Agent',
    [AgentType.CHATOPS_PROACTIVE_REPLY_AGENT]: 'Proactive Reply Agent',
    [AgentType.CHATOPS_REACTIVE_REPLY_AGENT]: 'Reactive Reply Agent',
  };

  const allowedTypes = getAllowedAgentTypes(moduleType);

  return allowedTypes.map((type) => ({
    label: agentTypeMap[type] || type,
    value: type,
  }));
};

/**
 * Get default agent type
 */
const getDefaultAgentType = (moduleType: HistoryModuleType): AgentType[] => {
  switch (moduleType) {
    case ModuleTypeEnum.INTELLIGENT_THRESHOLD:
      // Intelligent threshold: Default to intelligent threshold Agent
      return [AgentType.INTELLIGENT_THRESHOLD_AGENT];
    case ModuleTypeEnum.CHATOPS:
      // ChatOps: Default to all selected (all 3 Agents selected)
      return [
        AgentType.CHATOPS_INTEREST_AGENT,
        AgentType.CHATOPS_PROACTIVE_REPLY_AGENT,
        AgentType.CHATOPS_REACTIVE_REPLY_AGENT,
      ];
    case ModuleTypeEnum.EVENT_CENTER:
      // Event center: Default to all Agents selected
      return Object.values(AgentType);
    default:
      return [];
  }
};

/**
 * Get event level options
 */
const getEventLevelOptions = () => [
  { label: 'P0', value: 'P0' },
  { label: 'P1', value: 'P1' },
  { label: 'P2', value: 'P2' },
];

/**
 * Get show status options
 * Uses backend EventShowStatus enum (Chinese)
 */
const getShowStatusOptions = () => [
  {
    label: 'Waiting to Send',
    value: EventShowStatus.PENDING,
    extra: { color: 'blue' },
  },
  {
    label: 'Send Success',
    value: EventShowStatus.SUCCESS,
    extra: { color: 'green' },
  },
  {
    label: 'Not Subscribed',
    value: EventShowStatus.NOT_SUBSCRIBED,
    extra: { color: 'orange' },
  },
  {
    label: 'Rule Not Matched',
    value: EventShowStatus.NOT_MATCHED,
    extra: { color: 'red' },
  },
  {
    label: 'Filter Rule Matched',
    value: EventShowStatus.FILTERED,
    extra: { color: 'purple' },
  },
  {
    label: 'Alert Suppressed',
    value: EventShowStatus.RESTRAINED,
    extra: { color: 'magenta' },
  },
];

/**
 * Get event history filter configuration
 */
export const getEventHistoryFilters = ({
  moduleType,
  query,
  handleChange,
}: HandleFilterProps<EventHistoryFilters> & {
  moduleType: HistoryModuleType;
}): FieldItem[] => {
  const defaultAgentType = getDefaultAgentType(moduleType);

  return [
    {
      field: 'agent_type',
      label: 'Agent',
      type: 'Select',
      componentProps: {
        mode: 'multiple',
        placeholder: 'Please select agent',
        maxTagCount: 1,
        value: query.agent_type || defaultAgentType,
        defaultActiveFirstOption: true,
        allowClear: false,
        options: getAgentTypeOptions(moduleType),
        onChange: (value: AgentType[]) => {
          handleChange({ key: 'agent_type', value });
        },
      },
    },
    {
      field: 'event_level',
      label: 'Event Level',
      type: 'Select',
      componentProps: {
        mode: 'multiple',
        placeholder: 'Please select event level',
        maxTagCount: 3,
        value: query.event_level,
        allowClear: true,
        options: getEventLevelOptions(),
        onChange: (value: string[]) => {
          handleChange({
            key: 'event_level',
            value: value && value.length > 0 ? value : undefined,
          });
        },
      },
    },
    {
      field: 'show_status',
      label: 'Status',
      type: 'Select',
      componentProps: {
        mode: 'multiple',
        placeholder: 'Please select status',
        maxTagCount: 1,
        value: query.show_status,
        allowClear: true,
        options: getShowStatusOptions(),
        onChange: (value: string[]) => {
          handleChange({
            key: 'show_status',
            value: value && value.length > 0 ? value : undefined,
          });
        },
      },
    },
    {
      field: 'time_range',
      label: 'Time Range',
      type: 'RangePicker',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        value:
          query.start_time && query.end_time
            ? [query.start_time, query.end_time]
            : undefined,
        onChange: (value: [string, string] | undefined) => {
          if (value) {
            handleChange({
              updates: {
                start_time: value[0],
                end_time: value[1],
              },
            });
          } else {
            handleChange({
              updates: {
                start_time: undefined,
                end_time: undefined,
              },
            });
          }
        },
      },
    },
  ];
};
