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
import { logger } from '@veaiops/utils';
import { useCallback, useRef } from 'react';

import type { GlobalGuideStepNumber } from '../enums/guide-steps.enum';
import type { GlobalGuideStep, StepStatus } from '../lib';
import {
  GUIDE_STEPS_CONFIG,
  globalGuideTracker,
  useGlobalGuideStore,
} from '../lib';

/**
 * Auto-highlight frontend feature parameter interface
 */
interface HandleAutoHighlightFeatureParams {
  featureId: string;
  selector: string;
  tooltipContent: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * useStepNavigation Hook parameter interface
 */
export interface UseStepNavigationParams {
  onAutoHighlightFeature?: (params: HandleAutoHighlightFeatureParams) => void;
}

/**
 * Step navigation related Hook
 * Handles step click, status retrieval, step completion, and other logic
 */
export const useStepNavigation = ({
  onAutoHighlightFeature,
}: UseStepNavigationParams = {}) => {
  const navigate = useNavigate();
  const { currentStep, stepStatusMap, updateStepStatus, updateCurrentStep } =
    useGlobalGuideStore();

  const steps: GlobalGuideStep[] = GUIDE_STEPS_CONFIG;

  // Track whether frontend feature highlighting has been manually triggered
  const manualHighlightTriggered = useRef<Set<string>>(new Set());

  // Mark manually triggered frontend feature
  const markManualHighlight = useCallback((featureId: string) => {
    manualHighlightTriggered.current.add(featureId);
    logger.info({
      message: '[GlobalGuide] 标记手动触发的前端功能',
      data: {
        featureId,
        triggeredFeatures: Array.from(manualHighlightTriggered.current),
      },
      source: 'GlobalGuide',
      component: 'markManualHighlight',
    });
  }, []);

  // Check if a feature has been manually triggered
  const isManualHighlighted = useCallback((featureId: string) => {
    return manualHighlightTriggered.current.has(featureId);
  }, []);

  // Get current step status
  const getStepStatus = useCallback(
    (stepNumber: GlobalGuideStepNumber): StepStatus => {
      return stepStatusMap[stepNumber] || 'pending';
    },
    [stepStatusMap],
  );

  // Handle step selection (only update state, no navigation)
  const handleStepSelect = useCallback(
    (stepNumber: GlobalGuideStepNumber) => {
      logger.info({
        message: '[GlobalGuide] 步骤选择 - 只更新状态',
        data: {
          stepNumber,
          previousStep: currentStep,
          stepStatusMap,
        },
        source: 'GlobalGuide',
        component: 'handleStepSelect',
      });

      updateCurrentStep(stepNumber);

      logger.info({
        message: '[GlobalGuide] 步骤选择完成 - 状态已更新',
        data: {
          stepNumber,
          newCurrentStep: stepNumber,
        },
        source: 'GlobalGuide',
        component: 'handleStepSelect',
      });
    },
    [updateCurrentStep, currentStep, stepStatusMap],
  );

  // Handle step click (includes navigation logic)
  const handleStepClick = useCallback(
    (stepNumber: number) => {
      logger.info({
        message: `[GlobalGuide] 步骤点击开始`,
        data: {
          stepNumber,
          currentPath: window.location.pathname,
          currentSearch: window.location.search,
          currentUrl: window.location.href,
        },
        source: 'GlobalGuide',
        component: 'handleStepClick',
      });

      const step = steps.find((s) => s.number === stepNumber);
      if (step) {
        logger.info({
          message: `[GlobalGuide] 找到步骤配置`,
          data: {
            stepNumber,
            stepTitle: step.title,
            stepRoute: step.route,
            routeHasParams: step.route.includes('?'),
          },
          source: 'GlobalGuide',
          component: 'handleStepClick',
        });

        updateCurrentStep(stepNumber);

        // Intelligently handle steps with URL parameters
        if (step.route.includes('?')) {
          // Parse route and parameters
          const [path, search] = step.route.split('?');

          logger.info({
            message: `[GlobalGuide] 路由已包含参数，使用 navigate 跳转`,
            data: {
              stepNumber,
              targetRoute: step.route,
              path,
              search,
              currentUrl: window.location.href,
              navigationMode: 'navigate',
            },
            source: 'GlobalGuide',
            component: 'handleStepClick',
          });

          // Use navigate for SPA route navigation
          navigate({ pathname: path, search: `?${search}` });
        } else {
          // If route does not include parameters, check if specific parameters need to be added
          const currentPath = window.location.pathname;
          const currentSearch = window.location.search;

          logger.info({
            message: `[GlobalGuide] 检查是否需要添加参数`,
            data: {
              stepNumber,
              currentPath,
              currentSearch,
              targetRoute: step.route,
              isOnTargetPage: currentPath === step.route,
            },
            source: 'GlobalGuide',
            component: 'handleStepClick',
          });

          // 🔥 Fix: No longer automatically open drawer via URL parameters, only navigate to page and highlight
          // Check if currently on target page
          if (
            currentPath === step.route ||
            currentPath === step.route.split('?')[0]
          ) {
            // Already on target page, no navigation needed, only trigger frontend feature highlighting
            logger.info({
              message: `[GlobalGuide] 已在目标页面，触发前端功能高亮`,
              data: {
                stepNumber,
                currentPath,
                targetRoute: step.route,
              },
              source: 'GlobalGuide',
              component: 'handleStepClick',
            });
          } else {
            // If not on target page, navigate to target route (without URL parameters)
            const baseRoute = step.route.split('?')[0];
            logger.info({
              message: `[GlobalGuide] 不在目标页面，导航到路由`,
              data: {
                stepNumber,
                targetRoute: baseRoute,
              },
              source: 'GlobalGuide',
              component: 'handleStepClick',
            });
            navigate(baseRoute);
          }
        }

        globalGuideTracker.trackStepView(stepNumber);

        // Delay checking final URL state and automatically trigger frontend feature highlighting
        setTimeout(() => {
          logger.info({
            message: `[GlobalGuide] 步骤点击完成（延迟检查）`,
            data: {
              stepNumber,
              finalUrl: window.location.href,
              finalPath: window.location.pathname,
              finalSearch: window.location.search,
            },
            source: 'GlobalGuide',
            component: 'handleStepClick-delayed',
          });

          // Automatically trigger highlighting guide for first frontend feature
          // Only automatically highlight first feature if no features in this step have been manually triggered
          if (
            onAutoHighlightFeature &&
            step.frontendFeatures &&
            step.frontendFeatures.length > 0
          ) {
            const firstFeature = step.frontendFeatures[0];

            // Check if any features in current step have been manually triggered
            const hasAnyManualHighlight = step.frontendFeatures.some(
              (feature) => isManualHighlighted(feature.id),
            );

            // Only automatically highlight first feature if no features have been manually triggered
            if (
              !hasAnyManualHighlight &&
              !isManualHighlighted(firstFeature.id)
            ) {
              logger.info({
                message: '[GlobalGuide] 自动触发前端功能高亮',
                data: {
                  stepNumber,
                  featureId: firstFeature.id,
                  featureName: firstFeature.name,
                  selector: firstFeature.selector,
                  placement: firstFeature.placement,
                  tooltipContent: firstFeature.tooltipContent,
                  reason: '步骤内无手动触发过的功能',
                },
                source: 'GlobalGuide',
                component: 'handleStepClick-autoHighlight',
              });

              // Delay trigger to ensure page has loaded
              setTimeout(() => {
                onAutoHighlightFeature?.({
                  featureId: firstFeature.id,
                  selector: firstFeature.selector,
                  tooltipContent: firstFeature.tooltipContent || '',
                  placement: firstFeature.placement,
                });
              }, 1000);
            } else {
              logger.info({
                message: '[GlobalGuide] 跳过自动触发前端功能高亮',
                data: {
                  stepNumber,
                  featureId: firstFeature.id,
                  featureName: firstFeature.name,
                  hasAnyManualHighlight,
                  reason: hasAnyManualHighlight
                    ? '步骤内已有功能被手动触发'
                    : '该功能已手动触发过',
                },
                source: 'GlobalGuide',
                component: 'handleStepClick-autoHighlight',
              });
            }
          }
        }, 200);

        logger.info({
          message: `[GlobalGuide] 步骤点击完成`,
          data: {
            stepNumber,
            finalUrl: window.location.href,
          },
          source: 'GlobalGuide',
          component: 'handleStepClick',
        });
      } else {
        logger.warn({
          message: `[GlobalGuide] 未找到步骤配置`,
          data: {
            stepNumber,
            availableSteps: steps.map((s) => ({
              number: s.number,
              title: s.title,
            })),
          },
          source: 'GlobalGuide',
          component: 'handleStepClick',
        });
      }
    },
    [
      steps,
      updateCurrentStep,
      navigate,
      isManualHighlighted,
      onAutoHighlightFeature,
    ],
  );

  // Handle step completion
  const handleStepComplete = useCallback(
    (stepNumber: GlobalGuideStepNumber) => {
      updateStepStatus(stepNumber, 'completed');
      globalGuideTracker.trackStepComplete(stepNumber);

      // No longer auto-navigate, let user manually control
      // Can display a prompt to inform user what the next step is
      const nextStep = steps.find((s) => s.number === stepNumber + 1);
    },
    [steps, updateStepStatus],
  );

  // Handle quick fix
  const handleQuickFix = useCallback(
    (stepNumber: number, fixType: string) => {
      globalGuideTracker.trackQuickFix({ stepNumber, fixType });

      const step = steps.find((s) => s.number === stepNumber);
      if (step) {
        navigate(step.route);
      }
    },
    [steps, navigate],
  );

  return {
    steps,
    currentStep,
    getStepStatus,
    handleStepSelect,
    handleStepClick,
    handleStepComplete,
    handleQuickFix,
    markManualHighlight,
    isManualHighlighted,
  };
};
