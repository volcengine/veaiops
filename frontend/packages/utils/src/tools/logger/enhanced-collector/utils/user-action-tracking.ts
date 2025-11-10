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

import type { UserActionLog } from '../types';
import { getLogger } from './get-logger';

export const enableUserActionTracking = (
  logUserAction: (action: UserActionLog) => void,
): void => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    logUserAction({
      type: 'click',
      target:
        target.tagName +
        (target.id ? `#${target.id}` : '') +
        (target.className ? `.${target.className}` : ''),
      timestamp: Date.now(),
    });
  });

  document.addEventListener('input', (event) => {
    const target = event.target as HTMLInputElement;
    logUserAction({
      type: 'input',
      target: target.tagName + (target.id ? `#${target.id}` : ''),
      value: target.value?.substring(0, 100),
      timestamp: Date.now(),
    });
  });

  document.addEventListener('submit', (event) => {
    const target = event.target as HTMLFormElement;
    logUserAction({
      type: 'submit',
      target: target.tagName + (target.id ? `#${target.id}` : ''),
      timestamp: Date.now(),
    });
  });

  window.addEventListener('scroll', () => {
    logUserAction({
      type: 'scroll',
      timestamp: Date.now(),
    });
  });

  window.addEventListener('resize', () => {
    logUserAction({
      type: 'resize',
      timestamp: Date.now(),
    });
  });

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
};

