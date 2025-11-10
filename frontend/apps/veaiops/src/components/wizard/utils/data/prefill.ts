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
 * Data prefill utility functions
 * @description Extract configuration from existing data source and prefill to wizard state in edit mode
 */

import type {
  AliyunDataSourceConfig,
  VolcengineDataSourceConfig,
  ZabbixDataSourceConfig,
} from 'api-generate';
import {
  DataSourceType,
  type WizardActions,
  type WizardState,
} from '../../types';

/**
 * Prefill Zabbix data source configuration
 */
export const prefillZabbixData = async (
  config: ZabbixDataSourceConfig,
  actions: WizardActions,
  state: WizardState,
) => {
  try {
    // Prefill connection
    if (config.connect_name && state.connects.length > 0) {
      const connect = state.connects.find(
        (c) => c.name === config.connect_name,
      );
      if (connect) {
        actions.setSelectedConnect(connect);
      }
      // Connect not found, skip setting
    }
    // No connect_name or no connects available, skip

    // Prefill metric name (as selected metric)
    if (config.metric_name) {
      actions.setSelectedMetric({
        metric_name: config.metric_name,
        name: config.metric_name,
        key_: '',
        itemid: '',
      });
    }

    // Prefill host list (extract from targets, preserve itemid)
    if (config.targets && config.targets.length > 0) {
      const hosts = config.targets.map((target, index) => ({
        name: target.hostname || `Host ${index + 1}`,
        host: target.hostname || '',
        // Preserve itemid so targets can be correctly rebuilt during editing
        itemid: target.itemid,
      }));
      actions.setSelectedHosts(hosts);
    }
  } catch (error) {}
};

/**
 * Prefill Aliyun data source configuration
 */
export const prefillAliyunData = async (
  config: AliyunDataSourceConfig,
  actions: WizardActions,
  state: WizardState,
) => {
  try {
    // Prefill connection
    if (config.connect_name && state.connects.length > 0) {
      const connect = state.connects.find(
        (c) => c.name === config.connect_name,
      );
      if (connect) {
        actions.setSelectedConnect(connect);

        // Prefill project (use namespace as project)
        if (config.namespace) {
          actions.setSelectNamespace({
            project: config.namespace,
            region: config.region,
          });
        }

        // Prefill region to state (for Region input field display)
        if (config.region) {
          actions.setAliyunRegion(config.region);
        }
      }
      // Connect not found, skip setting
    }
    // No connect_name or no connects available, skip

    // Prefill metric
    if (config.metric_name && config.namespace) {
      actions.setSelectedAliyunMetric({
        metricName: config.metric_name,
        namespace: config.namespace,
        description: '',
      });
    }

    // Prefill instances (extract from dimensions)
    if (config.dimensions && config.dimensions.length > 0) {
      const instances = config.dimensions.map((dim, index) => ({
        instanceId: dim.InstanceId || dim.instanceId || `instance-${index}`,
        instanceName:
          dim.InstanceName ||
          dim.instanceName ||
          dim.InstanceId ||
          dim.instanceId ||
          `Instance ${index + 1}`,
        dimensions: dim,
      }));
      actions.setSelectedAliyunInstances(instances);
    }
  } catch (error) {}
};

/**
 * Prefill Volcengine data source configuration
 */
export const prefillVolcengineData = async (
  config: VolcengineDataSourceConfig,
  actions: WizardActions,
  state: WizardState,
) => {
  try {
    // Edge case: config is empty
    if (!config) {
      return;
    }

    // Prefill connection
    if (config.connect_name && state.connects && state.connects.length > 0) {
      const connect = state.connects.find(
        (c) => c.name === config.connect_name,
      );
      if (connect) {
        actions.setSelectedConnect(connect);
      }
    }

    // Prefill region - Edge case: do not set if empty string
    if (config.region?.trim()) {
      actions.setVolcengineRegion(config.region);
    }

    // Prefill product (create product object using namespace)
    if (config.namespace?.trim()) {
      actions.setSelectedProduct({
        namespace: config.namespace,
        name: config.namespace,
      });
    }

    // Prefill sub-namespace - Edge case: do not set if empty string
    if (config.sub_namespace?.trim()) {
      actions.setSelectedSubNamespace(config.sub_namespace);
    }

    // Prefill metric
    if (
      config.metric_name?.trim() &&
      config.namespace &&
      config.namespace.trim()
    ) {
      actions.setSelectedVolcengineMetric({
        metricName: config.metric_name,
        namespace: config.namespace,
        subNamespace: config.sub_namespace,
        unit: '',
      });
    }

    // Prefill instance list
    if (
      config.instances &&
      Array.isArray(config.instances) &&
      config.instances.length > 0
    ) {
      const instances = config.instances
        .filter(
          (dimensionsObj) => dimensionsObj && typeof dimensionsObj === 'object',
        ) // Filter out null/undefined
        .map((dimensionsObj, index) => {
          // Try to extract instance ID and name from dimensions object
          const instanceId =
            dimensionsObj.ResourceID ||
            dimensionsObj.resource_id ||
            dimensionsObj.instance_id ||
            dimensionsObj.InstanceId ||
            dimensionsObj.instanceId ||
            `instance-${index}`;

          const instanceName =
            dimensionsObj.ResourceName ||
            dimensionsObj.resource_name ||
            dimensionsObj.instance_name ||
            dimensionsObj.InstanceName ||
            dimensionsObj.instanceName ||
            instanceId;

          return {
            instanceId,
            instanceName,
            region: config.region || '',
            namespace: config.namespace || '',
            subNamespace: config.sub_namespace || '',
            dimensions: dimensionsObj,
          };
        });

      // Edge case: may be empty array after filtering
      if (instances.length > 0) {
        // Set both available instance list and selected instance list
        // In edit mode, show selected instances as available instance list
        // This allows users to see selected instances and deselect them
        actions.setVolcengineInstances(instances);
        actions.setSelectedVolcengineInstances(instances);
      }
    }
  } catch (error) {
    // prefillVolcengineData error
  }
};

/**
 * Prefill data source configuration (unified entry point)
 */
export const prefillDataSourceConfig = async (
  dataSource: any,
  actions: WizardActions,
  state: WizardState,
) => {
  if (!dataSource) {
    return;
  }

  // Convert type to lowercase to match DataSourceType enum values
  const dataSourceType = dataSource.type?.toLowerCase() as DataSourceType;

  // Get corresponding configuration object based on data source type
  let config: any = null;
  switch (dataSourceType) {
    case DataSourceType.ZABBIX:
      config = dataSource.zabbix_config || dataSource.config;
      break;
    case DataSourceType.ALIYUN:
      config = dataSource.aliyun_config || dataSource.config;
      break;
    case DataSourceType.VOLCENGINE:
      config = dataSource.volcengine_config || dataSource.config;
      break;
    default:
      break;
  }

  if (!config) {
    return;
  }

  switch (dataSourceType) {
    case DataSourceType.ZABBIX:
      await prefillZabbixData(config as ZabbixDataSourceConfig, actions, state);
      break;
    case DataSourceType.ALIYUN:
      await prefillAliyunData(config as AliyunDataSourceConfig, actions, state);
      break;
    case DataSourceType.VOLCENGINE:
      await prefillVolcengineData(
        config as VolcengineDataSourceConfig,
        actions,
        state,
      );
      break;
    default:
  }
};
