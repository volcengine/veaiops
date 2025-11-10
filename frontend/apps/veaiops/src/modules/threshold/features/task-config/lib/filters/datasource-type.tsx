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

import { useTaskConfigStore } from "@/stores/task-config-store";
import type { FieldItem, HandleFilterProps } from "@veaiops/components";
import { DataSourceType } from "@veaiops/api-client";
import type { TaskFiltersQuery } from "./types";

/**
 * Datasource type options configuration
 * Uses DataSourceType enum values generated from @veaiops/api-client
 */
const DATASOURCE_TYPE_OPTIONS = [
  { label: '火山引擎', value: DataSourceType.VOLCENGINE },
  { label: '阿里云', value: DataSourceType.ALIYUN },
  { label: 'Zabbix', value: DataSourceType.ZABBIX },
] as const;

/**
 * Datasource type filter
 */
export const createDatasourceTypeFilter = (
  props: HandleFilterProps<TaskFiltersQuery>,
): FieldItem => {
  const { query, handleChange } = props;

  return {
    field: 'datasource_type',
    label: '数据源类型',
    type: 'Select',
    componentProps: {
      placeholder: '请选择数据源类型',
      value: (() => {
        // Prefer value from query
        if (query?.datasource_type) {
          return query.datasource_type as string;
        }

        // If not in query, get from URL parameters
        if (typeof window !== 'undefined') {
          const urlParams = new URLSearchParams(window.location.search);
          const urlDatasourceType = urlParams.get('datasource_type');
          if (urlDatasourceType) {
            return urlDatasourceType;
          }
        }

        // Finally get from store
        const storeDatasourceType = useTaskConfigStore.getState().filterDatasourceType;
        if (storeDatasourceType) {
          return storeDatasourceType;
        }

        // Use default value DataSourceType.VOLCENGINE when all are empty
        return DataSourceType.VOLCENGINE;
      })(),
      defaultActiveFirstOption: true,
      allowClear: false,
      options: DATASOURCE_TYPE_OPTIONS,
      onChange: (v: string) => {
        handleChange({ key: 'datasource_type', value: v });

        // Update filter datasource type in store for default value linkage when creating new task
        const { setFilterDatasourceType } = useTaskConfigStore.getState();
        setFilterDatasourceType(v);
      },
    },
  };
};
