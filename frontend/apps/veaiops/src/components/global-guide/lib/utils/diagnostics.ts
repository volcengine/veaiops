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

import type { GlobalGuideStore } from './types';

/**
 * Quick diagnose GlobalGuide status
 *
 * Check content:
 * 1. Whether guideVisible is incorrectly persisted in localStorage
 * 2. Whether visible guide elements exist in DOM
 */
export const quickDiagnoseGlobalGuide = (): void => {
  // Check localStorage
  const guideStore = localStorage.getItem('global-guide-store');
  if (guideStore) {
    try {
      const parsed = JSON.parse(guideStore) as GlobalGuideStore;
      if ('state' in parsed && 'guideVisible' in (parsed.state || {})) {
        logger.error({
          message: '[GlobalGuide] 发现问题: guideVisible 被持久化',
          data: {
            value: parsed.state?.guideVisible,
            store: parsed,
          },
          source: 'GlobalGuide',
          component: 'quickDiagnoseGlobalGuide',
        });
      }
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: '[GlobalGuide] localStorage 解析失败',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
          guideStore,
        },
        source: 'GlobalGuide',
        component: 'quickDiagnoseGlobalGuide',
      });
    }
  }

  // Check DOM
  const visibleGuideElements = document.querySelectorAll(
    '[class*="global-guide"]:not([style*="display: none"])',
  );
  if (visibleGuideElements.length > 0) {
    logger.error({
      message: '[GlobalGuide] 发现问题: 存在可见的引导元素',
      data: {
        count: visibleGuideElements.length,
        elements: Array.from(visibleGuideElements).map((el) => ({
          tagName: el.tagName,
          className: el.className,
        })),
      },
      source: 'GlobalGuide',
      component: 'quickDiagnoseGlobalGuide',
    });
  }
};

/**
 * Export all GlobalGuide related logs
 *
 * @param filename - Optional filename
 */
export const exportAllGlobalGuideLogs = (filename?: string): void => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename =
    filename || `global-guide-complete-analysis-${timestamp}.log`;

  // TODO: Implement actual log export logic
  logger.info({
    message: '[GlobalGuide] 导出日志',
    data: {
      filename: finalFilename,
      timestamp,
    },
    source: 'GlobalGuide',
    component: 'exportAllGlobalGuideLogs',
  });
};

/**
 * Comprehensive analysis of GlobalGuide status
 *
 * Execute diagnosis first, export logs after 2 seconds
 */
export const analyzeGlobalGuide = (): void => {
  quickDiagnoseGlobalGuide();
  setTimeout(() => {
    exportAllGlobalGuideLogs();
  }, 2000);
};
