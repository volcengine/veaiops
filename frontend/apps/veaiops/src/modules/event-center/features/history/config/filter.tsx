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

import { AGENT_OPTIONS_EVENT_CENTER_HISTORY } from '@/pages/event-center/card-template/types';
import {
  EVENT_LEVEL_OPTIONS,
  EVENT_SHOW_STATUS_OPTIONS,
  EVENT_STATUS_OPTIONS,
} from '@ec/subscription';
import type { FieldItem, HandleFilterProps } from '@veaiops/components';
import { disabledDate } from '@veaiops/utils';
import type { EventLevel, EventShowStatus, EventStatus } from 'api-generate';
import dayjs from 'dayjs';

/**
 * History event filter configuration
 * Configure according to Python interface parameter requirements
 */
export const getHistoryFilters = ({
  query,
  handleChange,
}: {
  query: Record<string, unknown>;
  handleChange: HandleFilterProps<unknown>['handleChange'];
  handleFiltersProps?: Record<string, unknown>;
}): FieldItem[] => [
  // Agent type filter - Align with backend agent_type parameter, support multiple selection
  {
    field: 'agent_type',
    label: '智能体',
    type: 'Select',
    componentProps: {
      placeholder: '请选择智能体',
      value: query?.agent_type as string[] | undefined,
      mode: 'multiple',
      maxTagCount: 2,
      options: AGENT_OPTIONS_EVENT_CENTER_HISTORY,
      onChange: (v: string[]) => {
        handleChange({ key: 'agent_type', value: v });
      },
    },
  },
  // Event level filter - Use correct EventLevel enum values
  {
    field: 'event_level',
    label: '事件级别',
    type: 'Select',
    componentProps: {
      placeholder: '请选择事件级别',
      value: query?.event_level as EventLevel | undefined,
      allowClear: true,
      maxTagCount: 1,
      mode: 'multiple',
      options: EVENT_LEVEL_OPTIONS,
      onChange: (v: EventLevel) => {
        handleChange({ key: 'event_level', value: v });
      },
    },
  },
  // Status filter - Use show_status (Chinese status)
  {
    field: 'show_status',
    label: '状态',
    type: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      value: query?.show_status as EventShowStatus[] | undefined,
      mode: 'multiple',
      maxTagCount: 1,
      allowClear: true,
      options: EVENT_SHOW_STATUS_OPTIONS,
      onChange: (v: EventShowStatus[]) => {
        handleChange({ key: 'show_status', value: v });
      },
    },
  },
  // Status filter - Use status (status enum values)
  {
    field: 'status',
    label: '状态',
    type: 'Select',
    componentProps: {
      placeholder: '请选择状态',
      value: query?.status as EventStatus[] | undefined,
      mode: 'multiple',
      maxTagCount: 1,
      allowClear: true,
      options: EVENT_STATUS_OPTIONS,
      onChange: (v: EventStatus[]) => {
        handleChange({ key: 'status', value: v });
      },
    },
  },
  // Time range filter - Corresponds to backend start_time and end_time parameters
  {
    field: 'dateRange',
    label: '时间范围',
    type: 'RangePicker',
    componentProps: {
      placeholder: ['开始时间', '结束时间'],
      value:
        query?.start_time && query?.end_time
          ? [dayjs(query.start_time as string), dayjs(query.end_time as string)]
          : undefined,
      showTime: true,
      format: 'YYYY-MM-DD HH:mm:ss',
      allowClear: true,
      disabledDate,
      onChange: (dateStrings: string[] | null) => {
        if (dateStrings && dateStrings.length === 2) {
          const [startTimeStr, endTimeStr] = dateStrings;
          handleChange({ key: 'start_time', value: startTimeStr });
          handleChange({ key: 'end_time', value: endTimeStr });
        } else {
          handleChange({ key: 'start_time', value: undefined });
          handleChange({ key: 'end_time', value: undefined });
        }
      },
    },
  },
];
