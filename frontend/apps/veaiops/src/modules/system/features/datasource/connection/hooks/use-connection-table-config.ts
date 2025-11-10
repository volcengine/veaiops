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
 * Data source connection table configuration Hook
 *
 * Integrates useBusinessTable and various configuration hooks
 */

import { type OperationWrappers, useBusinessTable } from '@veaiops/components';
import {
  createLocalDataSource,
  createStandardTableProps,
} from '@veaiops/utils';
import type { Connect } from 'api-generate';
import { useMemo } from 'react';
import { useConnectionTableActions } from '../ui/tables/components/connection-table-actions';
import { useConnectionTableColumns } from '../ui/tables/components/connection-table-columns';
import { useConnectionTableFilters } from '../ui/tables/components/connection-table-filters';

/**
 * Data source connection table configuration Hook
 * Provides complete table configuration (integrated with useBusinessTable)
 */
export const useConnectionTableConfig = ({
  type,
  connects,
  onEdit,
  onDelete,
  onTest,
  onCreateMonitor,
  onRefresh,
}: {
  type?: string;
  connects: Connect[];
  onEdit?: (connection: Connect) => void;
  onDelete?: (id: string) => void;
  onTest?: (connection: Connect) => void;
  onCreateMonitor?: (connection: Connect) => void;
  onRefresh?: () => void;
}) => {
  // 🎯 Use utility function to create local data source
  const dataSource = useMemo(
    () => createLocalDataSource({ dataList: connects, ready: true }),
    [connects],
  );

  // 🎯 Use utility function to create table properties
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 1200,
      }),
    [],
  );

  // 🎯 Use useBusinessTable to integrate all logic (local data mode)
  const { customTableProps } = useBusinessTable({
    dataSource,
    tableProps,
    refreshConfig: {
      enableRefreshFeedback: false, // Local data does not need refresh feedback
    },
    // 🎯 Custom operation wrapper logic, supports complex scenarios (here mainly viewing and operations, no deletion needed)
    operationWrapper: (_: OperationWrappers) => ({}),
  });

  // 🎯 Get various configurations
  const handleColumns = useConnectionTableColumns({
    type,
    onEdit,
    onDelete,
    onTest,
    onCreateMonitor,
  });

  const handleFilters = useConnectionTableFilters();

  const renderActions = useConnectionTableActions({
    onRefresh,
  });

  return {
    customTableProps,
    handleColumns,
    handleFilters,
    renderActions,
  };
};
