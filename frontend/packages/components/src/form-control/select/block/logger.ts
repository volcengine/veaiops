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

import { setupGlobalExports } from './logger/global-exports';
import type { LogEntry, LoggerConfig } from './types/logger';
import { LogLevel } from './types/logger';
import {
  checkStateConsistency,
  forceLoadingSync,
  verifyAndFixInconsistencies,
} from './utils/state-sync';

export type { LogEntry, LoggerConfig };
export { LogLevel };

/**
 * SelectBlock dedicated log manager
 */
export class SelectBlockLogger {
  static forceLoadingSync = forceLoadingSync;
  static verifyAndFixInconsistencies = verifyAndFixInconsistencies;
  static checkStateConsistency = checkStateConsistency;

  private static instance: SelectBlockLogger;

  /**
   * Get singleton instance
   */
  static getInstance(config?: Partial<LoggerConfig>): SelectBlockLogger {
    if (!SelectBlockLogger.instance) {
      SelectBlockLogger.instance = new SelectBlockLogger(config);
    }
    return SelectBlockLogger.instance;
  }

  private config: LoggerConfig;

  private logs: LogEntry[] = [];

  private traceIdCounter = 0;

  private performanceMarks: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.DEBUG,
      enableConsole: true,
      enableStorage: true,
      maxEntries: 1000,
      moduleName: 'SelectBlock',
      ...config,
    };
  }

  /**
   * Generate unique trace ID
   */
  generateTraceId(): string {
    this.traceIdCounter++;
    return `trace_${Date.now()}_${this.traceIdCounter}`;
  }

  /**
   * Start performance monitoring
   */
  startPerformance(key: string): string {
    const traceId = this.generateTraceId();
    this.performanceMarks.set(`${key}_${traceId}`, performance.now());
    return traceId;
  }

  /**
   * End performance monitoring
   */
  endPerformance(key: string, traceId: string): number {
    const startKey = `${key}_${traceId}`;
    const startTime = this.performanceMarks.get(startKey);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.performanceMarks.delete(startKey);
      return duration;
    }
    return 0;
  }

  /**
   * Log entry
   */
  private log(
    level: LogLevel,
    module: string,
    message: string,
    data?: any,
    method?: string,
    traceId?: string,
    duration?: number,
    error?: Error,
  ): void {
    if (level < this.config.level) {
      return;
    }

    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      level,
      levelName: LogLevel[level],
      module,
      method,
      message,
      data,
      traceId,
      duration,
      error,
      stack: error?.stack,
    };

    // Store log
    if (this.config.enableStorage) {
      this.logs.push(entry);

      // Keep log count within limit
      if (this.logs.length > this.config.maxEntries) {
        this.logs = this.logs.slice(-this.config.maxEntries);
      }
    }

    // Console output
    if (this.config.enableConsole) {
      this.outputToConsole(entry);
    }
  }

  /**
   * Output to console
   */
  private outputToConsole(entry: LogEntry): void {
    // 🔧 Fix: Use format fully compatible with log-exporter
    // log-exporter recognition rule: firstArg.includes('[SelectBlock]') or /\[SelectBlock\/.*\]/.test(firstArg)
    const timestamp = new Date(entry.timestamp).toISOString();
    const prefix = `[${timestamp}][SelectBlock/${entry.module}]`;
    const formattedMessage = entry.method
      ? `${prefix}[${entry.method}] ${entry.message}`
      : `${prefix} ${entry.message}`;

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, entry.data);
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, entry.data);
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, entry.data);
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, entry.data, entry.error);
        break;
      default:
        console.log(formattedMessage, entry.data);
        break;
    }
  }

  /**
   * DEBUG level log
   */
  debug(
    module: string,
    message: string,
    data?: any,
    method?: string,
    traceId?: string,
  ): void {
    this.log(LogLevel.DEBUG, module, message, data, method, traceId);
  }

  /**
   * INFO level log
   */
  info(
    module: string,
    message: string,
    data?: any,
    method?: string,
    traceId?: string,
  ): void {
    this.log(LogLevel.INFO, module, message, data, method, traceId);
  }

  /**
   * WARN level log
   */
  warn(
    module: string,
    message: string,
    data?: any,
    method?: string,
    traceId?: string,
  ): void {
    this.log(LogLevel.WARN, module, message, data, method, traceId);
  }

  /**
   * ERROR level log
   */
  error(
    module: string,
    message: string,
    error?: Error,
    data?: any,
    method?: string,
    traceId?: string,
  ): void {
    this.log(
      LogLevel.ERROR,
      module,
      message,
      data,
      method,
      traceId,
      undefined,
      error,
    );
  }

  /**
   * Log with performance monitoring
   */
  withPerformance<T>(
    module: string,
    method: string,
    message: string,
    fn: (traceId: string) => Promise<T> | T,
    data?: any,
  ): Promise<T> | T {
    const traceId = this.generateTraceId();
    const perfKey = `${module}_${method}`;

    this.info(module, `Starting execution: ${message}`, data, method, traceId);
    this.startPerformance(perfKey);

    try {
      const result = fn(traceId);

      if (result instanceof Promise) {
        return result
          .then((res) => {
            this.endPerformance(perfKey, traceId);
            this.info(
              module,
              `Execution successful: ${message}`,
              { result: res },
              method,
              traceId,
            );
            return res;
          })
          .catch((err) => {
            this.endPerformance(perfKey, traceId);
            this.error(
              module,
              `Execution failed: ${message}`,
              err,
              data,
              method,
              traceId,
            );
            throw err;
          });
      }
      this.endPerformance(perfKey, traceId);
      this.info(
        module,
        `Execution successful: ${message}`,
        { result },
        method,
        traceId,
      );
      return result;
    } catch (err) {
      this.endPerformance(perfKey, traceId);
      this.error(
        module,
        `Execution failed: ${message}`,
        err as Error,
        data,
        method,
        traceId,
      );
      throw err;
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Filter logs by conditions
   */
  filterLogs(filter: Partial<LogEntry>): LogEntry[] {
    return this.logs.filter((log) => {
      return Object.keys(filter).every((key) => {
        const filterValue = filter[key as keyof LogEntry];
        const logValue = log[key as keyof LogEntry];
        return filterValue === undefined || logValue === filterValue;
      });
    });
  }

  /**
   * Get all logs for specified trace ID
   */
  getLogsByTraceId(traceId: string): LogEntry[] {
    return this.logs.filter((log) => log.traceId === traceId);
  }

  /**
   * Export logs as JSON
   */
  exportLogs(filter?: Partial<LogEntry>): string {
    const logsToExport = filter ? this.filterLogs(filter) : this.logs;
    return JSON.stringify(
      {
        metadata: {
          exportTime: new Date().toISOString(),
          logCount: logsToExport.length,
          config: this.config,
        },
        logs: logsToExport,
      },
      null,
      2,
    );
  }

  /**
   * Export logs as CSV
   */
  exportLogsCSV(filter?: Partial<LogEntry>): string {
    const logsToExport = filter ? this.filterLogs(filter) : this.logs;

    if (logsToExport.length === 0) {
      return 'No logs to export';
    }

    const headers = [
      'timestamp',
      'levelName',
      'module',
      'method',
      'message',
      'traceId',
      'duration',
      'data',
    ];
    const csvRows = [
      headers.join(','),
      ...logsToExport.map((log) =>
        [
          new Date(log.timestamp).toISOString(),
          log.levelName,
          log.module,
          log.method || '',
          `"${log.message.replace(/"/g, '""')}"`,
          log.traceId || '',
          log.duration || '',
          log.data ? `"${JSON.stringify(log.data).replace(/"/g, '""')}"` : '',
        ].join(','),
      ),
    ];

    return csvRows.join('\n');
  }

  /**
   * Download log file
   */
  downloadLogs(
    filter?: Partial<LogEntry>,
    format: 'json' | 'csv' = 'json',
  ): void {
    const content =
      format === 'json' ? this.exportLogs(filter) : this.exportLogsCSV(filter);
    const blob = new Blob([content], {
      type: format === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `selectblock-logs-${new Date().toISOString().split('T')[0]}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
    this.info(this.config.moduleName, 'Logs cleared');
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.info(this.config.moduleName, `Log level set to: ${LogLevel[level]}`);
  }

  /**
   * Get log statistics
   */
  getStats(): { [key: string]: number } {
    const stats: { [key: string]: number } = { total: this.logs.length };

    Object.values(LogLevel)
      .filter((v) => typeof v === 'string')
      .forEach((level) => {
        stats[level] = this.logs.filter(
          (log) => log.levelName === level,
        ).length;
      });

    return stats;
  }
}

export const logger = SelectBlockLogger.getInstance({
  moduleName: 'SelectBlock',
  level: LogLevel.DEBUG,
});

if (typeof window !== 'undefined') {
  setupGlobalExports(logger);
}

export default logger;
