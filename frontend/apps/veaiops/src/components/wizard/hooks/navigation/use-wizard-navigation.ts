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
 * useWizardNavigation - Wizard navigation logic (extracted Hook)
 * @description Extracts core logic of handleNext, handlePrev, handleClose to improve wizard-controller readability
 */

import { useCallback } from 'react';
import { DATA_SOURCE_CONFIGS } from '../../config/datasource-configs';
import { WizardStep } from '../../types';
import type { DataSourceType, WizardActions, WizardState } from '../../types';
import {
  canProceed,
  getButtonText,
  getCurrentStepConfig,
  handleStepDataFetch,
} from '../../utils/wizard-logic';

export interface UseWizardNavigationParams {
  selectedType: DataSourceType | null;
  setSelectedType: (type: DataSourceType | null) => void;
  state: WizardState;
  actions: WizardActions;
  onClose: () => void;
}

export interface UseWizardNavigationReturn {
  handleTypeSelect: (type: DataSourceType) => void;
  handleNext: () => Promise<void>;
  handlePrev: () => void;
  handleClose: () => void;
  canProceedToNext: () => boolean;
  getNextButtonText: () => string;
  getPrevButtonText: () => string;
  shouldShowPrevButton: () => boolean;
}

/**
 * Wizard navigation Hook
 */
export const useWizardNavigation = ({
  selectedType,
  setSelectedType,
  state,
  actions,
  onClose,
}: UseWizardNavigationParams): UseWizardNavigationReturn => {
  // Handle data source type selection
  const handleTypeSelect = useCallback(
    (type: DataSourceType) => {
      try {
        // First set data source type in state
        actions.setDataSourceType(type);
        // Then set local selected type
        setSelectedType(type);
        // Ensure step starts from -1, ready to enter configuration flow
        if (state.currentStep !== -1) {
          actions.setCurrentStep(WizardStep.TYPE_SELECTION);
        }
      } catch (error) {}
    },
    [selectedType, state.currentStep, setSelectedType, actions],
  );

  // Handle next step
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
      // Add extra confirmation to ensure user really wants to proceed
      if (!selectedType) {
        return;
      }

      // Set step
      actions.setCurrentStep(WizardStep.FIRST_STEP);

      // Get first step configuration and handle data fetching
      const firstStepConfig = getCurrentStepConfig(
        selectedType,
        WizardStep.FIRST_STEP,
      );
      if (firstStepConfig) {
        try {
          await handleStepDataFetch(
            selectedType,
            state,
            actions,
            firstStepConfig.key,
          );
        } catch (error) {}
      }
      return;
    }

    const currentStepConfig = getCurrentStepConfig(
      selectedType,
      state.currentStep,
    );
    if (!currentStepConfig) {
      return;
    }

    try {
      // Handle step data fetching
      await handleStepDataFetch(
        selectedType,
        state,
        actions,
        currentStepConfig.key,
      );

      // Enter next step
      const nextStep = Math.min(state.currentStep + 1, config.steps.length - 1);
      actions.setCurrentStep(nextStep);
    } catch (error) {}
  }, [selectedType, state, actions]);

  // Handle previous step
  const handlePrev = useCallback(() => {
    if (state.currentStep === WizardStep.FIRST_STEP) {
      // Return to type selection phase
      setSelectedType(null);
      actions.resetWizard();
    } else {
      // Return to previous step
      const prevStep = Math.max(state.currentStep - 1, WizardStep.FIRST_STEP);
      actions.setCurrentStep(prevStep);
    }
  }, [state.currentStep, selectedType, setSelectedType, actions]);

  // Handle close
  const handleClose = useCallback(() => {
    actions.resetWizard();
    setSelectedType(null);
    onClose();
  }, [state.currentStep, selectedType, actions, setSelectedType, onClose]);

  // Check if can proceed
  const canProceedToNext = useCallback(() => {
    return canProceed(selectedType, state);
  }, [selectedType, state]);

  // Get button text
  const getNextButtonText = useCallback(() => {
    return getButtonText(selectedType, state.currentStep);
  }, [selectedType, state.currentStep]);

  // Get previous button text
  const getPrevButtonText = useCallback(() => {
    return 'Previous';
  }, [selectedType, state.currentStep]);

  // Check if should show previous button
  const shouldShowPrevButton = useCallback(() => {
    // Only show previous button when actually entering configuration steps
    // Do not show previous button in type selection phase (TYPE_SELECTION)
    return state.currentStep > WizardStep.TYPE_SELECTION;
  }, [state.currentStep]);

  return {
    handleTypeSelect,
    handleNext,
    handlePrev,
    handleClose,
    canProceedToNext,
    getNextButtonText,
    getPrevButtonText,
    shouldShowPrevButton,
  };
};

export default useWizardNavigation;
