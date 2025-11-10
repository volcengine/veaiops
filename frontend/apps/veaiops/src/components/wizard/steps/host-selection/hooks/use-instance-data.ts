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
 * Instance selection step data management Hook
 * @description Handles instance data fetching for different data sources
 * @author AI Assistant
 * @date 2025-01-16
 */

import type {
  Connect,
  ZabbixHost,
  ZabbixTemplate,
  ZabbixTemplateMetric,
} from 'api-generate';
import { useEffect, useRef } from 'react';
import type {
  AliyunInstance,
  AliyunMetric,
  DataSourceType,
  VolcengineInstance,
  VolcengineMetric,
  WizardActions,
} from '../../../types';

// Define ZabbixMetric type alias
type ZabbixMetric = ZabbixTemplateMetric;

export interface UseInstanceDataProps {
  dataSourceType: DataSourceType;
  connect: Connect;
  // Zabbix related
  selectedTemplate?: ZabbixTemplate | null;
  selectedZabbixMetric?: ZabbixMetric | null;
  zabbixHosts: ZabbixHost[];
  // Alibaba Cloud related
  selectedAliyunMetric?: AliyunMetric | null;
  aliyunInstances: AliyunInstance[];
  // Volcano Engine related
  selectedVolcengineMetric?: VolcengineMetric | null;
  volcengineInstances: VolcengineInstance[];
  volcengineRegion?: string | null; // Volcano Engine region
  loading: boolean;
  actions: WizardActions;
}

export const useInstanceData = ({
  dataSourceType,
  connect,
  selectedTemplate,
  selectedZabbixMetric,
  zabbixHosts,
  selectedAliyunMetric,
  aliyunInstances,
  selectedVolcengineMetric,
  volcengineInstances,
  volcengineRegion,
  loading,
  actions,
}: UseInstanceDataProps) => {
  // Use useRef to track request state, preventing duplicate requests
  const requestTracker = useRef<{
    zabbix: string | null;
    aliyun: string | null;
    volcengine: string | null;
  }>({
    zabbix: null,
    aliyun: null,
    volcengine: null,
  });

  // Use useEffect to handle data fetching
  useEffect(() => {
    // Add debug logging
    if (process.env.NODE_ENV === 'development') {
      // Development mode debugging can be added here
    }

    // Zabbix data source handling
    if (
      dataSourceType === 'zabbix' &&
      connect?.name &&
      selectedTemplate?.templateid &&
      zabbixHosts.length === 0 &&
      !loading
    ) {
      const requestKey = `${connect.name}-${selectedTemplate.templateid}`;

      // Check if the same request has already been made
      if (requestTracker.current.zabbix !== requestKey) {
        requestTracker.current.zabbix = requestKey;
        actions.fetchZabbixHosts(connect.name, selectedTemplate.templateid);
      }
      // Already requested, skip
    }

    // Alibaba Cloud data source handling
    else if (
      dataSourceType === 'aliyun' &&
      connect?.name &&
      selectedAliyunMetric?.metricName &&
      aliyunInstances.length === 0 &&
      !loading
    ) {
      const requestKey = `${connect.name}-${selectedAliyunMetric.metricName}`;

      if (requestTracker.current.aliyun !== requestKey) {
        requestTracker.current.aliyun = requestKey;
        actions.fetchAliyunInstances(
          connect.name,
          selectedAliyunMetric.namespace,
          selectedAliyunMetric.metricName,
        );
      }
      // Already requested, skip
    }

    // Volcano Engine data source handling
    else if (
      dataSourceType === 'volcengine' &&
      connect?.name &&
      selectedVolcengineMetric?.metricName &&
      selectedVolcengineMetric?.namespace &&
      volcengineInstances.length === 0 &&
      !loading &&
      volcengineRegion && // Ensure region is selected
      volcengineRegion.trim() // Ensure region is not empty string
    ) {
      const requestKey = `${connect.name}-${volcengineRegion}-${selectedVolcengineMetric.metricName}`;

      if (requestTracker.current.volcengine !== requestKey) {
        requestTracker.current.volcengine = requestKey;

        try {
          actions.fetchVolcengineInstances(
            connect.name,
            volcengineRegion, // Use the passed region
            selectedVolcengineMetric.namespace,
            selectedVolcengineMetric.subNamespace || '',
            selectedVolcengineMetric.metricName,
          );
        } catch (error) {
          // Reset request tracker to allow retry
          requestTracker.current.volcengine = null;
        }
      }
    }
  }, [
    dataSourceType,
    connect?.name,
    selectedTemplate?.templateid,
    selectedZabbixMetric?.metric_name,
    selectedAliyunMetric?.metricName,
    selectedVolcengineMetric?.metricName,
    zabbixHosts.length,
    aliyunInstances.length,
    volcengineInstances.length,
    volcengineRegion,
    loading,
    actions,
  ]);

  // Reset request tracker when data source type or connect changes
  useEffect(() => {
    requestTracker.current = {
      zabbix: null,
      aliyun: null,
      volcengine: null,
    };
  }, [dataSourceType, connect?.name]);

  return {
    requestTracker,
  };
};
