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

import { logger } from '@veaiops/utils';
import { useCallback, useRef } from 'react';
import { useMetricTemplateManagementLogic } from '../hooks';
import { MetricTemplateDrawer } from './modal';
import { MetricTemplateTable } from './table';

/**
 * Metric template management main component
 * Integrates table and modal, provides complete management functionality
 */
const MetricTemplateManagement: React.FC = () => {
  // Use ref to store table refresh function
  const refreshTableRef = useRef<(() => Promise<boolean>) | undefined>();

  // Wrap refresh function
  const refreshTable = useCallback(async () => {
    logger.debug({
      message: 'refreshTable 被调用',
      data: {},
      source: 'MetricTemplateManagement',
      component: 'refreshTable',
    });
    if (refreshTableRef.current) {
      logger.debug({
        message: '调用表格刷新方法',
        data: {},
        source: 'MetricTemplateManagement',
        component: 'refreshTable',
      });
      const result = await refreshTableRef.current();
      logger.debug({
        message: '刷新完成',
        data: { result },
        source: 'MetricTemplateManagement',
        component: 'refreshTable',
      });
      return result;
    }
    logger.debug({
      message: '刷新函数未定义',
      data: {},
      source: 'MetricTemplateManagement',
      component: 'refreshTable',
    });
    return false;
  }, []);

  // Handle refresh function ready
  const handleRefreshReady = useCallback((refresh: () => Promise<boolean>) => {
    logger.debug({
      message: '表格刷新函数已准备就绪',
      data: {},
      source: 'MetricTemplateManagement',
      component: 'handleRefreshReady',
    });
    refreshTableRef.current = refresh;
  }, []);

  const {
    // State
    editingTemplate,
    modalVisible,
    form,

    // Operation methods
    deleteTemplate,
    handleEdit,
    handleAdd,
    handleModalOk,
    handleModalCancel,
  } = useMetricTemplateManagementLogic(refreshTable);

  return (
    <div className="metric-template-management">
      <MetricTemplateTable
        onEdit={handleEdit}
        onDelete={deleteTemplate}
        onCreate={handleAdd}
        onRefreshReady={handleRefreshReady}
      />

      <MetricTemplateDrawer
        visible={modalVisible}
        editingTemplate={editingTemplate}
        form={form}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
      />
    </div>
  );
};

export default MetricTemplateManagement;
