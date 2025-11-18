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
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { extractApiErrorMessage, logger } from '@veaiops/utils';
import type { ZabbixUserGroup } from 'api-generate';
import apiClient from '@/utils/api-client';
import type {
  DataSourceOption,
  SelectDataSourceProps,
} from './types';

/**
 * 获取 Zabbix 告警方式（媒介类型）数据源配置
 *
 * @param datasourceId - 数据源ID
 * @returns 异步函数，返回 options 数组
 */
export const getZabbixAlertMethodsDataSource = (
  datasourceId: string,
): ((
  props?: SelectDataSourceProps,
) => Promise<DataSourceOption[]>) => {
  return async (props?: SelectDataSourceProps) => {
    // 确保datasourceId是字符串
    const datasourceIdStr =
      typeof datasourceId === 'string' ? datasourceId : String(datasourceId);

    const pagination = props?.pageReq || { skip: 0, limit: 1000 };

    // ✅ 正确：使用 logger 记录调试信息
    logger.debug({
      message: '开始获取媒介类型',
      data: { datasourceId: datasourceIdStr, pagination },
      source: 'ZabbixAlertMethodsDataSource',
      component: 'getZabbixAlertMethodsDataSource',
    });

    try {
      // 注意：Zabbix的mediatypes接口目前不支持分页，所以我们只在第一页时获取数据
      if (pagination.skip > 0) {
        return []; // 分页时返回空数组，表示没有更多数据
      }

      const response =
        await apiClient.dataSources.getApisV1DatasourceZabbixDatasourceMediatypes(
          {
            datasourceId: datasourceIdStr,
          },
        );
      // ✅ 正确：使用 logger 记录调试信息
      logger.debug({
        message: '媒介类型响应',
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

        // ✅ 正确：使用 logger 记录成功信息
        logger.info({
          message: '媒介类型获取成功',
          data: { count: options.length, pagination },
          source: 'ZabbixAlertMethodsDataSource',
          component: 'getZabbixAlertMethodsDataSource',
        });

        return options;
      }

      // ✅ 正确：使用 logger 记录错误
      logger.error({
        message: '接口返回错误',
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
      // ✅ Use unified utility function to extract error message
      const errorMessage = extractApiErrorMessage(
        error,
        '获取媒介类型失败',
      );
      Message.error(errorMessage);
      logger.error({
        message: '获取媒介类型失败',
        data: {
          error: errorMessage,
          datasourceId: datasourceIdStr,
        },
        source: 'ZabbixAlertMethodsDataSource',
        component: 'getZabbixAlertMethodsDataSource',
      });
      return [];
    }
  };
};

/**
 * 获取 Zabbix 媒介类型数据源配置（保持兼容性）
 *
 * @param datasourceId - 数据源ID
 * @returns 异步函数，返回 options 数组
 * @deprecated 使用 getZabbixAlertMethodsDataSource 代替
 */
export const getZabbixMediatypeDataSource = (datasourceId: string) => {
  return getZabbixAlertMethodsDataSource(datasourceId);
};

/**
 * 获取 Zabbix 联系组数据源配置
 *
 * @param datasourceId - 数据源ID
 * @returns 异步函数，返回 options 数组
 */
export const getZabbixContactGroupDataSource = (
  datasourceId: string,
): ((
  props?: SelectDataSourceProps,
) => Promise<DataSourceOption<ZabbixUserGroup>[]>) => {
  return async (props?: SelectDataSourceProps) => {
    const pagination = props?.pageReq || { skip: 0, limit: 100 };

    // ✅ 正确：使用 logger 记录调试信息
    logger.debug({
      message: '开始获取联系组',
      data: { datasourceId, pagination },
      source: 'ZabbixContactGroupDataSource',
      component: 'getZabbixContactGroupDataSource',
    });

    try {
      // 注意：Zabbix的usergroups接口目前不支持分页，所以我们只在第一页时获取数据
      if (pagination.skip > 0) {
        return []; // 分页时返回空数组，表示没有更多数据
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

        // ✅ 正确：使用 logger 记录成功信息
        logger.info({
          message: '联系组获取成功',
          data: { count: options.length, pagination },
          source: 'ZabbixContactGroupDataSource',
          component: 'getZabbixContactGroupDataSource',
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
        source: 'ZabbixContactGroupDataSource',
        component: 'getZabbixContactGroupDataSource',
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
        source: 'ZabbixContactGroupDataSource',
        component: 'getZabbixContactGroupDataSource',
      });
      return [];
    }
  };
};
