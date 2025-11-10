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
import apiClient from '@/utils/api-client';
import { type FormInstance, Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type { IntelligentThresholdTask } from 'api-generate';
import { useCallback } from 'react';
import { deleteTask } from '../lib/data-source/api';
import { TaskOperateType } from '../lib/types';

interface UseTaskOperationsProps {
  setOperationType: (type: TaskOperateType) => void;
  setDrawerVisible: (visible: boolean) => void;
  setAlarmDrawerVisible?: (visible: boolean) => void;
  setBatchRerunModalVisible: (visible: boolean) => void;
  setSelectedTasks: (tasks: string[]) => void;
  setLoading: (loading: boolean) => void;
  form: FormInstance;
  selectedTasks: string[];
  taskList: IntelligentThresholdTask[];
}

/**
 * Hook for task operations
 */
export const useTaskOperations = ({
  setOperationType: _setOperationType,
  setDrawerVisible: _setDrawerVisible,
  setAlarmDrawerVisible,
  setBatchRerunModalVisible,
  setSelectedTasks: _setSelectedTasks,
  setLoading: _setLoading,
  form,
  selectedTasks,
  taskList: _taskList,
}: UseTaskOperationsProps) => {
  // Handle add task
  const handleAdd = useCallback(async (): Promise<boolean> => {
    const { openTaskDrawer } = useTaskConfigStore.getState();
    openTaskDrawer({ type: TaskOperateType.CREATE, record: undefined });
    form.resetFields();
    return true; // Add operation successful
  }, [form]);

  // Handle view task detail
  const handleTaskDetail = useCallback((task: IntelligentThresholdTask) => {
    // Directly call Zustand store's openTaskDrawer method
    const { openTaskDrawer } = useTaskConfigStore.getState();
    openTaskDrawer({ type: TaskOperateType.DETAIL, record: task });
  }, []);

  // Handle rerun task
  const handleRerun = useCallback((task: IntelligentThresholdTask) => {
    // Directly call Zustand store's openTaskDrawer method
    const { openTaskDrawer } = useTaskConfigStore.getState();
    openTaskDrawer({ type: TaskOperateType.RERUN, record: task });
  }, []);

  // Handle view task versions
  const handleViewVersions = useCallback((task: IntelligentThresholdTask) => {
    // Directly call Zustand store's openTaskDrawer method
    const { openTaskDrawer } = useTaskConfigStore.getState();
    openTaskDrawer({ type: TaskOperateType.VERSIONS, record: task });
  }, []);

  // Handle create alarm rule
  const handleCreateAlarm = useCallback(
    (task: IntelligentThresholdTask) => {
      // Prefer using method provided by props to maintain component decoupling
      if (setAlarmDrawerVisible) {
        setAlarmDrawerVisible(true);
      } else {
        const { openAlarmDrawer } = useTaskConfigStore.getState();
        openAlarmDrawer(task);
      }
    },
    [setAlarmDrawerVisible],
  );

  // Handle copy task
  const handleCopy = useCallback(async (task: IntelligentThresholdTask) => {
    try {
      // 🎯 First call detail API to get complete task information (including latest_version)
      logger.info({
        message: '📋 Starting to fetch task detail (copy task)',
        data: { taskId: task._id },
        source: 'useTaskOperations',
        component: 'handleCopy',
      });

      const detailResponse =
        await apiClient.intelligentThresholdTask.getApisV1IntelligentThresholdTask1(
          {
            taskId: task._id!,
          },
        );

      if (
        detailResponse.code !== API_RESPONSE_CODE.SUCCESS ||
        !detailResponse.data
      ) {
        Message.error('获取任务详情失败，无法复制');
        return;
      }

      const taskDetail = detailResponse.data;
      logger.info({
        message: '📋 Task detail fetched successfully',
        data: {
          taskId: task._id,
          hasLatestVersion: Boolean(taskDetail.latest_version),
          hasMetricTemplateValue: Boolean(
            taskDetail.latest_version?.metric_template_value,
          ),
        },
        source: 'useTaskOperations',
        component: 'handleCopy',
      });

      // Directly call Zustand store's openTaskDrawer method
      const { openTaskDrawer } = useTaskConfigStore.getState();

      // Construct copied task data (using detail data)
      const originalTaskName = taskDetail.task_name;
      const copyRecord = {
        ...taskDetail,
        _id: undefined, // Clear ID, indicating new creation
        task_name: originalTaskName
          ? `${originalTaskName}_副本`
          : '新建任务_副本',
      };

      // Use 'copy' operation type to open drawer, title will display "Copy Task"
      // Form will be automatically filled through TaskBasicForm's useEffect
      openTaskDrawer({ type: TaskOperateType.COPY, record: copyRecord });
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Failed to fetch task detail',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          taskId: task._id,
        },
        source: 'useTaskOperations',
        component: 'handleCopy',
      });
      Message.error(`获取任务详情失败: ${errorObj.message}`);
    }
  }, []);

  // Handle batch rerun - Open confirmation modal
  const handleBatchRerun = useCallback(() => {
    if (selectedTasks.length === 0) {
      Message.warning('请选择要重跑的任务');
      return;
    }
    // Open batch rerun confirmation modal
    setBatchRerunModalVisible(true);
  }, [selectedTasks, setBatchRerunModalVisible]);

  // Handle delete task
  const handleDelete = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      logger.info({
        message: '🗑️ Starting to delete task',
        data: { taskId },
        source: 'useTaskOperations',
        component: 'handleDelete',
      });
      // ✅ Use static import, avoid dynamic import (violates specification)
      const success = await deleteTask(taskId);
      logger.info({
        message: '🗑️ Task deletion completed',
        data: { taskId, success },
        source: 'useTaskOperations',
        component: 'handleDelete',
      });
      // 🎯 Return success, wrappedHandlers.delete will auto-refresh on success
      return success;
    } catch (error: unknown) {
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Failed to delete task',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          taskId,
        },
        source: 'useTaskOperations',
        component: 'handleDelete',
      });
      return false;
    }
  }, []);

  return {
    handleAdd,
    handleRerun,
    handleViewVersions,
    handleCreateAlarm,
    handleCopy,
    handleBatchRerun,
    handleTaskDetail,
    handleDelete,
  };
};
