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

import { Message } from '@arco-design/web-react';
import apiClient from '@/utils/api-client';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { extractApiErrorMessage, logger } from '@veaiops/utils';
import type {
  DataSourceOption,
  SelectDataSourceProps,
} from './types';

/**
 * 获取 Aliyun 联系组列表（函数式数据源）
 *
 * Aliyun 的联系组接口需要：
 * 1. 先通过 datasourceId 获取 DataSource 详情
 * 2. 从 DataSource 中提取 connect_id
 * 3. 使用 connect_id 调用联系组接口
 *
 * @param datasourceId - 数据源ID
 * @returns 异步函数，返回 options 数组
 */
export const getAliyunContactGroupDataSource = (
  datasourceId: string,
): ((
  props?: SelectDataSourceProps,
) => Promise<DataSourceOption[]>) => {
  return async (props?: SelectDataSourceProps) => {
    const pagination = props?.pageReq || { skip: 0, limit: 100 };

    // ✅ 正确：使用 logger 记录调试信息
    logger.debug({
      message: '开始获取联系组',
      data: { datasourceId, pagination },
      source: 'AliyunContactGroupDataSource',
      component: 'getAliyunContactGroupDataSource',
    });

    try {
      // 步骤1: 获取 DataSource 详情
      const datasourceResponse =
        await apiClient.dataSources.getApisV1DatasourceAliyun1({
          datasourceId,
        });

      if (datasourceResponse.code !== API_RESPONSE_CODE.SUCCESS) {
        // ✅ 正确：使用 logger 记录错误
        logger.error({
          message: '获取数据源信息失败',
          data: {
            code: datasourceResponse.code,
            message: datasourceResponse.message,
            datasourceId,
          },
          source: 'AliyunContactGroupDataSource',
          component: 'getAliyunContactGroupDataSource',
        });
        return [];
      }

      if (!datasourceResponse.data) {
        // ✅ 正确：使用 logger 记录错误
        logger.error({
          message: '数据源信息为空',
          data: { datasourceId },
          source: 'AliyunContactGroupDataSource',
          component: 'getAliyunContactGroupDataSource',
        });
        return [];
      }

      // 步骤2: 提取 connect_id
      const dataSourceData = datasourceResponse.data;
      const connectId =
        dataSourceData?.connect?.id || dataSourceData?.connect?._id;

      if (!connectId) {
        // ✅ 正确：使用 logger 记录错误
        logger.error({
          message: '数据源未配置连接信息',
          data: { datasourceId },
          source: 'AliyunContactGroupDataSource',
          component: 'getAliyunContactGroupDataSource',
        });
        return [];
      }

      // ✅ 正确：使用 logger 记录调试信息
      logger.debug({
        message: '使用 connect_id 获取联系组',
        data: { connectId, pagination },
        source: 'AliyunContactGroupDataSource',
        component: 'getAliyunContactGroupDataSource',
      });

      // 步骤3: 调用联系组接口，支持分页
      const response =
        await apiClient.dataSourceConnect.postApisV1DatasourceConnectAliyunDescribeContactGroupList(
          {
            connectId,
            skip: pagination.skip,
            limit: pagination.limit,
          },
        );

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        const options = response.data.map((group) => ({
          label: group.Name || '',
          value: group.Name || '',
          extra: group,
        }));

        // ✅ 正确：使用 logger 记录成功信息
        logger.info({
          message: '联系组获取成功',
          data: { count: options.length, pagination },
          source: 'AliyunContactGroupDataSource',
          component: 'getAliyunContactGroupDataSource',
        });

        return options;
      }

      // ✅ 正确：使用 logger 记录错误
      logger.error({
        message: '接口返回错误',
        data: {
          code: response.code,
          message: response.message,
          datasourceId,
        },
        source: 'AliyunContactGroupDataSource',
        component: 'getAliyunContactGroupDataSource',
      });
      return [];
    } catch (error: unknown) {
      // ✅ Use unified utility function to extract error message
      const errorMessage = extractApiErrorMessage(
        error,
        '获取联系组失败',
      );
      Message.error(errorMessage);
      logger.error({
        message: '获取联系组失败',
        data: {
          error: errorMessage,
          datasourceId,
        },
        source: 'AliyunContactGroupDataSource',
        component: 'getAliyunContactGroupDataSource',
      });
      return [];
    }
  };
};
