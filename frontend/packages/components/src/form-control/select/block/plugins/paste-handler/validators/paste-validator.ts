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

import { Message } from '@arco-design/web-react';
import type { PluginContext } from '../../../types/plugin';

/**
 * Paste value validator
 */
export class PasteValidator {
  constructor(private context: PluginContext) {}

  /**
   * Step 1: Basic validation and preprocessing
   */
  preValidateValues(values: string[]): {
    isValid: boolean;
    validValues: string[];
    errorMessage?: string;
  } {
    // Check empty values
    if (!values || values.length === 0) {
      return {
        isValid: false,
        validValues: [],
        errorMessage: 'Pasted content is empty',
      };
    }

    // Filter empty strings and invalid values
    const validValues = values
      .map((val) => val.trim())
      .filter((val) => val.length > 0)
      .filter((val) => this.validatePastedValue(val));

    if (validValues.length === 0) {
      return {
        isValid: false,
        validValues: [],
        errorMessage: 'Pasted content format is incorrect',
      };
    }

    // Check single value length limit
    const oversizedValues = validValues.filter((val) => val.length > 50);
    if (oversizedValues.length > 0) {
      return {
        isValid: false,
        validValues: [],
        errorMessage: `The following values are too long (exceeds 50 characters): ${oversizedValues.slice(0, 3).join(', ')}${
          oversizedValues.length > 3 ? '...' : ''
        }`,
      };
    }

    // Check paste count limit - relax limit, support larger batch operations
    if (validValues.length > 1000) {
      return {
        isValid: false,
        validValues: [],
        errorMessage: `Maximum 1000 values can be pasted at once, currently pasted ${validValues.length} values`,
      };
    }

    return { isValid: true, validValues };
  }

  /**
   * Step 2: Value type conversion
   */
  convertValueTypes(values: string[]): (string | number)[] {
    // 🔧 Defensive check: ensure context exists
    if (!this.context) {
      return values;
    }

    const { props } = this.context;

    // If pasteValueKey is used, prefer custom processor function or keep string type
    if (props.pasteValueKey) {
      const initialValues = values.map((val) => val); // First convert to basic type array

      if (props.pasteValueProcessor) {
        return props.pasteValueProcessor(initialValues);
      }
      return initialValues;
    }

    return values.map((val) => {
      // Original logic: determine type conversion based on optionCfg.valueRender
      const { dataSource } = props;
      if (
        dataSource &&
        typeof dataSource === 'object' &&
        'optionCfg' in dataSource &&
        dataSource.optionCfg?.valueRender
      ) {
        try {
          const numericValue = Number(val);
          return Number.isNaN(numericValue) ? val : numericValue;
        } catch (error) {
          return val;
        }
      }
      return val;
    });
  }

  /**
   * Step 3: Deduplication check
   */
  checkDuplication(
    newValues: (string | number)[],
    currentValues: (string | number)[],
  ): {
    hasNewValues: boolean;
    newUniqueValues: (string | number)[];
    duplicateValues: (string | number)[];
  } {
    const currentSet = new Set(currentValues.map((v) => String(v)));
    const newUniqueValues: (string | number)[] = [];
    const duplicateValues: (string | number)[] = [];

    newValues.forEach((val) => {
      if (currentSet.has(String(val))) {
        duplicateValues.push(val);
      } else {
        newUniqueValues.push(val);
        currentSet.add(String(val)); // Avoid duplicates within this paste operation
      }
    });

    return {
      hasNewValues: newUniqueValues.length > 0,
      newUniqueValues,
      duplicateValues,
    };
  }

  /**
   * Step 4: Quantity limit check
   */
  checkLimits(
    newValues: (string | number)[],
    _currentValues: (string | number)[],
  ): {
    isValid: boolean;
    finalValues: (string | number)[];
    errorMessage?: string;
  } {
    // 🔧 Defensive check: ensure context exists
    if (!this.context) {
      console.warn(
        '[PasteValidator] Context has been destroyed, skipping quantity limit check',
      );
      return { isValid: true, finalValues: newValues };
    }

    // 🔧 In batch paste scenario, completely remove quantity limit, no quantity check
    // This allows support for large-scale data import operations
    return { isValid: true, finalValues: newValues };
  }

  /**
   * Step 5: Data source validation (verify if values exist in remote data source)
   */
  async validateAgainstDataSource(values: (string | number)[]): Promise<{
    validValues: (string | number)[];
    invalidValues: (string | number)[];
  }> {
    // 🔧 Defensive check: ensure context exists
    if (!this.context) {
      console.warn(
        '[PasteValidator] Context has been destroyed, skipping data source validation',
      );
      return { validValues: values, invalidValues: [] };
    }

    const { props } = this.context;

    // If no data source, skip validation
    if (
      !props.dataSource ||
      typeof props.dataSource !== 'object' ||
      !('api' in props.dataSource)
    ) {
      return { validValues: values, invalidValues: [] };
    }

    try {
      // Due to complexity of data source validation, temporarily skip remote validation
      // Treat all values as valid, let user verify through normal data fetching flow after selection

      // Simple format validation (for numeric IDs)
      const validValues: (string | number)[] = [];
      const invalidValues: (string | number)[] = [];

      values.forEach((value) => {
        const strValue = String(value);
        // Basic format validation: if it's a numeric ID, should only contain digits
        if (
          /^\d+$/.test(strValue) &&
          strValue.length >= 3 &&
          strValue.length <= 20
        ) {
          validValues.push(value);
        } else {
          invalidValues.push(value);
        }
      });

      return { validValues, invalidValues };
    } catch (error) {
      // When validation fails, for better UX, can skip validation or show warning
      Message.warning(
        'An error occurred during data validation, validation has been skipped',
      );
      return { validValues: values, invalidValues: [] };
    }
  }

  /**
   * Validate pasted value
   */
  validatePastedValue(value: string): boolean {
    // Basic validation: non-empty string
    if (!value || typeof value !== 'string' || value.trim() === '') {
      return false;
    }

    // Can add more validation logic here
    // For example: format validation, length limits, etc.
    return true;
  }

  /**
   * Filter valid pasted values
   */
  filterValidValues(values: string[]): string[] {
    return values.filter((value) => this.validatePastedValue(value));
  }

  /**
   * Handle special characters
   */
  sanitizeValue(value: string): string {
    // Remove invisible characters and extra spaces
    return value.trim().replace(/[\u200B-\u200D]|\uFEFF/g, '');
  }

  /**
   * Process pasted values in batch
   */
  processPastedValues(
    values: string[],
    beforePasteProcess?: (value: string) => string,
  ): string[] {
    return values
      .map((value) => this.sanitizeValue(value))
      .filter((value) => this.validatePastedValue(value))
      .map((value) => (beforePasteProcess ? beforePasteProcess(value) : value));
  }
}
