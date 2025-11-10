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

import { logger } from '../../../logger';

export interface DebugLogEntry {
  action: string;
  data: any;
  timestamp: number;
  time: string;
}

export class DebugLogger {
  private debugLogs: DebugLogEntry[] = [];

  addDebugLog(action: string, data: any): void {
    const logEntry: DebugLogEntry = {
      action: `[SearchHandler] ${action}`,
      data,
      timestamp: Date.now(),
      time: new Date().toISOString(),
    };

    this.debugLogs.push(logEntry);
    if (this.debugLogs.length > 200) {
      this.debugLogs = this.debugLogs.slice(-100);
    }

    logger.debug('SearchHandler', action, data, action);
  }

  getDebugLogs(): DebugLogEntry[] {
    return this.debugLogs;
  }

  clearDebugLogs(): void {
    this.debugLogs = [];
  }

  exportDebugLogs(config: any): any {
    const logData = {
      plugin: 'SearchHandlerPluginImpl',
      timestamp: new Date().toISOString(),
      totalLogs: this.debugLogs.length,
      config,
      logs: this.debugLogs,
    };

    const jsonStr = JSON.stringify(logData, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `search-handler-debug-${timestamp}.json`;

    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return logData;
  }

  exposeDebugMethods(config: any): void {
    (window as any).getSearchHandlerDebugLogs = () => {
      return this.debugLogs;
    };

    (window as any).clearSearchHandlerDebugLogs = () => {
      this.debugLogs = [];
    };

    (window as any).exportSearchHandlerDebugLogs = () => {
      return this.exportDebugLogs(config);
    };
  }
}
