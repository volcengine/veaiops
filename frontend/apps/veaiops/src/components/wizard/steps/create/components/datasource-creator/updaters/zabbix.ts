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
 * Zabbix data source update function
 */

import type { WizardState } from '@/components/wizard/types';
import apiClient from '@/utils/api-client';
import { API_RESPONSE_CODE } from '@veaiops/constants';
import type { ZabbixDataSourceConfig } from 'api-generate';
import type { CreateResult } from '../types';
import { processApiError } from '../utils';

export const updateZabbixDataSource = async (
  datasourceId: string,
  state: WizardState,
): Promise<CreateResult> => {
  // Find corresponding item for each selected host
  const targets = state.zabbix.selectedHosts.map((host) => {
    // Prefer using itemid from host object (preserved from prefill in edit mode)
    if (host.itemid) {
      return {
        itemid: host.itemid,
        hostname: host.name,
      };
    }

    // Otherwise find matching item from items array
    const item = state.zabbix.items.find(
      (item) => item.hostname === host.host || item.hostname === host.name,
    );
    return {
      itemid: item?.itemid || '',
      hostname: host.name,
    };
  });

  const config: ZabbixDataSourceConfig = {
    name: state.dataSourceName,
    connect_name: state.selectedConnect!.name,
    targets,
    metric_name: state.zabbix.selectedMetric!.metric_name,
    history_type: 0,
  };

  try {
    const response = await apiClient.dataSources.putApisV1DatasourceZabbix({
      datasourceId,
      requestBody: config,
    });

    if (response.code === API_RESPONSE_CODE.SUCCESS && response.data) {
      return {
        success: true,
        message: '数据源更新成功',
        dataSourceId: response.data._id,
      };
    }

    return {
      success: false,
      message: response.message || '更新失败',
      error: response.message,
    };
  } catch (error: unknown) {
    const errorMessage = processApiError({
      error,
      operation: 'update',
      component: 'updateZabbixDataSource',
      config,
    });

    const errorObj = error instanceof Error ? error : new Error(String(error));
    return {
      success: false,
      message: errorMessage,
      error: errorObj.message,
    };
  }
};
