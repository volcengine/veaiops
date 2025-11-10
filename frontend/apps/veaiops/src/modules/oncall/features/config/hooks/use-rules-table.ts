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

import {
  createStatusToggleHandler,
  getRulesTableColumns,
} from '@oncall-config/lib';
import type {
  BaseQuery,
  FieldItem,
  HandleFilterProps,
  ModernTableColumnProps,
} from '@veaiops/components';
import type { Bot, Interest } from 'api-generate';
import { useCallback, useMemo } from 'react';

/**
 * Toggle status parameters interface
 */
interface HandleToggleStatusParams {
  ruleUuid: string;
  isActive: boolean;
}

export interface UseRulesTableProps {
  bots: Bot[];
  onToggleStatus: (params: HandleToggleStatusParams) => Promise<boolean>;
  onViewDetails: (rule: Interest) => void;
  onEdit: (rule: Interest) => void;
}

/**
 * Cohesive Hook - rule table configuration
 * Responsible for table-related configuration: column configuration, filter configuration, table property configuration
 */
export const useRulesTable = ({
  bots,
  onToggleStatus,
  onViewDetails,
  onEdit,
}: UseRulesTableProps) => {
  // 🎯 Status toggle handler
  const handleStatusToggle = useMemo(
    () => createStatusToggleHandler({ onToggleStatus }),
    [onToggleStatus],
  );

  // 🎯 Column configuration
  const handleColumns = useCallback((): ModernTableColumnProps<Interest>[] => {
    return getRulesTableColumns({
      onToggleStatus: handleStatusToggle,
      onViewDetails,
      onEdit,
    });
  }, [handleStatusToggle, onViewDetails, onEdit]);

  // 🎯 Filter configuration - bot selector
  const handleFilters = useCallback(
    ({ query, handleChange }: HandleFilterProps<BaseQuery>): FieldItem[] => [
      {
        field: 'botId',
        label: '选择机器人',
        type: 'Select',
        componentProps: {
          placeholder: '请选择机器人',
          value: query.botId as string | undefined,
          defaultActiveFirstOption: true,
          allowClear: false,
          options: bots.map((bot) => ({
            label: bot.name || '',
            value: bot.bot_id || '',
          })),
          onChange: (value: string) => {
            handleChange({ key: 'botId', value });
          },
        },
      },
    ],
    [bots],
  );

  // 🎯 Table property configuration
  const tableProps = useMemo(
    () => ({
      scroll: { x: 1700 },
      rowKey: 'uuid',
      pagination: {
        pageSize: 10,
        showTotal: (total: number) => `共 ${total} 条规则`,
        showJumper: true,
      },
    }),
    [],
  );

  return {
    handleColumns,
    handleFilters,
    tableProps,
  };
};
