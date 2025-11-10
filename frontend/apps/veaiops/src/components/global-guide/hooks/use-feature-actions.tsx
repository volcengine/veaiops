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

import { showGuideTip } from '../ui';
import { useElementWait } from './use-element-wait';
import { useGuideLogger } from './use-guide-logger';

/**
 * Highlight guide parameter interface
 */
interface HighlightAndGuideParams {
  selector: string;
  tooltipContent: string;
  featureId: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  allowDisabled?: boolean;
}

/**
 * Direct trigger action parameter interface
 */
interface TriggerDirectActionParams {
  selector: string;
  tooltipContent: string;
  featureId: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  allowDisabled?: boolean;
}

/**
 * Feature action related Hook
 * Includes highlight guide, direct trigger, and other functionality
 */
export const useFeatureActions = () => {
  const { waitForElement } = useElementWait();
  const guideLogger = useGuideLogger();

  /**
   * Highlight target element and show guide tip
   */
  const highlightAndGuide = useCallback(
    async ({
      selector,
      tooltipContent,
      featureId,
      placement = 'top',
      allowDisabled = false,
    }: HighlightAndGuideParams) => {
      const startTime = Date.now();

      try {
        // Wait for element to appear
        const targetElement = await waitForElement({
          selector,
          featureId,
          timeout: 8000,
          interval: 100,
          allowDisabled,
        });

        if (targetElement) {
          // Scroll to target element
          const scrollStartTime = Date.now();
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });

          // Delay a bit to ensure scroll completes
          await new Promise((resolve) => setTimeout(resolve, 300));
          const scrollTime = Date.now() - scrollStartTime;

          showGuideTip({
            content: tooltipContent,
            selector,
            placement,
            showArrow: true,
            buttonText: '知道了',
            autoClose: false, // Don't auto-close, user clicks to close
            closeOnOutsideClick: true, // Close when clicking outside area
          });

          const totalTime = Date.now() - startTime;

          // Log successful highlight guide
          guideLogger.logHighlightGuide({
            featureId,
            selector,
            success: true,
            scrollTime,
          });

          // Log performance metrics
          guideLogger.logPerformance({
            featureId,
            actionType: 'navigation',
            metrics: {
              totalTime,
              scrollTime,
              guideTime: totalTime - scrollTime,
            },
          });
        }
      } catch (error) {
        const totalTime = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Log failed highlight guide
        guideLogger.logHighlightGuide({
          featureId,
          selector,
          success: false,
          scrollTime: 0,
          error: errorMessage,
        });

        // Log error
        guideLogger.logError({
          category: 'HighlightGuide',
          action: '高亮引导失败',
          error: errorMessage,
          context: {
            featureId,
            selector,
            totalTime,
          },
        });
      }
    },
    [waitForElement, guideLogger],
  );

  /**
   * Directly trigger functionality (e.g., open modal)
   */
  const triggerDirectAction = useCallback(
    async ({
      selector,
      tooltipContent,
      featureId,
      placement,
      allowDisabled = false,
    }: TriggerDirectActionParams) => {
      const startTime = Date.now();

      try {
        // Wait for element to appear in DOM
        const element = await waitForElement({
          selector,
          featureId,
          timeout: 8000,
          interval: 100,
          allowDisabled,
        });
        const targetElement = element as HTMLElement;

        if (targetElement) {
          // Check if element is disabled (waitForElement may return disabled element when allowDisabled=true and all elements are disabled)
          const isDisabled =
            targetElement.hasAttribute('disabled') ||
            targetElement.getAttribute('aria-disabled') === 'true' ||
            targetElement.style.pointerEvents === 'none';

          // If element is disabled and allowDisabled=true, only show guide without triggering click
          if (isDisabled && allowDisabled) {
            const totalTime = Date.now() - startTime;

            // Show guide tip at disabled element position
            showGuideTip({
              content: tooltipContent,
              selector,
              placement: placement || 'top',
              showArrow: true,
              buttonText: '知道了',
              autoClose: false,
              closeOnOutsideClick: true,
            });

            // Log successful guide display (even though click was not triggered)
            guideLogger.logDirectAction({
              featureId,
              selector,
              success: true,
            });
            guideLogger.logPerformance({
              featureId,
              actionType: 'direct',
              metrics: { totalTime },
            });
            return;
          }

          // Directly trigger click event
          targetElement.click();
          const totalTime = Date.now() - startTime;

          // Log successful direct trigger
          guideLogger.logDirectAction({
            featureId,
            selector,
            success: true,
          });

          // Log performance metrics
          guideLogger.logPerformance({
            featureId,
            actionType: 'direct',
            metrics: {
              totalTime,
            },
          });
        }
      } catch (error) {
        const totalTime = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : String(error);

        // Log failed direct trigger
        guideLogger.logDirectAction({
          featureId,
          selector,
          success: false,
          error: errorMessage,
        });

        // Log error
        guideLogger.logError({
          category: 'DirectAction',
          action: '直接触发失败',
          error: errorMessage,
          context: {
            featureId,
            selector,
            totalTime,
          },
        });
      }
    },
    [waitForElement, guideLogger],
  );

  return { highlightAndGuide, triggerDirectAction };
};
