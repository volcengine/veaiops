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

import apiClient from '@/utils/api-client';
import type { RequestParams } from '../types';

/**
 * Call API based on datasource type
 */
export const callTimeseriesApi = async ({
  datasourceTypeNormalized,
  datasourceId,
  startTime,
  endTime,
  instances,
}: RequestParams) => {
  const requestBody = {
    datasource_id: datasourceId,
    start_time: Math.floor(startTime / 1000), // Convert to second-level timestamp
    end_time: Math.floor(endTime / 1000),
    period: '60s', // Default 1-minute sampling period
    instances,
  };

  if (datasourceTypeNormalized === 'volcengine') {
    return await apiClient.dataSources.postApisV1DatasourceVolcengineMetricsTimeseries(
      {
        requestBody,
      },
    );
  } else if (datasourceTypeNormalized === 'aliyun') {
    return await apiClient.dataSources.postApisV1DatasourceAliyunMetricsTimeseries(
      {
        requestBody,
      },
    );
  } else if (datasourceTypeNormalized === 'zabbix') {
    return await apiClient.dataSources.postApisV1DatasourceZabbixMetricsTimeseries(
      {
        requestBody,
      },
    );
  } else {
    throw new Error(`Unsupported datasource type: ${datasourceTypeNormalized}`);
  }
};
