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

import apiClient from "@/utils/api-client";
import type { FieldItem, HandleFilterProps } from "@veaiops/components";
import type { TaskFiltersQuery } from "./types";

/**
 * Project name filter
 */
export const createProjectsFilter = (
  props: HandleFilterProps<TaskFiltersQuery>,
): FieldItem => {
  const { query, handleChange } = props;

  return {
    field: 'projects',
    label: '项目名称',
    type: 'Select',
    componentProps: {
      placeholder: '请选择项目名称',
      value: query.projects,
      allowClear: true,
      mode: 'multiple',
      dataSource: {
        serviceInstance: apiClient.projects,
        api: 'getApisV1ManagerSystemConfigProjects',
        payload: {},
        responseEntityKey: 'data',
        optionCfg: {
          labelKey: 'name',
          valueKey: 'name',
        },
      },
      onChange: (v: string[]) => {
        handleChange({ key: 'projects', value: v });
      },
    },
  };
};
