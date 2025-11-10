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
 * Connection test Hook
 */

import apiClient from '@/utils/api-client';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type { ConnectCreateRequest } from 'api-generate';
import { useCallback, useState } from 'react';

/**
 * Connection test result type
 */
interface TestResult {
  success: boolean;
  message: string;
  details?: any;
}

interface UseConnectionTestReturn {
  testing: boolean;
  testResult: TestResult | null;
  testConnection: (
    connectId: string,
    customParams?: Partial<ConnectCreateRequest>,
  ) => Promise<TestResult>;
  testConnectionConfig: (config: ConnectCreateRequest) => Promise<TestResult>;
  clearResult: () => void;
}

export const useConnectionTest = (): UseConnectionTestReturn => {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  /**
   * Build connection parameters for Zabbix type
   */
  const buildZabbixParams = useCallback(
    (connect: any, customParams?: Partial<ConnectCreateRequest>) => ({
      zabbix_api_url:
        customParams?.zabbix_api_url || connect.zabbix_api_url || '',
      zabbix_api_user:
        customParams?.zabbix_api_user || connect.zabbix_api_user || '',
      zabbix_api_password: customParams?.zabbix_api_password || '',
    }),
    [],
  );

  /**
   * Build connection parameters for Aliyun type
   */
  const buildAliyunParams = useCallback(
    (connect: any, customParams?: Partial<ConnectCreateRequest>) => ({
      aliyun_access_key_id:
        customParams?.aliyun_access_key_id ||
        connect.aliyun_access_key_id ||
        '',
      aliyun_access_key_secret: customParams?.aliyun_access_key_secret || '',
    }),
    [],
  );

  /**
   * Build connection parameters for Volcengine type
   */
  const buildVolcengineParams = useCallback(
    (connect: any, customParams?: Partial<ConnectCreateRequest>) => ({
      volcengine_access_key_id:
        customParams?.volcengine_access_key_id ||
        connect.volcengine_access_key_id ||
        '',
      volcengine_access_key_secret:
        customParams?.volcengine_access_key_secret || '',
    }),
    [],
  );

  /**
   * Build connection request based on data source type
   */
  const buildConnectRequest = useCallback(
    (
      connect: any,
      customParams?: Partial<ConnectCreateRequest>,
    ): ConnectCreateRequest => {
      const baseRequest: ConnectCreateRequest = {
        name: connect.name,
        type: connect.type,
      };

      switch (connect.type) {
        case 'Zabbix':
          return {
            ...baseRequest,
            ...buildZabbixParams(connect, customParams),
          };
        case 'Aliyun':
          return {
            ...baseRequest,
            ...buildAliyunParams(connect, customParams),
          };
        case 'Volcengine':
          return {
            ...baseRequest,
            ...buildVolcengineParams(connect, customParams),
          };
        default:
          return baseRequest;
      }
    },
    [buildZabbixParams, buildAliyunParams, buildVolcengineParams],
  );

  /**
   * Handle API error response
   */
  const handleApiError = useCallback((error: any): string => {
    let errorMessage = '连接测试失败';
    if (error && typeof error === 'object' && 'body' in error) {
      const apiError = error;
      if (
        apiError.body &&
        typeof apiError.body === 'object' &&
        'message' in apiError.body
      ) {
        errorMessage = apiError.body.message || '连接测试失败';
      } else if (apiError.body && typeof apiError.body === 'string') {
        errorMessage = apiError.body;
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return errorMessage;
  }, []);

  const testConnection = useCallback(
    async (
      connectId: string,
      customParams?: Partial<ConnectCreateRequest>,
    ): Promise<TestResult> => {
      try {
        setTesting(true);
        setTestResult(null);

        // First get connection configuration
        const connectResponse =
          await apiClient.dataSourceConnect.getApisV1DatasourceConnect1({
            connectId,
          });

        if (
          connectResponse.code !== API_RESPONSE_CODE.SUCCESS ||
          !connectResponse.data
        ) {
          throw new Error(connectResponse.message || '获取连接配置失败');
        }

        const connect = connectResponse.data;
        const connectCreateRequest = buildConnectRequest(connect, customParams);

        // Directly call /dail endpoint for testing
        const response =
          await apiClient.dataSourceConnect.postApisV1DatasourceConnectDail({
            requestBody: connectCreateRequest,
          });

        const result: TestResult = {
          success: response.code === API_RESPONSE_CODE.SUCCESS,
          message:
            response.code === API_RESPONSE_CODE.SUCCESS
              ? '连接测试成功'
              : response.message || '连接测试失败',
          details: response.data,
        };
        setTestResult(result);
        return result;
      } catch (error) {
        // Handle API error response
        let errorMessage = '连接测试失败';
        if (error && typeof error === 'object' && 'body' in error) {
          const apiError = error as any;
          if (
            apiError.body &&
            typeof apiError.body === 'object' &&
            'message' in apiError.body
          ) {
            errorMessage = apiError.body.message || '连接测试失败';
          } else if (apiError.body && typeof apiError.body === 'string') {
            errorMessage = apiError.body;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        const result: TestResult = {
          success: false,
          message: errorMessage,
        };

        setTestResult(result);
        return result;
      } finally {
        // Operation completed
        setTesting(false);
      }
    },
    [buildConnectRequest, handleApiError],
  );

  const testConnectionConfig = useCallback(
    async (config: ConnectCreateRequest): Promise<TestResult> => {
      try {
        setTesting(true);
        setTestResult(null);

        const response =
          await apiClient.dataSourceConnect.postApisV1DatasourceConnectDail({
            requestBody: config,
          });

        const result: TestResult = {
          success: response.code === API_RESPONSE_CODE.SUCCESS,
          message:
            response.code === API_RESPONSE_CODE.SUCCESS
              ? '连接测试成功'
              : response.message || '连接测试失败',
          details: response.data,
        };

        setTestResult(result);
        return result;
      } catch (error) {
        // Handle API error response
        let errorMessage = '连接测试失败';
        if (error && typeof error === 'object' && 'body' in error) {
          const apiError = error as any;
          if (
            apiError.body &&
            typeof apiError.body === 'object' &&
            'message' in apiError.body
          ) {
            errorMessage = apiError.body.message || '连接测试失败';
          } else if (apiError.body && typeof apiError.body === 'string') {
            errorMessage = apiError.body;
          }
        } else if (error instanceof Error) {
          errorMessage = error.message;
        }

        const result: TestResult = {
          success: false,
          message: errorMessage,
        };

        setTestResult(result);
        return result;
      } finally {
        // Operation completed
        setTesting(false);
      }
    },
    [],
  );

  const clearResult = useCallback(() => {
    setTestResult(null);
  }, []);

  return {
    testing,
    testResult,
    testConnection,
    testConnectionConfig,
    clearResult,
  };
};
