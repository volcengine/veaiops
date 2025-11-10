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

import type { ApiRequestLog } from './types';

interface Logger {
  info: (params: {
    message: string;
    data?: unknown;
    source?: string;
    component?: string;
  }) => void;
}

interface EnhancedLoggerCollector {
  logApiRequest: (request: ApiRequestLog) => void;
  logApiResponse: (
    requestId: string,
    status: number,
    statusText: string,
    response?: unknown,
    error?: Error,
  ) => void;
}

export const setupApiInterceptors = (
  collector: EnhancedLoggerCollector,
  getLogger: () => Logger | null,
): void => {
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

    collector.logApiRequest({
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

      collector.logApiResponse(
        requestId,
        response.status,
        response.statusText,
        responseData,
      );

      return response;
    } catch (error: unknown) {
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      collector.logApiResponse(
        requestId,
        0,
        'Network Error',
        undefined,
        errorObj,
      );
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
};
