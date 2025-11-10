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
 * Data source creation operations Hook
 * @description Manages creation logic for various data sources
 * @author AI Assistant
 * @date 2025-01-16
 */

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { useCallback } from 'react';
import { DataSourceType } from '../../types';
import type { WizardState } from '../../types';

export const useDataSourceCreation = (
  state: WizardState,
  updateLoading: (key: keyof WizardState['loading'], value: boolean) => void,
) => {
  // Create Zabbix data source
  const createZabbixDataSource = useCallback(async () => {
    if (!state.selectedConnect) {
      throw new Error('请选择连接');
    }

    if (!state.zabbix.selectedMetric) {
      throw new Error('请选择监控指标');
    }

    if (
      !state.zabbix.selectedHosts ||
      state.zabbix.selectedHosts.length === 0
    ) {
      throw new Error('请选择主机');
    }

    // Build Zabbix data source configuration
    const zabbixConfig = {
      name: state.dataSourceName,
      connect_name: state.selectedConnect.name,
      metric_name: state.zabbix.selectedMetric.metric_name,
      targets: state.zabbix.selectedHosts.map((host, index) => ({
        itemid: `${state.zabbix.selectedMetric?.metric_name || ''}_${host.host || index}`,
        hostname: host.host,
      })),
      history_type: 0, // Default history type
      trigger_tags: [], // Default empty trigger tags
    };

    // Call API to create Zabbix data source
    const response = await apiClient.dataSources.postApisV1DatasourceZabbix({
      requestBody: zabbixConfig,
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      Message.success('Zabbix 数据源创建成功');
      return response.data;
    } else {
      throw new Error(response.message || 'Zabbix 数据源创建失败');
    }
  }, [
    state.selectedConnect,
    state.dataSourceName,
    state.zabbix.selectedMetric,
    state.zabbix.selectedHosts,
  ]);

  // Create Aliyun data source
  const createAliyunDataSource = useCallback(async () => {
    if (!state.selectedConnect) {
      throw new Error('请选择连接');
    }

    if (!state.aliyun.selectNamespace) {
      throw new Error('请选择命名空间');
    }

    if (!state.aliyun.selectedMetric) {
      throw new Error('请选择监控指标');
    }

    if (
      !state.aliyun.selectedInstances ||
      state.aliyun.selectedInstances.length === 0
    ) {
      throw new Error('请选择实例');
    }

    // Build Aliyun data source configuration
    const aliyunConfig = {
      name: state.dataSourceName,
      connect_name: state.selectedConnect.name,
      region: state.aliyun.region || 'cn-beijing', // Read from independent region field
      metric_name: state.aliyun.selectedMetric.metricName,
      namespace: state.aliyun.selectedMetric.namespace,
      // dimensions: Extract dimension information from selected instances
      dimensions: state.aliyun.selectedInstances.map(
        (instance) => instance.dimensions,
      ),
      // Add grouping dimensions
      group_by:
        state.aliyun.selectedGroupBy.length > 0
          ? state.aliyun.selectedGroupBy
          : undefined,
    };

    // Call API to create Aliyun data source
    const response = await apiClient.dataSources.postApisV1DatasourceAliyun({
      requestBody: aliyunConfig,
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      Message.success('阿里云数据源创建成功');
      return response.data;
    } else {
      throw new Error(response.message || '阿里云数据源创建失败');
    }
  }, [
    state.selectedConnect,
    state.dataSourceName,
    state.aliyun.selectNamespace,
    state.aliyun.selectedMetric,
    state.aliyun.selectedInstances,
  ]);

  // Create Volcengine data source
  const createVolcengineDataSource = useCallback(async () => {
    if (!state.selectedConnect) {
      throw new Error('请选择连接');
    }

    if (!state.volcengine.selectedProduct) {
      throw new Error('请选择产品');
    }

    if (!state.volcengine.selectedMetric) {
      throw new Error('请选择监控指标');
    }

    if (
      !state.volcengine.selectedInstances ||
      state.volcengine.selectedInstances.length === 0
    ) {
      throw new Error('请选择实例');
    }

    // Build Volcengine data source configuration
    const volcengineConfig = {
      name: state.dataSourceName,
      connect_name: state.selectedConnect.name,
      region: state.volcengine.region, // Already validated as required in pre-check
      namespace: state.volcengine.selectedProduct.namespace,
      sub_namespace: state.volcengine.selectedSubNamespace || '',
      metric_name: state.volcengine.selectedMetric.metricName,
      instances: state.volcengine.selectedInstances.map((instance) => ({
        instanceId: instance.instanceId,
        instanceName: instance.instanceName || '',
        ...instance.dimensions,
      })),
    };

    // Call API to create Volcengine data source
    const response = await apiClient.dataSources.postApisV1DatasourceVolcengine(
      {
        requestBody: volcengineConfig,
      },
    );

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      Message.success('火山引擎数据源创建成功');
      return response.data;
    } else {
      throw new Error(response.message || '火山引擎数据源创建失败');
    }
  }, [
    state.selectedConnect,
    state.dataSourceName,
    state.volcengine.selectedProduct,
    state.volcengine.selectedSubNamespace,
    state.volcengine.selectedMetric,
    state.volcengine.selectedInstances,
  ]);

  // Unified data source creation entry point
  const createDataSource = useCallback(async () => {
    updateLoading('creating', true);

    try {
      // Call different creation APIs based on data source type
      if (state.dataSourceType === DataSourceType.ZABBIX) {
        return await createZabbixDataSource();
      } else if (state.dataSourceType === DataSourceType.ALIYUN) {
        return await createAliyunDataSource();
      } else if (state.dataSourceType === DataSourceType.VOLCENGINE) {
        return await createVolcengineDataSource();
      } else {
        throw new Error('未选择数据源类型');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      Message.error(`创建数据源失败: ${errorMessage}`);
      throw error;
    } finally {
      updateLoading('creating', false);
    }
  }, [
    state.dataSourceType,
    state.dataSourceName,
    state.selectedConnect,
    createZabbixDataSource,
    createAliyunDataSource,
    createVolcengineDataSource,
    updateLoading,
  ]);

  return {
    createDataSource,
    createZabbixDataSource,
    createAliyunDataSource,
    createVolcengineDataSource,
  };
};
