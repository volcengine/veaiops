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

import type React from 'react';
import { FORM_FIELD_CONFIGS } from './config';
import { FormField } from './form-field';
import type { FormFieldsListProps } from './types';

/**
 * Form fields list component
 * Renders corresponding form fields based on connection type
 */
export const FormFieldsList: React.FC<FormFieldsListProps> = ({
  connectType,
  connect,
  disabledFields = [],
}) => {
  const fieldConfigs = FORM_FIELD_CONFIGS[connectType] || [];

  return (
    <>
      {fieldConfigs.map((config) => {
        const isDisabled = disabledFields.includes(config.field);
        // Password fields are not pre-filled, always empty, let user input manually
        let initialValue: string | undefined;
        if (config.isPassword) {
          initialValue = undefined;
        } else if (
          connect &&
          typeof connect === 'object' &&
          config.field in connect
        ) {
          // ✅ Fix: Use type guard to safely access dynamic fields
          // Connect type includes Record<string, unknown> index signature, can safely access any field
          // Use type check to ensure field value type is correct
          const fieldValue = (connect as Record<string, unknown>)[config.field];
          initialValue =
            typeof fieldValue === 'string' ? fieldValue : undefined;
        } else {
          initialValue = undefined;
        }

        return (
          <FormField
            key={config.field}
            config={config}
            disabled={isDisabled}
            initialValue={initialValue}
          />
        );
      })}
    </>
  );
};
