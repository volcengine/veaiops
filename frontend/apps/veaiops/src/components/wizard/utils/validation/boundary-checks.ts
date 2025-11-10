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
 * Boundary condition checking utilities
 * @description Checks various boundary cases to ensure data validity
 */

import { DataSource } from '@veaiops/api-client';
import type { DataSourceType, WizardState } from '../../types';

/**
 * Check if connection is valid
 */
export const isConnectValid = (state: WizardState): boolean => {
  if (!state.selectedConnect) {
    return false;
  }

  if (!state.selectedConnect.name || state.selectedConnect.name.trim() === '') {
    return false;
  }

  return true;
};

/**
 * Check if data source name is valid
 */
export const isDataSourceNameValid = (state: WizardState): boolean => {
  if (!state.dataSourceName || state.dataSourceName.trim() === '') {
    return false;
  }

  if (state.dataSourceName.length < 2) {
    return false;
  }

  if (state.dataSourceName.length > 100) {
    return false;
  }

  return true;
};

/**
 * Check if Zabbix configuration is complete
 */
export const isZabbixConfigComplete = (
  state: WizardState,
): { valid: boolean; message?: string } => {
  if (!state.zabbix.selectedTemplate) {
    return { valid: false, message: '请选择 Zabbix 模板' };
  }

  if (!state.zabbix.selectedMetric) {
    return { valid: false, message: '请选择监控指标' };
  }

  if (!state.zabbix.selectedHosts || state.zabbix.selectedHosts.length === 0) {
    return { valid: false, message: '请至少选择一个主机' };
  }

  return { valid: true };
};

/**
 * Check if Aliyun configuration is complete
 */
export const isAliyunConfigComplete = (
  state: WizardState,
): { valid: boolean; message?: string } => {
  if (!state.aliyun.selectNamespace) {
    return { valid: false, message: '请选择阿里云命名空间' };
  }

  if (!state.aliyun.selectedMetric) {
    return { valid: false, message: '请选择监控指标' };
  }

  // Region check - read from state.aliyun.region
  if (!state.aliyun.region || state.aliyun.region.trim() === '') {
    return { valid: false, message: '请填写 Region' };
  }

  // Aliyun instances are optional, not required
  return { valid: true };
};

/**
 * Check if Volcengine configuration is complete
 */
export const isVolcengineConfigComplete = (
  state: WizardState,
): { valid: boolean; message?: string } => {
  if (!state.volcengine.selectedProduct) {
    return { valid: false, message: '请选择火山引擎产品' };
  }

  if (!state.volcengine.selectedMetric) {
    return { valid: false, message: '请选择监控指标' };
  }

  if (
    !state.volcengine.selectedInstances ||
    state.volcengine.selectedInstances.length === 0
  ) {
    return { valid: false, message: '请至少选择一个实例' };
  }

  return { valid: true };
};

/**
 * Check configuration completeness based on data source type
 */
export const checkConfigCompleteness = (
  dataSourceType: DataSourceType,
  state: WizardState,
): { valid: boolean; message?: string } => {
  // Check common fields
  if (!isConnectValid(state)) {
    return { valid: false, message: '请选择连接' };
  }

  if (!isDataSourceNameValid(state)) {
    return { valid: false, message: '请输入有效的数据源名称（2-100字符）' };
  }

  // Check type-specific configuration
  switch (dataSourceType) {
    case DataSource.type.ZABBIX:
      return isZabbixConfigComplete(state);
    case DataSource.type.ALIYUN:
      return isAliyunConfigComplete(state);
    case DataSource.type.VOLCENGINE:
      return isVolcengineConfigComplete(state);
    default:
      return { valid: false, message: '不支持的数据源类型' };
  }
};

/**
 * Check if array is empty
 */
export const isArrayEmpty = <T>(arr: T[] | null | undefined): boolean => {
  return !arr || arr.length === 0;
};

/**
 * Check if object is empty
 */
export const isObjectEmpty = (obj: any): boolean => {
  return !obj || Object.keys(obj).length === 0;
};

/**
 * Safely get object property
 */
export const safeGet = <T>(obj: any, path: string, defaultValue: T): T => {
  const keys = path.split('.');
  let result = obj;

  for (const key of keys) {
    if (result === null || result === undefined) {
      return defaultValue;
    }
    result = result[key];
  }

  return result !== undefined ? result : defaultValue;
};

/**
 * Check if string is empty or contains only whitespace
 */
export const isStringEmpty = (str: string | null | undefined): boolean => {
  return !str || str.trim() === '';
};
