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

import { useTaskConfigStore } from '@/stores/task-config-store';
import { Form } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import type { IntelligentThresholdTask } from 'api-generate';
import { useCallback, useState } from 'react';
import type { TaskTableActions } from '../lib/types';
import { TaskOperateType } from '../lib/types';
import { useTaskFormHandlers } from './use-form-handlers';
import { useTaskOperations } from './use-operations';

/**
 * Task management business logic Hook - uses Zustand for unified state management
 * 🎯 Receives table refresh function, manually refreshes after create and update operations succeed
 *
 * @param refreshTable - Table refresh function (optional)
 */
export const useTaskManagementLogic = (
  refreshTable?: () => Promise<{ success: boolean; error?: Error }>,
) => {
  // Use Zustand store
  const {
    // State
    loading,
    taskDrawer,
    alarmDrawer,
    selectedTasks,
    taskList,

    // Drawer operations
    openTaskDrawer,
    closeTaskDrawer,
    closeAlarmDrawer,
    setSelectedTasks,

    // Business operations
    // loadTasks, // Removed unused variable
  } = useTaskConfigStore();

  // 🎯 CustomTable supports automatic refresh, no need to manually manage refresh logic
  // Provide placeholder functions to maintain interface compatibility
  const afterCreate = async () => {
    // Can add post-creation logic here, such as refreshing data or showing notifications
    logger.info({
      message: '任务创建成功',
      data: {},
      source: 'useTaskManagement',
      component: 'afterCreate',
    });
  };
  const afterUpdate = async () => {
    // Can add post-update logic here, such as refreshing data or showing notifications
    logger.info({
      message: '任务更新成功',
      data: {},
      source: 'useTaskManagement',
      component: 'afterUpdate',
    });
  };

  // Form instance
  const [form] = Form.useForm();

  // Batch rerun modal state
  const [batchRerunModalVisible, setBatchRerunModalVisible] = useState(false);

  // Use task operations Hook - adapted for Zustand store
  const taskOperations = useTaskOperations({
    setOperationType: (_type) => {
      // This function is now handled by openTaskDrawer
    },
    setDrawerVisible: (visible) => {
      if (!visible) {
        closeTaskDrawer();
      }
    },
    setAlarmDrawerVisible: (visible) => {
      if (!visible) {
        closeAlarmDrawer();
      }
    },
    setBatchRerunModalVisible,
    setSelectedTasks,
    setLoading: () => {
      // Loading state is now managed by Zustand store
    },
    form,
    selectedTasks,
    taskList,
  });

  // Use form handling Hook - adapted for Zustand store
  const formHandlers = useTaskFormHandlers({
    operationType: taskDrawer.type || 'create',
    editingTask: taskDrawer.record || null,
    form,
    setLoading: () => {
      // Loading state is now managed by Zustand store
    },
    setDrawerVisible: closeTaskDrawer,
    setAlarmDrawerVisible: closeAlarmDrawer,
    // ✅ Pass table refresh function, manually refresh table after create and update succeed
    refreshTable,
  });

  // Handle cancel operation
  const handleCancel = useCallback(() => {
    closeTaskDrawer();
    closeAlarmDrawer();
    form.resetFields();
  }, [form, closeTaskDrawer, closeAlarmDrawer]);

  // Override handleTaskDetail function, directly use Zustand store
  const handleTaskDetail = useCallback(
    (task: IntelligentThresholdTask) => {
      openTaskDrawer({ type: TaskOperateType.DETAIL, record: task });
    },
    [openTaskDrawer],
  );

  // Table operation configuration
  const tableActions: TaskTableActions = {
    onAdd: taskOperations.handleAdd,
    onRerun: async (task) => {
      taskOperations.handleRerun(task);
      return true;
    },
    onViewVersions: async (task) => {
      taskOperations.handleViewVersions(task);
      return true;
    },
    onCreateAlarm: async (task) => {
      taskOperations.handleCreateAlarm(task);
      return true;
    },
    onCopy: async (task) => {
      taskOperations.handleCopy(task);
      return true;
    },
    onTaskDetail: handleTaskDetail,
    onBatchRerun: async () => {
      taskOperations.handleBatchRerun();
      return true;
    },
    onDelete: taskOperations.handleDelete,
  };

  return {
    // State - retrieved from Zustand store
    drawerVisible: taskDrawer.visible,
    alarmDrawerVisible: alarmDrawer.visible,
    batchRerunModalVisible,
    setBatchRerunModalVisible,
    editingTask: taskDrawer.record || null,
    operationType: taskDrawer.type || TaskOperateType.CREATE,
    selectedTasks,
    loading,
    form,
    taskList,

    // Operation methods
    ...taskOperations,
    handleCancel,
    handleSubmit: formHandlers.handleSubmit,
    handleAlarmSubmit: formHandlers.handleAlarmSubmit,

    // Table configuration
    tableActions,
    handleTaskDetail,
    // Selection handling
    setSelectedTasks,
  };
};

// Re-export other Hooks
export { useTaskTableConfig } from '../ui/version/hooks/use-table-config';
export { useTaskActionConfig } from './use-action-config';
