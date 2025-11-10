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
 * Aliyun state management Hook
 * @description Manages Aliyun-related state update logic
 * @author AI Assistant
 * @date 2025-01-16
 */

import { useCallback } from 'react';
import type {
  AliyunInstance,
  AliyunMetric,
  AliyunProject,
  WizardState,
} from '../../types';

export const useAliyunState = (
  setState: React.Dispatch<React.SetStateAction<WizardState>>,
) => {
  // Update project list
  const updateProjects = useCallback(
    (projects: AliyunProject[], hasAttemptedFetch = true) => {
      setState((prev) => ({
        ...prev,
        aliyun: { ...prev.aliyun, projects, hasAttemptedFetch },
      }));
    },
    [setState],
  );

  // Set selected namespace (renamed: setSelectedProject -> setSelectNamespace)
  const setSelectNamespace = useCallback(
    (namespace: AliyunProject | null) => {
      setState((prev) => ({
        ...prev,
        aliyun: {
          ...prev.aliyun,
          selectNamespace: namespace,
          // Clear all dependent data when switching namespace
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

  // Update metrics list
  const updateMetrics = useCallback(
    (metrics: AliyunMetric[]) => {
      setState((prev) => ({
        ...prev,
        aliyun: { ...prev.aliyun, metrics },
      }));
    },
    [setState],
  );

  // Set selected metric
  const setSelectedMetric = useCallback(
    (metric: AliyunMetric | null) => {
      setState((prev) => ({
        ...prev,
        aliyun: {
          ...prev.aliyun,
          selectedMetric: metric,
          // Clear instances and groups when switching metrics to prevent data inconsistency
          instances: [],
          selectedInstances: [],
          selectedGroupBy: [],
        },
      }));
    },
    [setState],
  );

  // Update instances list
  const updateInstances = useCallback(
    (instances: AliyunInstance[]) => {
      setState((prev) => ({
        ...prev,
        aliyun: { ...prev.aliyun, instances },
      }));
    },
    [setState],
  );

  // Set selected instances
  const setSelectedInstances = useCallback(
    (instances: AliyunInstance[]) => {
      setState((prev) => ({
        ...prev,
        aliyun: { ...prev.aliyun, selectedInstances: instances },
      }));
    },
    [setState],
  );

  // Set selected groupBy dimensions
  const setSelectedGroupBy = useCallback(
    (groupBy: string[]) => {
      setState((prev) => ({
        ...prev,
        aliyun: { ...prev.aliyun, selectedGroupBy: groupBy },
      }));
    },
    [setState],
  );

  // Set Region (update to independent aliyun.region field)
  const setRegion = useCallback(
    (region: string) => {
      setState((prev) => ({
        ...prev,
        aliyun: {
          ...prev.aliyun,
          region, // Update independent region field
        },
      }));
    },
    [setState],
  );

  // Clear project-related data
  const clearProjectData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      aliyun: {
        ...prev.aliyun,
        projects: [],
        selectNamespace: null, // Renamed: selectedProject -> selectNamespace
        hasAttemptedFetch: true,
      },
    }));
  }, [setState]);

  // Clear metric-related data
  const clearMetricData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      aliyun: {
        ...prev.aliyun,
        metrics: [],
        selectedMetric: null,
      },
    }));
  }, [setState]);

  // Clear instance-related data
  const clearInstanceData = useCallback(() => {
    setState((prev) => ({
      ...prev,
      aliyun: {
        ...prev.aliyun,
        instances: [],
        selectedInstances: [],
      },
    }));
  }, [setState]);

  return {
    updateProjects,
    setSelectNamespace, // Renamed: setSelectedProject -> setSelectNamespace
    updateMetrics,
    setSelectedMetric,
    updateInstances,
    setSelectedInstances,
    setSelectedGroupBy,
    setRegion, // Update independent aliyun.region field
    clearProjectData,
    clearMetricData,
    clearInstanceData,
  };
};
