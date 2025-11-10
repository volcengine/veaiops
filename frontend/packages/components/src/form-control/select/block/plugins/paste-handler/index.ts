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
import { logger } from '../../logger';
import type {
  PasteHandlerConfig,
  PasteHandlerPlugin,
  PluginContext,
} from '../../types/plugin';
import { PasteDataFetcher } from './data-fetchers/paste-data-fetcher';
import { TokenSeparatorUtils } from './utils/token-separator-utils';
import { PasteValidator } from './validators/paste-validator';

// Import split utility classes

// Re-export utility classes for backward compatibility
export { TokenSeparatorUtils };

/**
 * Paste handler plugin implementation
 */
export class PasteHandlerPluginImpl implements PasteHandlerPlugin {
  name = 'paste-handler';

  config: PasteHandlerConfig;

  private context!: PluginContext;

  private validator!: PasteValidator;

  private dataFetcher!: PasteDataFetcher;

  private logger = logger;

  constructor(config: PasteHandlerConfig) {
    this.config = config;
  }

  init(context: PluginContext): void {
    this.context = context;
    this.validator = new PasteValidator(context);
    this.dataFetcher = new PasteDataFetcher(context);
  }

  /**
   * Handle paste event
   */
  handlePaste(event: ClipboardEvent): void {
    // Defensive check: ensure config object and context exist
    if (!this.config) {
      console.warn(
        '[PasteHandler] Config object not initialized, skipping paste handling',
      );
      return;
    }

    if (!this.context) {
      console.warn(
        '[PasteHandler] Context has been destroyed, skipping paste handling',
      );
      return;
    }

    const {
      allowPasteMultiple,
      mode,
      tokenSeparators,
      beforePasteProcess,
      onPaste,
    } = this.config;

    // Only effective in multiple mode and when paste multiple values is allowed
    if (!allowPasteMultiple || mode !== 'multiple') {
      return;
    }

    const pastedText = event.clipboardData?.getData('text') || '';
    if (!pastedText.trim()) {
      return;
    }

    // Prevent default behavior
    event.preventDefault();

    // 🔧 Enhanced separator support - use custom or default separators
    const separators =
      tokenSeparators || TokenSeparatorUtils.getDefaultSeparators();

    // Use enhanced text splitting method
    const splitValues = TokenSeparatorUtils.splitTextByMultipleSeparators(
      pastedText,
      separators,
    );

    if (splitValues.length === 0) {
      return;
    }

    // Process each value
    const processedValues = this.validator.processPastedValues(
      splitValues,
      beforePasteProcess,
    );

    // Call user-defined onPaste callback
    if (onPaste) {
      onPaste(processedValues, event);
    }

    // Update component value
    this.updateValue(processedValues);
  }

  /**
   * Update component value (includes complete validation and error handling)
   */
  private async updateValue(newValues: string[]): Promise<void> {
    // 🔧 Defensive check: ensure context exists, avoid async operations after component destruction
    if (!this.context) {
      console.warn(
        '[PasteHandler] Context has been destroyed, skipping value update',
      );
      return;
    }

    const { props } = this.context;

    // Get currently selected values, ensure type consistency
    let rawCurrentValues: (string | number)[] = [];

    if (Array.isArray(props.value)) {
      rawCurrentValues = props.value
        .map((v) => (typeof v === 'object' ? v.value : v))
        .filter((v) => v !== undefined);
    } else if (props.value !== undefined && props.value !== null) {
      const singleValue =
        typeof props.value === 'object' ? props.value.value : props.value;
      if (singleValue !== undefined) {
        rawCurrentValues = [singleValue];
      }
    }

    // Keep original type of current values, let onChangeProcessor handle final type conversion
    const currentValues = rawCurrentValues;

    try {
      // 🔧 Step 1: Basic validation and preprocessing
      const preValidationResult = this.validator.preValidateValues(newValues);
      if (!preValidationResult.isValid) {
        Message.error(
          preValidationResult.errorMessage || 'Paste data validation failed',
        );
        return;
      }

      // 🔧 Step 2: Value type conversion
      const processedNewValues = this.validator.convertValueTypes(
        preValidationResult.validValues,
      );

      // 🔧 Step 3: Deduplication check
      const deduplicationResult = this.validator.checkDuplication(
        processedNewValues,
        currentValues,
      );
      if (deduplicationResult.hasNewValues === false) {
        Message.warning(
          'All pasted values already exist, no need to add duplicates',
        );
        return;
      }

      // 🔧 Step 4: Quantity limit check
      const limitCheckResult = this.validator.checkLimits(
        deduplicationResult.newUniqueValues,
        currentValues,
      );
      if (!limitCheckResult.isValid) {
        Message.error(
          limitCheckResult.errorMessage || 'Quantity limit check failed',
        );
        return;
      }

      // 🔧 Step 5: Data source validation (verify if values actually exist)
      const validationResult = await this.validator.validateAgainstDataSource(
        limitCheckResult.finalValues,
      );

      // Handle validation results
      if (validationResult.validValues.length === 0) {
        Message.error(
          `All pasted values are invalid: ${validationResult.invalidValues.join(', ')}`,
        );
        return;
      }

      // Partial success case
      if (validationResult.invalidValues.length > 0) {
        Message.warning(
          `Invalid values ignored: ${validationResult.invalidValues.join(', ')}\n` +
            `Successfully added: ${validationResult.validValues.length} values`,
        );
      } else {
        Message.success(
          `Successfully pasted ${validationResult.validValues.length} accounts`,
        );
      }

      // 🔧 Step 6: Update component value and trigger data fetch
      const finalMergedValues = Array.from(
        new Set([...currentValues, ...validationResult.validValues]),
      );

      if (props.onChange) {
        // 🔧 Use onChangeProcessor to handle value types passed to form
        const processedValues = props.onChangeProcessor
          ? props.onChangeProcessor(finalMergedValues)
          : finalMergedValues; // If no onChangeProcessor, keep original type

        // Construct option information
        const optionInfo = validationResult.validValues.map((val) => ({
          value: val,
          label: String(val),
        }));

        this.logger.info(
          'PasteHandler',
          '🟢 Paste triggered onChange',
          {
            processedValues,
            optionInfo,
            placeholder: props.placeholder,
            addBefore: (props as any).addBefore,
            timestamp: new Date().toISOString(),
          },
          'handlePaste',
        );

        props.onChange(processedValues, optionInfo as any);
      }

      // 🔧 Important: Trigger data fetch after paste, ensure newly pasted values can be searched
      await this.dataFetcher.triggerDataFetchForPastedValues(
        validationResult.validValues,
      );
    } catch (error) {
      Message.error(
        'An error occurred while validating paste data, please try again',
      );
    }
  }

  /**
   * Create paste event handler
   */
  createPasteHandler(): ((event: ClipboardEvent) => void) | undefined {
    // Defensive check: ensure config object and context exist
    if (!this.config || !this.config.allowPasteMultiple) {
      return undefined;
    }

    if (!this.context) {
      console.warn(
        '[PasteHandler] Context has been destroyed, cannot create paste handler',
      );
      return undefined;
    }

    // Bind this context to prevent this from being lost when called
    return this.handlePaste.bind(this);
  }

  destroy(): void {
    this.context = null as any;
  }
}
