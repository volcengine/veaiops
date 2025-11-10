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

export interface ApiRequestLog {
  url: string;
  method: string;
  headers?: Record<string, string>;
  body?: unknown;
  startTime: number;
  endTime?: number;
  duration?: number;
  status?: number;
  statusText?: string;
  response?: unknown;
  error?: {
    message: string;
    stack?: string;
  };
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

export class ApiRequestCollector {
  private apiRequests: Map<string, ApiRequestLog> = new Map();

  logApiRequest(
    request: ApiRequestLog,
    getBrowserInfo: () => BrowserInfo,
    getPageInfo: () => PageInfo,
  ): void {
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
    response: unknown,
    error: Error | undefined,
    getBrowserInfo: () => BrowserInfo,
    getPageInfo: () => PageInfo,
  ): void {
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

  getApiRequests(): ApiRequestLog[] {
    return Array.from(this.apiRequests.values());
  }

  clearApiRequests(): void {
    this.apiRequests.clear();
  }

  enableApiInterceptors(
    logApiRequest: (request: ApiRequestLog) => void,
    logApiResponse: (
      requestId: string,
      status: number,
      statusText: string,
      response?: unknown,
      error?: Error,
    ) => void,
  ): void {
    if (typeof window === 'undefined') {
      return;
    }

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const url = args[0] instanceof Request ? args[0].url : String(args[0]);
      const method = args[0] instanceof Request ? args[0].method : 'GET';
      const headers: Record<string, string> = {};
      let body: unknown;

      if (args[0] instanceof Request) {
        args[0].headers.forEach((value, key) => {
          headers[key] = value;
        });
        try {
          const cloned = args[0].clone();
          body = await cloned.json().catch(() => undefined);
        } catch {
          body = undefined;
        }
      } else if (args[1]) {
        Object.entries(args[1].headers || {}).forEach(([key, value]) => {
          headers[key] = String(value);
        });
        const { body: requestBody } = args[1];
        body = requestBody;
      }

      const startTime = Date.now();
      const requestId = `${method}_${url}_${startTime}`;

      logApiRequest({
        url,
        method,
        headers,
        body,
        startTime,
      });

      try {
        const response = await originalFetch(...args);
        const endTime = Date.now();

        let responseData: unknown;
        try {
          const cloned = response.clone();
          responseData = await cloned.json().catch(() => undefined);
        } catch {
          responseData = undefined;
        }

        logApiResponse(
          requestId,
          response.status,
          response.statusText,
          responseData,
        );

        return response;
      } catch (error: unknown) {
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logApiResponse(requestId, 0, 'Network Error', undefined, errorObj);
        throw error;
      }
    };

    const logger = getLogger();
    if (logger) {
      logger.info({
        message: 'API request interceptor enabled',
        data: {},
        source: 'EnhancedLoggerCollector',
        component: 'enableApiInterceptors',
      });
    }
  }
}

