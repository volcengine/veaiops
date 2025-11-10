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
 * Zabbix data source operations Hook
 * @description Manages Zabbix-related API calls and state updates
 * @author AI Assistant
 * @date 2025-01-16
 */

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type {
  ZabbixHost,
  ZabbixTemplate,
  ZabbixTemplateMetric,
} from 'api-generate';
import { useCallback } from 'react';
import type { WizardState } from '../../types';

export const useZabbixOperations = (
  state: WizardState,
  setState: React.Dispatch<React.SetStateAction<WizardState>>,
  updateLoading: (key: keyof WizardState['loading'], value: boolean) => void,
) => {
  // Fetch Zabbix templates
  const fetchZabbixTemplates = useCallback(
    async (connectName: string, name?: string) => {
      updateLoading('templates', true);

      try {
        const response =
          await apiClient.dataSources.getApisV1DatasourceZabbixTemplates({
            connectName,
            name,
          });

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          setState((prev) => ({
            ...prev,
            zabbix: { ...prev.zabbix, templates: response.data || [] },
          }));
        } else {
          throw new Error(response.message || '获取模板列表失败');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';

        Message.error('获取 Zabbix 模板失败，请重试');
      } finally {
        updateLoading('templates', false);
      }
    },
    [setState, updateLoading],
  );

  // Set selected template
  const setSelectedTemplate = useCallback(
    (template: ZabbixTemplate | null) => {
      setState((prev) => ({
        ...prev,
        zabbix: {
          ...prev.zabbix,
          selectedTemplate: template,
          // Clear all subsequent dependent data when switching template
          selectedMetric: null,
          metrics: [],
          hosts: [],
          selectedHosts: [],
          items: [],
        },
      }));
    },
    [setState],
  );

  // Fetch Zabbix metrics
  const fetchZabbixMetrics = useCallback(
    async (connectName: string, templateId: string) => {
      updateLoading('metrics', true);

      try {
        const response =
          await apiClient.dataSources.getApisV1DatasourceZabbixTemplatesMetrics(
            {
              connectName,
              templateId,
            },
          );

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          setState((prev) => ({
            ...prev,
            zabbix: {
              ...prev.zabbix,
              metrics: (response.data ||
                []) as unknown as ZabbixTemplateMetric[],
            },
          }));
        } else {
          throw new Error(response.message || '获取监控项失败');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';

        Message.error('获取 Zabbix 监控项失败，请重试');

        // Set empty array as fallback
        setState((prev) => ({
          ...prev,
          zabbix: { ...prev.zabbix, metrics: [] },
        }));
      } finally {
        updateLoading('metrics', false);
      }
    },
    [setState, updateLoading],
  );

  // Fetch Zabbix host list
  const fetchZabbixHosts = useCallback(
    async (connectName: string, templateId: string) => {
      updateLoading('hosts', true);

      try {
        // Use apiClient to call API
        const result =
          await apiClient.dataSources.getApisV1DatasourceZabbixTemplatesHosts({
            connectName,
            templateId,
          });

        if (result.code === API_RESPONSE_CODE.SUCCESS && result.data) {
          setState((prev) => ({
            ...prev,
            zabbix: { ...prev.zabbix, hosts: result.data || [] },
          }));
        } else {
          throw new Error(result.message || '获取主机列表失败');
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : '未知错误';

        Message.error('获取 Zabbix 主机列表失败，请重试');

        // Set empty array as fallback
        setState((prev) => ({
          ...prev,
          zabbix: { ...prev.zabbix, hosts: [] },
        }));
      } finally {
        updateLoading('hosts', false);
      }
    },
    [setState, updateLoading],
  );

  // Set selected metric
  const setSelectedMetric = useCallback(
    (metric: ZabbixTemplateMetric | null) => {
      setState((prev) => {
        const newState = {
          ...prev,
          zabbix: {
            ...prev.zabbix,
            selectedMetric: metric,
            // Clear hosts and items when switching metric to prevent data inconsistency
            hosts: [],
            selectedHosts: [],
            items: [],
          },
        };

        return newState;
      });
    },
    [setState],
  );

  // Set selected hosts
  const setSelectedHosts = useCallback(
    (hosts: ZabbixHost[]) => {
      setState((prev) => ({
        ...prev,
        zabbix: { ...prev.zabbix, selectedHosts: hosts },
      }));
    },
    [setState],
  );

  // Fetch Zabbix Items
  const fetchZabbixItems = useCallback(
    async (connectName: string, host: string, metricName: string) => {
      try {
        updateLoading('items', true);

        // Call real API to fetch items
        const response = await apiClient.zabbix.getZabbixItems({
          connectName,
          host,
          metricName,
        });

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          setState((prev) => {
            // Merge new items instead of overwriting to avoid data loss during concurrent calls
            const existingItems = prev.zabbix.items || [];
            const newItems = response.data || [];

            // Deduplicate: use Map to ensure only the latest item per hostname is kept
            const itemsMap = new Map<string, (typeof newItems)[0]>();
            [...existingItems, ...newItems].forEach((item) => {
              itemsMap.set(item.hostname, item);
            });

            return {
              ...prev,
              zabbix: {
                ...prev.zabbix,
                items: Array.from(itemsMap.values()),
              },
            };
          });
        } else {
          throw new Error(response.message || '获取Zabbix Items失败');
        }
      } catch (error) {
        Message.error('获取Zabbix Items失败，请重试');
      } finally {
        updateLoading('items', false);
      }
    },
    [setState, updateLoading],
  );

  return {
    fetchZabbixTemplates,
    setSelectedTemplate,
    fetchZabbixMetrics,
    setSelectedMetric,
    fetchZabbixHosts,
    setSelectedHosts,
    fetchZabbixItems,
  };
};
