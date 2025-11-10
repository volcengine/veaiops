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
import type { Project } from 'api-generate';
import { useState } from 'react';

/**
 * Load corresponding content options based on category
 */
export const useAttributeValues = () => {
  const [valueOptions, setValueOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [loadingValues, setLoadingValues] = useState(false);

  const loadAttributeValues = async (
    attributeName: string,
  ): Promise<boolean> => {
    if (!attributeName) {
      setValueOptions([]);
      return false;
    }

    setLoadingValues(true);
    try {
      let response;
      switch (attributeName) {
        case 'project':
          response =
            await apiClient.projects.getApisV1ManagerSystemConfigProjects({});
          break;
        // case 'customer':
        //   response =
        //     await apiClient.customers.getApisV1ManagerSystemConfigCustomers({});
        //   break;
        // case 'product':
        //   response =
        //     await apiClient.products.getApisV1ManagerSystemConfigProducts({});
        //   break;
        default:
          setValueOptions([]);
          return false;
      }

      if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
        // Use name (display name) as label and value
        // Backend will save value to BotAttribute's value field
        const options = response.data.map((item: Project) => {
          const { name } = item;
          // If name doesn't exist, use project_id as fallback
          const fallbackValue = item.project_id;

          return {
            label: name || fallbackValue || '',
            value: name || fallbackValue || '',
          };
        });
        setValueOptions(options);
        return true;
      } else {
        Message.error(`获取${attributeName}选项失败`);
        setValueOptions([]);
        return false;
      }
    } catch (error: unknown) {
      // ✅ Correct: Expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage =
        errorObj.message || `获取${attributeName}选项失败，请重试`;
      Message.error(errorMessage);
      setValueOptions([]);
      return false;
    } finally {
      setLoadingValues(false);
    }
  };

  return {
    valueOptions,
    loadingValues,
    loadAttributeValues,
    setValueOptions,
  };
};
