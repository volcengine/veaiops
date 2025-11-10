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
 * Enhanced logger utility
 * Provides unified logging functionality with support for multiple output formats and filtering
 */

import { formatTimestamp } from './utils/format';
import { safeSerializeData } from './utils/serialization';

export interface LogEntry {
  timestamp: number;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
  source?: string;
  component?: string;
  sessionId?: string;
}

export interface LoggerConfig {
  maxLogs?: number;
  enableConsole?: boolean;
  enableStorage?: boolean;
  sessionId?: string;
}

/**
 * Log parameters interface
 */
export interface LogParams {
  message: string;
  data?: any;
  source?: string;
  component?: string;
}

class Logger {
  private logs: LogEntry[] = [];

  private maxLogs = 1000;

  private enableConsole = true;

  private enableStorage = true;

  private sessionId: string;

  constructor(config: LoggerConfig = {}) {
    this.maxLogs = config.maxLogs || 2000;
    this.enableConsole = config.enableConsole !== false;
    this.enableStorage = config.enableStorage || false;
    this.sessionId = config.sessionId || this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addLog(
    level: LogEntry['level'],
    message: string,
    data?: any,
    source?: string,
    component?: string,
  ) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data: safeSerializeData(data), // 🔥 Use safe serialization
      source: source || 'VeArchAmap',
      component,
      sessionId: this.sessionId,
    };

    this.logs.push(entry);

    // Limit log count
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console
    if (this.enableConsole) {
      const timestamp = formatTimestamp(entry.timestamp);
      const prefix = `[${timestamp}][${entry.source}${
        component ? `/${component}` : ''
      }]`;
      const consoleMessage = `${prefix} ${message}`;

      switch (level) {
        case 'error':
          console.error(consoleMessage, data);
          break;
        case 'warn':
          console.warn(consoleMessage, data);
          break;
        case 'info':
          console.info(consoleMessage, data);
          break;
        case 'debug':
          console.debug(consoleMessage, data);
          break;
        default:
          console.log(consoleMessage, data);
      }
    }

    // Store to local storage (optional)
    if (this.enableStorage) {
      try {
        const storageKey = `ve_arch_amap_logs_${this.sessionId}`;
        const existingLogs = JSON.parse(
          localStorage.getItem(storageKey) || '[]',
        );
        existingLogs.push(entry);

        // Limit stored log count
        if (existingLogs.length > this.maxLogs) {
          existingLogs.splice(0, existingLogs.length - this.maxLogs);
        }

        localStorage.setItem(storageKey, JSON.stringify(existingLogs));
      } catch (error: unknown) {
        // ✅ Silently handle localStorage errors (avoid blocking logging functionality), but log warning
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        console.warn('[Logger] localStorage storage failed', errorObj.message);
      }
    }
  }

  /**
   * Log a message
   * @param params Log parameters object
   */
  log({ message, data, source, component }: LogParams): void {
    this.addLog('log', message, data, source, component);
  }

  /**
   * Log an info message
   * @param params Log parameters object
   */
  info({ message, data, source, component }: LogParams): void {
    this.addLog('info', message, data, source, component);
  }

  /**
   * Log a warning message
   * @param params Log parameters object
   */
  warn({ message, data, source, component }: LogParams): void {
    this.addLog('warn', message, data, source, component);
  }

  /**
   * Log an error message
   * @param params Log parameters object
   */
  error({ message, data, source, component }: LogParams): void {
    this.addLog('error', message, data, source, component);
  }

  /**
   * Log a debug message
   * @param params Log parameters object
   */
  debug({ message, data, source, component }: LogParams): void {
    this.addLog('debug', message, data, source, component);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs within specified time range
  getLogsInRange({
    startTime,
    endTime,
  }: {
    startTime: number;
    endTime: number;
  }): LogEntry[] {
    return this.logs.filter(
      (log) => log.timestamp >= startTime && log.timestamp <= endTime,
    );
  }

  // Filter logs by level
  getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter((log) => log.level === level);
  }

  // Filter logs by component
  getLogsByComponent(component: string): LogEntry[] {
    return this.logs.filter((log) => log.component === component);
  }

  // Filter logs by source
  getLogsBySource(source: string): LogEntry[] {
    return this.logs.filter((log) => log.source === source);
  }

  // Search logs
  searchLogs(keyword: string): LogEntry[] {
    const lowerKeyword = keyword.toLowerCase();
    return this.logs.filter(
      (log) =>
        log.message.toLowerCase().includes(lowerKeyword) ||
        log.source?.toLowerCase().includes(lowerKeyword) ||
        log.component?.toLowerCase().includes(lowerKeyword),
    );
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    if (this.enableStorage) {
      try {
        const storageKey = `ve_arch_amap_logs_${this.sessionId}`;
        localStorage.removeItem(storageKey);
      } catch (error: unknown) {
        // ✅ Silently handle localStorage errors (avoid blocking logging functionality), but log warning
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        console.warn('[Logger] localStorage clear failed', errorObj.message);
      }
    }
  }

  // Get log count
  getLogCount(): number {
    return this.logs.length;
  }

  // Get log statistics
  getLogStats(): { [key in LogEntry['level']]: number } {
    const stats = { log: 0, info: 0, warn: 0, error: 0, debug: 0 };
    this.logs.forEach((log) => {
      stats[log.level]++;
    });
    return stats;
  }

  // Export logs as JSON format
  exportLogsAsJSON(): string {
    return JSON.stringify(
      {
        sessionId: this.sessionId,
        exportTime: new Date().toISOString(),
        totalLogs: this.logs.length,
        stats: this.getLogStats(),
        logs: this.logs,
      },
      null,
      2,
    );
  }

  // Export logs as text format
  exportLogsAsText(): string {
    const header = [
      `VeArch Amap Log Export`,
      `Session ID: ${this.sessionId}`,
      `Export Time: ${formatTimestamp(Date.now())}`,
      `Total Logs: ${this.logs.length}`,
      `Statistics: ${JSON.stringify(this.getLogStats())}`,
      '='.repeat(80),
      '',
    ].join('\n');

    const logLines = this.logs.map((log) => {
      const timestamp = formatTimestamp(log.timestamp);
      const prefix = `[${timestamp}][${log.level.toUpperCase()}][${log.source}${
        log.component ? `/${log.component}` : ''
      }]`;
      const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
      return `${prefix} ${log.message}${dataStr}`;
    });

    return header + logLines.join('\n');
  }

  // Get session ID
  getSessionId(): string {
    return this.sessionId;
  }

  // Configure logger
  configure(config: Partial<LoggerConfig>) {
    if (config.maxLogs !== undefined) {
      this.maxLogs = config.maxLogs;
    }
    if (config.enableConsole !== undefined) {
      this.enableConsole = config.enableConsole;
    }
    if (config.enableStorage !== undefined) {
      this.enableStorage = config.enableStorage;
    }
    if (config.sessionId !== undefined) {
      this.sessionId = config.sessionId;
    }
  }
}

// Create global logger instance
export const logger = new Logger({
  maxLogs: 2000,
  enableConsole: true,
  enableStorage: false, // Local storage disabled by default
});

// 🔥 Expose logger instance to window object for log export tools
if (typeof window !== 'undefined') {
  (window as any).__veaiopsUtilsLogger = logger;
}

// Export Logger class for creating independent instances elsewhere
export { Logger };
