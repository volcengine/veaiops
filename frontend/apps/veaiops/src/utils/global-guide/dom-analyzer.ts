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
import type { DOMAnalysis } from './types';

/**
 * Check if element is visible
 */
function isElementVisible(element: Element): boolean {
  const style = window.getComputedStyle(element);
  const htmlElement = element as HTMLElement;
  return (
    style.display !== 'none' &&
    style.visibility !== 'hidden' &&
    style.opacity !== '0' &&
    htmlElement.offsetWidth > 0 &&
    htmlElement.offsetHeight > 0
  );
}

/**
 * Analyze DOM state
 */
export function analyzeDOM(): DOMAnalysis {
  const analysis: DOMAnalysis = {
    guideElements: [],
    visibleElements: [],
    issues: [],
  };

  try {
    // Find all possible guide elements
    const selectors = [
      '[class*="global-guide"]',
      '[class*="guide"]',
      '[id*="guide"]',
      '[data-testid*="guide"]',
    ];

    selectors.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((el) => {
        const elementInfo = {
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          style: {
            display: (el as HTMLElement).style.display,
            visibility: (el as HTMLElement).style.visibility,
            opacity: (el as HTMLElement).style.opacity,
          },
          computedStyle: {
            display: window.getComputedStyle(el).display,
            visibility: window.getComputedStyle(el).visibility,
            opacity: window.getComputedStyle(el).opacity,
          },
          visible: isElementVisible(el),
        };

        analysis.guideElements.push(elementInfo);

        if (elementInfo.visible) {
          analysis.visibleElements.push(elementInfo);
          analysis.issues.push({
            type: 'visible_guide_element',
            message: 'Found visible guide element',
            severity: 'high',
            element: elementInfo,
          });
        }
      });
    });
  } catch (error: unknown) {
    // ✅ Correct: Expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    const errorMessage = errorObj.message || 'DOM analysis failed';
    analysis.issues.push({
      type: 'dom_analysis_error',
      message: `DOM analysis failed: ${errorMessage}`,
      severity: 'error',
      error: (error as Error).message,
    });
  }

  return analysis;
}

/**
 * Log initial state
 */
export function logInitialState(): void {
  try {
    // Check global guide store state
    const guideStore = localStorage.getItem('global-guide-store');
    if (guideStore) {
      const parsed = JSON.parse(guideStore);
      logger.info({
        message: 'Global guide store state',
        data: {
          store: parsed,
          hasGuideVisible: 'state' in parsed && 'guideVisible' in parsed.state,
          guideVisibleValue: parsed.state?.guideVisible,
        },
        source: 'GlobalGuideAnalyzer',
      });
    } else {
      // ✅ Correct: Use logger to record information, data parameter should be object or undefined
      logger.info({
        message: 'Global guide store does not exist',
        data: undefined,
        source: 'GlobalGuideAnalyzer',
      });
    }

    // Check current URL and route
    logger.info({
      message: 'Current page state',
      data: {
        url: window.location.href,
        pathname: window.location.pathname,
        search: window.location.search,
        hash: window.location.hash,
      },
      source: 'GlobalGuideAnalyzer',
      component: 'logInitialState',
    });

    // Check if there are DOM elements related to global guide component
    const guideElements = document.querySelectorAll(
      '[class*="global-guide"], [class*="guide"]',
    );
    logger.info({
      message: 'Guide elements in DOM',
      data: {
        elementCount: guideElements.length,
        elements: Array.from(guideElements).map((el) => ({
          tagName: el.tagName,
          className: el.className,
          id: el.id,
          visible:
            (el as HTMLElement).style.display !== 'none' &&
            (el as HTMLElement).style.visibility !== 'hidden',
        })),
      },
      source: 'GlobalGuideAnalyzer',
      component: 'logInitialState',
    });

    // Check component state in React DevTools (if available)
    if ((window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      logger.info({
        message: 'React DevTools available',
        data: {
          version: (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__.version,
        },
        source: 'GlobalGuideAnalyzer',
        component: 'logInitialState',
      });
    }
  } catch (error: unknown) {
    // ✅ Correct: Use logger to record error and expose actual error information
    const errorObj = error instanceof Error ? error : new Error(String(error));
    logger.error({
      message: 'Failed to log initial state',
      data: {
        error: errorObj.message,
        stack: errorObj.stack,
        errorObj,
      },
      source: 'GlobalGuideAnalyzer',
      component: 'logInitialState',
    });
  }
}
