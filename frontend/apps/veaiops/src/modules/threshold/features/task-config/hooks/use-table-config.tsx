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
import { IconPlus, IconRefresh } from '@arco-design/web-react/icon';
import {
  type ModernTableColumnProps,
  useBusinessTable,
} from '@veaiops/components';
import {
  createServerPaginationDataSource,
  createStandardTableProps,
  logger,
} from '@veaiops/utils';
import type {
  IntelligentThresholdTask,
  ListIntelligentThresholdTaskRequest,
  PaginatedAPIResponseIntelligentThresholdTask,
} from 'api-generate';
import { useMemo } from 'react';
import { getTaskColumns, getTaskFilters } from '../lib';
import { taskDataSource } from '../lib/data-source';
import type { TaskQueryParams } from '../lib/data-source/types';
import type { TaskTableActions } from '../lib/types';

/**
 * Return type for the task table configuration Hook
 *
 * Uses standard types to avoid custom types
 */
export interface UseTaskTableConfigReturn {
  // Table configuration
  customTableProps: ReturnType<typeof useBusinessTable>['customTableProps'];
  customOperations: ReturnType<typeof useBusinessTable>['customOperations'];
  operations: ReturnType<typeof useBusinessTable>['operations'];
  handleColumns: (
    props?: Record<string, unknown>,
  ) => ModernTableColumnProps<IntelligentThresholdTask>[];
  handleFilters: typeof getTaskFilters;
  renderActions: (props?: Record<string, unknown>) => JSX.Element[];
  // Refresh function (replaces tableRef)
  refresh: () => Promise<{ success: boolean; error?: Error }>;
}

/**
 * Task table configuration Hook
 *
 * 🎯 Fully implemented according to UI Extension Guidelines:
 * - Hook cohesion pattern: Cohesive all table-related logic, including tableActions
 * - Auto-refresh mechanism: Refresh directly through operations, supports no-ref mode
 * - Props fully cohesive: Returns all table props uniformly, reducing component code lines
 * - Standardized types: Uses standard types from @veaiops/components and api-generate
 * - Standardized architecture: Unified configuration structure and return interface
 *
 * 🏗️ Cohesive content:
 * - Data request logic and data source configuration
 * - Table configuration (pagination, styles, etc.)
 * - Column configuration and filter configuration
 * - Operation configuration and business operation wrapping
 * - tableActions cohesion (no need to pass from outside)
 * - Refresh function (provided through operations)
 * - Unified return of all UI props
 *
 * @param params - Parameter object
 * @param params.onEdit - Edit task callback
 * @param params.onRerun - Rerun task callback
 * @param params.onViewVersions - View versions callback
 * @param params.onCreateAlarm - Create alarm callback
 * @param params.onCopy - Copy task callback
 * @param params.onAdd - Add task callback
 * @param params.onBatchRerun - Batch rerun callback
 * @param params.onDelete - Delete task callback
 * @param params.handleTaskDetail - Task detail handler callback
 * @param params.selectedTasks - List of selected task IDs
 * @param params.tableRef - Table ref (optional, for supporting ref refresh mode)
 * @returns Table configuration and handlers
 */
export interface UseTaskTableConfigParams {
  onEdit: (task: IntelligentThresholdTask) => Promise<boolean>;
  onRerun: (task: IntelligentThresholdTask) => void;
  onViewVersions: (task: IntelligentThresholdTask) => void;
  onCreateAlarm: (task: IntelligentThresholdTask) => void;
  onCopy: (task: IntelligentThresholdTask) => void;
  onAdd?: () => Promise<boolean>;
  onBatchRerun?: () => void;
  onDelete?: (taskId: string) => Promise<boolean>;
  handleTaskDetail?: (task: IntelligentThresholdTask) => void;
  selectedTasks?: string[];
  tableRef?: React.RefObject<any>;
}

export const useTaskTableConfig = ({
  onEdit,
  onRerun,
  onViewVersions,
  onCreateAlarm,
  onCopy,
  onAdd,
  onBatchRerun,
  onDelete,
  handleTaskDetail,
  selectedTasks,
  tableRef,
}: UseTaskTableConfigParams): UseTaskTableConfigReturn => {
  // 🎯 Data request logic
  const request = useMemo(
    () =>
      async (
        params: Record<string, unknown>,
      ): Promise<{
        data: IntelligentThresholdTask[];
        total: number;
        success: boolean;
      }> => {
        try {
          // ✅ Correct: Convert parameters passed by CustomTable to TaskQueryParams format
          // CustomTable passes parameters containing page_req: { skip, limit }
          // taskDataSource.request expects TaskQueryParams, where page_req is required
          const taskParams: TaskQueryParams = {
            datasource_type: params.datasource_type as
              | ListIntelligentThresholdTaskRequest['datasource_type']
              | undefined,
            page_req: (params.page_req as { skip: number; limit: number }) || {
              skip: 0,
              limit: 20,
            },
            projects: params.projects as string[] | undefined,
            auto_update: params.auto_update as boolean | undefined,
            task_name: params.task_name as string | undefined,
            created_at_start: params.created_at_start as string | undefined,
            created_at_end: params.created_at_end as string | undefined,
            updated_at_start: params.updated_at_start as string | undefined,
            updated_at_end: params.updated_at_end as string | undefined,
          };

          const result: PaginatedAPIResponseIntelligentThresholdTask =
            await taskDataSource.request(taskParams);
          return {
            data: result.data || [],
            total: result.total || 0,
            success: true,
          };
        } catch (error) {
          // ✅ Correct: Use logger to record errors and expose actual error information
          const errorObj =
            error instanceof Error ? error : new Error(String(error));
          logger.error({
            message: 'Failed to fetch task list',
            data: {
              error: errorObj.message,
              stack: errorObj.stack,
              errorObj,
            },
            source: 'useTaskTableConfig',
            component: 'request',
          });
          return { data: [], total: 0, success: false };
        }
      },
    [],
  );

  // 🎯 Data source configuration - Use utility functions
  const dataSource = useMemo(
    () => createServerPaginationDataSource({ request }),
    [request],
  );

  // 🎯 Table configuration - Use utility functions
  const tableProps = useMemo(
    () =>
      createStandardTableProps({
        rowKey: '_id',
        pageSize: 20,
        scrollX: 1200,
      }),
    [],
  );

  // 🎯 Business operation wrapping - Add handlers to support auto-refresh
  const { customTableProps, customOperations, wrappedHandlers, operations } =
    useBusinessTable({
      dataSource,
      tableProps,
      // ✅ Add handlers configuration to wrap delete operation, enabling auto-refresh after success
      handlers: {
        // Delete operation - Returns boolean indicating success
        delete: onDelete
          ? async (id: string) => {
              const success = await onDelete(id);
              return success;
            }
          : undefined,
        // ⚠️ Note: Do not wrap onAdd and onEdit
        // - onAdd only opens drawer, actual creation is done in handleSubmit, cannot auto-refresh
        // - onEdit also opens drawer, actual editing is done in handleSubmit, cannot auto-refresh
        // - Refresh logic for create and edit needs to manually call operations.refresh() after handleSubmit succeeds
      },
      refreshConfig: {
        enableRefreshFeedback: true,
        successMessage: '操作成功',
        errorMessage: '操作失败，请重试',
      },
      // ✅ Pass tableRef so useBusinessTable can call ref.current.refresh()
      ref: tableRef,
    });

  // 🎯 Cohesive table action configuration - Use wrappedHandlers.delete to replace original onDelete
  const tableActions: TaskTableActions = useMemo(
    () => ({
      onRerun,
      onViewVersions,
      onCreateAlarm,
      onCopy,
      onAdd,
      onBatchRerun,
      // ✅ Use wrappedHandlers.delete (auto-refresh), or use original onDelete if not available
      onDelete: wrappedHandlers?.delete || onDelete,
      onTaskDetail:
        handleTaskDetail ||
        (() => {
          // Default empty handler for task detail
        }),
    }),
    [
      onRerun,
      onViewVersions,
      onCreateAlarm,
      onCopy,
      onAdd,
      onBatchRerun,
      onDelete,
      wrappedHandlers,
      handleTaskDetail,
    ],
  );

  // 🎯 Column configuration - Use standard types
  const handleColumns = useMemo(
    () =>
      (
        _props?: Record<string, unknown>,
      ): ModernTableColumnProps<IntelligentThresholdTask>[] =>
        getTaskColumns(tableActions),
    [tableActions],
  );

  // 🎯 Filter configuration - Use standard types
  const handleFilters = useMemo(() => getTaskFilters, []);

  // 🎯 Action configuration - Includes add and batch operation buttons
  const renderActions = useMemo(
    () =>
      (_props?: Record<string, unknown>): JSX.Element[] => {
        const actionButtons: JSX.Element[] = [];

        // Add create task button
        if (onAdd) {
          actionButtons.push(
            <Button
              key="add"
              type="primary"
              icon={<IconPlus />}
              onClick={onAdd}
            >
              Create Task
            </Button>,
          );
        }

        // Add batch rerun button (always shown, disabled when nothing is selected)
        if (onBatchRerun) {
          actionButtons.push(
            <Button
              key="batch-rerun"
              type="default"
              icon={<IconRefresh />}
              onClick={onBatchRerun}
              disabled={!selectedTasks || selectedTasks.length === 0}
            >
              Batch Rerun{' '}
              {selectedTasks &&
                selectedTasks.length > 0 &&
                `(${selectedTasks.length})`}
            </Button>,
          );
        }

        return actionButtons;
      },
    [onAdd, onBatchRerun, selectedTasks],
  );

  return {
    customTableProps,
    customOperations,
    operations,
    handleColumns,
    handleFilters,
    renderActions,
    // ✅ Use operations.refresh as refresh function
    refresh: operations.refresh || (async () => ({ success: true })),
  };
};
