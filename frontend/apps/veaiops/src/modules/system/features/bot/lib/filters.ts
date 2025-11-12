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
 * Bot管理筛选配置
 */
import { channelTypeOptions } from '@/modules/event-center/features/strategy/constants/options';
import type { FieldItem, HandleFilterProps } from '@veaiops/components';
import { ChannelType } from '@veaiops/api-client';

/**
 * 筛选配置接口
 *
 * ✅ 兼容性更新：添加索引签名以兼容 BaseQuery 类型
 */
export interface BotFilters {
  status?: string;
  channel?: string;
  keyword?: string;
  [key: string]: unknown;
}

/**
 * Default filter configuration
 * Default to Lark as enterprise collaboration tool
 *
 * Note: Use ChannelType enum instead of hardcoded strings
 * - ChannelType.LARK = 'Lark' (capital L)
 * - Ensure consistency with backend enum values
 */
export const DEFAULT_BOT_FILTERS: BotFilters = {
  status: '',
  channel: ChannelType.LARK, // ✅ Use enum for type safety and consistency
  keyword: '',
};

/**
 * Query format configuration for Bot table
 * Handles URL → Query conversion (normalize channel parameter)
 */
export const BOT_QUERY_FORMAT = {
  channel: ({ value }: { value: unknown }) => {
    // Normalize: map URL parameter value to correct ChannelType enum value
    const strValue = String(value);
    const lowerValue = strValue.toLowerCase();
    if (lowerValue === 'lark') {
      return ChannelType.LARK; // 'Lark'
    }
    return strValue;
  },
};

/**
 * Query search params format configuration for Bot table
 * Handles Query → URL conversion (preserve channel parameter)
 */
export const BOT_QUERY_SEARCH_PARAMS_FORMAT = {
  channel: (value: unknown) => String(value), // Keep enum value as-is ('Lark')
};

/**
 * Bot筛选配置 - CustomTable标准格式
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
    //   label: '智能体',
    //   type: 'Select',
    //   componentProps: {
    //     placeholder: '请选择智能体',
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
