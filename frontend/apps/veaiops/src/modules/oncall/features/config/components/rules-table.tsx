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

import { useRulesData, useRulesTable } from '@oncall-config/hooks';
import { CustomTable, type CustomTableActionType } from '@veaiops/components';
import type { Bot, Interest } from 'api-generate';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';

/**
 * Toggle status parameter interface
 */
interface HandleToggleStatusParams {
  ruleUuid: string;
  isActive: boolean;
}

export interface RulesTableProps {
  bots: Bot[];
  onToggleStatus: (params: HandleToggleStatusParams) => Promise<boolean>;
  onViewDetails: (rule: Interest) => void;
  onEdit: (rule: Interest) => void;
}

export interface RulesTableRef {
  refresh: () => Promise<{ success: boolean; error?: Error }>;
}

/**
 * Oncall rules table component
 * Uses CustomTable standardized implementation
 * Supports refresh functionality, all operations automatically refresh table data
 */
export const RulesTable = forwardRef<RulesTableRef, RulesTableProps>(
  ({ bots, onToggleStatus, onViewDetails, onEdit }, ref) => {
    // CustomTable internal ref
    const tableRef = useRef<CustomTableActionType<Interest>>(null);

    // Use cohesive Hook to separate business logic and UI configuration
    const { customTableProps, operations } = useRulesData({
      bots,
      ref: tableRef,
    });

    // Expose refresh method that conforms to RulesTableRef interface
    useImperativeHandle(
      ref,
      () => ({
        refresh: async () => {
          if (operations?.refresh) {
            return await operations.refresh();
          }
          // If operations unavailable, try using tableRef
          if (tableRef.current?.refresh) {
            await tableRef.current.refresh();
            return { success: true };
          }
          return {
            success: false,
            error: new Error('刷新方法不可用'),
          };
        },
      }),
      [operations],
    );
    const { handleColumns, handleFilters } = useRulesTable({
      bots,
      onToggleStatus,
      onViewDetails,
      onEdit,
    });

    // Default select first bot as initial query parameter (consistent with original branch functionality)
    const initQuery = useMemo(() => {
      if (bots.length > 0 && bots[0]?.bot_id) {
        return { botId: bots[0].bot_id };
      }
      return {};
    }, [bots]);

    return (
      <div data-testid="oncall-config-table">
        <CustomTable<Interest>
          {...customTableProps}
          ref={tableRef}
          title="内容识别规则详情"
          handleColumns={handleColumns}
          handleFilters={handleFilters}
          isAlertShow={true}
          showRefresh={true}
          syncQueryOnSearchParams
          useActiveKeyHook
          initQuery={initQuery}
        />
      </div>
    );
  },
);

RulesTable.displayName = 'RulesTable';
