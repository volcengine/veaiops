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

import { Button } from '@arco-design/web-react';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
  queryArrayFormat,
} from '@veaiops/utils';
import type React from 'react';
import { useCallback, useMemo } from 'react';
import { CustomTable } from '../custom-table';
import type { HandleFilterProps } from '../custom-table/types/core/common';
import { getEventHistoryColumns } from './columns';
import { getEventHistoryFilters } from './filters';
import type { EventHistoryFilters, EventHistoryTableProps } from './types';

/**
 * Unified event history table component
 *
 * Used for event history display in three modules:
 * - Intelligent threshold event history
 * - ChatOps event history
 * - Event center event history
 *
 * Features:
 * - Unified column configuration: Event ID, Agent, Status, Event Level, Project, Created At, Updated At
 * - Automatically filter agent options based on module type
 * - Supports custom action column
 * - Inject API request function through props to avoid direct dependency on application layer code in component library layer
 */
export const EventHistoryTable: React.FC<EventHistoryTableProps> = ({
  moduleType,
  title = 'Event History',
  showExport = false,
  onViewDetail,
  customActions,
  request,
}) => {
  // Use passed request function
  if (!request) {
    throw new Error('EventHistoryTable: request prop is required');
  }

  // Data source configuration
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // Table properties configuration
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 10,
        scrollX: 1400,
      }),
    [],
  );

  // Column configuration
  const handleColumns = useMemo(() => {
    return () => getEventHistoryColumns({ onViewDetail, customActions });
  }, [onViewDetail, customActions]);

  // Filter configuration
  const handleFilters = useCallback(
    (props: HandleFilterProps<EventHistoryFilters>) => {
      return getEventHistoryFilters({
        ...props,
        moduleType,
      });
    },
    [moduleType],
  );

  // Action buttons
  const actions = useMemo(() => {
    const buttons: React.ReactNode[] = [];

    if (showExport) {
      buttons.push(
        <Button key="export" type="primary">
          Export
        </Button>,
      );
    }

    return buttons;
  }, [showExport]);

  // Query format configuration
  const queryFormat = useMemo(
    () => ({
      agent_type: queryArrayFormat,
      event_level: queryArrayFormat,
      show_status: queryArrayFormat,
    }),
    [],
  );

  return (
    <CustomTable
      title={title}
      dataSource={dataSource}
      handleColumns={handleColumns}
      handleFilters={handleFilters}
      tableProps={tableProps}
      actions={actions}
      queryFormat={queryFormat}
    />
  );
};

export default EventHistoryTable;
