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

import { DataSourceType, type WizardState } from '@wizard/types';

function validateConnectStep(state: WizardState): boolean {
  return Boolean(state.selectedConnect);
}

function validateTemplateStep(state: WizardState): boolean {
  return Boolean(state.zabbix.selectedTemplate);
}

function validateProjectStep(state: WizardState): boolean {
  return Boolean(state.aliyun.selectNamespace);
}

function validateProductStep(state: WizardState): boolean {
  return Boolean(state.volcengine.selectedProduct);
}

function validateSubNamespaceStep(state: WizardState): boolean {
  return Boolean(state.volcengine.selectedSubNamespace);
}

function validateMetricStep(
  selectedType: DataSourceType,
  state: WizardState,
): boolean {
  if (selectedType === DataSourceType.ZABBIX) {
    return Boolean(state.zabbix.selectedMetric);
  }
  if (selectedType === DataSourceType.ALIYUN) {
    return Boolean(state.aliyun.selectedMetric);
  }
  if (selectedType === DataSourceType.VOLCENGINE) {
    return Boolean(state.volcengine.selectedMetric);
  }
  return false;
}

function validateHostStep(state: WizardState): boolean {
  return state.zabbix.selectedHosts.length > 0;
}

function validateInstanceStep(
  selectedType: DataSourceType,
  state: WizardState,
): boolean {
  if (selectedType === DataSourceType.ALIYUN) {
    return state.aliyun.selectedInstances.length > 0;
  }
  if (selectedType === DataSourceType.VOLCENGINE) {
    return state.volcengine.selectedInstances.length > 0;
  }
  return false;
}

export function validateStep(
  stepKey: string,
  selectedType: DataSourceType | null,
  state: WizardState,
): boolean {
  switch (stepKey) {
    case 'connect':
      return validateConnectStep(state);
    case 'template':
      return validateTemplateStep(state);
    case 'project':
      return validateProjectStep(state);
    case 'product':
      return validateProductStep(state);
    case 'subnamespace':
      return validateSubNamespaceStep(state);
    case 'metric':
      return selectedType ? validateMetricStep(selectedType, state) : false;
    case 'host':
      return validateHostStep(state);
    case 'instance':
      return selectedType ? validateInstanceStep(selectedType, state) : false;
    case 'confirm':
    case 'create':
      return true;
    default:
      return false;
  }
}
