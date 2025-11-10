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


/**
 * Debug command parameters interface
 */
export interface DebugStepClickParams {
  handleStepClick: (stepNumber: number) => void;
  stepNumber: number;
  stepName: string;
}

/**
 * Create debug step click command function
 *
 * @param params - Debug parameters
 * @returns Debug command function
 */
export const createDebugStepClickCommand = ({
  handleStepClick,
  stepNumber,
  stepName,
}: DebugStepClickParams): (() => void) => {
  return () => {
    logger.info({
      message: `[GlobalGuide] 手动触发${stepName}点击调试`,
      data: {
        currentUrl: window.location.href,
        currentPath: window.location.pathname,
        currentSearch: window.location.search,
      },
      source: 'GlobalGuide',
      component: `debugStep${stepNumber}Click`,
    });

    // Simulate step click
    handleStepClick(stepNumber);

    setTimeout(() => {
      logger.info({
        message: `[GlobalGuide] ${stepName}点击调试完成`,
        data: {
          finalUrl: window.location.href,
          finalPath: window.location.pathname,
          finalSearch: window.location.search,
        },
        source: 'GlobalGuide',
        component: `debugStep${stepNumber}Click`,
      });
    }, 100);
  };
};

/**
 * Debug URL state changes
 */
export const debugUrlState = (): void => {
  logger.info({
    message: '[GlobalGuide] URL状态调试',
    data: {
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      searchParams: new URLSearchParams(window.location.search).toString(),
    },
    source: 'GlobalGuide',
    component: 'debugUrlState',
  });
};

/**
 * Export GlobalGuide logs
 */
export const exportGlobalGuideLogs = (): void => {
  logger.info({
    message: '[GlobalGuide] 手动触发GlobalGuide日志导出',
    data: {
      currentUrl: window.location.href,
      currentPath: window.location.pathname,
      currentSearch: window.location.search,
      timestamp: new Date().toISOString(),
    },
    source: 'GlobalGuide',
    component: 'exportGlobalGuideLogs',
  });
};
