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

import { logger } from '../logger';

export const forceLoadingSync = (loading: boolean): void => {
  try {
    const selectElements = document.querySelectorAll('.arco-select');
    let syncedCount = 0;

    selectElements.forEach((element) => {
      const currentHasLoading = element.classList.contains(
        'arco-select-loading',
      );

      if (loading && !currentHasLoading) {
        element.classList.add('arco-select-loading');
        syncedCount++;
      } else if (!loading && currentHasLoading) {
        element.classList.remove('arco-select-loading');
        syncedCount++;
      }

      const placeholder = element.querySelector('.arco-select-placeholder');
      if (placeholder) {
        const currentText = placeholder.textContent;
        const expectedText = loading ? 'Searching...' : 'Please select';

        if (currentText !== expectedText) {
          placeholder.textContent = expectedText;
          syncedCount++;
        }
      }
    });

    logger.debug(
      'StateSync',
      `Forced state synchronization completed`,
      {
        loading,
        elementsCount: selectElements.length,
        syncedCount,
        timestamp: Date.now(),
      },
      'forceLoadingSync',
    );

    requestAnimationFrame(() => {
      verifyAndFixInconsistencies();
    });
  } catch (error) {
    logger.error(
      'StateSync',
      'State synchronization failed',
      error as Error,
      {
        loading,
      },
      'forceLoadingSync',
    );
  }
};

export const verifyAndFixInconsistencies = (): void => {
  try {
    const selectElements = document.querySelectorAll('.arco-select');
    let fixCount = 0;

    selectElements.forEach((element) => {
      const hasLoadingClass = element.classList.contains('arco-select-loading');
      const placeholder = element.querySelector('.arco-select-placeholder');
      const placeholderText = placeholder?.textContent;

      if (hasLoadingClass && placeholderText !== 'Searching...') {
        if (placeholder) {
          placeholder.textContent = 'Searching...';
          fixCount++;
        }
      } else if (!hasLoadingClass && placeholderText === 'Searching...') {
        if (placeholder) {
          placeholder.textContent = 'Please select';
          fixCount++;
        }
      }
    });

    if (fixCount > 0) {
      logger.info(
        'StateSync',
        `Fixed ${fixCount} state inconsistency issues`,
        {
          fixCount,
          elementsChecked: selectElements.length,
        },
        'verifyAndFixInconsistencies',
      );
    }
  } catch (error) {
    logger.error(
      'StateSync',
      'State verification and fix failed',
      error as Error,
      {},
      'verifyAndFixInconsistencies',
    );
  }
};

export const checkStateConsistency = (): {
  consistent: boolean;
  details: any;
} => {
  try {
    const selectElements = document.querySelectorAll('.arco-select');
    const inconsistencies: Array<{
      elementIndex: number;
      issue: string;
      expected: string;
      actual: string | null | undefined;
    }> = [];

    selectElements.forEach((element, index) => {
      const domHasLoading = element.classList.contains('arco-select-loading');
      const placeholder = element.querySelector('.arco-select-placeholder');
      const placeholderText = placeholder?.textContent;
      const expectedPlaceholder = domHasLoading
        ? 'Searching...'
        : 'Please select';

      if (placeholderText !== expectedPlaceholder) {
        inconsistencies.push({
          elementIndex: index,
          issue: 'placeholder_mismatch',
          expected: expectedPlaceholder,
          actual: placeholderText ?? null,
        });
      }
    });

    const result = {
      consistent: inconsistencies.length === 0,
      details: {
        elementsChecked: selectElements.length,
        inconsistencies,
        timestamp: Date.now(),
      },
    };

    logger.debug(
      'StateSync',
      'State consistency check completed',
      result,
      'checkStateConsistency',
    );

    return result;
  } catch (error) {
    logger.error(
      'StateSync',
      'State consistency check failed',
      error as Error,
      {},
      'checkStateConsistency',
    );
    return {
      consistent: false,
      details: { error: (error as Error).message },
    };
  }
};
