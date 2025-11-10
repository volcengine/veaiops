import { logger } from '@veaiops/utils';
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
import type {
  IntelligentThresholdTask,
  MetricThresholdResult,
} from 'api-generate';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useTaskManagementLogic, useUrlParams } from '../hooks';
import { AlarmDrawer } from './alarm';
import { BatchRerunModal, TimeseriesChartModal } from './components/modals';
import { TaskDrawer, TaskTable, type TaskTableRef } from './task';

/**
 * Intelligent threshold task management page
 * Provides CRUD functionality for tasks - uses CustomTable with separated business logic
 *
 * Architecture features:
 * - Uses custom Hooks to encapsulate business logic
 * - Single responsibility components, easy to maintain
 * - Separated state management and UI rendering
 * - Supports configuration and extension
 * - Uses CustomTable to provide advanced table functionality
 */
const TaskManagement: React.FC = () => {
  // Table ref, used for calling refresh method
  const tableRef = useRef<TaskTableRef>(null);

  // URL parameter management
  const { getParam } = useUrlParams();

  // Timeseries modal state
  const [timeseriesModalVisible, setTimeseriesModalVisible] = useState(false);
  const [selectedMetric, setSelectedMetric] =
    useState<MetricThresholdResult | null>(null);
  const [selectedTaskForTimeseries, setSelectedTaskForTimeseries] =
    useState<IntelligentThresholdTask | null>(null);

  interface HandleViewTimeSeriesParams {
    record: MetricThresholdResult;
    task?: IntelligentThresholdTask;
  }

  // Handle view timeseries (internal use object parameters)
  const handleViewTimeSeriesInternal = ({
    record,
    task,
  }: HandleViewTimeSeriesParams) => {
    setSelectedMetric(record);
    setSelectedTaskForTimeseries(task || null);
    setTimeseriesModalVisible(true);
  };

  // Adapt to external interface position parameter format (Note: third-party library callbacks must use position parameters)
  const handleViewTimeSeries = (
    record: MetricThresholdResult,
    task?: IntelligentThresholdTask,
  ) => {
    handleViewTimeSeriesInternal({ record, task });
  };

  // 🎯 Create stable refresh function reference
  const refreshTable = useCallback(async () => {
    if (tableRef.current?.refresh) {
      return await tableRef.current.refresh();
    }
    return { success: false, error: new Error('表格刷新函数未准备就绪') };
  }, []);

  // 🎯 Use custom hook to get all business logic, pass stable refresh function for refreshing after add and edit operations
  const {
    // State
    drawerVisible,
    alarmDrawerVisible,
    batchRerunModalVisible,
    setBatchRerunModalVisible,
    editingTask,
    operationType,
    selectedTasks,
    loading,
    form,
    taskList,

    // Event handlers
    handleAdd,
    handleRerun,
    handleViewVersions,
    handleCreateAlarm,
    handleCopy,
    handleBatchRerun,
    handleDelete,
    handleCancel,
    handleSubmit,
    handleAlarmSubmit,
    handleTaskDetail,
    // Selection handling
    setSelectedTasks,
  } = useTaskManagementLogic(
    // ✅ Pass stable refresh function, used for refreshing table after add and edit operations succeed
    refreshTable,
  );

  // Placeholder handler - edit is handled through detail
  const handleEdit = (task: IntelligentThresholdTask) => {
    handleTaskDetail(task);
  };

  // Handle taskName in URL parameters, automatically open detail drawer for corresponding task
  useEffect(() => {
    const taskNameFromUrl = getParam('taskName');
    if (taskNameFromUrl && taskList.length > 0 && !drawerVisible) {
      // Find corresponding task by taskName
      const targetTask = taskList.find(
        (task) => task.task_name === taskNameFromUrl,
      );
      if (targetTask) {
        handleTaskDetail(targetTask);
      }
    }
  }, [getParam, taskList, drawerVisible, handleTaskDetail]);

  // Callback after batch rerun success
  const handleBatchRerunSuccess = async () => {
    setSelectedTasks([]);
    // 🎯 After batch operation success, manually call table refresh
    if (tableRef.current) {
      const refreshResult = await tableRef.current.refresh();
      if (!refreshResult.success && refreshResult.error) {
        logger.warn({
          message: '批量操作后刷新表格失败',
          data: {
            error: refreshResult.error.message,
            stack: refreshResult.error.stack,
            errorObj: refreshResult.error,
          },
          source: 'TaskManagement',
          component: 'handleBatchRerunSuccess',
        });
      }
    }
  };

  return (
    <>
      {/* Task table component - Use CustomTable */}
      <TaskTable
        ref={tableRef}
        onEdit={handleEdit}
        onRerun={handleRerun}
        onViewVersions={handleViewVersions}
        onCreateAlarm={handleCreateAlarm}
        onCopy={handleCopy}
        onAdd={handleAdd}
        onBatchRerun={handleBatchRerun}
        onDelete={handleDelete}
        selectedTasks={selectedTasks}
        onSelectedTasksChange={setSelectedTasks}
        handleTaskDetail={handleTaskDetail}
      />

      {/* Task drawer component */}
      <TaskDrawer
        visible={drawerVisible}
        operationType={operationType}
        editingTask={editingTask || null}
        onCancel={handleCancel}
        onSubmit={handleSubmit}
        form={form}
        loading={loading}
        onViewTimeSeries={handleViewTimeSeries}
      />

      {/* Alarm rule creation drawer */}
      <AlarmDrawer
        visible={alarmDrawerVisible}
        task={editingTask || null}
        onCancel={handleCancel}
        onSubmit={async (payload) => {
          // payload type is SyncAlarmRulesPayload, can pass directly
          return await handleAlarmSubmit(payload);
        }}
        loading={loading}
      />

      {/* Timeseries modal */}
      <TimeseriesChartModal
        visible={timeseriesModalVisible}
        onClose={() => {
          setTimeseriesModalVisible(false);
          setSelectedMetric(null);
          setSelectedTaskForTimeseries(null);
        }}
        metric={selectedMetric}
        task={selectedTaskForTimeseries}
      />

      {/* Batch rerun confirmation modal */}
      <BatchRerunModal
        visible={batchRerunModalVisible}
        taskIds={selectedTasks}
        onClose={() => setBatchRerunModalVisible(false)}
        onSuccess={handleBatchRerunSuccess}
      />
    </>
  );
};

export { TaskManagement };
export default TaskManagement;
