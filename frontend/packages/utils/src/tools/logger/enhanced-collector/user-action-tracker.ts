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

import type { UserActionLog } from './types';

interface Logger {
  info: (params: {
    message: string;
    data?: unknown;
    source?: string;
    component?: string;
  }) => void;
}

interface EnhancedLoggerCollector {
  logUserAction: (action: UserActionLog) => void;
}

export const setupUserActionTracking = (
  collector: EnhancedLoggerCollector,
  getLogger: () => Logger | null,
): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  document.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      collector.logUserAction({
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
      collector.logUserAction({
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
    collector.logUserAction({
      type: 'navigation',
      url: window.location.href,
      timestamp: Date.now(),
    });
  };

  const originalReplaceState = history.replaceState;
  history.replaceState = (...args) => {
    originalReplaceState.apply(history, args);
    collector.logUserAction({
      type: 'navigation',
      url: window.location.href,
      timestamp: Date.now(),
    });
  };

  window.addEventListener('popstate', () => {
    collector.logUserAction({
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
};
