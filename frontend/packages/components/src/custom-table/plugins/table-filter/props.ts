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

/* Copyright 2025 Beijing Volcano Engine Technology Co., Ltd. and/or its affiliates
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * You may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * TableFilterPlugin Compatible Extended Props
 * - Encapsulates extended properties passed through from old plugins in different pages as a unified interface
 * - All fields are optional to avoid type errors when not provided
 * - Only responsible for type and safe reading, does not introduce business logic
 */
import type { PluginContext } from '@/custom-table/types/plugins';

export interface FiltersPluginProps {
  handleFilters?: (args: {
    query: unknown;
    handleChange: (key: unknown, value: unknown) => void;
    handleFiltersProps?: unknown;
  }) => unknown[];
  handleFiltersProps?: unknown;
  isFilterShow?: boolean;
  isFilterAffixed?: boolean;
  isFilterCollection?: boolean;
  filterStyleCfg?:
    | { isWithBackgroundAndBorder?: boolean; style?: React.CSSProperties }
    | unknown;
  showReset?: boolean;
  operations?: unknown[];
  customActions?: unknown[] | unknown;
  customActionsStyle?: React.CSSProperties | unknown;
  tableFilterProps?: Record<string, unknown>;
  tableFilterWrapperClassName?: string;
  finalQuery?: Record<string, unknown>;
}

/**
 * Safely read and normalize plugin extended Props
 * - Perform typeof/Array checks for each field
 * - Return Partial<FiltersPluginProps>
 */
export const readFiltersPluginProps = (
  context: PluginContext,
): Partial<FiltersPluginProps> => {
  // First narrow to unknown, then assert as indexable object, avoid direct conversion from specific type
  const raw = context.props as unknown as Record<string, unknown>;

  // Use destructuring to read, satisfy eslint preference for destructuring
  const {
    handleFilters: rawHandleFilters,
    handleFiltersProps,
    isFilterShow,
    isFilterAffixed,
    isFilterCollection,
    filterStyleCfg,
    showReset,
    operations,
    customActions,
    customActionsStyle,
    tableFilterProps,
    tableFilterWrapperClassName,
    finalQuery,
  } = raw;

  const safeHandleFilters =
    typeof rawHandleFilters === 'function' ? rawHandleFilters : undefined;

  const safeIsFilterShow =
    typeof isFilterShow === 'boolean' ? isFilterShow : undefined;

  const safeIsFilterAffixed =
    typeof isFilterAffixed === 'boolean' ? isFilterAffixed : undefined;

  const safeIsFilterCollection =
    typeof isFilterCollection === 'boolean' ? isFilterCollection : undefined;

  const safeShowReset = typeof showReset === 'boolean' ? showReset : undefined;

  const safeOperations = Array.isArray(operations)
    ? (operations as unknown[])
    : undefined;

  const safeCustomActions =
    Array.isArray(customActions) || customActions !== undefined
      ? (customActions as unknown[] | unknown)
      : undefined;

  const safeTableFilterProps =
    tableFilterProps && typeof tableFilterProps === 'object'
      ? (tableFilterProps as Record<string, unknown>)
      : undefined;

  const safeWrapperClassName =
    typeof tableFilterWrapperClassName === 'string'
      ? tableFilterWrapperClassName
      : undefined;

  const safeFinalQuery =
    finalQuery && typeof finalQuery === 'object'
      ? (finalQuery as Record<string, unknown>)
      : undefined;

  return {
    handleFilters: safeHandleFilters as FiltersPluginProps['handleFilters'],
    handleFiltersProps,
    isFilterShow: safeIsFilterShow,
    isFilterAffixed: safeIsFilterAffixed,
    isFilterCollection: safeIsFilterCollection,
    filterStyleCfg,
    showReset: safeShowReset,
    operations: safeOperations,
    customActions: safeCustomActions,
    customActionsStyle: customActionsStyle as React.CSSProperties | undefined,
    tableFilterProps: safeTableFilterProps,
    tableFilterWrapperClassName: safeWrapperClassName,
    finalQuery: safeFinalQuery,
  };
};
