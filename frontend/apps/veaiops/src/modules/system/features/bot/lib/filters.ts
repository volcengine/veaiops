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
 * Bot management filter configuration
 */
import { channelTypeOptions } from '@/modules/event-center/features/strategy/constants/options';
import type { FieldItem, HandleFilterProps } from '@veaiops/components';

/**
 * Filter configuration interface
 */
export interface BotFilters {
  status?: string;
  channel?: string;
  keyword?: string;
}

/**
 * Default filter configuration
 * Default to Lark as enterprise collaboration tool
 */
export const DEFAULT_BOT_FILTERS: BotFilters = {
  status: '',
  channel: 'Lark', // Default to Lark
  keyword: '',
};

/**
 * Bot filter configuration - CustomTable standard format
 */
export const getBotFilters = ({
  query,
  handleChange,
}: {
  query: Record<string, unknown>;
  handleChange: HandleFilterProps<unknown>['handleChange'];
  handleFiltersProps?: Record<string, unknown>;
}): FieldItem[] => {
  return [
    // {
    //   field: 'agent_type',
    //   label: 'Agent',
    //   type: 'Select',
    //   componentProps: {
    //     placeholder: 'Please select agent',
    //     value: query?.agent_type as string[] | undefined,
    //     options: AGENT_TYPE_OPTIONS,
    //     onChange: (v: string[]) => {
    //       handleChange('agent_type', v);
    //     },
    //   },
    // },
    {
      field: 'channel',
      label: '企业协同工具',
      type: 'Select',
      componentProps: {
        placeholder: '请选择企业协同工具',
        value: query?.channel as string | undefined,
        options: channelTypeOptions,
        onChange: (v: string) => {
          handleChange({ key: 'channel', value: v });
        },
      },
    },
    {
      field: 'name',
      label: '机器人名称',
      type: 'Input',
      componentProps: {
        placeholder: '请输入机器人名称（支持模糊搜索）',
        value: query?.name as string | undefined,
        onChange: (v: string) => {
          handleChange({ key: 'name', value: v });
        },
      },
    },
  ];
};
