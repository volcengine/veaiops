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

import type { FormInstance } from '@arco-design/web-react/es/Form';
import type { DataSource, DataSourceType } from '@datasource/lib';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';

/**
 * Monitor data source handler Hook parameters
 */
interface UseMonitorHandlersParams {
  setEditingMonitor: (monitor: DataSource | null) => void;
  setModalVisible: (visible: boolean) => void;
  setWizardVisible: (visible: boolean) => void;
  setDetailDrawerVisible: (visible: boolean) => void;
  setSelectedMonitor: (monitor: DataSource | null) => void;
  form: FormInstance;
  deleteMonitor: (id: string, type: DataSourceType) => Promise<boolean>;
}

/**
 * Monitor data source event handler Hook
 * Provides handler functions for all UI events
 */
export const useMonitorHandlers = ({
  setEditingMonitor,
  setModalVisible,
  setWizardVisible,
  setDetailDrawerVisible,
  setSelectedMonitor,
  form,
  deleteMonitor,
}: UseMonitorHandlersParams) => {
  // Handle add
  const handleAdd = useCallback(() => {
    setWizardVisible(true);
  }, [setWizardVisible]);

  // Handle edit
  const handleEdit = useCallback(
    (monitor: DataSource) => {
      setEditingMonitor(monitor);
      setModalVisible(true);
    },
    [setEditingMonitor, setModalVisible],
  );

  // Handle delete
  interface HandleDeleteParams {
    id: string;
    datasourceType: DataSourceType;
  }
  const handleDelete = useCallback(
    async ({ id, datasourceType }: HandleDeleteParams): Promise<boolean> => {
      try {
        const success = await deleteMonitor(id, datasourceType);
        return success;
      } catch (error: unknown) {
        // ✅ Correct: record error and return failure
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: '删除监控数据源失败',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
            id,
            datasourceType,
          },
          source: 'useMonitorHandlers',
          component: 'handleDelete',
        });
        return false;
      }
    },
    [deleteMonitor],
  );

  // Handle view details
  const handleViewDetails = useCallback(
    (monitor: DataSource) => {
      setSelectedMonitor(monitor);
      setDetailDrawerVisible(true);
    },
    [setSelectedMonitor, setDetailDrawerVisible],
  );

  // Handle close detail drawer
  const handleDetailDrawerClose = useCallback(() => {
    setDetailDrawerVisible(false);
    setSelectedMonitor(null);
  }, [setDetailDrawerVisible, setSelectedMonitor]);

  // Handle modal cancel
  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    setEditingMonitor(null);
    form.resetFields();
  }, [setModalVisible, setEditingMonitor, form]);

  // Handle wizard close
  const handleWizardClose = useCallback(() => {
    setWizardVisible(false);
  }, [setWizardVisible]);

  return {
    handleAdd,
    handleEdit,
    handleDelete,
    handleViewDetails,
    handleDetailDrawerClose,
    handleModalCancel,
    handleWizardClose,
  };
};
