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

import type { LogEntry } from '../core';
import { setupApiInterceptors } from './api-interceptor';
import { setupErrorHandlers } from './error-handlers';
import type { ApiRequestLog, PerformanceMetrics, UserActionLog } from './types';
import { setupUserActionTracking } from './user-action-tracker';
import {
  collectPerformanceMetrics,
  getBrowserInfo,
  getPageInfo,
} from './utils';

interface Logger {
  info: (params: {
    message: string;
    data?: unknown;
    source?: string;
    component?: string;
  }) => void;
  warn: (params: {
    message: string;
    data?: unknown;
    source?: string;
    component?: string;
  }) => void;
  error: (params: {
    message: string;
    data?: unknown;
    source?: string;
    component?: string;
  }) => void;
  debug: (params: {
    message: string;
    data?: unknown;
    source?: string;
    component?: string;
  }) => void;
}

let loggerInstance: Logger | null = null;
const getLogger = (): Logger | null => {
  if (loggerInstance === null && typeof window !== 'undefined') {
    try {
      const windowLogger = window.__veaiopsUtilsLogger;
      if (
        windowLogger &&
        typeof windowLogger === 'object' &&
        'info' in windowLogger &&
        'warn' in windowLogger &&
        'error' in windowLogger &&
        'debug' in windowLogger
      ) {
        loggerInstance = windowLogger as Logger;
      } else {
        loggerInstance = {
          info: () => {},
          warn: () => {},
          error: () => {},
          debug: () => {},
        };
      }
    } catch {
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

export class EnhancedLoggerCollector {
  private apiRequests: Map<string, ApiRequestLog> = new Map();
  private userActions: UserActionLog[] = [];
  private performanceMetrics: PerformanceMetrics = {};
  private isCollecting = false;

  enhanceLogEntry(entry: LogEntry): LogEntry {
    if (!this.isCollecting) {
      return entry;
    }

    const enhancedData = {
      ...entry.data,
      browser: getBrowserInfo(),
      page: getPageInfo(),
      performance: this.performanceMetrics,
    };

    return {
      ...entry,
      data: enhancedData,
    };
  }

  startCollection(): void {
    if (this.isCollecting) {
      return;
    }

    this.isCollecting = true;

    if (typeof window !== 'undefined' && window.performance) {
      this.performanceMetrics = collectPerformanceMetrics();
    }

    setupErrorHandlers(getLogger);

    const logger = getLogger();
    if (logger) {
      logger.info({
        message: 'Enhanced log collection started',
        data: {
          browser: getBrowserInfo(),
          page: getPageInfo(),
          performance: this.performanceMetrics,
        },
        source: 'EnhancedLoggerCollector',
        component: 'startCollection',
      });
    }
  }

  stopCollection(): void {
    this.isCollecting = false;
    this.apiRequests.clear();
    this.userActions = [];
  }

  logApiRequest(request: ApiRequestLog): void {
    if (!this.isCollecting) {
      return;
    }

    const requestId = `${request.method}_${request.url}_${request.startTime}`;
    this.apiRequests.set(requestId, request);

    const logger = getLogger();
    if (logger) {
      logger.debug({
        message: `API Request: ${request.method} ${request.url}`,
        data: {
          url: request.url,
          method: request.method,
          headers: request.headers,
          body: request.body,
          startTime: request.startTime,
          browser: getBrowserInfo(),
          page: getPageInfo(),
        },
        source: 'ApiRequestLogger',
        component: 'logApiRequest',
      });
    }
  }

  logApiResponse(
    requestId: string,
    status: number,
    statusText: string,
    response?: unknown,
    error?: Error,
  ): void {
    if (!this.isCollecting) {
      return;
    }

    const request = this.apiRequests.get(requestId);
    if (!request) {
      return;
    }

    const endTime = Date.now();
    const duration = endTime - request.startTime;

    const logData = {
      url: request.url,
      method: request.method,
      status,
      statusText,
      duration,
      startTime: request.startTime,
      endTime,
      response,
      browser: getBrowserInfo(),
      page: getPageInfo(),
    };

    const logger = getLogger();
    if (logger) {
      if (error) {
        logger.error({
          message: `API Request Failed: ${request.method} ${request.url}`,
          data: {
            ...logData,
            error: error.message,
            stack: error.stack,
            errorObj: error,
          },
          source: 'ApiRequestLogger',
          component: 'logApiResponse',
        });
      } else if (status >= 400) {
        logger.warn({
          message: `API Request Warning: ${request.method} ${request.url} (${status})`,
          data: logData,
          source: 'ApiRequestLogger',
          component: 'logApiResponse',
        });
      } else {
        logger.info({
          message: `API Request Success: ${request.method} ${request.url} (${status})`,
          data: logData,
          source: 'ApiRequestLogger',
          component: 'logApiResponse',
        });
      }
    }

    request.endTime = endTime;
    request.duration = duration;
    request.status = status;
    request.statusText = statusText;
    request.response = response;
    if (error) {
      request.error = {
        message: error.message,
        stack: error.stack,
      };
    }
  }

  logUserAction(action: UserActionLog): void {
    if (!this.isCollecting) {
      return;
    }

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

  logPerformance(metrics: Partial<PerformanceMetrics>): void {
    if (!this.isCollecting) {
      return;
    }

    this.performanceMetrics = { ...this.performanceMetrics, ...metrics };

    const logger = getLogger();
    if (logger) {
      logger.debug({
        message: 'Performance metrics updated',
        data: {
          ...metrics,
          browser: getBrowserInfo(),
          page: getPageInfo(),
        },
        source: 'PerformanceLogger',
        component: 'logPerformance',
      });
    }
  }

  getApiRequests(): ApiRequestLog[] {
    return Array.from(this.apiRequests.values());
  }

  getUserActions(): UserActionLog[] {
    return [...this.userActions];
  }

  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  clear(): void {
    this.apiRequests.clear();
    this.userActions = [];
    this.performanceMetrics = {};
  }

  enableApiInterceptors(): void {
    setupApiInterceptors(this, getLogger);
  }

  enableUserActionTracking(): void {
    setupUserActionTracking(this, getLogger);
  }
}

export const enhancedCollector = new EnhancedLoggerCollector();

if (typeof window !== 'undefined') {
  (window as any).__veaiopsEnhancedCollector = enhancedCollector;
}
