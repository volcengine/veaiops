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

import { waitForNextElement, waitForPageReady } from '../lib';
import { useElementWait } from './use-element-wait';

/**
 * Parameters interface for handling next prerequisite step
 */
interface HandleNextPrerequisiteStepParams {
  currentIndex: number;
  prerequisiteSteps: string[];
  currentStepConfig: any;
}

/**
 * Parameters interface for handling prerequisite steps
 */
interface HandlePrerequisiteStepsParams {
  prerequisiteSteps: string[];
  currentStepConfig: any;
}

/**
 * Hook related to prerequisite step handling
 */
export const usePrerequisiteSteps = () => {
  const { waitForElement } = useElementWait();

  /**
   * Handle element wait for next prerequisite step
   */
  const handleNextPrerequisiteStep = useCallback(
    async ({
      currentIndex,
      prerequisiteSteps,
      currentStepConfig,
    }: HandleNextPrerequisiteStepParams) => {
      if (currentIndex >= prerequisiteSteps.length - 1) {
        return;
      }

      const nextStepId = prerequisiteSteps[currentIndex + 1];
      const nextFeature = currentStepConfig?.frontendFeatures?.find(
        (f: any) => f.id === nextStepId,
      );

      if (nextFeature) {
        await waitForNextElement({ selector: nextFeature.selector });
      }
    },
    [],
  );

  /**
   * Handle prerequisite steps - execute prerequisite steps in order
   */
  const handlePrerequisiteSteps = useCallback(
    async ({
      prerequisiteSteps,
      currentStepConfig,
    }: HandlePrerequisiteStepsParams) => {
      for (let i = 0; i < prerequisiteSteps.length; i++) {
        const stepId = prerequisiteSteps[i];

        // Find prerequisite step in current step
        const prerequisiteFeature = currentStepConfig?.frontendFeatures?.find(
          (feature: any) => feature.id === stepId,
        );

        if (prerequisiteFeature) {
          // Wait for prerequisite step element to appear (waitForElement returns first available element)
          try {
            const targetElement = await waitForElement({
              selector: prerequisiteFeature.selector,
              featureId: stepId,
            });
            const element = targetElement as HTMLElement;

            if (element) {
              element.click();

              // Intelligently wait for page response and next prerequisite step element to appear
              const baseWaitDuration = 500; // Base wait time

              // Wait for base time first, let drawer animation and initial rendering complete
              await waitForPageReady({ maxWaitTime: baseWaitDuration });

              // If there is a next prerequisite step, wait for its element to appear
              await handleNextPrerequisiteStep({
                currentIndex: i,
                prerequisiteSteps,
                currentStepConfig,
              });
            }
          } catch (error) {
            // Continue executing next prerequisite step, don't interrupt entire flow
          }
        }
      }
    },
    [waitForElement, handleNextPrerequisiteStep],
  );

  return { handlePrerequisiteSteps };
};
