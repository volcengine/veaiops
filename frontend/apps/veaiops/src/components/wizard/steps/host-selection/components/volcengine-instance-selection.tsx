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
 * Volcengine instance selection component
 * @description Handles instance selection specifically for Volcengine data sources
 * @author AI Assistant
 * @date 2025-01-16
 */

import type React from 'react';
import type { VolcengineInstance, WizardActions } from '../../../types';
import { GenericInstanceSelection, createVolcengineConfig } from './shared';

export interface VolcengineInstanceSelectionProps {
  instances: VolcengineInstance[];
  selectedInstances: VolcengineInstance[];
  loading: boolean;
  searchText: string;
  onSearchChange: (value: string) => void;
  actions: WizardActions;
}

export const VolcengineInstanceSelection: React.FC<
  VolcengineInstanceSelectionProps
> = ({
  instances,
  selectedInstances,
  loading,
  searchText,
  onSearchChange,
  actions,
}) => {
  const config = createVolcengineConfig(actions.setSelectedVolcengineInstances);

  return (
    <GenericInstanceSelection
      items={instances}
      selectedItems={selectedInstances}
      loading={loading}
      searchText={searchText}
      onSearchChange={onSearchChange}
      config={config}
    />
  );
};

export default VolcengineInstanceSelection;
