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
import { extractApiErrorMessage, logger } from '@veaiops/utils';
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
 * 任务操作相关的 Hook
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
  // 处理添加任务
  const handleAdd = useCallback(async (): Promise<boolean> => {
    const { openTaskDrawer } = useTaskConfigStore.getState();
    openTaskDrawer({ type: TaskOperateType.CREATE, record: undefined });
    form.resetFields();
    return true; // 添加操作成功
  }, [form]);

  // 处理查看任务详情
  const handleTaskDetail = useCallback((task: IntelligentThresholdTask) => {
    // 直接调用 Zustand store 的 openTaskDrawer 方法
    const { openTaskDrawer } = useTaskConfigStore.getState();
    openTaskDrawer({ type: TaskOperateType.DETAIL, record: task });
  }, []);

  // 处理重新执行任务
  const handleRerun = useCallback((task: IntelligentThresholdTask) => {
    // 直接调用 Zustand store 的 openTaskDrawer 方法
    const { openTaskDrawer } = useTaskConfigStore.getState();
    openTaskDrawer({ type: TaskOperateType.RERUN, record: task });
  }, []);

  // 处理查看任务版本
  const handleViewVersions = useCallback((task: IntelligentThresholdTask) => {
    // 直接调用 Zustand store 的 openTaskDrawer 方法
    const { openTaskDrawer } = useTaskConfigStore.getState();
    openTaskDrawer({ type: TaskOperateType.VERSIONS, record: task });
  }, []);

  // 处理创建告警规则
  const handleCreateAlarm = useCallback(
    (task: IntelligentThresholdTask) => {
      // 优先使用 props 提供的方法以保持组件内解耦
      if (setAlarmDrawerVisible) {
        setAlarmDrawerVisible(true);
      } else {
        const { openAlarmDrawer } = useTaskConfigStore.getState();
        openAlarmDrawer(task);
      }
    },
    [setAlarmDrawerVisible],
  );

  // 处理复制任务
  const handleCopy = useCallback(async (task: IntelligentThresholdTask) => {
    try {
      // 🎯 先调用详情接口获取完整的任务信息（包含 latest_version）
      logger.info({
        message: '📋 开始获取任务详情（复制任务）',
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
        message: '📋 任务详情获取成功',
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

      // 直接调用 Zustand store 的 openTaskDrawer 方法
      const { openTaskDrawer } = useTaskConfigStore.getState();

      // 构造复制的任务数据（使用详情数据）
      const originalTaskName = taskDetail.task_name;
      const copyRecord = {
        ...taskDetail,
        _id: undefined, // 清空 ID，表示新建
        task_name: originalTaskName
          ? `${originalTaskName}_副本`
          : '新建任务_副本',
      };

      // 使用 'copy' 操作类型打开抽屉，标题将显示"复制任务"
      // 表单会通过 TaskBasicForm 的 useEffect 自动填充
      openTaskDrawer({ type: TaskOperateType.COPY, record: copyRecord });
    } catch (error: unknown) {
      // ✅ Use unified utility function to extract error message
      const errorMessage = extractApiErrorMessage(error, '获取任务详情失败');
      Message.error(`获取任务详情失败：${errorMessage}`);
    }
  }, []);

  // 处理批量重新执行 - 打开确认 modal
  const handleBatchRerun = useCallback(() => {
    if (selectedTasks.length === 0) {
      Message.warning('请选择要重新执行的任务');
      return;
    }
    // 打开批量重新执行确认弹窗
    setBatchRerunModalVisible(true);
  }, [selectedTasks, setBatchRerunModalVisible]);

  // 处理删除任务
  const handleDelete = useCallback(async (taskId: string): Promise<boolean> => {
    try {
      logger.info({
        message: '🗑️ 开始删除任务',
        data: { taskId },
        source: 'useTaskOperations',
        component: 'handleDelete',
      });
      // ✅ 使用静态导入，避免动态 import（违反规范）
      const success = await deleteTask(taskId);
      logger.info({
        message: '🗑️ 删除任务完成',
        data: { taskId, success },
        source: 'useTaskOperations',
        component: 'handleDelete',
      });
      // 🎯 返回 success，wrappedHandlers.delete 会在成功时自动刷新
      return success;
    } catch (error: unknown) {
      // ✅ Use unified utility function to extract error message
      // Note: deleteTask API already shows Message.error in its catch block and returns false,
      // so this catch block should not be triggered. But we keep it for safety.
      const errorMessage = extractApiErrorMessage(error, '删除任务失败');
      // Note: deleteTask already shows Message.error, so we don't show it here to avoid duplicate
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
