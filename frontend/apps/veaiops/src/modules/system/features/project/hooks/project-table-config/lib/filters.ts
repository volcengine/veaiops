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

import type { BaseQuery, FieldItem, HandleFilterProps } from '@veaiops/components';

/**
 * Get project table filter configuration
 *
 * Note: Backend only supports name parameter filtering (veaiops/handler/routers/apis/v1/system_config/project.py)
 * Does not support project_id and is_active parameters, so only keep name filter
 */
export const getProjectTableFilters = (
  props: HandleFilterProps<BaseQuery>,
): FieldItem[] => {
  const { query, handleChange } = props;
  return [
    {
      field: 'name',
      label: '项目名称',
      type: 'Input',
      componentProps: {
        placeholder: '请输入项目名称',
        allowClear: true,
        value: query.name as string | undefined,
        onChange: (v: string) => {
          handleChange({ key: 'name', value: v });
        },
      },
    },
  ];
};
