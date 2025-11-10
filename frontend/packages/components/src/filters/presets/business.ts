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
 * Business preset configuration
 * Common filter component presets for AI-Ops project
 */
import type { PresetGenerator } from './types';

/**
 * Account selector preset
 * Simplifies account selector configuration, reuses AccountSelect component logic
 */
export const accountSelectPreset: PresetGenerator = (params = {}) => ({
  type: 'Select.Account',
  field: 'customerIDs',
  label: '账户',
  componentProps: {
    mode: 'multiple',
    maxTagCount: 1,
    placeholder: '请选择账户',
    allowClear: true,
    ...params,
  },
});

/**
 * Product selector preset
 */
export const productSelectPreset: PresetGenerator = (params = {}) => ({
  type: 'Select',
  field: 'productIDs',
  label: '云产品',
  componentProps: {
    mode: 'multiple',
    maxTagCount: 2,
    placeholder: '请选择云产品',
    dataSource: {
      serviceInstance: 'aiOpsService', // This will be parsed by plugin system
      api: 'ListProduct',
      responseEntityKey: 'list',
      optionCfg: {
        labelKey: 'productName',
        valueKey: 'id',
      },
    },
    isDebouncedFetch: true,
    isScrollFetching: true,
    isCascadeRemoteSearch: true,
    isValueEmptyTriggerOptions: true,
    searchKey: 'productName',
    allowClear: true,
    ...params,
  },
});

/**
 * Event type selector preset
 */
export const eventTypeSelectPreset: PresetGenerator = (params = {}) => ({
  type: 'Select',
  field: 'eventTypes',
  label: '事件源',
  componentProps: {
    mode: 'multiple',
    placeholder: '请选择事件源',
    enumOptionConfig: {
      key: 'EventType', // FrontEnumKey.EventType
      isValueToNumber: true,
    },
    allowClear: true,
    ...params,
  },
});

/**
 * Event ID input preset
 */
export const eventIdInputPreset: PresetGenerator = (params = {}) => ({
  type: 'InputTag',
  field: 'eventIDs',
  label: '事件ID',
  componentProps: {
    placeholder: '支持回车输入多个ID',
    maxTagCount: 3,
    validate: (v: string) => {
      if (!v || Number.isNaN(Number(v))) {
        // Need to import Message component here

        return false;
      }
      return true;
    },
    allowClear: true,
    ...params,
  },
});

/**
 * Subscription name input preset
 */
export const subscriptionNameInputPreset: PresetGenerator = (params = {}) => ({
  type: 'Input',
  field: 'name',
  label: '订阅名称',
  componentProps: {
    placeholder: '请输入订阅名称',
    allowClear: true,
    ...params,
  },
});

/**
 * Business scene cascader preset
 */
export const businessSceneCascaderPreset: PresetGenerator = (params = {}) => ({
  type: 'Cascader',
  field: 'businessSceneNames',
  label: '业务场景',
  componentProps: {
    mode: 'multiple',
    maxTagCount: 1,
    placeholder: '请选择业务场景',
    showSearch: {
      retainInputValueWhileSelect: false,
    },
    fieldNames: {
      children: 'children',
      label: 'name',
      value: 'id',
    },
    allowClear: true,
    // options need to be passed through handleFiltersProps
    ...params,
  },
});

/**
 * Data source type selector preset
 */
export const datasourceTypeSelectPreset: PresetGenerator = (params = {}) => ({
  type: 'Select',
  field: 'datasourceType',
  label: '数据源类型',
  componentProps: {
    placeholder: '请选择数据源类型',
    enumOptionConfig: {
      key: 'DataSourceType', // FrontEnumKey.DataSourceType
      isValueToNumber: true,
    },
    allowClear: false,
    ...params,
  },
});

/**
 * Task status selector preset
 */
export const taskStatusSelectPreset: PresetGenerator = (params = {}) => ({
  type: 'Select',
  field: 'statuses',
  label: '任务状态',
  componentProps: {
    mode: 'multiple',
    maxTagCount: 3,
    placeholder: '请选择任务状态',
    enumOptionConfig: {
      key: 'AutoThresholdTaskStatus', // FrontEnumKey.AutoThresholdTaskStatus
      isValueToNumber: true,
    },
    allowClear: true,
    ...params,
  },
});

/**
 * Task ID selector preset
 */
export const taskIdSelectPreset: PresetGenerator = (params = {}) => ({
  type: 'Select',
  field: 'taskIDs',
  label: '任务ID',
  componentProps: {
    mode: 'multiple',
    placeholder: '请选择任务ID',
    dataSource: {
      serviceInstance: 'aiOpsService',
      api: 'ListAutoThresholdTask',
      responseEntityKey: 'autoThresholdTasks',
      optionCfg: {
        labelKey: 'taskId',
        valueKey: 'taskId',
      },
    },
    isDebouncedFetch: true,
    isScrollFetching: true,
    isCascadeRemoteSearch: true,
    isValueEmptyTriggerOptions: true,
    searchKey: 'taskIDs',
    allowClear: true,
    ...params,
  },
});
