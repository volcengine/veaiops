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

import type { BaseQuery, HandleFilterProps } from '@veaiops/components';
import { CustomTable } from '@veaiops/components';
import type { ModuleType } from '@veaiops/types';
import { queryArrayFormat } from '@veaiops/utils';
import type { Event as PushHistoryRecord } from 'api-generate';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { getPushHistoryFilters } from './filters';
import {
  usePushHistoryActionConfig,
  usePushHistoryTableConfig,
} from './hooks/use-push-history-management-logic';
import { useTableColumns } from './table-columns';

/**
 * Push history table component props interface
 */
interface PushHistoryTableProps {
  moduleType: ModuleType;
  title?: string;
  showModuleTypeColumn?: boolean;
  customActions?: (record: PushHistoryRecord) => React.ReactNode;
  loading?: boolean;
  onViewDetail?: (record: PushHistoryRecord) => void;
}

const queryFormat = {
  agent_type: queryArrayFormat,
  event_level: queryArrayFormat,
  show_status: queryArrayFormat, // Status array
};

/**
 * Push history table component
 * Encapsulates table rendering logic, provides clear interface
 */
export const PushHistoryTable: React.FC<PushHistoryTableProps> = ({
  moduleType,
  title = '历史事件',
  showModuleTypeColumn = true,
  customActions,
  loading = false,
  onViewDetail,
}) => {
  // Table configuration
  const { dataSource, tableProps } = usePushHistoryTableConfig({
    moduleType,
    showModuleTypeColumn,
  });

  // Action button configuration
  const { actionButtons } = usePushHistoryActionConfig({
    loading,
  });

  // Get table column configuration
  const columns = useTableColumns({
    showModuleTypeColumn,
    customActions,
    moduleType,
    onViewDetail,
  });

  // 🔧 Fix infinite loop: Use useMemo to cache handleColumns function
  const handleColumns = useMemo(() => {
    return () => columns;
  }, [columns]);

  // 🔧 Fix infinite loop: Use useCallback to cache handleFilters function
  const handleFilters = useCallback(
    (params: HandleFilterProps<BaseQuery>) => {
      return getPushHistoryFilters({
        ...params,
        handleFiltersProps: { moduleType, ...params.handleFiltersProps },
      });
    },
    [moduleType],
  );

  // 🔧 Fix infinite loop: Use useMemo to cache handleFiltersProps
  const handleFiltersProps = useMemo(() => ({ moduleType }), [moduleType]);

  return (
    <div data-testid="oncall-history-table">
      <CustomTable
        // Table title
        title={title}
        // Data source configuration
        dataSource={dataSource}
        // Column configuration handler function
        handleColumns={handleColumns}
        // Filter handler function
        handleFilters={handleFilters}
        handleFiltersProps={handleFiltersProps}
        // Use table props configuration returned by Hook
        tableProps={tableProps}
        // Action buttons
        actions={actionButtons}
        // Table style
        tableClassName="push-history-table"
        queryFormat={queryFormat}
      />
    </div>
  );
};
