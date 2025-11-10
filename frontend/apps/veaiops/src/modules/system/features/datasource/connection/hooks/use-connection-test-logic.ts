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
 * Connection test logic Hook
 */

import { useConnectionTest } from '@/hooks/use-connection-test';
import { Message } from '@arco-design/web-react';
import { type ConnectCreateRequest, DataSourceType } from 'api-generate';
import { useCallback } from 'react';

interface UseConnectionTestLogicProps {
  type: DataSourceType;
}

export const useConnectionTestLogic = ({
  type,
}: UseConnectionTestLogicProps) => {
  const { testResult, testing, testConnectionConfig, clearResult } =
    useConnectionTest();

  /**
   * Build test configuration
   */
  const buildTestConfig = useCallback(
    (values: any): ConnectCreateRequest => {
      const testConfig: ConnectCreateRequest = {
        name: values.name,
        type,
      };

      // Add authentication information based on data source type
      if (type === DataSourceType.ZABBIX) {
        testConfig.zabbix_api_url = values.zabbix_api_url;
        testConfig.zabbix_api_user = values.zabbix_api_user;
        testConfig.zabbix_api_password = values.zabbix_api_password;
      } else if (type === DataSourceType.ALIYUN) {
        testConfig.aliyun_access_key_id = values.aliyun_access_key_id;
        testConfig.aliyun_access_key_secret = values.aliyun_access_key_secret;
      } else if (type === DataSourceType.VOLCENGINE) {
        testConfig.volcengine_access_key_id = values.volcengine_access_key_id;
        testConfig.volcengine_access_key_secret =
          values.volcengine_access_key_secret;
      }

      return testConfig;
    },
    [type],
  );

  /**
   * Validate password field
   */
  const validatePassword = useCallback(
    (values: any): string | null => {
      if (type === DataSourceType.ZABBIX && !values.zabbix_api_password) {
        return 'API密码';
      } else if (
        type === DataSourceType.ALIYUN &&
        !values.aliyun_access_key_secret
      ) {
        return 'Access Key Secret';
      } else if (
        type === DataSourceType.VOLCENGINE &&
        !values.volcengine_access_key_secret
      ) {
        return 'Access Key Secret';
      }
      return null;
    },
    [type],
  );

  /**
   * Handle connection test
   */
  const handleTestConnection = useCallback(
    async (values: any) => {
      try {
        const testConfig = buildTestConfig(values);

        // Check if password is filled
        const missingField = validatePassword(values);
        if (missingField) {
          Message.error(`请输入${missingField}以进行连接测试`);
          return false;
        }

        const result = await testConnectionConfig(testConfig);

        if (result.success) {
          Message.success('连接测试成功');
          return true;
        } else {
          return false;
        }
      } catch (error) {
        // ✅ Correct: Expose actual error information
        const msg =
          error instanceof Error ? error.message : '连接测试失败，请检查输入';
        Message.error(`连接测试失败:${msg}`);
        return false;
      }
    },
    [buildTestConfig, validatePassword, testConnectionConfig],
  );

  /**
   * Execute connection test (used before form submission)
   */
  const executeConnectionTest = useCallback(
    async (values: any) => {
      const testConfig = buildTestConfig(values);
      return await testConnectionConfig(testConfig);
    },
    [buildTestConfig, testConnectionConfig],
  );

  return {
    testResult,
    testing,
    handleTestConnection,
    executeConnectionTest,
    validatePassword,
    clearResult,
  };
};
