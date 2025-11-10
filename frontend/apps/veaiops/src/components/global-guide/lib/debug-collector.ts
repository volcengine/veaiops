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

/**
 * Debug log collector
 * Specifically for collecting debug logs for new connection feature
 */

import { exportLogsToFile, logger } from '@veaiops/utils';

/**
 * Collect all logs related to new connection
 */
export const collectNewConnectionLogs = () => {
  const startTime = Date.now();

  logger.info({
    message: '[DebugLogCollector] Start collecting new connection feature logs',
    data: {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    },
    source: 'DebugLogCollector',
    component: 'collectNewConnectionLogs',
  });

  // Check page status
  const pageInfo = {
    url: window.location.href,
    pathname: window.location.pathname,
    search: window.location.search,
    hash: window.location.hash,
    title: document.title,
  };

  // Check target button status
  const targetButton = document.querySelector(
    '[data-testid="new-connection-btn"]',
  );
  const buttonInfo = targetButton
    ? {
        exists: true,
        tagName: targetButton.tagName,
        textContent: targetButton.textContent,
        className: targetButton.className,
        visible: (targetButton as HTMLElement).offsetParent !== null,
        rect: targetButton.getBoundingClientRect(),
        computedStyle: window.getComputedStyle(targetButton),
      }
    : {
        exists: false,
      };

  // Check all related buttons
  const allButtons = document.querySelectorAll('button');
  const allTestIds = document.querySelectorAll('[data-testid]');
  const connectionButtons = Array.from(allButtons).filter(
    (btn) =>
      btn.textContent?.includes('新建') ||
      btn.textContent?.includes('连接') ||
      btn.getAttribute('data-testid')?.includes('connection'),
  );

  const debugInfo = {
    pageInfo,
    buttonInfo,
    allButtonsCount: allButtons.length,
    allTestIdsCount: allTestIds.length,
    connectionButtons: connectionButtons.map((btn) => ({
      text: btn.textContent,
      testId: btn.getAttribute('data-testid'),
      classes: btn.className,
      visible: (btn as HTMLElement).offsetParent !== null,
    })),
    allTestIds: Array.from(allTestIds).map((el) => ({
      testId: el.getAttribute('data-testid'),
      tagName: el.tagName,
      text: el.textContent,
    })),
  };

  logger.info({
    message: '[DebugLogCollector] Page status check completed',
    data: debugInfo,
    source: 'DebugLogCollector',
    component: 'pageCheck',
  });

  // Check global guide system status
  const guideElements = document.querySelectorAll('[data-x-guide]');
  const guideInfo = {
    guideElementsCount: guideElements.length,
    guideElements: Array.from(guideElements).map((el) => ({
      testId: el.getAttribute('data-testid'),
      tagName: el.tagName,
      text: el.textContent,
    })),
  };

  logger.info({
    message: '[DebugLogCollector] Global guide system status check completed',
    data: guideInfo,
    source: 'DebugLogCollector',
    component: 'guideCheck',
  });

  const endTime = Date.now();
  const totalTime = endTime - startTime;

  logger.info({
    message: '[DebugLogCollector] New connection feature log collection completed',
    data: {
      totalTime,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
    source: 'DebugLogCollector',
    component: 'collectComplete',
  });

  return {
    debugInfo,
    guideInfo,
    totalTime,
  };
};

/**
 * Export all related logs
 */
export const exportNewConnectionLogs = () => {
  logger.info({
    message: '[DebugLogCollector] Export new connection feature logs',
    data: {
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
    source: 'DebugLogCollector',
    component: 'exportLogs',
  });

  // First collect current status
  collectNewConnectionLogs();

  // Export all logs
  exportLogsToFile(
    `new-connection-debug-${new Date()
      .toISOString()
      .slice(0, 19)
      .replace(/:/g, '-')}.log`,
  );
};

/**
 * Output debug information to console
 */
export const logDebugInfo = () => {
  const info = collectNewConnectionLogs();
  return info;
};

/**
 * Check if on datasource management page
 */
const isDataSourcePage = (url: string): boolean => {
  return url.includes('/system/datasource') || url.includes('datasource');
};

/**
 * Enhanced log collection (for datasource management page)
 */
const collectEnhancedLogs = () => {
  const url = window.location.href;

  logger.info({
    message: '[DebugLogCollector] Execute enhanced log collection',
    data: {
      url,
      isDataSourcePage: isDataSourcePage(url),
      timestamp: new Date().toISOString(),
    },
    source: 'DebugLogCollector',
    component: 'collectEnhancedLogs',
  });

  // Basic log collection
  collectNewConnectionLogs();

  // If on datasource management page, perform enhanced collection
  if (isDataSourcePage(url)) {
    logger.info({
      message: '[DebugLogCollector] Detected datasource management page, execute enhanced collection',
      data: {
        url,
        timestamp: new Date().toISOString(),
      },
      source: 'DebugLogCollector',
      component: 'enhancedCollection',
    });

    // Check connection management drawer status
    const connectDrawerShow = new URLSearchParams(window.location.search).get(
      'connectDrawerShow',
    );

    // Check all connection panels
    const connectionPanels = document.querySelectorAll(
      '[class*="connection-panel"]',
    );
    const connectionHeaders = document.querySelectorAll(
      '[class*="connection-panel-header"]',
    );

    // Check detailed status of new connection buttons
    const newConnectionButtons = document.querySelectorAll(
      '[data-testid="new-connection-btn"]',
    );

    const enhancedInfo = {
      connectDrawerShow,
      connectionPanelsCount: connectionPanels.length,
      connectionHeadersCount: connectionHeaders.length,
      newConnectionButtonsCount: newConnectionButtons.length,
      newConnectionButtons: Array.from(newConnectionButtons).map((btn) => ({
        text: btn.textContent,
        classes: btn.className,
        visible: (btn as HTMLElement).offsetParent !== null,
        rect: btn.getBoundingClientRect(),
        parentElement: btn.parentElement?.tagName,
        parentClasses: btn.parentElement?.className,
      })),
    };

    logger.info({
      message: '[DebugLogCollector] Datasource page enhanced information collection completed',
      data: enhancedInfo,
      source: 'DebugLogCollector',
      component: 'enhancedInfoCollected',
    });
  }
};

/**
 * Automatically collect logs on page initialization
 * @returns Cleanup function to stop automatic collection
 */
export const initAutoLogCollection = (): (() => void) | undefined => {
  if (typeof window === 'undefined') {
    return undefined;
  }

  logger.info({
    message: '[DebugLogCollector] Initialize automatic log collection',
    data: {
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    },
    source: 'DebugLogCollector',
    component: 'initAutoLogCollection',
  });

  // Delayed collection after page load completes
  const collectOnLoad = () => {
    setTimeout(() => {
      logger.info({
        message: '[DebugLogCollector] Page load completed, start automatic log collection',
        data: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
        source: 'DebugLogCollector',
        component: 'autoCollectOnLoad',
      });

      collectEnhancedLogs();
    }, 1000); // Delay 1 second to ensure DOM is fully rendered
  };

  // Listen for page load events
  if (document.readyState === 'complete') {
    collectOnLoad();
  } else {
    window.addEventListener('load', collectOnLoad);
  }

  // Listen for route changes (SPA application)
  let currentUrl = window.location.href;
  const checkUrlChange = () => {
    if (window.location.href !== currentUrl) {
      currentUrl = window.location.href;

      logger.info({
        message: '[DebugLogCollector] Route change detected, re-collect logs',
        data: {
          newUrl: currentUrl,
          timestamp: new Date().toISOString(),
        },
        source: 'DebugLogCollector',
        component: 'autoCollectOnRouteChange',
      });

      // Delayed collection to ensure new page content is loaded
      setTimeout(() => {
        collectEnhancedLogs();
      }, 500);
    }
  };

  // Periodically check URL changes
  const urlCheckInterval = setInterval(checkUrlChange, 1000);

  // Listen for popstate event (browser forward/back)
  window.addEventListener('popstate', () => {
    setTimeout(() => {
      logger.info({
        message: '[DebugLogCollector] Browser navigation detected, re-collect logs',
        data: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
        source: 'DebugLogCollector',
        component: 'autoCollectOnPopState',
      });

      collectEnhancedLogs();
    }, 500);
  });

  // Listen for pushstate/replacestate (programmatic navigation)
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(history, args);
    setTimeout(() => {
      logger.info({
        message: '[DebugLogCollector] pushState navigation detected, re-collect logs',
        data: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
        source: 'DebugLogCollector',
        component: 'autoCollectOnPushState',
      });

      collectEnhancedLogs();
    }, 500);
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(history, args);
    setTimeout(() => {
      logger.info({
        message: '[DebugLogCollector] replaceState navigation detected, re-collect logs',
        data: {
          url: window.location.href,
          timestamp: new Date().toISOString(),
        },
        source: 'DebugLogCollector',
        component: 'autoCollectOnReplaceState',
      });

      collectEnhancedLogs();
    }, 500);
  };

  // Cleanup function
  const cleanup = () => {
    clearInterval(urlCheckInterval);
    window.removeEventListener('load', collectOnLoad);
    window.removeEventListener('popstate', checkUrlChange);
    history.pushState = originalPushState;
    history.replaceState = originalReplaceState;
  };

  // Cleanup on page unload
  window.addEventListener('beforeunload', cleanup);

  logger.info({
    message: '[DebugLogCollector] Automatic log collection started',
    data: {
      url: window.location.href,
      timestamp: new Date().toISOString(),
    },
    source: 'DebugLogCollector',
    component: 'autoCollectionStarted',
  });

  return cleanup;
};

/**
 * Stop automatic log collection
 */
export const stopAutoLogCollection = (cleanup: () => void) => {
  if (cleanup) {
    cleanup();
    logger.info({
      message: '[DebugLogCollector] Automatic log collection stopped',
      data: {
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
      source: 'DebugLogCollector',
      component: 'autoCollectionStopped',
    });
  }
};

// Mount debug functions to global object for easy console access
if (typeof window !== 'undefined') {
  (window as any).debugNewConnection = {
    collectLogs: collectNewConnectionLogs,
    exportLogs: exportNewConnectionLogs,
    logInfo: logDebugInfo,
    initAutoCollection: initAutoLogCollection,
    stopAutoCollection: stopAutoLogCollection,
  };

  // Automatically start log collection
  const cleanup = initAutoLogCollection();
  (window as any).debugNewConnection._cleanup = cleanup;
}
