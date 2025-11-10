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
 * Data source wizard step utility functions
 * @description Provides common utility functions related to steps, such as getting step configuration, button text, etc.
 * @author AI Assistant
 * @date 2025-01-19
 */

import { DATA_SOURCE_CONFIGS } from '../../config/datasource-configs';
import { type DataSourceType, WizardStep } from '../../types';

/**
 * Get step progress text
 * @param selectedType Selected data source type
 * @param currentStep Current step index
 * @returns Progress text, e.g., "2 / 5"
 */
export const getStepProgressText = (
  selectedType: DataSourceType | null,
  currentStep: number,
): string => {
  if (!selectedType) {
    return '';
  }

  const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
  if (!config) {
    return '';
  }

  return `${currentStep + 1} / ${config.steps.length}`;
};

/**
 * Get current step configuration
 * @param selectedType Selected data source type
 * @param currentStep Current step index
 * @returns Step configuration object, or null if not found
 */
export const getCurrentStepConfig = (
  selectedType: DataSourceType | null,
  currentStep: number,
) => {
  if (!selectedType || currentStep < WizardStep.FIRST_STEP) {
    return null;
  }

  const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
  if (!config || currentStep >= config.steps.length) {
    return null;
  }

  return config.steps[currentStep];
};

/**
 * Get next step button text
 * @param selectedType Selected data source type
 * @param currentStep Current step index
 * @returns Button text
 */
export const getButtonText = (
  selectedType: DataSourceType | null,
  currentStep: number,
): string => {
  if (!selectedType) {
    return 'Start Configuration';
  }

  if (currentStep === WizardStep.TYPE_SELECTION) {
    return 'Start Configuration';
  }

  const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
  if (!config) {
    return 'Next';
  }

  // If it's the last step, show "Complete"
  if (currentStep === config.steps.length - 1) {
    return 'Complete';
  }

  return 'Next';
};

/**
 * Check if it's the last step
 * @param selectedType Selected data source type
 * @param currentStep Current step index
 * @returns Whether it's the last step
 */
export const isLastStep = (
  selectedType: DataSourceType | null,
  currentStep: number,
): boolean => {
  if (!selectedType) {
    return false;
  }

  const config = DATA_SOURCE_CONFIGS.find((c) => c.type === selectedType);
  if (!config) {
    return false;
  }

  return currentStep === config.steps.length - 1;
};

/**
 * Get display name for data source type
 * @param type Data source type
 * @returns Display name
 */
export const getDataSourceTypeDisplayName = (type: DataSourceType): string => {
  const config = DATA_SOURCE_CONFIGS.find((c) => c.type === type);
  return config?.name || type;
};
