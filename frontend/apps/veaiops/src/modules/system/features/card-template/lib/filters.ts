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
 * Card template filter configuration
 */

import { channelTypeOptions } from '@/modules/event-center/features/strategy/constants/options';
import { AGENT_TYPE_OPTIONS } from '@/pages/event-center/card-template/types';
import type { FieldItem, HandleFilterProps } from '@veaiops/components';
import { AgentTemplateQuery } from '@/pages/system/card-template/types';

/**
 * Card template filter configuration
 */
export const getCardTemplateFilters = ({
  query,
  handleChange,
}: {
  query: AgentTemplateQuery;
  handleChange: HandleFilterProps<AgentTemplateQuery>['handleChange'];
}): FieldItem[] => {
  return [
    {
      field: 'templateId',
      label: '卡片模版ID',
      type: 'Input',
      componentProps: {
        value: query?.templateId,
        allowClear: true,
        onChange: (v: string) => handleChange({ key: 'templateId', value: v }),
      },
    },
    // Agent type filter
    {
      field: 'agents',
      label: '智能体',
      type: 'Select',
      componentProps: {
        value: query?.agents,
        allowClear: true,
        options: AGENT_TYPE_OPTIONS,
        mode: 'multiple',
        onChange: (v: string[]) => handleChange({ key: 'agents', value: v }),
      },
    },

    // Channel type filter (currently only supports Lark)
    {
      field: 'channels',
      label: '企业协同工具',
      type: 'Select',
      componentProps: {
        value: query?.channels as string | undefined,
        allowClear: true,
        options: channelTypeOptions,
        mode: 'multiple',
        onChange: (v: string) => handleChange({ key: 'channels', value: v }),
      },
    },
    // // Creation time range
    // {
    //   type: "RangePicker",
    //   componentProps: {
    //     prefix: "Creation Time",
    //     value: query?.createTimeRanges,
    //     showTime: true,
    //     onChange: (v: number[]) => {
    //       handleChange("createTimeRanges", v);
    //     },
    //   },
    // },
  ];
};
