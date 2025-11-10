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
 * Aliyun data source update function
 */

import type { WizardState } from '@/components/wizard/types';
import apiClient from '@/utils/api-client';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type { AliyunDataSourceConfig } from 'api-generate';
import type { CreateResult } from '../types';
import { processApiError } from '../utils';

export const updateAliyunDataSource = async (
  datasourceId: string,
  state: WizardState,
): Promise<CreateResult> => {
  const config: AliyunDataSourceConfig = {
    name: state.dataSourceName,
    connect_name: state.selectedConnect!.name,
    // Read from state.aliyun.region (entered by user in connection selection step)
    region: state.aliyun.region || 'cn-beijing',
    namespace: state.aliyun.selectedMetric!.namespace,
    metric_name: state.aliyun.selectedMetric!.metricName,
    dimensions:
      state.aliyun.selectedInstances.length > 0
        ? state.aliyun.selectedInstances.map((instance) => instance.dimensions)
        : undefined,
    // Add grouping dimensions
    group_by:
      state.aliyun.selectedGroupBy.length > 0
        ? state.aliyun.selectedGroupBy
        : undefined,
  };

  try {
    const response = await apiClient.dataSources.putApisV1DatasourceAliyun({
      datasourceId,
      requestBody: config,
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      return {
        success: true,
        message: '数据源更新成功',
        dataSourceId: response.data._id,
      };
    }

    return {
      success: false,
      message: response.message || '更新失败',
      error: response.message,
    };
  } catch (error: unknown) {
    const errorMessage = processApiError({
      error,
      operation: 'update',
      component: 'updateAliyunDataSource',
      config,
    });

    const errorObj = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      message: errorMessage,
      error: errorObj.message,
    };
  }
};
