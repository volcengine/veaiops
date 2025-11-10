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
 * Data source wizard step validators
 * @description Handles validation logic for each wizard step, determines if can proceed to next step
 * @author AI Assistant
 * @date 2025-01-19
 */

import { DATA_SOURCE_CONFIGS } from '../../config/datasource-configs';
import { WizardStep } from '../../types';
import type { DataSourceType, WizardState } from '../../types';
import { validateStep } from './validators/step-validators';

export const canProceed = (
  selectedType: DataSourceType | null,
  state: WizardState,
): boolean => {
  if (!selectedType) {
    return false;
  }

  if (selectedType && state.currentStep === WizardStep.TYPE_SELECTION) {
    return true;
  }

  if (selectedType && state.dataSourceType !== selectedType) {
    return true;
  }

  const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
  if (
    !config ||
    state.currentStep < WizardStep.FIRST_STEP ||
    state.currentStep >= config.steps.length
  ) {
    return Boolean(selectedType);
  }

  const currentStepConfig = config.steps[state.currentStep];
  return validateStep(currentStepConfig.key, selectedType, state);
};
