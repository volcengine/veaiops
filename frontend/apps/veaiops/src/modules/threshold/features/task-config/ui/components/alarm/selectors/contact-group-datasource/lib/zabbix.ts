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

import { API_RESPONSE_CODE } from '@veaiops/constants';
import { logger } from '@veaiops/utils';
import type { ZabbixUserGroup } from 'api-generate';
import apiClient from '@/utils/api-client';
import type {
  DataSourceOption,
  SelectDataSourceProps,
} from './types';

/**
 * Get Zabbix alert method (media type) data source configuration
 *
 * @param datasourceId - Data source ID
 * @returns Async function that returns options array
 */
export const getZabbixAlertMethodsDataSource = (
  datasourceId: string,
): ((
  props?: SelectDataSourceProps,
) => Promise<DataSourceOption[]>) => {
  return async (props?: SelectDataSourceProps) => {
    // Ensure datasourceId is a string
    const datasourceIdStr =
      typeof datasourceId === 'string' ? datasourceId : String(datasourceId);

    const pagination = props?.pageReq || { skip: 0, limit: 1000 };

    // ✅ Correct: Use logger to record debug information
    logger.debug({
      message: 'Starting to fetch media types',
      data: { datasourceId: datasourceIdStr, pagination },
      source: 'ZabbixAlertMethodsDataSource',
      component: 'getZabbixAlertMethodsDataSource',
    });

    try {
      // Note: Zabbix mediatypes API currently doesn't support pagination, so we only fetch data on first page
      if (pagination.skip > 0) {
        return []; // Return empty array when paginating, indicating no more data
      }

      const response =
        await apiClient.dataSources.getApisV1DatasourceZabbixDatasourceMediatypes(
          {
            datasourceId: datasourceIdStr,
          },
        );
      // ✅ Correct: Use logger to record debug information
      logger.debug({
        message: 'Media type response',
        data: { code: response.code, hasData: Boolean(response.data) },
        source: 'ZabbixAlertMethodsDataSource',
        component: 'getZabbixAlertMethodsDataSource',
      });
      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        const options =
          response?.data?.map((mediatype) => ({
            label: mediatype.name || '',
            value: mediatype.media_type_id || '',
            extra: mediatype,
          })) || [];

        // ✅ Correct: Use logger to record success information
        logger.info({
          message: 'Media types fetched successfully',
          data: { count: options.length, pagination },
          source: 'ZabbixAlertMethodsDataSource',
          component: 'getZabbixAlertMethodsDataSource',
        });

        return options;
      }

      // ✅ Correct: Use logger to record error
      logger.error({
        message: 'API returned error',
        data: {
          code: response.code,
          message: response.message,
          datasourceId: datasourceIdStr,
        },
        source: 'ZabbixAlertMethodsDataSource',
        component: 'getZabbixAlertMethodsDataSource',
      });
      return [];
    } catch (error: unknown) {
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Failed to fetch media types',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          datasourceId: datasourceIdStr,
          errorObj,
        },
        source: 'ZabbixAlertMethodsDataSource',
        component: 'getZabbixAlertMethodsDataSource',
      });
      return [];
    }
  };
};

/**
 * Get Zabbix media type data source configuration (maintain compatibility)
 *
 * @param datasourceId - Data source ID
 * @returns Async function that returns options array
 * @deprecated Use getZabbixAlertMethodsDataSource instead
 */
export const getZabbixMediatypeDataSource = (datasourceId: string) => {
  return getZabbixAlertMethodsDataSource(datasourceId);
};

/**
 * Get Zabbix contact group data source configuration
 *
 * @param datasourceId - Data source ID
 * @returns Async function that returns options array
 */
export const getZabbixContactGroupDataSource = (
  datasourceId: string,
): ((
  props?: SelectDataSourceProps,
) => Promise<DataSourceOption<ZabbixUserGroup>[]>) => {
  return async (props?: SelectDataSourceProps) => {
    const pagination = props?.pageReq || { skip: 0, limit: 100 };

    // ✅ Correct: Use logger to record debug information
    logger.debug({
      message: 'Starting to fetch contact groups',
      data: { datasourceId, pagination },
      source: 'ZabbixContactGroupDataSource',
      component: 'getZabbixContactGroupDataSource',
    });

    try {
      // Note: Zabbix usergroups API currently doesn't support pagination, so we only fetch data on first page
      if (pagination.skip > 0) {
        return []; // Return empty array when paginating, indicating no more data
      }

      const response =
        await apiClient.dataSources.getApisV1DatasourceZabbixDatasourceUsergroups(
          {
            datasourceId,
          },
        );

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        const options = response.data.map((group) => ({
          label: group.name || '',
          value: group.usrgrpid || '',
          extra: group,
        }));

        // ✅ Correct: Use logger to record success information
        logger.info({
          message: 'Contact groups fetched successfully',
          data: { count: options.length, pagination },
          source: 'ZabbixContactGroupDataSource',
          component: 'getZabbixContactGroupDataSource',
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
        source: 'ZabbixContactGroupDataSource',
        component: 'getZabbixContactGroupDataSource',
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
        source: 'ZabbixContactGroupDataSource',
        component: 'getZabbixContactGroupDataSource',
      });
      return [];
    }
  };
};
