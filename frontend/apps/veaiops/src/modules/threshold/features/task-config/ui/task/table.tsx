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

import { TASK_CONFIG_MANAGEMENT_CONFIG } from '@task-config/lib';
import { deleteTask } from '@task-config/lib/data-source/api';
import { CustomTable } from '@veaiops/components';
import { logger } from '@veaiops/utils';
import type { IntelligentThresholdTask } from 'api-generate';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import { useAutoRefreshOperations, useTaskTableConfig } from '../../hooks';
import { TASK_TABLE_QUERY_FORMAT } from './config';

/**
 * Task table component props interface
 */
interface TaskTableProps {
  onEdit: (task: IntelligentThresholdTask) => void;
  onRerun: (task: IntelligentThresholdTask) => void;
  onViewVersions: (task: IntelligentThresholdTask) => void;
  onCreateAlarm: (task: IntelligentThresholdTask) => void;
  onCopy: (task: IntelligentThresholdTask) => void;
  onAdd: () => void;
  onBatchRerun: () => void;
  onDelete?: (taskId: string) => Promise<boolean>; // Optional, because we have auto-refresh operations
  selectedTasks: string[];
  onSelectedTasksChange: (selectedTasks: string[]) => void;
  handleTaskDetail: (task: IntelligentThresholdTask) => void;
}

/**
 * Task table component ref interface
 * Provides refresh functionality and auto-refresh CRUD operations
 */
export interface TaskTableRef {
  refresh: () => Promise<{ success: boolean; error?: Error }>;
  operations: {
    delete: (id: string) => Promise<boolean>;
    update: () => Promise<{ success: boolean; error?: Error }>;
    create?: (data: any) => Promise<{ success: boolean; error?: Error }>;
  };
}

/**
 * Intelligent threshold task table component
 * Encapsulates table rendering logic, provides clear interface
 */
export const TaskTable = forwardRef<TaskTableRef, TaskTableProps>(
  (
    {
      onEdit,
      onRerun,
      onViewVersions,
      onCreateAlarm,
      onCopy,
      onAdd,
      onBatchRerun,
      onDelete,
      selectedTasks,
      onSelectedTasksChange,
      handleTaskDetail,
    },
    ref,
  ) => {
    // 🎯 Create internal ref, pass to CustomTable
    const customTableRef = useRef<any>(null);

    // 🎯 Use cohesive table configuration Hook - tableActions already cohesive, no need to pass from outside
    const {
      customTableProps,
      handleColumns,
      handleFilters,
      renderActions,
      refresh,
      operations,
    } = useTaskTableConfig({
      onEdit: async (task) => {
        onEdit(task);
        return true;
      },
      onRerun,
      onViewVersions,
      onCreateAlarm,
      onCopy,
      onAdd: onAdd
        ? async () => {
            onAdd();
            return true;
          }
        : undefined,
      onBatchRerun,
      onDelete,
      handleTaskDetail,
      selectedTasks,
      // ✅ Pass internal ref so useBusinessTable can call CustomTable's refresh
      tableRef: customTableRef,
    });

    // 🎯 Create auto-refresh CRUD operations (deprecated, use operations)
    // ⚠️ Note: Delete operation already auto-refreshes through wrappedHandlers.delete, no need to use autoRefreshOperations
    const autoRefreshOperations = useAutoRefreshOperations({
      refreshFn: operations.refresh || (async () => {}),
      // Delete API (deprecated, handled by wrappedHandlers.delete)
      deleteApi: async (id: string) => {
        return await deleteTask(id);
      },
      // Update API (batch operations)
      updateApi: async () => {
        // ✅ Correct: Use logger to record information
        logger.info({
          message: 'Executing batch update operation',
          data: {},
          source: 'TaskTable',
          component: 'batchUpdate',
        });
        // Batch rerun and other operations can be implemented here
      },
    });

    // Expose refresh function and auto-refresh operations to parent component
    useImperativeHandle(
      ref,
      () => ({
        // ✅ Use CustomTable's refresh method
        refresh: async () => {
          logger.info({
            message: '[TaskTable] 🔄 External refresh call',
            data: {
              hasCustomTableRef: Boolean(customTableRef.current),
              hasCustomTableRefresh: Boolean(customTableRef.current?.refresh),
            },
            source: 'TaskTable',
            component: 'useImperativeHandle.refresh',
          });
          if (customTableRef.current?.refresh) {
            await customTableRef.current.refresh();
            return { success: true };
          }
          return { success: false, error: new Error('CustomTable ref not ready') };
        },
        operations: autoRefreshOperations,
      }),
      [autoRefreshOperations],
    );

    return (
      <CustomTable<IntelligentThresholdTask>
        ref={customTableRef}
        title={TASK_CONFIG_MANAGEMENT_CONFIG.title}
        {...customTableProps}
        actions={renderActions()}
        handleColumns={handleColumns}
        handleFilters={handleFilters}
        tableProps={{
          ...(customTableProps.tableProps &&
          typeof customTableProps.tableProps === 'object' &&
          !Array.isArray(customTableProps.tableProps)
            ? (customTableProps.tableProps as Record<string, unknown>)
            : {}),
          rowSelection: {
            selectedRowKeys: selectedTasks,
            type: 'checkbox',
            onChange: (selectedRowKeys) => {
              onSelectedTasksChange(selectedRowKeys as string[]);
            },
          },
        }}
        queryFormat={TASK_TABLE_QUERY_FORMAT}
        syncQueryOnSearchParams
        useActiveKeyHook
      />
    );
  },
);

TaskTable.displayName = 'TaskTable';

export default TaskTable;
