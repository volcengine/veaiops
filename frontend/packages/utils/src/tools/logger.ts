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
 * Log entry interface
 */
export interface LogEntry {
  message: string;
  data?: unknown;
  source?: string;
  component?: string;
}

/**
 * Log level
 */
export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

/**
 * Log record
 */
interface LogRecord {
  timestamp: number;
  level: LogLevel;
  entry: LogEntry;
}

/**
 * Logger class
 * Unified logging utility with support for log collection and export
 */
class Logger {
  private logs: LogRecord[] = [];
  private readonly maxLogs: number = 10000; // Maximum number of logs

  /**
   * Log a message
   */
  private log(level: LogLevel, entry: LogEntry): void {
    const record: LogRecord = {
      timestamp: Date.now(),
      level,
      entry,
    };

    // Add to log array
    this.logs.push(record);

    // Limit log count
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Output to console based on environment
    if (process.env.NODE_ENV === 'development') {
      const prefix = `[${entry.source || 'App'}${entry.component ? `/${entry.component}` : ''}]`;
      const { message, data } = entry;

      switch (level) {
        case LogLevel.DEBUG:
          console.debug(prefix, message, data || '');
          break;
        case LogLevel.INFO:
          console.info(prefix, message, data || '');
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data || '');
          break;
        case LogLevel.ERROR:
          console.error(prefix, message, data || '');
          break;
        default:
          console.log(prefix, message, data || '');
          break;
      }
    } else if (level === LogLevel.ERROR) {
      // Production environment: only output error and warn
      const prefix = `[${entry.source || 'App'}${entry.component ? `/${entry.component}` : ''}]`;
      const { message, data } = entry;
      console.error(prefix, message, data || '');
    } else if (level === LogLevel.WARN) {
      const prefix = `[${entry.source || 'App'}${entry.component ? `/${entry.component}` : ''}]`;
      const { message, data } = entry;
      console.warn(prefix, message, data || '');
    }
  }

  /**
   * Log debug level message
   */
  debug(entry: LogEntry): void {
    this.log(LogLevel.DEBUG, entry);
  }

  /**
   * Log info level message
   */
  info(entry: LogEntry): void {
    this.log(LogLevel.INFO, entry);
  }

  /**
   * Log warn level message
   */
  warn(entry: LogEntry): void {
    this.log(LogLevel.WARN, entry);
  }

  /**
   * Log error level message
   */
  error(entry: LogEntry): void {
    this.log(LogLevel.ERROR, entry);
  }

  /**
   * Export logs as JSON
   */
  exportLogsAsJSON(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  /**
   * Export logs as text
   */
  exportLogsAsText(): string {
    return this.logs
      .map((record) => {
        const time = new Date(record.timestamp).toISOString();
        const prefix = `[${record.entry.source || 'App'}${record.entry.component ? `/${record.entry.component}` : ''}]`;
        return `[${time}] [${record.level.toUpperCase()}] ${prefix} ${record.entry.message}${
          record.entry.data ? ` ${JSON.stringify(record.entry.data)}` : ''
        }`;
      })
      .join('\n');
  }

  /**
   * Get log statistics
   */
  getLogStats(): {
    total: number;
    byLevel: Record<LogLevel, number>;
    bySource: Record<string, number>;
  } {
    const stats = {
      total: this.logs.length,
      byLevel: {
        [LogLevel.DEBUG]: 0,
        [LogLevel.INFO]: 0,
        [LogLevel.WARN]: 0,
        [LogLevel.ERROR]: 0,
      } as Record<LogLevel, number>,
      bySource: {} as Record<string, number>,
    };

    for (const record of this.logs) {
      stats.byLevel[record.level]++;
      const source = record.entry.source || 'unknown';
      stats.bySource[source] = (stats.bySource[source] || 0) + 1;
    }

    return stats;
  }

  /**
   * Filter logs by component
   */
  getLogsByComponent(component: string): LogRecord[] {
    return this.logs.filter((record) => record.entry.component === component);
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get log count
   */
  getLogCount(): number {
    return this.logs.length;
  }

  /**
   * Get all logs
   */
  getLogs(): LogRecord[] {
    return [...this.logs];
  }

  /**
   * Get logs within specified time range
   */
  getLogsInRange(options: { startTime: number; endTime: number }): LogRecord[] {
    return this.logs.filter(
      (record) =>
        record.timestamp >= options.startTime &&
        record.timestamp <= options.endTime,
    );
  }

  /**
   * Get session ID (for log export)
   */
  getSessionId(): string {
    if (typeof window !== 'undefined') {
      const sessionId = (window as any).__veaiopsSessionId;
      if (sessionId) {
        return sessionId;
      }
      // Generate new session ID
      const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      (window as any).__veaiopsSessionId = newSessionId;
      return newSessionId;
    }
    return 'unknown';
  }
}

// Export singleton
export const logger = new Logger();

/**
 * Export logs to file
 * @param filename File name (optional, defaults to timestamp)
 */
export const exportLogsToFile = (filename?: string): void => {
  if (typeof window === 'undefined') {
    console.warn(
      '[Logger] exportLogsToFile can only be used in browser environment',
    );
    return;
  }

  const text = logger.exportLogsAsText();
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  const defaultFilename =
    filename ||
    `veaiops-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.log`;

  const link = document.createElement('a');
  link.href = url;
  link.download = defaultFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
};

/**
 * Get log count
 */
export function getLogCount(): number {
  return logger.getLogCount();
}

/**
 * Start log collection (unified logger is enabled by default, this function is kept for compatibility)
 */
export function startLogCollection(): void {
  // logger is enabled by default, this function is kept for compatibility
  // If enable/disable functionality is needed in the future, it can be implemented here
}

/**
 * Stop log collection (unified logger is enabled by default, this function is kept for compatibility)
 */
export function stopLogCollection(): void {
  // logger is enabled by default, this function is kept for compatibility
  // If enable/disable functionality is needed in the future, it can be implemented here
}

/**
 * Export logs within specified time range
 * @param startTime - Start time (timestamp)
 * @param endTime - End time (timestamp), use current time if not provided
 * @param formatOrFilename - Export format: 'json' | 'text', or directly pass custom filename (backward compatible)
 */
export function exportLogsInTimeRange(
  startTime: number,
  endTime?: number,
  formatOrFilename: 'json' | 'text' | string = 'json',
): void {
  if (typeof window === 'undefined') {
    console.warn(
      '[Logger] exportLogsInTimeRange can only be used in browser environment',
    );
    return;
  }

  // If endTime is not provided, use current time
  const actualEndTime = endTime ?? Date.now();

  const logs = logger.getLogsInRange({ startTime, endTime: actualEndTime });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  let content: string;
  let filename: string;
  let mimeType: string;

  // If filename is passed (contains .json or .txt/.log extension), determine format based on extension
  if (formatOrFilename.includes('.json')) {
    filename = formatOrFilename;
    content = JSON.stringify(
      {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(actualEndTime).toISOString(),
        totalLogs: logs.length,
        logs: logs.map((record) => ({
          timestamp: record.timestamp,
          level: record.level,
          message: record.entry.message,
          data: record.entry.data,
          source: record.entry.source,
          component: record.entry.component,
        })),
      },
      null,
      2,
    );
    mimeType = 'application/json';
  } else if (
    formatOrFilename.includes('.txt') ||
    formatOrFilename.includes('.log')
  ) {
    filename = formatOrFilename;
    const header = [
      'VeAIOps Time Range Log Export',
      `Start Time: ${new Date(startTime).toISOString()}`,
      `End Time: ${new Date(actualEndTime).toISOString()}`,
      `Log Count: ${logs.length}`,
      '='.repeat(80),
      '',
    ].join('\n');
    const logLines = logs.map((record) => {
      const time = new Date(record.timestamp).toISOString();
      const prefix = `[${time}][${record.level.toUpperCase()}][${record.entry.source || 'App'}${
        record.entry.component ? `/${record.entry.component}` : ''
      }]`;
      const dataStr = record.entry.data
        ? ` | Data: ${JSON.stringify(record.entry.data)}`
        : '';
      return `${prefix} ${record.entry.message}${dataStr}`;
    });
    content = header + logLines.join('\n');
    mimeType = 'text/plain;charset=utf-8';
  } else if (formatOrFilename === 'json') {
    content = JSON.stringify(
      {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(actualEndTime).toISOString(),
        totalLogs: logs.length,
        logs: logs.map((record) => ({
          timestamp: record.timestamp,
          level: record.level,
          message: record.entry.message,
          data: record.entry.data,
          source: record.entry.source,
          component: record.entry.component,
        })),
      },
      null,
      2,
    );
    filename = `veaiops-logs-${timestamp}.json`;
    mimeType = 'application/json';
  } else {
    const header = [
      'VeAIOps Time Range Log Export',
      `Start Time: ${new Date(startTime).toISOString()}`,
      `End Time: ${new Date(actualEndTime).toISOString()}`,
      `Log Count: ${logs.length}`,
      '='.repeat(80),
      '',
    ].join('\n');
    const logLines = logs.map((record) => {
      const time = new Date(record.timestamp).toISOString();
      const prefix = `[${time}][${record.level.toUpperCase()}][${record.entry.source || 'App'}${
        record.entry.component ? `/${record.entry.component}` : ''
      }]`;
      const dataStr = record.entry.data
        ? ` | Data: ${JSON.stringify(record.entry.data)}`
        : '';
      return `${prefix} ${record.entry.message}${dataStr}`;
    });
    content = header + logLines.join('\n');
    filename =
      formatOrFilename === 'text'
        ? `veaiops-logs-${timestamp}.txt`
        : `${formatOrFilename}.txt`;
    mimeType = 'text/plain;charset=utf-8';
  }

  // Create download link
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Expose to window in development environment
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (
    window as unknown as { __veaiopsUtilsLogger?: Logger }
  ).__veaiopsUtilsLogger = logger;
}
