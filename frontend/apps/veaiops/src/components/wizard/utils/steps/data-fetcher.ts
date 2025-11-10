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
 * Data source wizard step data fetcher
 * @description Handles data fetching logic when wizard steps change, loading necessary data for each step
 * @author AI Assistant
 * @date 2025-01-19
 */

import {
  createDataSource,
  updateDataSource,
} from '../../steps/create/components/datasource-creator';
import { DataSourceType } from '../../types';
import type { WizardActions, WizardState } from '../../types';

/**
 * Handle data fetching logic when steps change
 * @param selectedType Selected data source type
 * @param state Wizard state
 * @param actions Wizard action methods
 * @param currentStepKey Current step key
 * @returns Promise, returns creation result for create step
 */
export const handleStepDataFetch = async (
  selectedType: DataSourceType,
  state: WizardState,
  actions: WizardActions,
  currentStepKey: string,
): Promise<any> => {
  // Execute corresponding data fetching logic based on current step
  switch (currentStepKey) {
    case 'connect':
      await handleConnectStep(selectedType, state, actions);
      break;

    case 'template':
      await handleTemplateStep(selectedType, state, actions);
      break;

    case 'metric':
      await handleMetricStep(selectedType, state, actions);
      break;

    case 'project':
      await handleProjectStep(selectedType, state, actions);
      break;

    case 'product':
      // After Volcengine product selection, sub-namespaces are automatically fetched by SubnamespaceSelectionStep component
      // No need to call fetchVolcengineSubNamespaces here to avoid duplicate requests
      break;

    case 'subnamespace':
      await handleSubnamespaceStep(selectedType, state, actions);
      break;

    case 'instance':
      // Instance selection step - data already fetched in metric step, no additional operation needed here
      break;

    case 'host':
      await handleHostStep(selectedType, state, actions);
      break;

    case 'create': {
      // Create or update data source
      const result = await handleCreateStep(selectedType, state);
      return result;
    }

    default:
      break;
  }

  return undefined;
};

/**
 * Handle connection selection step
 */
async function handleConnectStep(
  selectedType: DataSourceType,
  state: WizardState,
  actions: WizardActions,
): Promise<void> {
  // When entering connection selection step, first fetch connection list
  if (!state.connects.length) {
    try {
      await actions.fetchConnects(selectedType);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new Error(`Failed to fetch ${selectedType} connection list: ${errorMessage}`);
    }
  }

  // Logic after connection selection - only execute after successfully fetching connection list
  if (state.connects.length > 0) {
    try {
      if (selectedType === DataSourceType.ZABBIX && state.selectedConnect) {
        await actions.fetchZabbixTemplates(state.selectedConnect.name);
      } else if (
        selectedType === DataSourceType.ALIYUN &&
        state.selectedConnect
      ) {
        if (!state.selectedConnect._id) {
          throw new Error('Aliyun connection missing ID');
        }
        await actions.fetchAliyunProjects(state.selectedConnect._id);
      } else if (selectedType === DataSourceType.VOLCENGINE) {
        await actions.fetchVolcengineProducts();
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new Error(`Failed to initialize ${selectedType} data: ${errorMessage}`);
    }
  }
}

/**
 * Handle template selection step (Zabbix)
 */
async function handleTemplateStep(
  selectedType: DataSourceType,
  state: WizardState,
  actions: WizardActions,
): Promise<void> {
  // Fetch metrics after Zabbix template selection
  if (
    selectedType === DataSourceType.ZABBIX &&
    state.selectedConnect &&
    state.zabbix.selectedTemplate
  ) {
    if (!state.zabbix.selectedTemplate.templateid) {
      throw new Error('Zabbix template missing templateid');
    }
    try {
      await actions.fetchZabbixMetrics(
        state.selectedConnect.name,
        state.zabbix.selectedTemplate.templateid,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new Error(`Failed to fetch Zabbix metrics: ${errorMessage}`);
    }
  }
}

/**
 * Handle metric selection step
 */
async function handleMetricStep(
  selectedType: DataSourceType,
  state: WizardState,
  actions: WizardActions,
): Promise<void> {
  try {
    // Fetch host list after Zabbix metric selection
    if (
      selectedType === DataSourceType.ZABBIX &&
      state.selectedConnect &&
      state.zabbix.selectedTemplate &&
      state.zabbix.selectedMetric
    ) {
      await actions.fetchZabbixHosts(
        state.selectedConnect.name,
        state.zabbix.selectedTemplate.templateid,
      );
    }
    // Fetch instance list after Aliyun metric selection
    else if (
      selectedType === DataSourceType.ALIYUN &&
      state.selectedConnect &&
      state.aliyun.selectedMetric
    ) {
      if (
        !state.aliyun.selectedMetric.namespace ||
        !state.aliyun.selectedMetric.metricName
      ) {
        throw new Error('Aliyun metric information incomplete');
      }
      await actions.fetchAliyunInstances(
        state.selectedConnect.name,
        state.aliyun.selectedMetric.namespace,
        state.aliyun.selectedMetric.metricName,
      );
    }
    // Fetch instance list after Volcengine metric selection
    else if (
      selectedType === DataSourceType.VOLCENGINE &&
      state.selectedConnect &&
      state.volcengine.selectedMetric &&
      state.volcengine.selectedProduct &&
      state.volcengine.selectedSubNamespace
    ) {
      if (!state.volcengine.region) {
        throw new Error('Volcengine region not selected');
      }
      if (!state.volcengine.selectedProduct.namespace) {
        throw new Error('Volcengine product namespace not selected');
      }
      await actions.fetchVolcengineInstances(
        state.selectedConnect.name,
        state.volcengine.region,
        state.volcengine.selectedProduct.namespace,
        state.volcengine.selectedSubNamespace,
        state.volcengine.selectedMetric.metricName,
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    throw new Error(`Failed to fetch ${selectedType} instance list: ${errorMessage}`);
  }
}

/**
 * Handle project selection step (Aliyun)
 */
async function handleProjectStep(
  selectedType: DataSourceType,
  state: WizardState,
  actions: WizardActions,
): Promise<void> {
  // Fetch metrics after Aliyun project selection
  if (selectedType === DataSourceType.ALIYUN && state.selectedConnect) {
    if (!state.selectedConnect._id) {
      throw new Error('Aliyun connection missing ID');
    }
    try {
      await actions.fetchAliyunMetrics(state.selectedConnect._id);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new Error(`Failed to fetch Aliyun metrics: ${errorMessage}`);
    }
  }
}

/**
 * Handle sub-namespace selection step (Volcengine)
 */
async function handleSubnamespaceStep(
  selectedType: DataSourceType,
  state: WizardState,
  actions: WizardActions,
): Promise<void> {
  // Fetch metrics after Volcengine sub-namespace selection
  if (selectedType === DataSourceType.VOLCENGINE) {
    if (!state.volcengine.selectedProduct?.namespace) {
      throw new Error('Volcengine product namespace not selected');
    }
    try {
      await actions.fetchVolcengineMetrics(
        state.volcengine.selectedProduct.namespace,
        state.volcengine.selectedSubNamespace || undefined,
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new Error(`Failed to fetch Volcengine metrics: ${errorMessage}`);
    }
  }
}

/**
 * Handle host selection step (Zabbix)
 */
async function handleHostStep(
  selectedType: DataSourceType,
  state: WizardState,
  actions: WizardActions,
): Promise<void> {
  // Fetch metric details after Zabbix host selection
  if (
    selectedType === DataSourceType.ZABBIX &&
    state.selectedConnect &&
    state.zabbix.selectedMetric &&
    state.zabbix.selectedHosts.length > 0
  ) {
    // Validate host data integrity
    const invalidHosts = state.zabbix.selectedHosts.filter(
      (host) => !host.host,
    );
    if (invalidHosts.length > 0) {
      throw new Error(`Found ${invalidHosts.length} invalid hosts (missing host field)`);
    }

    try {
      const promises = state.zabbix.selectedHosts.map((host) =>
        actions.fetchZabbixItems(
          state.selectedConnect!.name,
          host.host,
          state.zabbix.selectedMetric!.metric_name,
        ),
      );
      await Promise.all(promises);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      throw new Error(`Failed to fetch Zabbix metric details: ${errorMessage}`);
    }
  }
}

/**
 * Handle create step
 */
async function handleCreateStep(
  selectedType: DataSourceType,
  state: WizardState,
): Promise<any> {
  const isEditMode = Boolean(state.editingDataSourceId);

  const result = isEditMode
    ? await updateDataSource(selectedType, state.editingDataSourceId!, state)
    : await createDataSource(selectedType, state);

  if (!result.success) {
    throw new Error(
      result.message || (isEditMode ? 'Failed to update data source' : 'Failed to create data source'),
    );
  }

  return result;
}
