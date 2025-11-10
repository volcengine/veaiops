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

import { DataSource } from '@veaiops/api-client';
import type { Connect, ZabbixTemplateMetric } from 'api-generate';
import React from 'react';
import type {
  AliyunMetric,
  DataSourceType,
  VolcengineMetric,
  WizardActions,
} from '../../../types';
import { AliyunInstanceSelection } from './aliyun-instance-selection';
import { VolcengineInstanceSelection } from './volcengine-instance-selection';
import { ZabbixHostSelection } from './zabbix-host-selection';

export interface InstanceSelectionStepProps {
  dataSourceType: DataSourceType;
  connect: Connect;
  // Zabbix props
  selectedTemplate?: any;
  selectedZabbixMetric?: ZabbixTemplateMetric | null;
  zabbixHosts?: any[];
  selectedZabbixHosts?: any[];
  // Aliyun props
  selectedAliyunMetric?: AliyunMetric | null;
  aliyunInstances?: any[];
  selectedAliyunInstances?: any[];
  // Volcengine props
  selectedVolcengineMetric?: VolcengineMetric | null;
  volcengineInstances?: any[];
  selectedVolcengineInstances?: any[];
  // Loading state
  loading?: boolean;
  // Actions
  actions: WizardActions;
  onZabbixHostSelect?: (hosts: any[]) => void;
  onAliyunInstanceSelect?: (instances: any[]) => void;
  onVolcengineInstanceSelect?: (instances: any[]) => void;
}

export const InstanceSelectionStep: React.FC<InstanceSelectionStepProps> = ({
  dataSourceType,
  connect,
  selectedTemplate,
  selectedZabbixMetric,
  zabbixHosts = [],
  selectedZabbixHosts = [],
  selectedAliyunMetric,
  aliyunInstances = [],
  selectedAliyunInstances = [],
  selectedVolcengineMetric,
  volcengineInstances = [],
  selectedVolcengineInstances = [],
  loading = false,
  actions,
  onZabbixHostSelect,
  onAliyunInstanceSelect,
  onVolcengineInstanceSelect,
}) => {
  // Manage search text state
  const [searchText, setSearchText] = React.useState('');

  switch (dataSourceType) {
    case DataSource.type.ZABBIX:
      return (
        <ZabbixHostSelection
          hosts={zabbixHosts}
          selectedHosts={selectedZabbixHosts}
          loading={loading}
          searchText={searchText}
          onSearchChange={setSearchText}
          actions={actions}
        />
      );

    case DataSource.type.ALIYUN:
      return (
        <AliyunInstanceSelection
          instances={aliyunInstances}
          selectedInstances={selectedAliyunInstances}
          loading={loading}
          searchText={searchText}
          onSearchChange={setSearchText}
          actions={actions}
        />
      );

    case DataSource.type.VOLCENGINE:
      return (
        <VolcengineInstanceSelection
          instances={volcengineInstances}
          selectedInstances={selectedVolcengineInstances}
          loading={loading}
          searchText={searchText}
          onSearchChange={setSearchText}
          actions={actions}
        />
      );

    default:
      return null;
  }
};
