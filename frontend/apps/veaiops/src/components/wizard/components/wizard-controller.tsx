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
 * Data source wizard controller (refactored)
 * @description Provides core control logic for the wizard, improving readability through modularization
 * @author AI Assistant
 * @date 2025-01-15
 */

import { DataSource } from '@veaiops/api-client';
import { useCallback, useState } from 'react';
import { DATA_SOURCE_CONFIGS } from '../config/datasource-configs';
import {
  guardAliyunConnectRegion,
  guardVolcengineConnectRegion,
} from '../hooks/navigation/use-next-step-guard';
import { useWizardNavigation } from '../hooks/navigation/use-wizard-navigation';
import type { DataSourceType, WizardActions, WizardState } from '../types';
import { WizardStep } from '../types';
import { CreationConfirmModal } from './modals/creation-confirm-modal';

export interface WizardControllerProps {
  selectedType: DataSourceType | null;
  setSelectedType: (type: DataSourceType | null) => void;
  state: WizardState;
  actions: WizardActions;
  onClose: () => void;
  onSuccess?: (dataSource: unknown) => void;
  editingDataSource?: any; // Data source being edited
}

/**
 * Data source type display text mapping
 */
const getDataSourceTypeText = (type: DataSourceType): string => {
  switch (type) {
    case DataSource.type.ZABBIX:
      return 'Zabbix';
    case DataSource.type.ALIYUN:
      return 'Aliyun';
    case DataSource.type.VOLCENGINE:
      return 'Volcengine';
    default:
      return type;
  }
};

/**
 * Check if it's the last step (creation step)
 */
const isLastStep = (
  selectedType: DataSourceType,
  state: WizardState,
): boolean => {
  const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
  return config ? state.currentStep === config.steps.length - 1 : false;
};

/**
 * Check if data source name is valid
 */
const isDataSourceNameValid = (state: WizardState): boolean => {
  return Boolean(state.dataSourceName && state.dataSourceName.trim() !== '');
};

/**
 * Render Aliyun Region not filled prompt modal
 */
const renderAliyunRegionModal = () => <AliyunRegionPrompt />;

/**
 * Data source wizard controller Hook
 */
export const useWizardController = ({
  selectedType,
  setSelectedType,
  state,
  actions,
  onClose,
  onSuccess,
  editingDataSource,
}: WizardControllerProps) => {
  // Creation confirmation modal state
  const [showCreationModal, setShowCreationModal] = useState(false);

  // Use navigation Hook
  const navigation = useWizardNavigation({
    selectedType,
    setSelectedType,
    state,
    actions,
    onClose,
  });

  // Handle next step (with pre-validation)
  const handleNext = useCallback(async () => {
    if (!selectedType) {
      return;
    }

    const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
    if (!config) {
      return;
    }

    // If still in type selection phase, enter first step
    if (state.currentStep === WizardStep.TYPE_SELECTION) {
      await navigation.handleNext();
      return;
    }

    const currentStepConfig = config.steps[state.currentStep];
    if (!currentStepConfig) {
      return;
    }

    // If it's the last step (creation step), execute data source creation logic
    if (isLastStep(selectedType, state)) {
      // Check data source name
      if (!isDataSourceNameValid(state)) {
        return;
      }

      // Show creation confirmation modal
      setShowCreationModal(true);
      return;
    }

    // Aliyun connection step: show confirmation and intercept when region is not filled
    if (
      selectedType === DataSource.type.ALIYUN &&
      currentStepConfig.key === 'connect'
    ) {
      const passed = guardAliyunConnectRegion({
        selectedType,
        currentStepKey: currentStepConfig.key,
        state,
      });
      if (!passed) {
        return; // Modal already shown, intercept proceeding to next step
      }
    }

    // Volcengine connection step: show confirmation and intercept when region is not filled
    if (
      selectedType === DataSource.type.VOLCENGINE &&
      currentStepConfig.key === 'connect'
    ) {
      const passed = guardVolcengineConnectRegion({
        selectedType,
        currentStepKey: currentStepConfig.key,
        state,
      });
      if (!passed) {
        return; // Modal already shown, intercept proceeding to next step
      }
    }

    // Handle step data fetching
    await navigation.handleNext();
  }, [selectedType, state, actions, navigation]);

  // Handle creation confirmation
  const handleCreationConfirm = useCallback(
    (dataSource?: unknown) => {
      setShowCreationModal(false);

      // Call onSuccess callback
      if (onSuccess && dataSource) {
        onSuccess(dataSource);
      }

      // Reset drawer state
      actions.resetWizard();
      setSelectedType(null);

      onClose();
    },
    [onClose, onSuccess, actions, setSelectedType],
  );

  // Handle creation cancellation
  const handleCreationCancel = useCallback(() => {
    setShowCreationModal(false);
  }, []);

  // Helper function to render creation confirmation modal
  const renderCreationConfirmModal = () => {
    if (!showCreationModal || !selectedType) {
      return null;
    }

    const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
    const currentStepConfig = config?.steps[state.currentStep];
    if (!currentStepConfig) {
      return null;
    }

    return (
      <CreationConfirmModal
        visible={showCreationModal}
        selectedType={selectedType}
        currentStepConfig={currentStepConfig}
        state={state}
        actions={actions}
        onClose={handleCreationCancel}
        onConfirm={handleCreationConfirm}
        editingDataSource={editingDataSource}
      />
    );
  };

  return {
    ...navigation,
    handleNext,
    CreationConfirmModalComponent: renderCreationConfirmModal(),
  };
};

export default useWizardController;
