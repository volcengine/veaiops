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
 * Aliyun data source operations Hook
 * @description Manages Aliyun-related API calls and state updates
 * @author AI Assistant
 * @date 2025-01-16
 */

import { Message } from '@arco-design/web-react';
import { logger } from '@veaiops/utils';
import { useCallback } from 'react';
import {
  fetchAliyunInstancesAPI,
  fetchAliyunMetricsAPI,
  fetchAliyunProjectsAPI,
} from '../../services/aliyun-api';
import type { WizardState } from '../../types';
import {
  getMockInstanceData,
  transformInstanceData,
  transformMetricData,
  transformProjectData,
} from '../../utils/data/transformers/aliyun';
import { validateConnectIdWithMessage } from '../../utils/validation/aliyun-validators';
import { useAliyunState } from '../state/use-aliyun-state';

export const useAliyunOperations = (
  state: WizardState,
  setState: React.Dispatch<React.SetStateAction<WizardState>>,
  updateLoading: (key: keyof WizardState['loading'], value: boolean) => void,
) => {
  const {
    updateProjects,
    setSelectNamespace, // Renamed: setSelectedProject -> setSelectNamespace
    updateMetrics,
    setSelectedMetric,
    updateInstances,
    setSelectedInstances,
    setSelectedGroupBy,
    setRegion,
    clearProjectData,
    clearMetricData,
  } = useAliyunState(setState);

  // Fetch Aliyun project list
  const fetchAliyunProjects = useCallback(
    async (connectId: string) => {
      // Validate connectId format
      const validation = validateConnectIdWithMessage(connectId);
      if (!validation.isValid) {
        Message.error(
          `连接ID格式无效: ${validation.errorMessage}`,
        );
        clearProjectData();
        return;
      }

      updateLoading('projects', true);
      try {
        const rawData = await fetchAliyunProjectsAPI(connectId);
        const projects = transformProjectData(rawData);
        updateProjects(projects);
      } catch (error) {
        Message.error('获取阿里云项目失败，请重试');
        clearProjectData();
      } finally {
        updateLoading('projects', false);
      }
    },
    [updateLoading, updateProjects, clearProjectData],
  );

  // Fetch Aliyun metrics
  const fetchAliyunMetrics = useCallback(
    async (connectId: string) => {
      updateLoading('metrics', true);
      try {
        const namespace = state.aliyun.selectNamespace?.project;
        if (!namespace) {
          throw new Error('请先选择命名空间');
        }

        // Region note: region is entered in the connection selection step
        // Reference: https://help.aliyun.com/document_detail/40654.html
        if (!state.aliyun.region) {
          // ✅ Note: empty region is allowed, will prompt user to input in next step
          // Log in development environment for debugging
          logger.debug({
            message: 'Aliyun region not set, will prompt user in connect step',
            data: { namespace: state.aliyun.selectNamespace?.name },
            source: 'AliyunOperations',
            component: 'fetchAliyunMetrics',
          });
        }

        const rawData = await fetchAliyunMetricsAPI(connectId, namespace);

        const metrics = transformMetricData(rawData);
        updateMetrics(metrics);
      } catch (error) {
        Message.error('获取阿里云指标失败，请重试');
        clearMetricData();
      } finally {
        updateLoading('metrics', false);
      }
    },
    [
      updateLoading,
      updateMetrics,
      clearMetricData,
      state.aliyun.selectNamespace,
    ],
  );

  // Fetch Aliyun instances
  const fetchAliyunInstances = useCallback(
    async (connectName: string, namespace: string, metricName: string) => {
      updateLoading('instances', true);
      try {
        // Read from state.aliyun.region (entered by user in connection selection step)
        const { region } = state.aliyun;
        if (!region) {
          throw new Error(
            '未选择有效的区域，无法获取实例列表',
          );
        }
        // Pass selected groupBy dimensions
        const groupBy =
          state.aliyun.selectedGroupBy.length > 0
            ? state.aliyun.selectedGroupBy
            : undefined;
        const rawData = await fetchAliyunInstancesAPI(
          connectName,
          namespace,
          metricName,
          region,
          groupBy,
        );
        const instances = transformInstanceData(rawData);
        updateInstances(instances);
      } catch (error) {
        Message.error('获取阿里云实例失败，请重试');

        // If API fails, use mock data as fallback
        const mockInstances = getMockInstanceData();
        updateInstances(mockInstances);
      } finally {
        updateLoading('instances', false);
      }
    },
    [
      updateLoading,
      updateInstances,
      state.aliyun.selectNamespace,
      state.aliyun.selectedGroupBy,
    ],
  );

  return {
    fetchAliyunProjects,
    setSelectNamespace, // Renamed: setSelectedProject -> setSelectNamespace
    fetchAliyunMetrics,
    setSelectedAliyunMetric: setSelectedMetric,
    fetchAliyunInstances,
    setSelectedAliyunInstances: setSelectedInstances,
    setSelectedGroupBy,
    setAliyunRegion: setRegion,
  };
};
