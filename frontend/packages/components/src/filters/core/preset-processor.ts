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

import { filterPresetRegistry } from '../presets';
/**
 * Preset processor
 * Process field items with preset configuration
 */
import type { FieldItem } from './types';

/**
 * Process preset configuration
 * @param field - Field configuration
 * @returns - Processed field configuration
 */
export const processPreset = (field: FieldItem): FieldItem => {
  // If no preset configuration, return directly
  if (!field.preset) {
    return field;
  }

  // Get preset generator
  const presetGenerator = filterPresetRegistry.get(field.preset);
  if (!presetGenerator) {
    return field;
  }

  // Generate preset configuration
  const presetConfig = presetGenerator(field.componentProps);

  // Merge configuration, user configuration takes priority
  const mergedField: FieldItem = {
    ...presetConfig,
    ...field,
    // Deep merge componentProps
    componentProps: {
      ...presetConfig.componentProps,
      ...field.componentProps,
    },
  };

  // Remove preset property to avoid duplicate processing
  delete mergedField.preset;

  return mergedField;
};

/**
 * Batch process preset configurations
 * @param fields - Field configuration list
 * @returns - Processed field configuration list
 */
export const processPresets = (fields: FieldItem[]): FieldItem[] => {
  return fields.map(processPreset);
};
