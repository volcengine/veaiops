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
 * 阿里云API服务层
 * @description 封装阿里云相关的API调用
 * @author AI Assistant
 * @date 2025-01-16
 */

import apiClient from '@/utils/api-client';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type { AliyunMetricMetaListPayload } from 'api-generate';

/**
 * 获取阿里云项目列表
 */
export const fetchAliyunProjectsAPI = async (connectId: string) => {
  const response =
    await apiClient.dataSourceConnect.postApisV1DatasourceConnectAliyunDescribeProjectMeta(
      {
        connectId,
        requestBody: {},
        skip: 0,
        limit: 1000,
      },
    );

  if (response.code !== API_RESPONSE_CODE.SUCCESS || !response.data) {
    throw new Error(response.message || '获取项目列表失败');
  }

  return response.data;
};

/**
 * 获取阿里云指标列表
 */
export const fetchAliyunMetricsAPI = async (
  connectId: string,
  namespace: string,
) => {
  const response =
    await apiClient.dataSourceConnect.postApisV1DatasourceConnectAliyunDescribeMetricMetaList(
      {
        connectId,
        requestBody: { namespace } as AliyunMetricMetaListPayload,
        limit: 1000,
      },
    );

  if (response.code !== API_RESPONSE_CODE.SUCCESS || !response.data) {
    throw new Error(response.message || '获取监控项失败');
  }

  return response.data;
};

/**
 * 获取阿里云实例列表
 */
export const fetchAliyunInstancesAPI = async (
  connectName: string,
  namespace: string,
  metricName: string,
  region: string,
  groupBy?: string[],
) => {
  const response =
    await apiClient.dataSourceConnect.postApisV1DatasourceConnectAliyunMetricsInstances(
      {
        requestBody: {
          connect_name: connectName,
          namespace,
          metric_name: metricName,
          region,
          group_by: groupBy,
        },
      },
    );

  if (response.code !== API_RESPONSE_CODE.SUCCESS || !response.data) {
    throw new Error(response.message || '获取实例列表失败');
  }

  return response.data;
};
