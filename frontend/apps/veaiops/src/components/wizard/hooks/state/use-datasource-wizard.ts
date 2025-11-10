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

/**
 * Data source wizard main Hook
 * @description Combines various sub-Hooks to provide a unified wizard management interface
 * @author AI Assistant
 * @date 2025-01-16
 */

import { useMemo } from 'react';
import type { WizardActions } from '../../types';
import { useDataSourceCreation } from '../creation/use-datasource-creation';
import { useAliyunOperations } from '../operations/use-aliyun-operations';
import { useConnectOperations } from '../operations/use-connect-operations';
import { useVolcengineOperations } from '../operations/use-volcengine-operations';
import { useZabbixOperations } from '../operations/use-zabbix-operations';
import { useAliyunState } from './use-aliyun-state';
import { useWizardState } from './use-wizard-state';

/**
 * Data source wizard main Hook
 * @description Integrates all sub-Hooks to provide complete wizard functionality
 */
export const useDataSourceWizard = () => {
  // Basic state management
  const {
    state,
    setState,
    setCurrentStep,
    setDataSourceType,
    setSelectedConnect,
    setDataSourceName,
    setDataSourceDescription,
    setEditingDataSourceId,
    resetWizard,
    updateLoading,
    setZabbixSearchText,
    setAliyunSearchText,
    setVolcengineSearchText,
  } = useWizardState();

  // Connection management
  const { fetchConnects } = useConnectOperations(
    state,
    setState,
    updateLoading,
  );

  // Zabbix operations
  const {
    fetchZabbixTemplates,
    setSelectedTemplate,
    fetchZabbixMetrics,
    setSelectedMetric,
    fetchZabbixHosts,
    setSelectedHosts,
    fetchZabbixItems,
  } = useZabbixOperations(state, setState, updateLoading);

  // Aliyun operations
  const {
    fetchAliyunProjects,
    setSelectNamespace,
    fetchAliyunMetrics,
    setSelectedAliyunMetric,
    fetchAliyunInstances,
    setSelectedAliyunInstances,
    setSelectedGroupBy,
    setAliyunRegion,
  } = useAliyunOperations(state, setState, updateLoading);

  // Volcengine operations
  const {
    fetchVolcengineProducts,
    setSelectedProduct,
    fetchVolcengineSubNamespaces,
    setSelectedSubNamespace,
    fetchVolcengineMetrics,
    setSelectedVolcengineMetric,
    fetchVolcengineInstances,
    setVolcengineInstances,
    setSelectedVolcengineInstances,
    setSelectedVolcengineGroupBy,
    setVolcengineRegion,
  } = useVolcengineOperations(state, setState, updateLoading);

  // Data source creation
  const { createDataSource } = useDataSourceCreation(state, updateLoading);

  // Combine all operations into a unified actions object
  const actions: WizardActions = useMemo(
    () => ({
      // Basic operations
      setCurrentStep,
      setDataSourceType,
      setSelectedConnect,
      setDataSourceName,
      setDataSourceDescription,
      setEditingDataSourceId,
      resetWizard,

      // Connection operations
      fetchConnects,

      // Zabbix operations
      fetchZabbixTemplates,
      setSelectedTemplate,
      fetchZabbixMetrics,
      setSelectedMetric,
      fetchZabbixHosts,
      setSelectedHosts,
      fetchZabbixItems,
      setZabbixSearchText,

      // Aliyun operations
      fetchAliyunProjects,
      setSelectNamespace,
      fetchAliyunMetrics,
      setSelectedAliyunMetric,
      fetchAliyunInstances,
      setSelectedAliyunInstances,
      setSelectedGroupBy,
      setAliyunRegion,
      setAliyunSearchText,

      // Volcengine operations
      fetchVolcengineProducts,
      setSelectedProduct,
      fetchVolcengineSubNamespaces,
      setSelectedSubNamespace,
      fetchVolcengineMetrics,
      setSelectedVolcengineMetric,
      fetchVolcengineInstances,
      setVolcengineInstances,
      setSelectedVolcengineInstances,
      setSelectedVolcengineGroupBy,
      setVolcengineRegion,
      setVolcengineSearchText,

      // Data source creation
      createDataSource,
    }),
    [
      // Basic operation dependencies
      setCurrentStep,
      setDataSourceType,
      setSelectedConnect,
      setDataSourceName,
      setDataSourceDescription,
      setEditingDataSourceId,
      resetWizard,

      // Connection operation dependencies
      fetchConnects,

      // Zabbix operation dependencies
      fetchZabbixTemplates,
      setSelectedTemplate,
      fetchZabbixMetrics,
      setSelectedMetric,
      fetchZabbixHosts,
      setSelectedHosts,
      fetchZabbixItems,
      setZabbixSearchText,

      // Aliyun operation dependencies
      fetchAliyunProjects,
      setSelectNamespace,
      fetchAliyunMetrics,
      setSelectedAliyunMetric,
      fetchAliyunInstances,
      setSelectedAliyunInstances,
      setSelectedGroupBy,
      setAliyunRegion,
      setAliyunSearchText,

      // Volcengine operation dependencies
      fetchVolcengineProducts,
      setSelectedProduct,
      fetchVolcengineSubNamespaces,
      setSelectedSubNamespace,
      fetchVolcengineMetrics,
      setSelectedVolcengineMetric,
      fetchVolcengineInstances,
      setVolcengineInstances,
      setSelectedVolcengineInstances,
      setSelectedVolcengineGroupBy,
      setVolcengineRegion,
      setVolcengineSearchText,

      // Data source creation dependency
      createDataSource,
    ],
  );

  return { state, actions };
};
