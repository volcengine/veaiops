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

import { useCallback } from 'react';
import { useGuideLogger } from './use-guide-logger';

export interface WaitForElementParams {
  selector: string;
  featureId: string;
  timeout?: number;
  interval?: number;
  allowDisabled?: boolean;
}

/**
 * Wait for element to appear in DOM
 * @param selector CSS selector
 * @param timeout Timeout in milliseconds
 * @param checkInterval Check interval in milliseconds
 * @param allowDisabled Whether to allow disabled elements (some guides need to show tips for disabled buttons)
 */
export const useElementWait = () => {
  const guideLogger = useGuideLogger();

  const waitForElement = useCallback(
    ({
      selector,
      featureId,
      timeout = 8000,
      interval: checkInterval = 100,
      allowDisabled = false,
    }: WaitForElementParams): Promise<Element> => {
      return new Promise((resolve, reject) => {
        const startTime = Date.now();

        const checkElement = () => {
          const elements = document.querySelectorAll(selector);
          const currentWaitTime = Date.now() - startTime;

          if (elements.length === 0) {
            // No elements found, continue waiting
            if (currentWaitTime >= timeout) {
              const error = `等待元素超时：未找到任何匹配 ${selector} 的元素`;
              reject(new Error(error));
              return;
            }
            setTimeout(checkElement, checkInterval);
            return;
          }

          // Find first available element (not disabled)
          let targetElement: Element | null = null;
          let allDisabled = true;

          for (const el of elements) {
            const isDisabled =
              el.hasAttribute('disabled') ||
              el.getAttribute('aria-disabled') === 'true' ||
              (el as HTMLElement).style.pointerEvents === 'none';

            if (!isDisabled) {
              targetElement = el;
              allDisabled = false;
              break;
            }
          }

          // If available element found, return directly
          if (targetElement) {
            const waitTime = Date.now() - startTime;
            guideLogger.logElementWait({
              featureId,
              selector,
              success: true,
              waitTime,
            });
            resolve(targetElement);
            return;
          }

          // All elements are disabled
          if (allDisabled && allowDisabled) {
            // If disabled elements are allowed, return first element
            const element = elements[0];
            const waitTime = Date.now() - startTime;
            guideLogger.logElementWait({
              featureId,
              selector,
              success: true,
              waitTime,
            });
            resolve(element);
            return;
          }

          // All elements are disabled and disabled elements are not allowed, continue waiting
          if (allDisabled && !allowDisabled) {
            // Check if timeout
            if (Date.now() - startTime >= timeout) {
              reject(new Error('等待可用元素超时：所有元素都被禁用'));
              return;
            }

            setTimeout(checkElement, checkInterval);
          }
        };

        checkElement();
      });
    },
    [guideLogger],
  );

  return { waitForElement };
};
