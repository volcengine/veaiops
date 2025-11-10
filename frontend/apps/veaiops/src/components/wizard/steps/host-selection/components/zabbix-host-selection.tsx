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
 * Zabbix host selection component
 * @description Handles host selection specifically for Zabbix data sources
 * @author AI Assistant
 * @date 2025-01-16
 */

import type { ZabbixHost } from 'api-generate';
import type React from 'react';
import type { WizardActions } from '../../../types';
import { GenericInstanceSelection, createZabbixConfig } from './shared';

export interface ZabbixHostSelectionProps {
  hosts: ZabbixHost[];
  selectedHosts: ZabbixHost[];
  loading: boolean;
  searchText: string;
  onSearchChange: (value: string) => void;
  actions: WizardActions;
}

export const ZabbixHostSelection: React.FC<ZabbixHostSelectionProps> = ({
  hosts,
  selectedHosts,
  loading,
  searchText,
  onSearchChange,
  actions,
}) => {
  const config = createZabbixConfig(actions.setSelectedHosts);

  return (
    <GenericInstanceSelection
      items={hosts}
      selectedItems={selectedHosts}
      loading={loading}
      searchText={searchText}
      onSearchChange={onSearchChange}
      config={config}
    />
  );
};

export default ZabbixHostSelection;
