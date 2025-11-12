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
 * veArch SelectBlock unified log manager
 * Supports hierarchical logging, full-link tracing, and export functionality
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  levelName: string;
  module: string;
  method?: string;
  message: string;
  data?: any;
  traceId?: string;
  duration?: number;
  error?: Error;
  stack?: string;
}

export interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableStorage: boolean;
  maxEntries: number;
  moduleName: string;
}

/**
 * SelectBlock dedicated log manager
 */
export class SelectBlockLogger {
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

  /**
   * Force React state and DOM state synchronization
   * Resolves UI inconsistency issues caused by asynchronous state updates
   */
  static forceLoadingSync(loading: boolean): void {
    try {
      // Immediately sync DOM state (without waiting for RAF)
      const selectElements = document.querySelectorAll('.arco-select');
      let syncedCount = 0;

      selectElements.forEach((element) => {
        const currentHasLoading = element.classList.contains(
          'arco-select-loading',
        );

        if (loading && !currentHasLoading) {
          element.classList.add('arco-select-loading');
          syncedCount++;
        } else if (!loading && currentHasLoading) {
          element.classList.remove('arco-select-loading');
          syncedCount++;
        }

        // Sync placeholder text
        const placeholder = element.querySelector('.arco-select-placeholder');
        if (placeholder) {
          const currentText = placeholder.textContent;
          const expectedText = loading ? '搜索中...' : '请选择';

          if (currentText !== expectedText) {
            placeholder.textContent = expectedText;
            syncedCount++;
          }
        }
      });

      // 🚨 Remove event triggering to prevent infinite loops
      // StateSync only handles DOM synchronization, does not trigger additional events

      logger.debug(
        'StateSync',
        `强制状态同步完成`,
        {
          loading,
          elementsCount: selectElements.length,
          syncedCount,
          timestamp: Date.now(),
        },
        'forceLoadingSync',
      );

      // Use RAF to ensure verification after rendering completes
      requestAnimationFrame(() => {
        SelectBlockLogger.verifyAndFixInconsistencies();
      });
    } catch (error) {
      logger.error(
        'StateSync',
        '状态同步失败',
        error as Error,
        {
          loading,
        },
        'forceLoadingSync',
      );
    }
  }

  /**
   * Verify and fix state inconsistencies
   */
  static verifyAndFixInconsistencies(): void {
    try {
      const selectElements = document.querySelectorAll('.arco-select');
      let fixCount = 0;

      selectElements.forEach((element) => {
        const hasLoadingClass = element.classList.contains(
          'arco-select-loading',
        );
        const placeholder = element.querySelector('.arco-select-placeholder');
        const placeholderText = placeholder?.textContent;

        // Check and fix inconsistent state
        if (hasLoadingClass && placeholderText !== '搜索中...') {
          if (placeholder) {
            placeholder.textContent = '搜索中...';
            fixCount++;
          }
        } else if (!hasLoadingClass && placeholderText === '搜索中...') {
          if (placeholder) {
            placeholder.textContent = '请选择';
            fixCount++;
          }
        }
      });

      if (fixCount > 0) {
        logger.info(
          'StateSync',
          `修复了${fixCount}个状态不一致问题`,
          {
            fixCount,
            elementsChecked: selectElements.length,
          },
          'verifyAndFixInconsistencies',
        );
      }
    } catch (error) {
      logger.error(
        'StateSync',
        '状态验证修复失败',
        error as Error,
        {},
        'verifyAndFixInconsistencies',
      );
    }
  }

  /**
   * Check if React state and DOM state are consistent
   */
  static checkStateConsistency(): { consistent: boolean; details: any } {
    try {
      const selectElements = document.querySelectorAll('.arco-select');
      const inconsistencies: Array<{
        elementIndex: number;
        issue: string;
        expected: string;
        actual: string | null | undefined;
      }> = [];

      selectElements.forEach((element, index) => {
        const domHasLoading = element.classList.contains('arco-select-loading');
        const placeholder = element.querySelector('.arco-select-placeholder');
        const placeholderText = placeholder?.textContent;
        const expectedPlaceholder = domHasLoading ? '搜索中...' : '请选择';

        if (placeholderText !== expectedPlaceholder) {
          inconsistencies.push({
            elementIndex: index,
            issue: 'placeholder_mismatch',
            expected: expectedPlaceholder,
            actual: placeholderText ?? null,
          });
        }
      });

      const result = {
        consistent: inconsistencies.length === 0,
        details: {
          elementsChecked: selectElements.length,
          inconsistencies,
          timestamp: Date.now(),
        },
      };

      logger.debug(
        'StateSync',
        '状态一致性检查完成',
        result,
        'checkStateConsistency',
      );

      return result;
    } catch (error) {
      logger.error(
        'StateSync',
        '状态一致性检查失败',
        error as Error,
        {},
        'checkStateConsistency',
      );
      return {
        consistent: false,
        details: { error: (error as Error).message },
      };
    }
  }

  private config: LoggerConfig;

  private logs: LogEntry[] = [];

  private traceIdCounter = 0;

  private performanceMarks: Map<string, number> = new Map();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: LogLevel.DEBUG,
      // ✅ feat(logger): Silent mode - Disable console output by default
      enableConsole: false,
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

    this.info(module, `开始执行: ${message}`, data, method, traceId);
    this.startPerformance(perfKey);

    try {
      const result = fn(traceId);

      if (result instanceof Promise) {
        return result
          .then((res) => {
            this.endPerformance(perfKey, traceId);
            this.info(
              module,
              `执行成功: ${message}`,
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
              `执行失败: ${message}`,
              err,
              data,
              method,
              traceId,
            );
            throw err;
          });
      }
      this.endPerformance(perfKey, traceId);
      this.info(module, `执行成功: ${message}`, { result }, method, traceId);
      return result;
    } catch (err) {
      this.endPerformance(perfKey, traceId);
      this.error(
        module,
        `执行失败: ${message}`,
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
    this.info(this.config.moduleName, '日志已清空');
  }

  /**
   * Set log level
   */
  setLevel(level: LogLevel): void {
    this.config.level = level;
    this.info(this.config.moduleName, `日志级别已设置为: ${LogLevel[level]}`);
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

// Create default instance
export const logger = SelectBlockLogger.getInstance({
  moduleName: 'SelectBlock',
  level: LogLevel.DEBUG,
});

// Expose globally for debugging convenience
if (typeof window !== 'undefined') {
  (window as any).SelectBlockLogger = logger;
  // StateSync API compatibility
  (window as any).StateSync = {
    forceLoadingSync: SelectBlockLogger.forceLoadingSync,
    verifyAndFixInconsistencies: SelectBlockLogger.verifyAndFixInconsistencies,
    checkStateConsistency: SelectBlockLogger.checkStateConsistency,
  };

  // Provide interface for ComprehensiveLoadingDebugger
  (window as any).getSelectBlockLogs = () => logger.getLogs();
  (window as any).getSelectBlockLogsByTrace = (traceId: string) =>
    logger.getLogsByTraceId(traceId);
  (window as any).exportSelectBlockLogs = (format: 'json' | 'csv' = 'json') =>
    logger.downloadLogs(undefined, format);
  (window as any).clearSelectBlockLogs = () => logger.clearLogs();
  (window as any).getSelectBlockStats = () => logger.getStats();

  // Quick fix tool
  (window as any).forceResetLoadingState = () =>
    SelectBlockLogger.forceLoadingSync(false);
  (window as any).checkLoadingConsistency = () =>
    SelectBlockLogger.checkStateConsistency();

  // 🔧 Create safe JSON serialization function, filter circular references and DOM elements
  const createSafeJSONReplacer = () => {
    const seen = new WeakSet();

    return (key: string, value: any): any => {
      // ✅ Handle BigInt type (avoid serialization errors)
      if (typeof value === 'bigint') {
        return `${value.toString()}n`; // Convert to string and add 'n' marker
      }

      // Filter out DOM elements and other non-serializable objects
      if (value instanceof HTMLElement) {
        return '[HTMLElement]';
      }
      if (value instanceof Element) {
        return '[Element]';
      }
      if (value instanceof Node) {
        return '[Node]';
      }
      if (typeof value === 'function') {
        return '[Function]';
      }
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }

      // Handle objects and arrays - only detect circular references, no depth limit
      if (typeof value === 'object' && value !== null) {
        // Detect circular references
        if (seen.has(value)) {
          return '[Circular]';
        }
        seen.add(value);
      }

      return value;
    };
  };

  // Unified log export interface
  (window as any).exportAllComponentLogs = () => {
    try {
      const selectBlockLogs = logger.getLogs();
      const customTableLogs = (window as any).getCustomTableLogs?.() || [];
      const filtersLogs = (window as any).getFiltersLogs?.() || [];
      const taskFilterLogs = (window as any).__taskFilterLogs || [];
      const querySyncLogs = (window as any).getQuerySyncLogs?.() || [];
      const tableHelpersLogs = (window as any).__tableHelpersLogs || [];
      const tableFilterPluginLogs =
        (window as any).getTableFilterLogs?.() || [];

      // 🔥 New: Get logs from @veaiops/utils logger (for Drawer, ConnectionManager, etc.)
      const utilsLoggerLogs =
        (window as any).__veaiopsUtilsLogger?.getLogs?.() || [];

      // 🔥 New: Collect timezone-related logs by source (for diagnosing timezone issues)
      const timezoneRelatedSources = [
        'TimezoneConverter',
        'DateUtils',
        'TimezonePreference',
        'TimeRangeUtils',
        'TimezoneSelector',
      ];
      const timezoneLogs = utilsLoggerLogs.filter(
        (log: any) => log.source && timezoneRelatedSources.includes(log.source),
      );

      // 🔧 Add loop detection analysis
      const loopAnalysis = {
        selectBlockRenderCount: 0,
        propsUpdateCount: 0,
        stateUpdateCount: 0,
        suspiciousPatterns: [] as string[],
      };

      // Count render and update times
      selectBlockLogs.forEach((log) => {
        if (
          log.message.includes('组件开始渲染') ||
          log.message.includes('Hook开始执行')
        ) {
          loopAnalysis.selectBlockRenderCount++;
        }
        if (log.message === 'Props更新') {
          loopAnalysis.propsUpdateCount++;
        }
        if (log.method === 'setState') {
          loopAnalysis.stateUpdateCount++;
        }
      });

      // Detect suspicious patterns
      if (loopAnalysis.selectBlockRenderCount > 50) {
        loopAnalysis.suspiciousPatterns.push(
          `⚠️ SelectBlock 渲染次数过多: ${loopAnalysis.selectBlockRenderCount}`,
        );
      }
      if (loopAnalysis.propsUpdateCount > 50) {
        loopAnalysis.suspiciousPatterns.push(
          `⚠️ Props 更新次数过多: ${loopAnalysis.propsUpdateCount}`,
        );
      }
      if (loopAnalysis.stateUpdateCount > 100) {
        loopAnalysis.suspiciousPatterns.push(
          `⚠️ State 更新次数过多: ${loopAnalysis.stateUpdateCount}`,
        );
      }

      const allLogs = {
        metadata: {
          exportTime: new Date().toISOString(),
          totalLogCount:
            selectBlockLogs.length +
            customTableLogs.length +
            filtersLogs.length +
            taskFilterLogs.length +
            querySyncLogs.length +
            tableHelpersLogs.length +
            tableFilterPluginLogs.length +
            utilsLoggerLogs.length,
          components: {
            SelectBlock: selectBlockLogs.length,
            CustomTable: customTableLogs.length,
            Filters: filtersLogs.length,
            TaskFilters: taskFilterLogs.length,
            QuerySync: querySyncLogs.length,
            TableHelpers: tableHelpersLogs.length,
            TableFilterPlugin: tableFilterPluginLogs.length,
            // 🔥 New: VeAIOps Utils Logger (includes Drawer, ConnectionManager, DataSourceWizard, ManagementPage, etc.)
            VeAIOpsUtils: utilsLoggerLogs.length,
            // 🔥 New: Timezone-related log statistics (for diagnosing timezone issues)
            TimezoneRelated: timezoneLogs.length,
          },
          loopAnalysis,
        },
        logs: {
          SelectBlock: selectBlockLogs,
          CustomTable: customTableLogs,
          Filters: filtersLogs,
          TaskFilters: taskFilterLogs,
          QuerySync: querySyncLogs,
          TableHelpers: tableHelpersLogs,
          TableFilterPlugin: tableFilterPluginLogs,
          // 🔥 New: VeAIOps Utils Logger logs
          VeAIOpsUtils: utilsLoggerLogs,
          // 🔥 New: Timezone-related logs (grouped by source for easier timezone issue diagnosis)
          TimezoneRelated: timezoneLogs.reduce(
            (acc: any, log: any) => {
              const source = log.source || 'Unknown';
              if (!acc[source]) {
                acc[source] = [];
              }
              acc[source].push(log);
              return acc;
            },
            {} as Record<string, any[]>,
          ),
        },
      };

      // 🔧 Use safe serialization function to avoid circular reference errors
      const content = JSON.stringify(allLogs, createSafeJSONReplacer(), 2);
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `veaiops-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('📊 日志导出成功:', allLogs.metadata);
      if (loopAnalysis.suspiciousPatterns.length > 0) {
        console.warn(
          '🚨 检测到可疑的循环模式:',
          loopAnalysis.suspiciousPatterns,
        );
      }
      return allLogs;
    } catch (error) {
      console.error('日志导出失败:', error);
      throw error;
    }
  };

  // 🔧 Add quick loop detection tool
  (window as any).detectSelectBlockLoop = () => {
    const logs = logger.getLogs();
    const recentLogs = logs.slice(-100); // Last 100 logs

    // Statistics by module
    const moduleStats: Record<string, number> = {};
    const methodStats: Record<string, number> = {};
    const messageStats: Record<string, number> = {};

    recentLogs.forEach((log) => {
      moduleStats[log.module] = (moduleStats[log.module] || 0) + 1;
      if (log.method) {
        const key = `${log.module}.${log.method}`;
        methodStats[key] = (methodStats[key] || 0) + 1;
      }
      messageStats[log.message] = (messageStats[log.message] || 0) + 1;
    });

    console.group('🔍 SelectBlock 循环检测报告（最近100条日志）');
    console.log('📊 模块调用统计:', moduleStats);
    console.log('📊 方法调用统计:', methodStats);
    console.log('📊 消息统计:', messageStats);

    // Find high-frequency calls
    const highFrequencyThreshold = 10;
    const highFrequencyMessages = Object.entries(messageStats)
      .filter(([_, count]) => count > highFrequencyThreshold)
      .sort((a, b) => b[1] - a[1]);

    if (highFrequencyMessages.length > 0) {
      console.warn('⚠️ 高频消息（可能的循环点）:', highFrequencyMessages);
    }
    console.groupEnd();

    return {
      moduleStats,
      methodStats,
      messageStats,
      highFrequencyMessages,
      totalRecentLogs: recentLogs.length,
    };
  };
}

export default logger;
