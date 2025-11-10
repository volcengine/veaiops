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
 * Data source wizard state management Hook
 * @description Manages wizard's basic state and common operations
 * @author AI Assistant
 * @date 2025-01-16
 */

import type { Connect } from 'api-generate';
import { useCallback, useState } from 'react';
import { type DataSourceType, type WizardState, WizardStep } from '../../types';

// Initial state
const initialState: WizardState = {
  currentStep: WizardStep.TYPE_SELECTION,
  dataSourceType: null,
  connects: [],
  selectedConnect: null,
  dataSourceName: '',
  dataSourceDescription: '',

  zabbix: {
    templates: [],
    selectedTemplate: null,
    metrics: [],
    selectedMetric: null,
    hosts: [],
    selectedHosts: [],
    items: [],
    searchText: '',
  },

  aliyun: {
    projects: [],
    selectNamespace: null, // Renamed: selectedProject -> selectNamespace
    metrics: [],
    selectedMetric: null,
    instances: [],
    selectedInstances: [],
    selectedGroupBy: [],
    hasAttemptedFetch: false,
    region: null, // Region ID (entered by user in connection selection step)
    searchText: '',
  },

  volcengine: {
    products: [],
    selectedProduct: null,
    subNamespaces: [],
    selectedSubNamespace: null,
    metrics: [],
    selectedMetric: null,
    instances: [],
    selectedInstances: [],
    selectedGroupBy: [],
    region: null, // Default empty, entered by user
    searchText: '',
  },

  loading: {
    connects: false,
    templates: false,
    metrics: false,
    hosts: false,
    items: false,
    projects: false,
    instances: false,
    products: false,
    subNamespaces: false,
    creating: false,
  },
};

export const useWizardState = () => {
  const [state, setState] = useState<WizardState>(initialState);

  // Common operations
  const setCurrentStep = useCallback(
    (step: number) => {
      setState((prev) => ({ ...prev, currentStep: step }));
    },
    [state.currentStep],
  );

  const setDataSourceType = useCallback(
    (type: DataSourceType | null) => {
      setState((prev) => ({ ...prev, dataSourceType: type }));
    },
    [state.dataSourceType],
  );

  const setSelectedConnect = useCallback(
    (connect: Connect | null) => {
      setState((prev) => ({
        ...prev,
        selectedConnect: connect,
        // Clear all related state when switching connections
        zabbix: {
          ...prev.zabbix,
          templates: [],
          selectedTemplate: null,
          metrics: [],
          selectedMetric: null,
          hosts: [],
          selectedHosts: [],
          items: [],
          searchText: '',
        },
        aliyun: {
          ...prev.aliyun,
          projects: [],
          selectNamespace: null, // Renamed: selectedProject -> selectNamespace
          metrics: [],
          selectedMetric: null,
          instances: [],
          selectedInstances: [],
          selectedGroupBy: [],
          searchText: '',
        },
        volcengine: {
          ...prev.volcengine,
          products: [],
          selectedProduct: null,
          subNamespaces: [],
          selectedSubNamespace: null,
          metrics: [],
          selectedMetric: null,
          instances: [],
          selectedInstances: [],
          selectedGroupBy: [],
          region: '', // Clear when switching connections, user re-enters
          searchText: '',
        },
      }));
    },
    [state.selectedConnect],
  );

  const setDataSourceName = useCallback(
    (name: string) => {
      setState((prev) => ({ ...prev, dataSourceName: name }));
    },
    [state.dataSourceName],
  );

  const setDataSourceDescription = useCallback(
    (description: string) => {
      setState((prev) => ({ ...prev, dataSourceDescription: description }));
    },
    [state.dataSourceDescription],
  );

  const setEditingDataSourceId = useCallback((id?: string) => {
    setState((prev) => ({ ...prev, editingDataSourceId: id }));
  }, []);

  const resetWizard = useCallback(() => {
    setState({
      ...initialState,
      currentStep: WizardStep.TYPE_SELECTION,
      dataSourceType: null,
      selectedConnect: null,
    });
  }, [state.currentStep, state.dataSourceType, state.selectedConnect]);

  const updateLoading = useCallback(
    (loadingKey: keyof WizardState['loading'], value: boolean) => {
      setState((prev) => ({
        ...prev,
        loading: { ...prev.loading, [loadingKey]: value },
      }));
    },
    [],
  );

  const setZabbixSearchText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      zabbix: { ...prev.zabbix, searchText: text },
    }));
  }, []);

  const setAliyunSearchText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      aliyun: { ...prev.aliyun, searchText: text },
    }));
  }, []);

  const setVolcengineSearchText = useCallback((text: string) => {
    setState((prev) => ({
      ...prev,
      volcengine: { ...prev.volcengine, searchText: text },
    }));
  }, []);

  return {
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
  };
};
