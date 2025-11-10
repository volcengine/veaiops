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
import { useMemo } from 'react';

/**
 * Datasource configuration Hook
 * Provides configuration information for datasource, template, and projects
 */
export const useDatasourceConfig = (datasourceType: string | undefined) => {
  // Datasource configuration
  const datasourceDataSource = useMemo(() => {
    if (!datasourceType) {
      return undefined;
    }

    return {
      serviceInstance: apiClient.dataSources,
      api: `getApisV1Datasource${datasourceType}`,
      payload: {},
      responseEntityKey: 'data',
      optionCfg: {
        labelKey: 'name',
        valueKey: '_id',
      },
    };
  }, [datasourceType]);

  // Template configuration
  const templateDataSource = useMemo(
    () => ({
      serviceInstance: apiClient.metricTemplate,
      api: 'getApisV1DatasourceTemplate',
      payload: {},
      responseEntityKey: 'data',
      optionCfg: {
        labelKey: 'name',
        valueKey: '_id',
      },
    }),
    [],
  );

  // Project configuration
  const projectsDataSource = useMemo(
    () => ({
      serviceInstance: apiClient.projects,
      api: 'getApisV1ManagerSystemConfigProjects',
      payload: {},
      responseEntityKey: 'data',
      optionCfg: {
        labelKey: 'name',
        valueKey: '_id',
      },
    }),
    [],
  );

  return {
    datasourceDataSource,
    templateDataSource,
    projectsDataSource,
  };
};
