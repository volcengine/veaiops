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
 * Enhanced logging tool
 * Provides unified logging functionality with support for multiple output formats and filtering
 * Integrates enhanced log collector to automatically collect context information, API requests, performance metrics, etc.
 */

/**
 * Convert timestamp to yyyy-mm-dd hh:mm:ss format
 */
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

/**
 * Enhanced collector lazy loader
 * Note: Use dynamic import to avoid circular dependency
 */
let enhancedCollectorInstance: any = null;

const getEnhancedCollector = () => {
  if (enhancedCollectorInstance === null && typeof window !== 'undefined') {
    try {
      // Lazy import to avoid circular dependency
      const imported = require('./enhanced-collector');
      enhancedCollectorInstance = imported.enhancedCollector;
    } catch {
      enhancedCollectorInstance = false;
    }
  }
  return enhancedCollectorInstance;
};

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

  /**
   * Safely serialize data, remove circular references and non-serializable objects
   */
  private safeSerializeData(data: any): any {
    if (data === null || data === undefined) {
      return data;
    }

    // If it's a primitive type, return directly
    if (typeof data !== 'object') {
      return data;
    }

    try {
      // Use JSON.parse(JSON.stringify) to detect circular references
      // If there's a circular reference, it will throw an error
      JSON.stringify(data);
      return data;
    } catch (error: unknown) {
      // ✅ If there's a circular reference or serialization error, return safe simplified version
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      try {
        if (Array.isArray(data)) {
          return data.map((item) => this.safeSerializeData(item));
        }

        // Object type: Only extract serializable fields
        const safeData: any = {};
        for (const key in data) {
          if (!Object.prototype.hasOwnProperty.call(data, key)) {
            continue;
          }

          safeData[key] = this.serializeValue(data[key]);
        }
        return safeData;
      } catch (innerError: unknown) {
        // ✅ Complete failure, return string representation
        // Note: Errors inside logger tool use console.warn (compliant with spec, as logger is the logging tool itself)
        const innerErrorObj =
          innerError instanceof Error
            ? innerError
            : new Error(String(innerError));
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[Logger] Data serialization completely failed',
            innerErrorObj.message,
            {
              originalError: errorObj.message,
            },
          );
        }
        return `[Unserializable: ${typeof data}]`;
      }
    }
  }

  private addLog(
    level: LogEntry['level'],
    message: string,
    data?: any,
    source?: string,
    component?: string,
  ) {
    let entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data: this.safeSerializeData(data), // Use safe serialization
      source: source || 'VeArchAmap',
      component,
      sessionId: this.sessionId,
    };

    // ✅ Use enhanced collector to automatically enhance log entries (add context information)
    const collector = getEnhancedCollector();
    if (collector && typeof collector.enhanceLogEntry === 'function') {
      try {
        entry = collector.enhanceLogEntry(entry);
      } catch (error: unknown) {
        // ✅ Silently handle enhancement failure, don't affect normal logging
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[Logger] Failed to enhance log entry',
            errorObj.message,
          );
        }
      }
    }

    this.logs.push(entry);

    // Limit log count
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Output to console (only in development environment)
    // ✅ Non-development environments: only collect logs, do not print to console
    if (this.enableConsole && process.env.NODE_ENV === 'development') {
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
        // ✅ Silently handle localStorage errors (avoid blocking logging functionality), but log warning in dev
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[Logger] localStorage storage failed',
            errorObj.message,
          );
        }
      }
    }
  }

  /**
   * Log message
   * @param params Log parameters object
   */
  log({ message, data, source, component }: LogParams): void {
    this.addLog('log', message, data, source, component);
  }

  /**
   * Log info message
   * @param params Log parameters object
   */
  info({ message, data, source, component }: LogParams): void {
    this.addLog('info', message, data, source, component);
  }

  /**
   * Log warning message
   * @param params Log parameters object
   */
  warn({ message, data, source, component }: LogParams): void {
    this.addLog('warn', message, data, source, component);
  }

  /**
   * Log error message
   * @param params Log parameters object
   */
  error({ message, data, source, component }: LogParams): void {
    this.addLog('error', message, data, source, component);
  }

  /**
   * Log debug message
   * @param params Log parameters object
   */
  debug({ message, data, source, component }: LogParams): void {
    this.addLog('debug', message, data, source, component);
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs in specified time range
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
        // ✅ Silently handle localStorage errors (avoid blocking logging functionality), but log warning in dev
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        if (process.env.NODE_ENV === 'development') {
          console.warn('[Logger] localStorage clear failed', errorObj.message);
        }
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

  private serializeValue(value: any): any {
    // Handle primitive types
    if (
      value === null ||
      value === undefined ||
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    // Handle arrays
    if (Array.isArray(value)) {
      return value.map((item) => {
        if (typeof item === 'object' && item !== null) {
          return '[Object]';
        }
        return item;
      });
    }

    // Handle objects
    if (typeof value === 'object' && value !== null) {
      return this.serializeObjectValue(value);
    }

    // Other types
    return String(value);
  }

  /**
   * Detect if object contains circular references
   */
  private hasCircularReference(
    value: unknown,
    seen = new WeakSet<object>(),
  ): boolean {
    if (typeof value !== 'object' || value === null) {
      return false;
    }

    if (seen.has(value)) {
      return true;
    }

    seen.add(value);

    try {
      for (const key in value) {
        if (Object.prototype.hasOwnProperty.call(value, key)) {
          const propValue = (value as Record<string, unknown>)[key];
          if (this.hasCircularReference(propValue, seen)) {
            return true;
          }
        }
      }
    } catch {
      // If accessing property fails (e.g., accessor property throws error), consider it may have circular reference
      return true;
    }

    // ✅ WeakSet doesn't need manual deletion, will be automatically cleaned when object is garbage collected
    // But for accurate detection, we need to maintain seen state when recursively returning
    return false;
  }

  /**
   * Serialize object value, avoid deep nesting and circular references
   */
  private serializeObjectValue(value: any): string {
    // Check if it's a DOM element or React element
    if (value instanceof Element || value.$$typeof || value._owner) {
      return '[React/DOM Element]';
    }

    // ✅ Prioritize detecting circular references (avoid JSON.stringify throwing error)
    if (this.hasCircularReference(value)) {
      return '[Circular Reference]';
    }

    // Check if it's a React Context (usually contains _context property causing circular reference)
    if (
      typeof value === 'object' &&
      value !== null &&
      ('_context' in value ||
        '_currentValue' in value ||
        '_currentValue2' in value)
    ) {
      return '[React Context]';
    }

    // Try to serialize nested object (at most one level)
    try {
      return JSON.parse(JSON.stringify(value));
    } catch (error: unknown) {
      // ✅ Return placeholder when serialization fails
      // Note: Circular references have been detected and handled earlier, errors here are usually other reasons (e.g., contains functions)
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      const errorMessage = errorObj.message || String(error);

      // Only print warning for non-circular reference errors (circular references are silently handled)
      if (
        process.env.NODE_ENV === 'development' &&
        !errorMessage.includes('circular') &&
        !errorMessage.includes('Converting circular structure')
      ) {
        console.warn('[Logger] Object serialization failed', errorMessage);
      }

      return '[Complex Object]';
    }
  }
}

// Create global logger instance
export const logger = new Logger({
  maxLogs: 2000,
  enableConsole: true,
  enableStorage: false, // Default: local storage not enabled
});

// 🔥 Expose logger instance to window object for log export tools and enhanced collector
if (typeof window !== 'undefined') {
  (window as any).__veaiopsUtilsLogger = logger;

  // ✅ Automatically start enhanced collector (development environment)
  if (process.env.NODE_ENV === 'development') {
    setTimeout(() => {
      try {
        const collector = getEnhancedCollector();
        if (collector?.startCollection) {
          collector.startCollection();
        }
      } catch (error) {
        // If startup fails, silently handle (enhanced collector is optional)
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            '[Logger] Enhanced collector startup failed (optional feature)',
            error instanceof Error ? error.message : String(error),
          );
        }
      }
    }, 0);
  }
}

// Export Logger class for creating independent instances elsewhere
export { Logger };
