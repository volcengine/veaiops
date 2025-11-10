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
 * Metric selection step data management Hook
 * @description Handles metric data fetching for different data sources
 * @author AI Assistant
 * @date 2025-01-16
 */

import { DataSource } from '@veaiops/api-client';
import { logger } from '@veaiops/utils';
import type {
  Connect,
  ZabbixTemplate,
  ZabbixTemplateMetric,
} from 'api-generate';
import { useEffect, useRef } from 'react';
import type {
  AliyunMetric,
  DataSourceType,
  VolcengineMetric,
  WizardActions,
} from '../../../types';

// Define ZabbixMetric type alias
type ZabbixMetric = ZabbixTemplateMetric;

export interface UseMetricDataProps {
  dataSourceType: DataSourceType;
  connect: Connect;
  selectedTemplate?: ZabbixTemplate | null;
  zabbixMetrics: ZabbixMetric[];
  aliyunMetrics: AliyunMetric[];
  volcengineMetrics: VolcengineMetric[];
  loading: boolean;
  actions: WizardActions;
}

export const useMetricData = ({
  dataSourceType,
  connect,
  selectedTemplate,
  zabbixMetrics,
  aliyunMetrics,
  volcengineMetrics,
  loading,
  actions,
}: UseMetricDataProps) => {
  // Use useRef to track request state, prevent duplicate requests
  const requestTracker = useRef<{
    zabbix: string | null;
    aliyun: string | null;
    volcengine: boolean;
  }>({
    zabbix: null,
    aliyun: null,
    volcengine: false,
  });

  // Use useEffect to handle data fetching
  useEffect(() => {
    // ✅ Add debug logging (using logger instead of console)
    logger.debug({
      message: 'useMetricData effect triggered',
      data: {
        dataSourceType,
        connectName: connect?.name,
        hasTemplate: Boolean(selectedTemplate),
        metricsCount: zabbixMetrics.length,
        loading,
      },
      source: 'UseMetricData',
      component: 'effect',
    });

    // Zabbix data source handling
    if (
      dataSourceType === DataSource.type.ZABBIX &&
      connect?.name &&
      selectedTemplate?.templateid &&
      zabbixMetrics.length === 0 &&
      !loading
    ) {
      const requestKey = `${connect.name}-${selectedTemplate.templateid}`;

      // Check if same request has already been made
      if (requestTracker.current.zabbix !== requestKey) {
        requestTracker.current.zabbix = requestKey;
        actions.fetchZabbixMetrics(connect.name, selectedTemplate.templateid);
      }
    }

    // Aliyun data source handling
    else if (
      dataSourceType === DataSource.type.ALIYUN &&
      connect?.name &&
      aliyunMetrics.length === 0 &&
      !loading
    ) {
      const requestKey = connect.name;

      if (requestTracker.current.aliyun !== requestKey) {
        requestTracker.current.aliyun = requestKey;
        // ✅ Fixed: Remove unnecessary type assertion, use conditional check instead
        const connectId = connect.id || connect._id;
        if (connectId) {
          actions.fetchAliyunMetrics(connectId);
        }
      }
    }

    // Volcengine data source handling
    else if (
      dataSourceType === DataSource.type.VOLCENGINE &&
      volcengineMetrics.length === 0 &&
      !loading
    ) {
      if (!requestTracker.current.volcengine) {
        requestTracker.current.volcengine = true;
        actions.fetchVolcengineMetrics();
      }
    }
  }, [
    dataSourceType,
    connect?.name,
    selectedTemplate?.templateid,
    zabbixMetrics.length,
    aliyunMetrics.length,
    volcengineMetrics.length,
    loading,
    actions,
  ]);

  // Reset request tracker when data source type or connection changes
  useEffect(() => {
    requestTracker.current = {
      zabbix: null,
      aliyun: null,
      volcengine: false,
    };
  }, [dataSourceType, connect?.name]);

  return {
    requestTracker,
  };
};
