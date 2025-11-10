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
 * QuerySync log collector
 * Extracted from use-query-sync.ts, used to centrally manage query synchronization logs
 * ✅ Optimization: Unified use of @veaiops/utils logger
 */

import { logger } from '@veaiops/utils';

export interface QuerySyncLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: any;
}

interface LogParams {
  level: QuerySyncLogEntry['level'];
  component: string;
  message: string;
  data?: any;
}

export class QuerySyncLogger {
  private logs: QuerySyncLogEntry[] = [];
  private enabled = true;

  log({ level, component, message, data }: LogParams): void {
    if (!this.enabled) {
      return;
    }

    const entry: QuerySyncLogEntry = {
      timestamp: Date.now(),
      level,
      component,
      message,
      data,
    };

    this.logs.push(entry);

    // ✅ Unified use of @veaiops/utils logger (logger internally handles console output)
    const logData = data ? { data } : undefined;
    switch (level) {
      case 'error':
        logger.error({
          message,
          data: logData,
          source: 'QuerySync',
          component,
        });
        break;
      case 'warn':
        logger.warn({
          message,
          data: logData,
          source: 'QuerySync',
          component,
        });
        break;
      case 'debug':
        logger.debug({
          message,
          data: logData,
          source: 'QuerySync',
          component,
        });
        break;
      default:
        logger.info({
          message,
          data: logData,
          source: 'QuerySync',
          component,
        });
        break;
    }
  }

  info({
    component,
    message,
    data,
  }: { component: string; message: string; data?: any }): void {
    this.log({ level: 'info', component, message, data });
  }

  warn({
    component,
    message,
    data,
  }: { component: string; message: string; data?: any }): void {
    this.log({ level: 'warn', component, message, data });
  }

  error({
    component,
    message,
    data,
  }: { component: string; message: string; data?: any }): void {
    this.log({ level: 'error', component, message, data });
  }

  debug({
    component,
    message,
    data,
  }: { component: string; message: string; data?: any }): void {
    this.log({ level: 'debug', component, message, data });
  }

  getLogs(): QuerySyncLogEntry[] {
    return [...this.logs];
  }

  clear(): void {
    this.logs = [];
  }
}

// Create singleton instance
export const querySyncLogger = new QuerySyncLogger();

// Expose to global for log export system use
if (typeof window !== 'undefined') {
  (window as any).getQuerySyncLogs = () => querySyncLogger.getLogs();
}
