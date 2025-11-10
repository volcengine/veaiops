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

import type { BrowserInfo, PageInfo } from './browser-info';

export interface UserActionLog {
  type: 'click' | 'input' | 'submit' | 'navigation' | 'scroll' | 'resize';
  target?: string;
  value?: string;
  url?: string;
  timestamp: number;
}

let loggerInstance: any = null;
const getLogger = () => {
  if (loggerInstance === null && typeof window !== 'undefined') {
    try {
      loggerInstance = (window as any).__veaiopsUtilsLogger;
    } catch (error) {
      loggerInstance = {
        info: () => {},
        warn: () => {},
        error: () => {},
        debug: () => {},
      };
    }
  }
  return loggerInstance;
};

export class UserActionCollector {
  private userActions: UserActionLog[] = [];

  logUserAction(
    action: UserActionLog,
    getBrowserInfo: () => BrowserInfo,
    getPageInfo: () => PageInfo,
  ): void {
    if (this.userActions.length > 100) {
      this.userActions.shift();
    }

    this.userActions.push(action);

    if (action.type === 'submit' || action.type === 'navigation') {
      const logger = getLogger();
      if (logger) {
        logger.info({
          message: `User Action: ${action.type}`,
          data: {
            ...action,
            browser: getBrowserInfo(),
            page: getPageInfo(),
          },
          source: 'UserActionLogger',
          component: 'logUserAction',
        });
      }
    }
  }

  getUserActions(): UserActionLog[] {
    return [...this.userActions];
  }

  clearUserActions(): void {
    this.userActions = [];
  }

  enableUserActionTracking(
    logUserAction: (action: UserActionLog) => void,
  ): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    document.addEventListener(
      'click',
      (event) => {
        const target = event.target as HTMLElement;
        logUserAction({
          type: 'click',
          target: target?.tagName || 'unknown',
          timestamp: Date.now(),
        });
      },
      true,
    );

    document.addEventListener(
      'submit',
      (event) => {
        const form = event.target as HTMLFormElement;
        logUserAction({
          type: 'submit',
          target: form?.id || form?.name || 'form',
          timestamp: Date.now(),
        });
      },
      true,
    );

    const originalPushState = history.pushState;
    history.pushState = (...args) => {
      originalPushState.apply(history, args);
      logUserAction({
        type: 'navigation',
        url: window.location.href,
        timestamp: Date.now(),
      });
    };

    const originalReplaceState = history.replaceState;
    history.replaceState = (...args) => {
      originalReplaceState.apply(history, args);
      logUserAction({
        type: 'navigation',
        url: window.location.href,
        timestamp: Date.now(),
      });
    };

    window.addEventListener('popstate', () => {
      logUserAction({
        type: 'navigation',
        url: window.location.href,
        timestamp: Date.now(),
      });
    });

    const logger = getLogger();
    if (logger) {
      logger.info({
        message: 'User action tracking enabled',
        data: {},
        source: 'EnhancedLoggerCollector',
        component: 'enableUserActionTracking',
      });
    }
  }
}

