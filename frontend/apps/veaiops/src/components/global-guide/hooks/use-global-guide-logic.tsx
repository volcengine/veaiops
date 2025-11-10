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

import { logger } from '@veaiops/utils';
import { useCallback, useEffect } from 'react';

import { GlobalGuideStepNumber } from '../enums/guide-steps.enum';
import type { GlobalGuideStep } from '../lib';
import {
  GUIDE_STEPS_CONFIG,
  getCurrentStepIssues,
  useGlobalGuideStore,
} from '../lib';
import { useConsoleCommands } from './use-console-commands';
import { useFrontendInteraction } from './use-frontend-interaction';
import { usePanelState } from './use-panel-state';
import { useStepNavigation } from './use-step-navigation';

/**
 * Auto highlight feature parameters interface
 */
interface HandleAutoHighlightFeatureParams {
  featureId: string;
  selector: string;
  tooltipContent: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
}

/**
 * Handle frontend feature click parameters interface
 */
interface HandleFrontendFeatureClickParams {
  featureId: string;
  selector: string;
  tooltipContent: string;
  actionType?: any;
  targetRoute?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  prerequisiteSteps?: string[];
  currentStepConfig?: any;
  allowDisabled?: boolean;
}

/**
 * Main business logic Hook for global guide component
 * Combines various sub-Hooks to provide complete business logic
 */
export const useGlobalGuideLogic = () => {
  const { currentStep, stepStatusMap, userProgress, sideGuidePanelVisible } =
    useGlobalGuideStore();

  // Use various sub-Hooks
  const frontendInteraction = useFrontendInteraction();

  const handleAutoHighlightFeature = useCallback(
    ({
      featureId,
      selector,
      tooltipContent,
      placement,
    }: HandleAutoHighlightFeatureParams) => {
      logger.info({
        message: '[GlobalGuide] 自动高亮前端功能',
        data: {
          featureId,
          selector,
          tooltipContent,
          hasTooltipContent: Boolean(tooltipContent),
          placement,
          timestamp: new Date().toISOString(),
        },
        source: 'GlobalGuide',
        component: 'handleAutoHighlightFeature',
      });

      // Only show highlight and guide tip if tooltipContent exists
      if (tooltipContent) {
        frontendInteraction.highlightAndGuide({
          selector,
          tooltipContent,
          featureId,
          placement,
        });
      } else {
        logger.info({
          message: '[GlobalGuide] 无需显示提示，跳过自动高亮',
          data: {
            featureId,
            selector,
          },
          source: 'GlobalGuide',
          component: 'handleAutoHighlightFeature',
        });
      }
    },
    [frontendInteraction],
  );

  const stepNavigation = useStepNavigation({
    onAutoHighlightFeature: handleAutoHighlightFeature,
  });
  const panelState = usePanelState();
  // const routeListener = useRouteListener(); // Temporarily commented out unused variable

  // Wrap frontend feature click handling, add manual trigger marker
  const handleFrontendFeatureClickWithMark = useCallback(
    (params: HandleFrontendFeatureClickParams) => {
      // Mark as manually triggered
      stepNavigation.markManualHighlight(params.featureId);

      // Call original frontend feature click handling
      frontendInteraction.handleFrontendFeatureClick(params);
    },
    [frontendInteraction, stepNavigation],
  );

  // Log initial state
  useEffect(() => {
    logger.info({
      message: '[GlobalGuide] Hook初始化',
      data: {
        currentStep,
        stepStatusMap,
        sideGuidePanelVisible,
        userProgress,
      },
      source: 'GlobalGuide',
      component: 'useGlobalGuideLogic',
    });

    // Ensure first step is activated by default
    if (
      currentStep === GlobalGuideStepNumber.CONNECTION &&
      stepStatusMap[GlobalGuideStepNumber.CONNECTION] !== 'active'
    ) {
      logger.info({
        message: '[GlobalGuide] 初始化 - 确保第一步激活',
        data: {
          currentStep,
          stepStatusMap,
        },
        source: 'GlobalGuide',
        component: 'useGlobalGuideLogic',
      });

      stepNavigation.handleStepSelect(GlobalGuideStepNumber.CONNECTION);
    }
  }, [
    currentStep,
    stepStatusMap,
    stepNavigation,
    sideGuidePanelVisible,
    userProgress,
  ]);

  // Log sub-Hook state
  useEffect(() => {
    logger.info({
      message: '[GlobalGuide] 子Hook状态更新',
      data: {
        stepNavigation: {
          currentStep: stepNavigation.currentStep,
          steps: stepNavigation.steps.length,
        },
        panelState: {
          sideGuidePanelVisible: panelState.sideGuidePanelVisible,
          panelContentVisible: panelState.panelContentVisible,
          hintCardVisible: panelState.hintCardVisible,
        },
      },
      source: 'GlobalGuide',
      component: 'useGlobalGuideLogic',
    });
  }, [
    stepNavigation.currentStep,
    stepNavigation.steps.length,
    panelState.sideGuidePanelVisible,
    panelState.panelContentVisible,
    panelState.hintCardVisible,
    sideGuidePanelVisible,
    userProgress,
  ]);

  // Register console commands
  useConsoleCommands(stepNavigation.handleStepClick);

  // Step configuration
  const steps: GlobalGuideStep[] = GUIDE_STEPS_CONFIG;

  // Get current step's incomplete items
  const getCurrentStepIssuesCallback = useCallback(() => {
    const issues = getCurrentStepIssues(currentStep, userProgress);
    logger.info({
      message: '[GlobalGuide] 获取当前步骤未完成项',
      data: {
        currentStep,
        issuesCount: issues.length,
        issues,
      },
      source: 'GlobalGuide',
      component: 'getCurrentStepIssues',
    });
    return issues;
  }, [currentStep, userProgress]);

  // Handle step selection (no navigation, only update state and open panel)
  const handleStepSelect = useCallback(
    (stepNumber: GlobalGuideStepNumber) => {
      logger.info({
        message: '[GlobalGuide] 步骤选择开始',
        data: {
          stepNumber,
          previousStep: currentStep,
          sideGuidePanelVisible,
          panelContentVisible: panelState.panelContentVisible,
        },
        source: 'GlobalGuide',
        component: 'handleStepSelect',
      });

      stepNavigation.handleStepSelect(stepNumber);
      panelState.handleOpenPanelContent();

      logger.info({
        message: '[GlobalGuide] 步骤选择完成',
        data: {
          stepNumber,
          newCurrentStep: stepNavigation.currentStep,
          panelContentVisible: panelState.panelContentVisible,
        },
        source: 'GlobalGuide',
        component: 'handleStepSelect',
      });
    },
    [stepNavigation, panelState, currentStep, sideGuidePanelVisible],
  );

  // Show hint card (only when side guide panel is open)
  useEffect(() => {
    if (!sideGuidePanelVisible) {
      return;
    }

    const issues = getCurrentStepIssuesCallback();
    const shouldShowHint = issues.length > 0;

    logger.info({
      message: '[GlobalGuide] 提示卡片状态更新',
      data: {
        sideGuidePanelVisible,
        issuesCount: issues.length,
        shouldShowHint,
        currentHintCardVisible: panelState.hintCardVisible,
      },
      source: 'GlobalGuide',
      component: 'hintCardEffect',
    });

    panelState.setHintCardVisible(shouldShowHint);
  }, [sideGuidePanelVisible, getCurrentStepIssuesCallback, panelState]);

  // Calculate current step configuration (based on current step, not affected by panel visibility)
  const currentStepConfig = steps.find((s) => s.number === currentStep) || null;

  // Only calculate issues when side guide panel is open
  const issues = sideGuidePanelVisible ? getCurrentStepIssuesCallback() : [];

  // Log state changes
  useEffect(() => {
    logger.info({
      message: '[GlobalGuide] 状态变化',
      data: {
        currentStep,
        currentStepConfig: currentStepConfig
          ? {
              number: currentStepConfig.number,
              title: currentStepConfig.title,
            }
          : null,
        sideGuidePanelVisible,
        panelContentVisible: panelState.panelContentVisible,
        issuesCount: issues.length,
      },
      source: 'GlobalGuide',
      component: 'stateChange',
    });
  }, [
    currentStep,
    currentStepConfig,
    sideGuidePanelVisible,
    panelState.panelContentVisible,
    issues.length,
  ]);

  return {
    // State
    currentStep,
    stepStatusMap,
    userProgress,
    sideGuidePanelVisible,
    panelContentVisible: panelState.panelContentVisible,
    hintCardVisible: panelState.hintCardVisible,
    steps,
    currentStepConfig,
    issues,

    // Methods
    getStepStatus: stepNavigation.getStepStatus,
    handleStepClick: stepNavigation.handleStepClick,
    handleStepSelect,
    handleStepComplete: stepNavigation.handleStepComplete,
    handleQuickFix: stepNavigation.handleQuickFix,
    handleFrontendFeatureClick: handleFrontendFeatureClickWithMark,
    handleCloseSidePanel: panelState.handleCloseSidePanel,
    handleOpenSidePanel: panelState.handleOpenSidePanel,
    handleClosePanelContent: panelState.handleClosePanelContent,
    handleOpenPanelContent: panelState.handleOpenPanelContent,
    getCurrentStepIssues: getCurrentStepIssuesCallback,
  };
};
