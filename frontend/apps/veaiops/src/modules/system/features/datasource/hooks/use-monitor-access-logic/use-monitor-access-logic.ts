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

import { Message } from '@arco-design/web-react';
import type {
  DataSource,
  DataSourceType,
  MonitorAccessProps,
} from '@datasource/lib';
import { detectModuleType, getSupportedModuleType } from '@datasource/lib';
import { useMonitorCrud } from './use-monitor-crud';
import { useMonitorHandlers } from './use-monitor-handlers';
import { useMonitorState } from './use-monitor-state';

/**
 * Monitor data source management logic Hook
 * Provides all business logic for monitor data source management page
 *
 * Uses split modules:
 * - useMonitorState: State management
 * - useMonitorCrud: CRUD operations
 * - useMonitorHandlers: Event handlers
 */
export const useMonitorAccessLogic = (props: MonitorAccessProps) => {
  // Detect module type
  const detectedModuleType = props.moduleType || detectModuleType();
  const supportedModuleType = getSupportedModuleType(detectedModuleType);
  const pageTitle = '监控数据源管理';

  // State management
  const state = useMonitorState();

  // CRUD operations
  const { createMonitor, updateMonitor, deleteMonitor } = useMonitorCrud();

  /**
   * Delete parameters interface
   */
  interface HandleDeleteParams {
    id: string;
    datasourceType: DataSourceType;
  }

  // Delete monitor configuration
  const handleDelete = async ({
    id,
    datasourceType,
  }: HandleDeleteParams): Promise<{ success: boolean; error?: Error }> => {
    try {
      const success = await deleteMonitor(
        id,
        datasourceType || (supportedModuleType as DataSourceType),
      );
      if (success) {
        // CustomTable will automatically refresh data
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || '删除数据源失败，请重试';
      Message.error(errorMessage);
      return { success: false, error: errorObj };
    }
  };

  // Create monitor configuration
  const handleCreate = async (
    values: Partial<DataSource>,
  ): Promise<boolean> => {
    try {
      const success = await createMonitor(values);
      if (success) {
        state.setModalVisible(false);
        state.form.resetFields();
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '创建失败，请重试';
      Message.error(errorMessage);
      return false;
    }
  };

  // Update monitor configuration
  const handleUpdate = async (
    values: Partial<DataSource>,
  ): Promise<boolean> => {
    // Helper function to uniformly get monitor configuration ID
    // Because editingMonitor may come from different sources, field names may be inconsistent (id vs _id)
    const getMonitorId = (monitor: DataSource | null): string | null => {
      if (!monitor) {
        return null;
      }
      // Prefer id field (frontend unified format)
      if ('id' in monitor && monitor.id && typeof monitor.id === 'string') {
        return monitor.id;
      }
      // If id doesn't exist, try using _id (api-generate format)
      if ('_id' in monitor && monitor._id && typeof monitor._id === 'string') {
        return monitor._id;
      }
      return null;
    };

    const monitorId = getMonitorId(state.editingMonitor);
    if (!monitorId) {
      Message.error('监控配置 ID 不能为空');
      return false;
    }

    try {
      const success = await updateMonitor(
        monitorId,
        values,
        supportedModuleType as DataSourceType,
      );

      if (success) {
        state.setModalVisible(false);
        state.setEditingMonitor(null);
        state.form.resetFields();
        return true;
      }
      return false;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : '更新失败，请重试';
      Message.error(errorMessage);
      return false;
    }
  };

  // Handle form submission
  const handleSubmit = async (
    values: Partial<DataSource>,
  ): Promise<boolean> => {
    if (state.editingMonitor) {
      return await handleUpdate(values);
    } else {
      return await handleCreate(values);
    }
  };

  // Event handlers
  const handlers = useMonitorHandlers({
    setEditingMonitor: state.setEditingMonitor,
    setModalVisible: state.setModalVisible,
    setWizardVisible: state.setWizardVisible,
    setDetailDrawerVisible: state.setDetailDrawerVisible,
    setSelectedMonitor: state.setSelectedMonitor,
    form: state.form,
    deleteMonitor,
  });

  return {
    // State
    modalVisible: state.modalVisible,
    editingMonitor: state.editingMonitor,
    form: state.form,
    pageTitle,
    supportedModuleType,

    // Event handlers
    handleEdit: handlers.handleEdit,
    handleAdd: handlers.handleAdd,
    handleCancel: handlers.handleModalCancel,
    handleSubmit,
    handleDelete,
  };
};
