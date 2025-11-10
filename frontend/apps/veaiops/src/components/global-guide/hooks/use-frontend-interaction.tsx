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

import { useNavigate } from '@modern-js/runtime/router';
import { useCallback } from 'react';

import type { FeatureActionType } from '../lib';
import { waitForPageReady } from '../lib';
import { useFeatureActions } from './use-feature-actions';
import { useGuideLogger } from './use-guide-logger';
import { usePrerequisiteSteps } from './use-prerequisite-steps';

/**
 * Parameters interface for executing main feature
 */
interface ExecuteMainFeatureParams {
  featureId: string;
  selector: string;
  tooltipContent: string;
  actionType: FeatureActionType;
  targetRoute?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  allowDisabled?: boolean;
}

/**
 * Parameters interface for handling frontend feature click
 */
interface HandleFrontendFeatureClickParams {
  featureId: string;
  selector: string;
  tooltipContent: string;
  actionType?: FeatureActionType;
  targetRoute?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  prerequisiteSteps?: string[];
  currentStepConfig?: any;
  allowDisabled?: boolean;
}

/**
 * Hook for frontend interactions
 * Handles frontend feature clicks and other interaction logic
 *
 * This Hook combines multiple sub-Hooks:
 * - useFeatureActions: Feature actions (highlight guide, direct trigger)
 * - usePrerequisiteSteps: Prerequisite steps handling
 */
export const useFrontendInteraction = () => {
  const navigate = useNavigate();
  const guideLogger = useGuideLogger();
  const { highlightAndGuide, triggerDirectAction } = useFeatureActions();
  const { handlePrerequisiteSteps } = usePrerequisiteSteps();

  /**
   * Execute main feature (extracted common logic)
   */
  const executeMainFeature = useCallback(
    ({
      featureId,
      selector,
      tooltipContent,
      actionType,
      targetRoute,
      placement,
      allowDisabled = false,
    }: ExecuteMainFeatureParams) => {
      if (actionType === 'direct') {
        // Direct trigger type: directly click to trigger feature
        triggerDirectAction({
          selector,
          tooltipContent,
          featureId,
          placement,
          allowDisabled,
        });
      } else if (actionType === 'navigation') {
        // Navigation guide type: need to navigate and highlight
        const currentPath = window.location.pathname;
        const currentSearch = window.location.search;

        // Determine target route based on feature ID
        let finalTargetRoute = targetRoute;
        if (featureId === 'new-datasource') {
          // Only add dataSourceWizardShow=true for new datasource, and remove connectDrawerShow
          const params = new URLSearchParams(currentSearch);
          params.delete('connectDrawerShow'); // Remove connection drawer parameter
          params.set('dataSourceWizardShow', 'true');
          finalTargetRoute = `/system/datasource?${params.toString()}`;
        } else if (
          featureId === 'new-connection' ||
          featureId === 'edit-connection' ||
          featureId === 'test-connection' ||
          featureId === 'delete-connection'
        ) {
          // Connection management related features: remove dataSourceWizardShow, keep connectDrawerShow
          const params = new URLSearchParams(currentSearch);
          params.delete('dataSourceWizardShow'); // Remove datasource wizard parameter
          params.set('connectDrawerShow', 'true');
          finalTargetRoute = `/system/datasource?${params.toString()}`;
        } else if (
          featureId === 'delete-datasource' ||
          featureId === 'edit-datasource' ||
          featureId === 'toggle-datasource'
        ) {
          // Delete, edit, enable/disable datasource: do not add dataSourceWizardShow parameter
          finalTargetRoute = '/system/datasource';
        }

        // Extract path and parameter parts to determine if navigation is needed
        const [finalPath, finalSearch] = (finalTargetRoute || '').split('?');
        const needsNavigation =
          currentPath !== finalPath ||
          currentSearch !== `?${finalSearch || ''}`;

        // If targetRoute is provided, check if navigation is needed
        if (finalTargetRoute && needsNavigation) {
          try {
            // Navigate to target page
            navigate(finalTargetRoute);

            // Log successful navigation jump
            guideLogger.logNavigationJump({
              featureId,
              fromRoute: currentPath,
              toRoute: finalTargetRoute,
              success: true,
            });

            // Intelligently wait for page to load before showing highlight
            waitForPageReady({ maxWaitTime: 1500 }).then(() => {
              // Only show highlight and guide tip if tooltipContent exists
              if (tooltipContent) {
                highlightAndGuide({
                  selector,
                  tooltipContent,
                  featureId,
                  placement,
                  allowDisabled,
                });
              }
            });
          } catch (error) {
            const errorMessage =
              error instanceof Error ? error.message : String(error);

            // Log failed navigation jump
            guideLogger.logNavigationJump({
              featureId,
              fromRoute: currentPath,
              toRoute: finalTargetRoute,
              success: false,
              error: errorMessage,
            });

            // Log error
            guideLogger.logError({
              category: 'NavigationJump',
              action: 'Navigation jump failed',
              error: errorMessage,
              context: {
                featureId,
                currentPath,
                finalTargetRoute,
              },
            });
          }
        } else {
          // Already on target page

          // Log navigation when already on target page
          guideLogger.logNavigationJump({
            featureId,
            fromRoute: currentPath,
            toRoute: finalTargetRoute || currentPath,
            success: true,
          });

          // Only show highlight and guide tip if tooltipContent exists
          if (tooltipContent) {
            highlightAndGuide({
              selector,
              tooltipContent,
              featureId,
              placement,
              allowDisabled,
            });
          }
        }
      }
    },
    [
      navigate,
      triggerDirectAction,
      highlightAndGuide,
      guideLogger,
      waitForPageReady,
    ],
  );

  /**
   * Handle frontend feature click - take different strategies based on actionType
   */
  const handleFrontendFeatureClick = useCallback(
    ({
      featureId,
      selector,
      tooltipContent,
      actionType = 'direct',
      targetRoute,
      placement,
      prerequisiteSteps,
      currentStepConfig,
      allowDisabled = false,
    }: HandleFrontendFeatureClickParams) => {
      const startTime = Date.now();

      // Log feature type judgment
      guideLogger.logFeatureTypeJudgment({
        featureId,
        actionType,
        selector,
        tooltipContent,
      });

      // If there are prerequisite steps, execute them first
      if (prerequisiteSteps && prerequisiteSteps.length > 0) {
        // Asynchronously execute prerequisite steps and main feature
        (async () => {
          try {
            await handlePrerequisiteSteps({
              prerequisiteSteps,
              currentStepConfig,
            });

            // After prerequisite steps complete, continue with main feature
            executeMainFeature({
              featureId,
              selector,
              tooltipContent,
              actionType,
              targetRoute,
              placement,
              allowDisabled,
            });

            // Log user interaction
            const totalTime = Date.now() - startTime;
            guideLogger.logUserInteraction({
              featureId,
              actionType,
              userAction: 'Feature click',
              success: true,
              data: {
                totalTime,
                targetRoute,
                currentPath: window.location.pathname,
                prerequisiteSteps,
              },
            });
          } catch (error) {
            // Prerequisite steps execution failed
          }
        })();
      } else {
        // No prerequisite steps, directly execute main feature
        executeMainFeature({
          featureId,
          selector,
          tooltipContent,
          actionType,
          targetRoute,
          placement,
          allowDisabled,
        });

        // Log user interaction
        const totalTime = Date.now() - startTime;
        guideLogger.logUserInteraction({
          featureId,
          actionType,
          userAction: 'Feature click',
          success: true,
          data: {
            totalTime,
            targetRoute,
            currentPath: window.location.pathname,
            prerequisiteSteps,
          },
        });
      }
    },
    [
      navigate,
      triggerDirectAction,
      highlightAndGuide,
      guideLogger,
      handlePrerequisiteSteps,
      executeMainFeature,
    ],
  );

  return {
    handleFrontendFeatureClick,
    highlightAndGuide,
  };
};
