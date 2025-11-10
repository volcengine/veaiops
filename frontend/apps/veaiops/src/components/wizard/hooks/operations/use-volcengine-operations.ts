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
 * Volcengine data source operations Hook
 * @description Manages Volcengine-related API calls and state updates
 * @author AI Assistant
 * @date 2025-01-16
 */

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';

import type {
  VolcengineMetric as APIVolcengineMetric,
  VolcengineProduct as APIVolcengineProduct,
} from 'api-generate';
import { useCallback } from 'react';
import type {
  VolcengineInstance,
  VolcengineMetric,
  VolcengineProduct,
  WizardState,
} from '../../types';

// Volcengine instance API response type
type APIVolcengineInstance = Record<string, string>;

export const useVolcengineOperations = (
  state: WizardState,
  setState: React.Dispatch<React.SetStateAction<WizardState>>,
  updateLoading: (key: keyof WizardState['loading'], value: boolean) => void,
) => {
  // Fetch Volcengine product list
  const fetchVolcengineProducts = useCallback(async () => {
    updateLoading('products', true);
    try {
      const response =
        await apiClient.dataSources.getApisV1DatasourceVolcengineProducts();

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        // Transform API response data to component-required format
        const products: VolcengineProduct[] = response.data.map(
          (item: APIVolcengineProduct) => ({
            namespace: item.namespace,
            name: item.description || item.namespace,
            description: item.description,
          }),
        );

        setState((prev) => ({
          ...prev,
          volcengine: { ...prev.volcengine, products },
        }));
      } else {
        throw new Error(response.message || '获取产品列表失败');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      Message.error('获取火山引擎产品失败，请重试');

      // Set empty array as fallback
      setState((prev) => ({
        ...prev,
        volcengine: { ...prev.volcengine, products: [] },
      }));
    } finally {
      updateLoading('products', false);
    }
  }, [setState, updateLoading]);

  // Set selected product
  const setSelectedProduct = useCallback(
    (product: VolcengineProduct | null) => {
      setState((prev) => ({
        ...prev,
        volcengine: {
          ...prev.volcengine,
          selectedProduct: product,
          // Clear sub-namespace related data when selecting new product
          subNamespaces: [],
          selectedSubNamespace: null,
          metrics: [],
          selectedMetric: null,
          instances: [],
          selectedInstances: [],
        },
      }));
    },
    [setState],
  );

  // Fetch Volcengine sub-namespaces
  const fetchVolcengineSubNamespaces = useCallback(
    async (namespace: string) => {
      updateLoading('subNamespaces', true);
      try {
        const response =
          await apiClient.dataSources.getApisV1DatasourceVolcengineMetricsSubNamespaces(
            {
              namespace,
            },
          );

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          setState((prev) => ({
            ...prev,
            volcengine: {
              ...prev.volcengine,
              subNamespaces: response.data || [],
            },
          }));
        } else {
          throw new Error(response.message || '获取子命名空间失败');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';

        Message.error('获取火山引擎子命名空间失败，请重试');

        // Set empty array as fallback
        setState((prev) => ({
          ...prev,
          volcengine: { ...prev.volcengine, subNamespaces: [] },
        }));
      } finally {
        updateLoading('subNamespaces', false);
      }
    },
    [setState, updateLoading],
  );

  // Set selected sub-namespace
  const setSelectedSubNamespace = useCallback(
    (subNamespace: string | null) => {
      setState((prev) => ({
        ...prev,
        volcengine: {
          ...prev.volcengine,
          selectedSubNamespace: subNamespace,
          // Clear all subsequent dependent data when switching sub-namespace
          metrics: [],
          selectedMetric: null,
          instances: [],
          selectedInstances: [],
          selectedGroupBy: [],
        },
      }));
    },
    [setState],
  );

  // Fetch Volcengine metrics list
  const fetchVolcengineMetrics = useCallback(
    async (namespace?: string, subNamespace?: string) => {
      updateLoading('metrics', true);
      try {
        const response =
          await apiClient.dataSources.getApisV1DatasourceVolcengineMetricsSearch(
            {
              namespace,
              subNamespace,
            },
          );

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          // Transform API response data to component-required format
          const metrics: VolcengineMetric[] = response.data.map(
            (item: APIVolcengineMetric) => ({
              metricName: item.metric_name,
              namespace: item.namespace,
              subNamespace: item.sub_namespace,
              description: item.description,
              unit: item.unit,
            }),
          );

          setState((prev) => ({
            ...prev,
            volcengine: { ...prev.volcengine, metrics },
          }));
        } else {
          throw new Error(response.message || '获取指标列表失败');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';

        Message.error('获取火山引擎指标失败，请重试');

        // Set empty array as fallback
        setState((prev) => ({
          ...prev,
          volcengine: { ...prev.volcengine, metrics: [] },
        }));
      } finally {
        updateLoading('metrics', false);
      }
    },
    [setState, updateLoading],
  );

  // Set selected metric
  const setSelectedVolcengineMetric = useCallback(
    (metric: VolcengineMetric | null) => {
      setState((prev) => ({
        ...prev,
        volcengine: {
          ...prev.volcengine,
          selectedMetric: metric,
          // Clear instances and grouping when switching metrics to prevent data inconsistency
          instances: [],
          selectedInstances: [],
          selectedGroupBy: [],
        },
      }));
    },
    [setState],
  );

  // Fetch Volcengine instance list
  const fetchVolcengineInstances = useCallback(
    async (
      connectName: string,
      region: string,
      namespace: string,
      subNamespace: string,
      metricName: string,
    ) => {
      updateLoading('instances', true);
      try {
        // Use Volcengine API to fetch instance list (POST method)
        const response =
          await apiClient.dataSources.postApisV1DatasourceVolcengineMetricsInstances(
            {
              requestBody: {
                connect_name: connectName,
                region,
                namespace,
                sub_namespace: subNamespace,
                metric_name: metricName,
              },
            },
          );

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          // Transform API response data to component-required format
          // Volcengine response format: [{"ResourceID": "i-xxx"}, {"ResourceID": "i-yyy"}]
          // Need to support multiple possible field names
          const instances: VolcengineInstance[] =
            response.data?.map((item: APIVolcengineInstance) => {
              // Try to get instance ID from multiple possible fields
              const instanceId =
                item.ResourceID ||
                item.resource_id ||
                item.instance_id ||
                item.InstanceId ||
                item.instanceId ||
                'unknown';

              // Try to get instance name from multiple possible fields
              const instanceName =
                item.ResourceName ||
                item.resource_name ||
                item.instance_name ||
                item.InstanceName ||
                item.instanceName ||
                instanceId;

              return {
                instanceId,
                instanceName,
                region: item.region || region, // Use passed region
                namespace,
                subNamespace: subNamespace || '',
                dimensions: item,
              };
            }) || [];

          setState((prev) => ({
            ...prev,
            volcengine: { ...prev.volcengine, instances },
          }));
        } else {
          throw new Error(response.message || '获取实例列表失败');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';

        Message.error('获取火山引擎实例失败，请重试');

        // Set empty array as fallback
        setState((prev) => ({
          ...prev,
          volcengine: { ...prev.volcengine, instances: [] },
        }));
      } finally {
        updateLoading('instances', false);
      }
    },
    [setState, updateLoading],
  );

  // Set available instance list (for prefill)
  const setVolcengineInstances = useCallback(
    (instances: VolcengineInstance[]) => {
      setState((prev) => ({
        ...prev,
        volcengine: { ...prev.volcengine, instances },
      }));
    },
    [setState],
  );

  // Set selected instances
  const setSelectedVolcengineInstances = useCallback(
    (instances: VolcengineInstance[]) => {
      setState((prev) => ({
        ...prev,
        volcengine: { ...prev.volcengine, selectedInstances: instances },
      }));
    },
    [setState],
  );

  // Set selected grouping dimensions
  const setSelectedVolcengineGroupBy = useCallback(
    (groupBy: string[]) => {
      setState((prev) => ({
        ...prev,
        volcengine: { ...prev.volcengine, selectedGroupBy: groupBy },
      }));
    },
    [setState],
  );

  // Set region
  const setVolcengineRegion = useCallback(
    (region: string) => {
      setState((prev) => ({
        ...prev,
        volcengine: { ...prev.volcengine, region },
      }));
    },
    [setState],
  );

  return {
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
  };
};
