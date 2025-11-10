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
import type { AttributeKey } from 'api-generate';

/**
 * Bot attribute filter query parameters interface
 */
export interface BotAttributeFiltersQuery {
  /**
   * Category filter (multiple selection)
   * Corresponds to backend names parameter
   */
  names?: AttributeKey[];
  /**
   * Content filter (fuzzy search)
   * Corresponds to backend value parameter
   */
  value?: string;
  /**
   * Index signature, satisfies BaseQuery constraint
   */
  [key: string]: unknown;
}

/**
 * Bot attribute table filter configuration
 * Configured according to backend interface parameter requirements
 *
 * ⚠️ Fix notes (resolving infinite loop issue):
 * - Removed logic that directly calls handleChange to avoid triggering state updates in handleFilters function
 * - handleFilters will be called on every render (in useMemo), should not have side effects
 * - Default values should be set through CustomTable's initQuery property, not in handleFilters
 * - Reference: frontend/packages/components/src/custom-table/types/components/props.ts (initQuery)
 */
export const getBotAttributeFilters = ({
  query,
  handleChange,
}: {
  query: BotAttributeFiltersQuery;
  handleChange: HandleFilterProps<BotAttributeFiltersQuery>['handleChange'];
}): FieldItem[] => {
  // Use the passed query.names, if it doesn't exist use default value (but don't call handleChange in the function)
  // Default values should be set at component level through initQuery
  const currentNames = query?.names || ['project'];

  return [
    {
      field: 'names',
      label: '类目',
      type: 'Select',
      componentProps: {
        placeholder: '请选择类目',
        value: currentNames,
        mode: 'multiple',
        maxTagCount: 2,
        allowClear: false, // Cannot be cleared
        disabled: true, // Disabled selection because there is only one option and it is required
        options: [{ label: '项目', value: 'project' }],
        onChange: (v: AttributeKey[]) => {
          handleChange({ key: 'names', value: v });
        },
      },
    },
    {
      field: 'value',
      label: '内容',
      type: 'Input',
      componentProps: {
        placeholder: '请输入内容',
        value: query?.value,
        allowClear: true,
        onChange: (v: string) => {
          handleChange({ key: 'value', value: v });
        },
      },
    },
  ];
};
