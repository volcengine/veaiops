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

import { DataSourceWizard } from '@/components';
import { Tabs } from '@arco-design/web-react';
import type { DataSourceType, MonitorAccessProps } from '@datasource/lib';
import { XGuide } from '@veaiops/components'; // Temporarily commented, has style issues
import { logger } from '@veaiops/utils';
import type React from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import { ConnectionManager } from '../../connection/ui/panels/connection-manager';
import { useDataSourceHandlers, useMonitorAccessLogic } from '../../hooks';
import { ManagementHeader, ManagementToolbar } from '../components';
import { renderDataSourceTabs } from './components';
import { createDataSourceConfigs } from './config';
import { useGuide } from './hooks/use-guide';
import { useTabManagement } from './hooks/use-tab-management';
import { useUrlParamHandlers } from './hooks/use-url-param-handlers';
import style from './index.module.less';

/**
 * Monitor access management page
 * Provides CRUD functionality for monitor access - uses split components and business logic separation
 *
 * Architecture features:
 * - Use custom Hooks to encapsulate business logic (useTabManagement, useMonitorAccessLogic, useDataSourceHandlers)
 * - Single responsibility components, easy to maintain (split into independent components and configuration files)
 * - State management separated from UI rendering
 * - Supports configuration and extension (createDataSourceConfigs)
 * - Modular split: types.ts, config.ts, hooks/, components/
 */
export const MonitorAccessManagement: React.FC<MonitorAccessProps> = (
  props,
) => {
  logger.info({
    message: '🎨 MonitorAccessManagement component rendering',
    data: {},
    source: 'ManagementPage',
    component: 'render',
  });

  // Tab management logic
  const { activeTab, handleTabChange } = useTabManagement();

  // Guide configuration
  const guideConfig = useGuide();

  // 🔥 Monitor component mount and unmount
  useEffect(() => {
    logger.info({
      message: '✨ MonitorAccessManagement mounted',
      data: {},
      source: 'ManagementPage',
      component: 'mount',
    });
    return () => {
      logger.info({
        message: '💥 MonitorAccessManagement unmounting',
        data: {},
        source: 'ManagementPage',
        component: 'unmount',
      });
    };
  }, []);

  // Use custom Hook to get all business logic
  const {
    // State
    pageTitle,

    // Event handlers
    handleDelete,
  } = useMonitorAccessLogic(props);

  /**
   * Delete parameters interface
   */
  interface HandleDeleteParams {
    id: string;
    datasourceType: DataSourceType;
  }

  // Wrap handleDelete function to match createDataSourceConfigs expected type (positional parameters)
  const wrappedHandleDeleteForConfig = useCallback(
    async (
      monitorId: string,
      dataSourceType?: DataSourceType,
    ): Promise<boolean> => {
      const result = await handleDelete({
        id: monitorId,
        datasourceType: dataSourceType || ('Prometheus' as DataSourceType),
      });
      return result.success;
    },
    [handleDelete],
  );

  // Wrap handleDelete function to match useDataSourceHandlers expected type (object parameter, returns boolean)
  const wrappedHandleDeleteForHandlers = useCallback(
    async (params: {
      id: string;
      datasourceType: DataSourceType;
    }): Promise<boolean> => {
      const result = await handleDelete(params);
      return result.success;
    },
    [handleDelete],
  );

  // Data source handler logic
  const {
    // State
    connectionDrawerVisible,
    wizardVisible,
    editingDataSource,
    volcengineTableRef,
    aliyunTableRef,
    zabbixTableRef,

    // Event handlers
    handleDeleteZabbix,
    handleDeleteAliyun,
    handleDeleteVolcengine,
    handleAdd,
    handleEditDataSource,
    handleWizardSuccess,
    handleOpenConnectionManager,
    handleCloseConnectionManager,

    // Setters
    setWizardVisible,
    setEditingDataSource,
  } = useDataSourceHandlers({
    handleDelete: wrappedHandleDeleteForHandlers,
    handleTabChange,
  });

  // 🔥 Monitor connectionDrawerVisible state changes
  useEffect(() => {
    logger.info({
      message: '📊 connectionDrawerVisible changed in ManagementPage',
      data: {
        visible: connectionDrawerVisible,
        timestamp: new Date().toISOString(),
      },
      source: 'ManagementPage',
      component: 'connectionDrawerVisible-effect',
    });
  }, [connectionDrawerVisible]);

  // 🔥 Monitor wizardVisible state changes
  useEffect(() => {
    logger.info({
      message: '📊 wizardVisible changed in ManagementPage',
      data: {
        visible: wizardVisible,
        timestamp: new Date().toISOString(),
      },
      source: 'ManagementPage',
      component: 'wizardVisible-effect',
    });
  }, [wizardVisible]);

  // URL parameter handling logic (extracted to independent Hook)
  const {
    wrappedHandleOpenConnectionManager,
    wrappedHandleCloseConnectionManager,
    wrappedHandleAdd,
    wrappedHandleEditDataSource,
    wrappedSetWizardVisible,
  } = useUrlParamHandlers({
    connectionDrawerVisible,
    wizardVisible,
    handleOpenConnectionManager,
    handleCloseConnectionManager,
    handleAdd,
    handleEditDataSource,
    setWizardVisible,
  });

  // Data source configuration list
  const dataSourceConfigs = useMemo(
    () =>
      createDataSourceConfigs({
        handleDeleteVolcengine,
        handleDeleteAliyun,
        handleDeleteZabbix,
      }),
    // Note: wrappedHandleDeleteForConfig is unused but kept for future needs
    [handleDeleteVolcengine, handleDeleteAliyun, handleDeleteZabbix],
  );

  // Table ref mapping
  const tableRefMap = useMemo(
    () => ({
      volcengineTableRef,
      aliyunTableRef,
      zabbixTableRef,
    }),
    [volcengineTableRef, aliyunTableRef, zabbixTableRef],
  );

  return (
    <div className="monitor-access-management">
      {/* Page header */}
      <ManagementHeader pageTitle={pageTitle} />

      {/* Data source Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={handleTabChange}
        type="card-gutter"
        className={style.tabs}
        extra={
          <ManagementToolbar
            onOpenConnectionManager={wrappedHandleOpenConnectionManager}
            onAdd={wrappedHandleAdd}
          />
        }
      >
        {renderDataSourceTabs(
          dataSourceConfigs,
          tableRefMap,
          wrappedHandleEditDataSource,
        )}
      </Tabs>

      {/* Data source create/edit wizard - for create and edit */}
      <DataSourceWizard
        visible={wizardVisible}
        onClose={() => {
          wrappedSetWizardVisible(false);
          setEditingDataSource(null);
        }}
        onSuccess={handleWizardSuccess}
        editingDataSource={editingDataSource}
      />

      {/* Global connection manager */}
      <ConnectionManager
        visible={connectionDrawerVisible}
        onClose={wrappedHandleCloseConnectionManager}
      />

      {/* Guide component */}
      <XGuide {...guideConfig} />
    </div>
  );
};

// Default export for backward compatibility
export default MonitorAccessManagement;
