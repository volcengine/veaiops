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
import type { ContactGroup } from '../shared/types';

/**
 * Get Volcengine contact groups
 *
 * @param datasourceId - Data source ID
 * @returns Promise<ContactGroup[]>
 */
export const fetchVolcengineContactGroups = async (
  datasourceId: string,
): Promise<ContactGroup[]> => {
  try {
    // Use generated API method to call backend interface
    const response =
      await apiClient.dataSources.getApisV1DatasourceVolcengineContactGroups({
        datasourceId,
        skip: 0,
        limit: 100,
      });

    const contactGroupsData = response.data as ContactGroup[] | undefined;

    if (response.code === API_RESPONSE_CODE.SUCCESS && contactGroupsData) {
      return contactGroupsData;
    } else {
      const error = response.message || 'Failed to fetch contact groups';

      throw new Error(error);
    }
  } catch (error) {
    // ✅ Correct: Expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    throw new Error(
      errorObj instanceof Error
        ? errorObj.message
        : 'Failed to fetch Volcengine contact groups, please try again later',
    );
  }
};

/**
 * Get Aliyun contact groups
 *
 * @param datasourceId - Data source ID
 * @returns Promise<ContactGroup[]>
 */
export const fetchAliyunContactGroups = async (
  datasourceId: string,
): Promise<ContactGroup[]> => {
  try {
    // Step 1: Get DataSource details to obtain connect_id

    const datasourceResponse =
      await apiClient.dataSources.getApisV1DatasourceAliyun1({
        datasourceId,
      });

    if (datasourceResponse.code !== API_RESPONSE_CODE.SUCCESS) {
      const error = datasourceResponse.message || 'Failed to fetch datasource information';

      throw new Error(error);
    }

    if (!datasourceResponse.data) {
      throw new Error('Datasource information is empty');
    }

    const dataSourceData: any = datasourceResponse.data;

    // Step 2: Get connect ID from DataSource
    const connectId = dataSourceData.connect?._id || dataSourceData.connect;

    if (!connectId) {
      throw new Error('Datasource connection information not configured');
    }

    // Step 3: Use connect_id to call Aliyun's contact groups API
    // Backend interface: POST /apis/v1/datasource/connect/aliyun/{connect_id}/describe-contact-group-list
    const response: any = await apiClient.request.request({
      method: 'POST',
      url: `/apis/v1/datasource/connect/aliyun/${connectId}/describe-contact-group-list`,
      query: {
        skip: 0,
        limit: 100,
      },
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      return response.data as ContactGroup[];
    } else {
      const error = response.message || 'Failed to fetch contact groups';

      throw new Error(error);
    }
  } catch (error) {
    // ✅ Correct: Expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    throw new Error(
      errorObj instanceof Error
        ? errorObj.message
        : 'Failed to fetch Aliyun contact groups, please try again later',
    );
  }
};

/**
 * Get contact groups based on datasource type
 *
 * @param datasourceType - Data source type (Volcengine|Aliyun|Zabbix)
 * @param datasourceId - Data source ID
 * @returns Promise<ContactGroup[]>
 */
export const fetchContactGroups = async (
  datasourceType: string,
  datasourceId: string,
): Promise<ContactGroup[]> => {
  switch (datasourceType) {
    case 'Volcengine':
      return fetchVolcengineContactGroups(datasourceId);
    case 'Aliyun':
      return fetchAliyunContactGroups(datasourceId);
    default:
      return [];
  }
};
