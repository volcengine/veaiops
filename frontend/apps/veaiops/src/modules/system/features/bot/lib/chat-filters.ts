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

import type { FieldItem, HandleFilterProps } from '@veaiops/components';
import type { ChatQueryParams } from './chat-types';

interface FilterConfigProps {
  query: ChatQueryParams;
  handleChange: HandleFilterProps<ChatQueryParams>['handleChange'];
  handleFiltersProps?: Record<string, unknown>;
}

/**
 * Get chat management filter configuration
 *
 * Corresponds to origin/feat/web-v2 branch implementation, ensuring functional consistency
 *
 * Fix notes:
 * - Ensure default value "否" (No/false) displays correctly
 * - Since Select component's convertToSelectValue function doesn't support boolean type,
 *   need to convert boolean values to string or number type
 * - Use string 'true'/'false' as option values, convert back to boolean in onChange
 */
export const getChatFilters = ({
  query,
  handleChange,
}: FilterConfigProps): FieldItem[] => [
  // Name search (fuzzy search)
  {
    type: 'Input',
    componentProps: {
      addBefore: '名称',
      placeholder: '请输入群名称',
      value: query?.name,
      allowClear: true,
      onChange: (v: string) => {
        handleChange({ key: 'name', value: v || undefined });
      },
    },
  },
  // Status filter (joined group)
  {
    type: 'Select',
    componentProps: {
      addBefore: '已入群',
      placeholder: '请选择状态',
      // ✅ Fix: Convert boolean to string, because Select component's convertToSelectValue doesn't support boolean
      // undefined -> undefined (allows clearing, means all), true -> 'true', false -> 'false'
      // ✅ Initial state controlled by initQuery (is_active: true), becomes undefined after user clears
      value: (() => {
        if (query?.is_active === undefined) {
          // ✅ Allow clearing, display as empty
          return undefined;
        }
        if (query.is_active === true) {
          return 'true';
        }
        return 'false';
      })(),
      allowClear: true, // ✅ Allow clearing, after clearing means all (no parameter passed)
      options: [
        { label: '是', value: 'true' },
        { label: '否', value: 'false' },
      ],
      onChange: (v: string | boolean | undefined) => {
        // ✅ Fix: Convert string value back to boolean or undefined
        // Clear or undefined -> undefined (no parameter passed, means all), 'true' -> true, 'false' -> false
        if (v === undefined || v === null || v === '') {
          handleChange({ key: 'is_active', value: undefined });
        } else {
          let boolValue: boolean;
          if (v === 'true') {
            boolValue = true;
          } else if (v === 'false') {
            boolValue = false;
          } else {
            boolValue = Boolean(v);
          }
          handleChange({ key: 'is_active', value: boolValue });
        }
      },
    },
  },
  // Content recognition Agent status filter
  {
    type: 'Select',
    componentProps: {
      addBefore: '内容识别Agent',
      placeholder: '请选择状态',
      // ✅ No need for "all" option, default is all (no parameter passed)
      // undefined -> undefined (no parameter passed, means all), true -> 'true', false -> 'false'
      value: (() => {
        if (query?.enable_func_interest === undefined) {
          // Default no parameter passed, means all
          return undefined;
        }
        if (query.enable_func_interest === true) {
          return 'true';
        }
        return 'false';
      })(),
      allowClear: true, // ✅ Allow clearing, after clearing means all (no parameter passed)
      options: [
        { label: '开启', value: 'true' },
        { label: '关闭', value: 'false' },
      ],
      onChange: (v: string | boolean | undefined) => {
        // ✅ Clear or undefined -> undefined (no parameter passed, means all)
        if (v === undefined || v === null || v === '') {
          handleChange({ key: 'enable_func_interest', value: undefined });
        } else {
          let boolValue: boolean;
          if (v === 'true') {
            boolValue = true;
          } else if (v === 'false') {
            boolValue = false;
          } else {
            boolValue = Boolean(v);
          }
          handleChange({ key: 'enable_func_interest', value: boolValue });
        }
      },
    },
  },
  // Proactive reply Agent status filter
  {
    type: 'Select',
    componentProps: {
      addBefore: '主动回复Agent',
      placeholder: '请选择状态',
      // ✅ No need for "all" option, default is all (no parameter passed)
      // undefined -> undefined (no parameter passed, means all), true -> 'true', false -> 'false'
      value: (() => {
        if (query?.enable_func_proactive_reply === undefined) {
          // Default no parameter passed, means all
          return undefined;
        }
        if (query.enable_func_proactive_reply === true) {
          return 'true';
        }
        return 'false';
      })(),
      allowClear: true, // ✅ Allow clearing, after clearing means all (no parameter passed)
      options: [
        { label: '开启', value: 'true' },
        { label: '关闭', value: 'false' },
      ],
      onChange: (v: string | boolean | undefined) => {
        // ✅ Clear or undefined -> undefined (no parameter passed, means all)
        if (v === undefined || v === null || v === '') {
          handleChange({ key: 'enable_func_proactive_reply', value: undefined });
        } else {
          let boolValue: boolean;
          if (v === 'true') {
            boolValue = true;
          } else if (v === 'false') {
            boolValue = false;
          } else {
            boolValue = Boolean(v);
          }
          handleChange({ key: 'enable_func_proactive_reply', value: boolValue });
        }
      },
    },
  },
  // Force refresh selection
  {
    type: 'Select',
    componentProps: {
      addBefore: '强制刷新',
      placeholder: '是否强制刷新',
      // ✅ Fix: Convert boolean to string, because Select component's convertToSelectValue doesn't support boolean
      // false -> 'false', true -> 'true'
      value:
        query?.force_refresh === undefined
          ? 'false'
          : String(query.force_refresh),
      defaultValue: 'false', // Default "否"
      allowClear: false,
      options: [
        { label: '是', value: 'true' },
        { label: '否', value: 'false' },
      ],
      onChange: (v: string | boolean) => {
        // ✅ Fix: Convert string value back to boolean
        // 'true' -> true, 'false' -> false, true -> true, false -> false
        let boolValue: boolean;
        if (v === 'true') {
          boolValue = true;
        } else if (v === 'false') {
          boolValue = false;
        } else {
          boolValue = Boolean(v);
        }
        handleChange({ key: 'force_refresh', value: boolValue });
      },
    },
  },
];
