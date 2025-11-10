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

import { getTaskColumns } from '@task-config/lib';
import type { FieldItem, ModernTableColumnProps } from '@veaiops/components';
import type { IntelligentThresholdTask } from 'api-generate';
import { useCallback } from 'react';
import type {
  ActionProps,
  FilterProps,
  TableColumnProps,
  TaskTableActions,
} from '../types';

interface UseTableHandlersParams {
  tableActions: TaskTableActions;
}

/**
 * Table handler configuration Hook
 */
export const useTableHandlers = ({ tableActions }: UseTableHandlersParams) => {
  // 🎯 Column configuration
  const handleColumns = useCallback(
    (
      _props: TableColumnProps,
    ): ModernTableColumnProps<IntelligentThresholdTask>[] =>
      getTaskColumns(tableActions),
    [tableActions],
  );

  // 🎯 Filter configuration
  const handleFilters = useCallback(
    (_filters: FilterProps): FieldItem[] => [
      {
        field: 'auto_update',
        label: '自动更新',
        type: 'Select',
        componentProps: {
          options: [
            { label: '全部', value: undefined },
            { label: '启用', value: true },
            { label: '禁用', value: false },
          ],
          placeholder: '请选择状态',
        },
      },
    ],
    [],
  );

  // 🎯 Action configuration
  const renderActions = useCallback(
    (_props: ActionProps) =>
      [
        // Create functionality not supported for now, can be added later based on requirements
      ].filter(Boolean),
    [],
  );

  return {
    handleColumns,
    handleFilters,
    renderActions,
  };
};
