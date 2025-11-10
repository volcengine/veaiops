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
 * Data source configuration validator
 */

import type { DataSourceType, WizardState } from '@/components/wizard/types';
import { DataSource } from '@veaiops/api-client';

export const validateConfiguration = (
  dataSourceType: DataSourceType,
  state: WizardState,
): string | null => {
  if (!state.dataSourceName.trim()) {
    return '请输入数据源名称';
  }

  if (!state.selectedConnect) {
    return '请选择连接';
  }

  switch (dataSourceType) {
    case DataSource.type.ZABBIX:
      if (!state.zabbix.selectedTemplate) {
        return '请选择 Zabbix 模板';
      }
      if (!state.zabbix.selectedMetric) {
        return '请选择监控指标';
      }
      if (state.zabbix.selectedHosts.length === 0) {
        return '请选择至少一个主机';
      }
      break;

    case DataSource.type.ALIYUN:
      if (!state.aliyun.selectNamespace) {
        return '请选择阿里云命名空间';
      }
      if (!state.aliyun.selectedMetric) {
        return '请选择监控指标';
      }
      // Aliyun instance selection is optional, not selecting instances will monitor all instances
      break;

    case DataSource.type.VOLCENGINE:
      if (!state.volcengine.selectedProduct) {
        return '请选择火山引擎产品';
      }
      if (!state.volcengine.selectedMetric) {
        return '请选择监控指标';
      }
      if (state.volcengine.selectedInstances.length === 0) {
        return '请选择至少一个实例';
      }
      break;

    default:
      return '不支持的数据源类型';
  }

  return null;
};
