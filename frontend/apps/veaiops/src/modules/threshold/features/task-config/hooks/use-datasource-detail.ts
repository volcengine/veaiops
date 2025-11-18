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
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import { extractApiErrorMessage, logger } from '@veaiops/utils';
import type { DataSource } from 'api-generate';
import { useCallback, useState } from 'react';

interface FetchDatasourceDetailParams {
  datasourceId: string;
  datasourceType: 'Volcengine' | 'Aliyun' | 'Zabbix';
}

/**
 * 数据源详情管理 Hook
 *
 * 功能：
 * - 根据数据源类型和ID获取数据源详情
 * - 支持 Volcengine、Aliyun、Zabbix 三种数据源类型
 * - 统一的错误处理和日志记录
 */
export const useDatasourceDetail = () => {
  const [datasource, setDatasource] = useState<DataSource | null>(null);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  /**
   * 获取数据源详情
   *
   * 根据不同的数据源类型调用对应的 API 接口
   */
  const fetchDatasourceDetail = useCallback(
    async ({
      datasourceId,
      datasourceType,
    }: FetchDatasourceDetailParams): Promise<{
      success: boolean;
      error?: Error;
    }> => {
      if (!datasourceId) {
        return {
          success: false,
          error: new Error('数据源ID不能为空'),
        };
      }

      try {
        setLoading(true);

        logger.info({
          message: '开始获取数据源详情',
          data: { datasourceId, datasourceType },
          source: 'useDatasourceDetail',
          component: 'fetchDatasourceDetail',
        });

        let response;

        // 根据数据源类型调用对应的 API 接口
        switch (datasourceType) {
          case 'Volcengine':
            response =
              await apiClient.dataSources.getApisV1DatasourceVolcengineDatasourceId(
                {
                  datasourceId,
                },
              );
            break;
          case 'Aliyun':
            response = await apiClient.dataSources.getApisV1DatasourceAliyun1({
              datasourceId,
            });
            break;
          case 'Zabbix':
            response = await apiClient.dataSources.getApisV1DatasourceZabbix1({
              datasourceId,
            });
            break;
          default:
            return {
              success: false,
              error: new Error(`不支持的数据源类型: ${datasourceType}`),
            };
        }

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          setDatasource(response.data);
          setVisible(true);

          logger.info({
            message: '获取数据源详情成功',
            data: {
              datasourceId,
              datasourceType,
              datasourceName: response.data.name,
            },
            source: 'useDatasourceDetail',
            component: 'fetchDatasourceDetail',
          });

          return { success: true };
        } else {
          const errorMessage = '获取数据源详情失败';
          Message.error(errorMessage);

          logger.error({
            message: errorMessage,
            data: {
              datasourceId,
              datasourceType,
              responseCode: response.code,
            },
            source: 'useDatasourceDetail',
            component: 'fetchDatasourceDetail',
          });

          return {
            success: false,
            error: new Error(errorMessage),
          };
        }
      } catch (error: unknown) {
        // ✅ Use unified utility function to extract error message
        const errorMessage = extractApiErrorMessage(
          error,
          '获取数据源详情失败，请重试',
        );
        Message.error(errorMessage);

        return {
          success: false,
          error: error instanceof Error ? error : new Error(errorMessage),
        };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  /**
   * 关闭抽屉
   */
  const handleClose = useCallback(() => {
    setVisible(false);
    setDatasource(null);
  }, []);

  return {
    datasource,
    loading,
    visible,
    fetchDatasourceDetail,
    handleClose,
  };
};
