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
 * Connection management operations Hook
 * @description Manages data source connection fetching and management
 * @author AI Assistant
 * @date 2025-01-16
 */

import apiClient from '@/utils/api-client';
import { Message } from '@arco-design/web-react';
import { API_RESPONSE_CODE } from '@veaiops/constants';

import type React from 'react';
import { useCallback } from 'react';
import { DataSourceType } from '../../types';
import type { WizardState } from '../../types';

export const useConnectOperations = (
  state: WizardState,
  setState: React.Dispatch<React.SetStateAction<WizardState>>,
  updateLoading: (key: keyof WizardState['loading'], value: boolean) => void,
) => {
  // Fetch connection list
  const fetchConnects = useCallback(
    async (dataSourceType?: DataSourceType) => {
      updateLoading('connects', true);

      try {
        // Call API to fetch connection list
        const response =
          await apiClient.dataSourceConnect.getApisV1DatasourceConnect({
            limit: 100,
          });

        if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
          let connects = response.data || [];

          // If data source type specified, filter
          if (dataSourceType) {
            connects = connects.filter((connect) => {
              // API type and local type mapping conversion
              const apiTypeToLocal: Record<string, DataSourceType> = {
                Zabbix: DataSourceType.ZABBIX,
                Aliyun: DataSourceType.ALIYUN,
                Volcengine: DataSourceType.VOLCENGINE,
              };

              const localType = apiTypeToLocal[connect.type as string];
              const isMatch = localType === dataSourceType;

              return isMatch;
            });
          }

          setState((prev) => ({
            ...prev,
            connects,
          }));
        } else {
          const errorMsg = response.message || '获取连接列表失败';

          throw new Error(errorMsg);
        }
      } catch (error) {
        Message.error('获取连接列表失败，请重试');
      } finally {
        updateLoading('connects', false);
      }
    },
    [setState, updateLoading],
  );

  return {
    fetchConnects,
  };
};
