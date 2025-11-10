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
 * Filters component log collector
 * 🚀 Enhanced version: Integrates @veaiops/utils logger and log-exporter
 */

import { logger, startLogCollection } from '@veaiops/utils';

interface FilterLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: unknown;
}

/**
 * Log parameters interface
 */
interface LogParams {
  level: FilterLogEntry['level'];
  component: string;
  message: string;
  data?: unknown;
}

/**
 * Info/Warn/Error/Debug log parameters interface
 */
interface InfoWarnErrorDebugParams {
  component: string;
  message: string;
  data?: unknown;
}

class FilterLogger {
  private logs: FilterLogEntry[] = [];
  private enabled = false;

  /**
   * Enable log collection
   */
  enable(): void {
    this.enabled = true;
    this.logs = [];
  }

  /**
   * Disable log collection
   */
  disable(): void {
    this.enabled = false;
  }

  /**
   * Log entry
   * ✅ Optimized: Unified use of @veaiops/utils logger, removed duplicate console output
   * Logger internally handles console output and timestamp formatting
   */
  log({ level, component, message, data }: LogParams): void {
    if (!this.enabled) {
      return;
    }

    const entry: FilterLogEntry = {
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
          source: 'Filters',
          component,
        });
        break;
      case 'warn':
        logger.warn({
          message,
          data: logData,
          source: 'Filters',
          component,
        });
        break;
      case 'debug':
        logger.debug({
          message,
          data: logData,
          source: 'Filters',
          component,
        });
        break;
      default:
        logger.info({
          message,
          data: logData,
          source: 'Filters',
          component,
        });
        break;
    }
  }

  /**
   * Get all logs
   */
  getLogs(): FilterLogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }

  info({ component, message, data }: InfoWarnErrorDebugParams): void {
    this.log({ level: 'info', component, message, data });
  }

  warn({ component, message, data }: InfoWarnErrorDebugParams): void {
    this.log({ level: 'warn', component, message, data });
  }

  error({ component, message, data }: InfoWarnErrorDebugParams): void {
    this.log({ level: 'error', component, message, data });
  }

  debug({ component, message, data }: InfoWarnErrorDebugParams): void {
    this.log({ level: 'debug', component, message, data });
  }
}

// Create global instance
export const filterLogger = new FilterLogger();

// Enable and expose to global in development environment
if (typeof window !== 'undefined') {
  filterLogger.enable();

  // Expose log retrieval interface to unified log export system
  (window as any).getFiltersLogs = () => {
    return filterLogger.getLogs();
  };

  // 🚀 New: Unified log export interface
  if (!(window as any).exportAllComponentLogs) {
    (window as any).exportAllComponentLogs = () => {
      console.group('📦 Collect all component logs');

      const filtersLogs = (window as any).getFiltersLogs?.() || [];
      console.log(`✅ Filters logs: ${filtersLogs.length} entries`);

      const tableFilterLogs = (window as any).getTableFilterLogs?.() || [];
      console.log(
        `✅ TableFilterPlugin logs: ${tableFilterLogs.length} entries`,
      );

      // 🔍 Sort all logs by time
      const allLogsArray = [
        ...filtersLogs.map((log: any) => ({ ...log, source: 'Filters' })),
        ...tableFilterLogs.map((log: any) => ({
          ...log,
          source: 'TableFilterPlugin',
        })),
      ].sort((a, b) => a.timestamp - b.timestamp);

      const allLogs = {
        metadata: {
          exportTime: new Date().toISOString(),
          components: {
            Filters: filtersLogs.length,
            TableFilterPlugin: tableFilterLogs.length,
          },
          total: filtersLogs.length + tableFilterLogs.length,
          timeline: {
            firstLog: allLogsArray[0]?.timestamp
              ? new Date(allLogsArray[0].timestamp).toISOString()
              : null,
            lastLog: allLogsArray[allLogsArray.length - 1]?.timestamp
              ? new Date(
                  allLogsArray[allLogsArray.length - 1].timestamp,
                ).toISOString()
              : null,
          },
        },
        logs: {
          filters: filtersLogs,
          tableFilter: tableFilterLogs,
          timeline: allLogsArray, // All logs sorted by time
        },
      };

      console.groupEnd();

      // Export to file
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `route-filter-debug-logs-${timestamp}.json`;
      const blob = new Blob([JSON.stringify(allLogs, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log(`✅ Route filter debug logs exported: ${filename}`);
      console.table(allLogs.metadata);

      return allLogs;
    };

    console.log(
      '✅ exportAllComponentLogs function registered to window object',
    );
  }
}

export default filterLogger;
