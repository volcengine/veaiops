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
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type {
  DataSourceOption,
  SelectDataSourceProps,
} from './types';

/**
 * Get Aliyun contact group list (functional data source)
 *
 * Aliyun contact group API requires:
 * 1. First get DataSource details through datasourceId
 * 2. Extract connect_id from DataSource
 * 3. Use connect_id to call contact group API
 *
 * @param datasourceId - Data source ID
 * @returns Async function that returns options array
 */
export const getAliyunContactGroupDataSource = (
  datasourceId: string,
): ((
  props?: SelectDataSourceProps,
) => Promise<DataSourceOption[]>) => {
  return async (props?: SelectDataSourceProps) => {
    const pagination = props?.pageReq || { skip: 0, limit: 100 };

    // ✅ Correct: Use logger to record debug information
    logger.debug({
      message: 'Starting to fetch contact groups',
      data: { datasourceId, pagination },
      source: 'AliyunContactGroupDataSource',
      component: 'getAliyunContactGroupDataSource',
    });

    try {
      // Step 1: Get DataSource details
      const datasourceResponse =
        await apiClient.dataSources.getApisV1DatasourceAliyun1({
          datasourceId,
        });

      if (datasourceResponse.code !== API_RESPONSE_CODE.SUCCESS) {
        // ✅ Correct: Use logger to record error
        logger.error({
          message: 'Failed to fetch datasource information',
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
        // ✅ Correct: Use logger to record error
        logger.error({
          message: 'Datasource information is empty',
          data: { datasourceId },
          source: 'AliyunContactGroupDataSource',
          component: 'getAliyunContactGroupDataSource',
        });
        return [];
      }

      // Step 2: Extract connect_id
      const dataSourceData = datasourceResponse.data;
      const connectId =
        dataSourceData?.connect?.id || dataSourceData?.connect?._id;

      if (!connectId) {
        // ✅ Correct: Use logger to record error
        logger.error({
          message: 'Datasource connection information not configured',
          data: { datasourceId },
          source: 'AliyunContactGroupDataSource',
          component: 'getAliyunContactGroupDataSource',
        });
        return [];
      }

      // ✅ Correct: Use logger to record debug information
      logger.debug({
        message: 'Using connect_id to fetch contact groups',
        data: { connectId, pagination },
        source: 'AliyunContactGroupDataSource',
        component: 'getAliyunContactGroupDataSource',
      });

      // Step 3: Call contact group API, supports pagination
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

        // ✅ Correct: Use logger to record success information
        logger.info({
          message: 'Contact groups fetched successfully',
          data: { count: options.length, pagination },
          source: 'AliyunContactGroupDataSource',
          component: 'getAliyunContactGroupDataSource',
        });

        return options;
      }

      // ✅ Correct: Use logger to record error
      logger.error({
        message: 'API returned error',
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
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Failed to fetch contact groups',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          datasourceId,
          errorObj,
        },
        source: 'AliyunContactGroupDataSource',
        component: 'getAliyunContactGroupDataSource',
      });
      return [];
    }
  };
};
