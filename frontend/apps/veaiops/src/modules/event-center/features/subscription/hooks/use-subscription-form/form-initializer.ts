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

import { ModuleType } from '@/types/module';
import type { FormInstance } from '@arco-design/web-react';
import { AgentType, type SubscribeRelationWithAttributes } from 'api-generate';
import { normalizeStrategyIds } from './strategy-id-normalizer';
import { createDefaultTimeRange, parseTimeRange } from './time-range-utils';

/**
 * List of interest attribute fields
 */
const INTEREST_FIELDS = [
  'interest_products',
  'interest_projects',
  'interest_customers',
  'webhook_endpoint',
] as const;

/**
 * Set interest attribute fields in the form
 *
 * Iterates through all interest attribute fields and sets them in the form if values exist in the initial data.
 * This approach avoids unnecessary field overwrites.
 *
 * @param form - Form instance
 * @param initialData - Initial data
 *
 * @example
 * ```ts
 * setInterestFields(form, {
 *   interest_products: ['product1', 'product2'],
 *   interest_projects: null, // Will not be set
 *   webhook_endpoint: 'https://example.com'
 * });
 * ```
 */
export const setInterestFields = (
  form: FormInstance,
  initialData: SubscribeRelationWithAttributes,
): void => {
  INTEREST_FIELDS.forEach((field) => {
    const value = initialData[field];
    // Only set non-null values
    if (value != null) {
      form.setFieldValue(field, value);
    }
  });
};

/**
 * Create form initial values for edit mode
 *
 * Handles data transformation in edit mode:
 * 1. Normalize strategy IDs (handle object arrays)
 * 2. Parse time range (ISO string to Date)
 * 3. Convert event level field name (event_level -> event_levels)
 * 4. Preserve other field values
 *
 * @param initialData - Initial data
 * @returns Form initial values object
 *
 * @example
 * ```ts
 * const formValues = createEditFormValues({
 *   name: 'Test Subscription',
 *   inform_strategy_ids: [{ id: '123' }, { id: '456' }],
 *   start_time: '2025-01-01T00:00:00.000Z',
 *   end_time: '2025-12-31T23:59:59.999Z',
 *   event_level: ['P0', 'P1'],
 *   // ... other fields
 * });
 * // Result:
 * // {
 * //   name: 'Test Subscription',
 * //   inform_strategy_ids: ['123', '456'],
 * //   effective_time_range: [Date(2025-01-01), Date(2025-12-31)],
 * //   event_levels: ['P0', 'P1'],
 * //   // ... other fields
 * // }
 * ```
 */
export const createEditFormValues = (
  initialData: SubscribeRelationWithAttributes,
): Record<string, unknown> => {
  // Spread initial data, but exclude event_level field to avoid conflicts
  const { event_level, ...restData } = initialData;

  return {
    ...restData,
    // Normalize strategy ID array
    inform_strategy_ids: normalizeStrategyIds(initialData.inform_strategy_ids),
    // Parse time range
    effective_time_range: parseTimeRange(
      initialData.start_time,
      initialData.end_time,
    ),
    // Convert event level field name: event_level (backend) -> event_levels (frontend form)
    // Ensure empty arrays are displayed correctly
    event_levels: Array.isArray(event_level) ? event_level : [],
  };
};

/**
 * Create form initial values for new mode
 *
 * Sets default values when creating a new subscription:
 * 1. Default time range: current time to 100 years later
 * 2. Default event level: empty array (represents all levels selected)
 * 3. Default agent for specific modules:
 *    - Oncall module: defaults to content recognition agent
 *    - Intelligent threshold module: defaults to intelligent threshold agent
 *    - Event center module: defaults to content recognition agent
 *
 * @param moduleType - Module type
 * @returns Form initial values object
 *
 * @example
 * ```ts
 * // Normal mode
 * createNewFormValues()
 * // { effective_time_range: [now, now+100years], event_levels: [] }
 *
 * // Oncall module
 * createNewFormValues(ModuleType.ONCALL)
 * // {
 * //   effective_time_range: [now, now+100years],
 * //   event_levels: [],
 * //   agent_type: 'chatops_interest_agent'
 * // }
 *
 * // Intelligent threshold module
 * createNewFormValues(ModuleType.INTELLIGENT_THRESHOLD)
 * // {
 * //   effective_time_range: [now, now+100years],
 * //   event_levels: [],
 * //   agent_type: 'intelligent_threshold_agent'
 * // }
 *
 * // Event center module
 * createNewFormValues(ModuleType.EVENT_CENTER)
 * // {
 * //   effective_time_range: [now, now+100years],
 * //   event_levels: [],
 * //   agent_type: 'chatops_interest_agent'
 * // }
 * ```
 */
export const createNewFormValues = (
  moduleType?: ModuleType,
): Record<string, unknown> => {
  const defaultValues: Record<string, unknown> = {
    effective_time_range: createDefaultTimeRange(),
    // ⚠️ Note: Although the backend supports empty array to represent "all levels",
    // the frontend has required validation. For better UX, we don't set a default value,
    // letting users actively choose.
    // event_levels: [], // Don't set default value, let users actively choose
  };

  // Set default agent based on module type
  if (moduleType === ModuleType.ONCALL) {
    // Oncall module defaults to content recognition agent
    defaultValues.agent_type = AgentType.CHATOPS_INTEREST_AGENT;
  } else if (moduleType === ModuleType.INTELLIGENT_THRESHOLD) {
    // Intelligent threshold module defaults to intelligent threshold agent
    defaultValues.agent_type = AgentType.INTELLIGENT_THRESHOLD_AGENT;
  }
  // Event center module: don't set default value, as there are two options, let users choose

  return defaultValues;
};

/**
 * Initialize form data
 *
 * Determines initialization strategy based on whether initial data exists:
 * - With initial data: edit mode, use createEditFormValues
 * - Without initial data: new mode, use createNewFormValues
 *
 * @param form - Form instance
 * @param initialData - Initial data (optional)
 * @param moduleType - Module type (optional)
 */
export const initializeForm = (
  form: FormInstance,
  initialData?: SubscribeRelationWithAttributes | null,
  moduleType?: ModuleType,
): void => {
  // Reset form
  form.resetFields();

  if (initialData) {
    // Edit mode: set initial values
    const editValues = createEditFormValues(initialData);
    form.setFieldsValue(editValues);

    // Set interest attribute fields separately (to avoid overwriting)
    setInterestFields(form, initialData);
  } else {
    // New mode: set default values
    const newValues = createNewFormValues(moduleType);
    form.setFieldsValue(newValues);
  }
};
