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
import apiClient from "@/utils/api-client";
import type {
  BaseQuery,
  FieldItem,
  HandleFilterProps,
} from "@veaiops/components";
import { disabledDate, ensureArray, logger } from "@veaiops/utils";
import type { ListIntelligentThresholdTaskRequest } from "api-generate";

// 🔍 Import log collector
interface TaskFilterLogEntry {
  timestamp: number;
  level: string;
  component: string;
  message: string;
  data?: unknown;
}

interface WindowWithTaskFilterLogs extends Window {
  __taskFilterLogs?: TaskFilterLogEntry[];
}

const filterLogger = {
  info: ({ component, message, data }: { component: string; message: string; data?: unknown }) => {
    const entry: TaskFilterLogEntry = {
      timestamp: Date.now(),
      level: 'info',
      component,
      message,
      data,
    };
    logger.info({
      message: `[${component}] ${message}`,
      data: data || {},
      source: component,
      component: 'log',
    });

    // Add to global log collection
    if (typeof window !== 'undefined') {
      const windowWithLogs = window as unknown as WindowWithTaskFilterLogs;
      if (!windowWithLogs.__taskFilterLogs) {
        windowWithLogs.__taskFilterLogs = [];
      }
      windowWithLogs.__taskFilterLogs.push(entry);
    }
  },
};

/**
 * Task filter query parameter type
 * Excludes pagination parameters and adds time range fields
 */
export type TaskFiltersQuery = Omit<
  ListIntelligentThresholdTaskRequest,
  "skip" | "limit"
> & {
  create_time_range?: [number, number];
  update_time_range?: [number, number];
};

/**
 * Intelligent threshold task table filter configuration
 * Implemented according to CustomTable's handleFilters pattern
 */
export const getTaskFilters = (
  props: HandleFilterProps<TaskFiltersQuery & BaseQuery>,
): FieldItem[] => {
  const { query, handleChange } = props;
  // Synchronize filter's datasource_type to store during initialization
  // This ensures correct linkage when page loads with initial values (e.g., from URL parameters or default values)
  if (query?.datasource_type) {
    const { setFilterDatasourceType } = useTaskConfigStore.getState();
    const currentFilterType =
      useTaskConfigStore.getState().filterDatasourceType;
    // Only update when value differs, avoid unnecessary state updates
    if (currentFilterType !== query.datasource_type) {
      setFilterDatasourceType(query.datasource_type);
    }
  }

  return [
    {
      field: 'task_name',
      label: '任务名称',
      type: 'Input',
      componentProps: {
        placeholder: '请输入任务名称',
        value: query.task_name,
        allowClear: true,
        onChange: (v: string) => {
          handleChange({ key: 'task_name', value: v });
        },
      },
    },
    {
      field: 'datasource_type',
      label: '数据源类型',
      type: 'Select',
      componentProps: {
        placeholder: '请选择数据源类型',
        value: query.datasource_type as string | undefined,
        defaultActiveFirstOption: true,
        allowClear: false,
        options: [
          { label: '火山引擎', value: 'Volcengine' },
          { label: '阿里云', value: 'Aliyun' },
          { label: 'Zabbix', value: 'Zabbix' },
        ],
        onChange: (v: string) => {
          filterLogger.info({
            component: 'TaskConfigFilters',
            message: '🔵 数据源类型 onChange 被触发',
            data: {
              newValue: v,
              oldValue: query.datasource_type,
              handleChangeType: typeof handleChange,
              timestamp: new Date().toISOString(),
            },
          });

          handleChange({ key: 'datasource_type', value: v });

          // Update filter datasource type in store, used for default value linkage when creating new task
          const { setFilterDatasourceType } = useTaskConfigStore.getState();
          setFilterDatasourceType(v);

          filterLogger.info({
            component: 'TaskConfigFilters',
            message: '🔵 handleChange 已调用',
            data: {
              key: 'datasource_type',
              value: v,
              timestamp: new Date().toISOString(),
            },
          });
        },
      },
    },
    {
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
    },
    {
      field: 'auto_update',
      label: '自动更新',
      type: 'Select',
      componentProps: {
        placeholder: '请选择自动更新状态',
        value: query.auto_update,
        allowClear: true,
        options: [
          { label: '已开启', value: true },
          { label: '已关闭', value: false },
        ],
        onChange: (v: boolean) => {
          handleChange({ key: 'auto_update', value: v });
        },
      },
    },
    {
      field: 'create_time_range',
      label: '创建时间',
      type: 'RangePicker',
      componentProps: {
        placeholder: ['开始时间', '结束时间'],
        value: ensureArray([
          query.created_at_start,
          query.created_at_end,
        ]) as [string, string] | undefined,
        showTime: true,
        disabledDate,
        onChange: (v: [string, string]) => {
          if (v && v.length === 2) {
            handleChange({ key: 'created_at_start', value: v[0] });
            handleChange({ key: 'created_at_end', value: v[1] });
          } else {
            handleChange({ key: 'created_at_start', value: undefined });
            handleChange({ key: 'created_at_end', value: undefined });
          }
        },
      },
    },
    {
      field: 'update_time_range',
      label: '更新时间',
      type: 'RangePicker',
      componentProps: {
        placeholder: ['开始时间', '结束时间'],
        value: ensureArray([
          query.updated_at_start,
          query.updated_at_end,
        ]) as [string, string] | undefined,
        showTime: true,
        disabledDate,
        onChange: (v: [string, string]) => {
          if (v && v.length === 2) {
            handleChange({ key: 'updated_at_start', value: v[0] });
            handleChange({ key: 'updated_at_end', value: v[1] });
          } else {
            handleChange({ key: 'updated_at_start', value: undefined });
            handleChange({ key: 'updated_at_end', value: undefined });
          }
        },
      },
    },
  ];
};
