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
 * CustomTable full-link log collector
 * Provides component full lifecycle log recording functionality
 */

import { logger } from '@veaiops/utils';
import { devLog } from './utils/log-utils';

/**
 * Log phase enumeration
 */
export enum LogPhase {
  /** Component initialization */
  COMPONENT_INIT = 'component_init',
  /** State initialization */
  STATE_INIT = 'state_init',
  /** Column configuration */
  COLUMNS_CONFIG = 'columns_config',
  /** Query synchronization */
  QUERY_SYNC = 'query_sync',
  /** Data source request */
  DATA_SOURCE_REQUEST = 'data_source_request',
  /** Data source response */
  DATA_SOURCE_RESPONSE = 'data_source_response',
  /** Plugin registration */
  PLUGIN_REGISTER = 'plugin_register',
  /** Plugin initialization */
  PLUGIN_INIT = 'plugin_init',
  /** Context enhancement */
  CONTEXT_ENHANCE = 'context_enhance',
  /** Render preparation */
  RENDER_PREPARE = 'render_prepare',
  /** Render completion */
  RENDER_COMPLETE = 'render_complete',
  /** Error handling */
  ERROR = 'error',
}

/**
 * Log level type
 */
export type LogLevel = 'info' | 'warn' | 'error' | 'debug';

/**
 * Component name type constraint
 */
export type ComponentName = string;

/**
 * Log data type - Use conditional types to distinguish log data from different phases
 */
export type LogData =
  | Record<string, unknown>
  | Array<Record<string, unknown>>
  | string
  | number
  | boolean
  | null
  | undefined;

/**
 * Log entry interface - Uses advanced TS types
 */
export interface LogEntry {
  readonly timestamp: number;
  readonly traceId: string;
  readonly phase: LogPhase;
  readonly level: LogLevel;
  readonly component: ComponentName;
  readonly message: string;
  readonly data?: LogData;
}

/**
 * CustomTable full-link log collector
 */
export class CustomTableLogCollector {
  private static instance: CustomTableLogCollector;

  /**
   * Get singleton instance
   */
  static getInstance(): CustomTableLogCollector {
    if (!CustomTableLogCollector.instance) {
      CustomTableLogCollector.instance = new CustomTableLogCollector();
    }
    return CustomTableLogCollector.instance;
  }

  private traceId: string;
  private startTime: number;
  private logs: LogEntry[] = [];

  private constructor() {
    this.traceId = this.generateTraceId();
    this.startTime = Date.now();
  }

  /**
   * Generate trace ID
   */
  private generateTraceId(): string {
    return `ct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Type guard: Check if data is valid log data
   */
  private isValidLogData(data: unknown): data is Record<string, unknown> {
    return typeof data === 'object' && data !== null && !Array.isArray(data);
  }

  /**
   * Type guard: Check if value is an error object
   */
  private isErrorLike(
    error: unknown,
  ): error is Error & Record<string, unknown> {
    return (
      error instanceof Error ||
      (typeof error === 'object' && error !== null && 'message' in error)
    );
  }

  /**
   * Internal log recording method - Uses advanced TS generics
   */
  private recordLog<T extends LogData>({
    phase,
    level,
    component,
    message,
    data,
  }: {
    phase: LogPhase;
    level: LogLevel;
    component: ComponentName;
    message: string;
    data?: T;
  }): void {
    const entry: LogEntry = {
      timestamp: Date.now(),
      traceId: this.traceId,
      phase,
      level,
      component,
      message,
      data,
    };

    // Save to internal log array
    this.logs.push(entry);

    // Limit log count
    if (this.logs.length > 500) {
      this.logs = this.logs.slice(-500);
    }

    // Use logger output
    const loggerData: Record<string, unknown> = {
      traceId: this.traceId,
      phase,
    };

    if (this.isValidLogData(data)) {
      Object.assign(loggerData, data);
    } else if (data !== undefined) {
      loggerData.data = data;
    }

    // ✅ Correct: Use logger's signature (object destructuring)
    switch (level) {
      case 'error':
        logger.error({
          message,
          data: loggerData,
          source: 'CustomTable',
          component,
        });
        devLog.error({ component, message, data });
        break;
      case 'warn':
        logger.warn({
          message,
          data: loggerData,
          source: 'CustomTable',
          component,
        });
        devLog.warn({ component, message, data });
        break;
      case 'debug':
        logger.debug({
          message,
          data: loggerData,
          source: 'CustomTable',
          component,
        });
        devLog.log({ component, message, data });
        break;
      default:
        logger.info({
          message,
          data: loggerData,
          source: 'CustomTable',
          component,
        });
        devLog.info({ component, message, data });
    }
  }

  /**
   * Record component initialization
   */
  logComponentInit(componentName: string, props: Record<string, unknown>) {
    this.recordLog({
      phase: LogPhase.COMPONENT_INIT,
      level: 'info',
      component: componentName,
      message: `[${componentName}] Component initialized`,
      data: {
        props: Object.keys(props),
        timestamp: Date.now(),
      },
    });
  }

  /**
   * Record state initialization
   */
  logStateInit(data: Record<string, unknown>) {
    this.recordLog({
      phase: LogPhase.STATE_INIT,
      level: 'debug',
      component: 'useTableState',
      message: 'State initialization completed',
      data,
    });
  }

  /**
   * Record column configuration
   */
  logColumnsConfig(data: Record<string, unknown>) {
    this.recordLog({
      phase: LogPhase.COLUMNS_CONFIG,
      level: 'debug',
      component: 'handleColumns',
      message: 'Column configuration processed',
      data,
    });
  }

  /**
   * Record data source request
   */
  logDataSourceRequest(params: Record<string, unknown>, requestId?: string) {
    this.recordLog({
      phase: LogPhase.DATA_SOURCE_REQUEST,
      level: 'info',
      component: 'useDataSource',
      message: 'Data source request started',
      data: {
        requestId: requestId || this.generateTraceId(),
        params,
      },
    });
  }

  /**
   * Record data source response
   */
  logDataSourceResponse(
    data: Record<string, unknown>,
    requestId?: string,
  ): void {
    const responseData: Record<string, unknown> = {
      requestId: requestId || this.generateTraceId(),
    };

    if (this.isValidLogData(data)) {
      responseData.dataLength = Array.isArray(data.data)
        ? data.data.length
        : undefined;
      responseData.total = data.total;
      Object.assign(responseData, data);
    } else {
      Object.assign(responseData, data);
    }

    this.recordLog({
      phase: LogPhase.DATA_SOURCE_RESPONSE,
      level: 'info',
      component: 'useDataSource',
      message: 'Data source response received',
      data: responseData,
    });
  }

  /**
   * Record plugin registration
   */
  logPluginRegister({
    pluginName,
    pluginType,
  }: { pluginName: string; pluginType: string }) {
    this.recordLog({
      phase: LogPhase.PLUGIN_REGISTER,
      level: 'info',
      component: 'usePluginManager',
      message: `Plugin registered: ${pluginName}`,
      data: {
        pluginName,
        pluginType,
      },
    });
  }

  /**
   * Record plugin initialization
   */
  logPluginInit({
    pluginName,
    duration,
  }: { pluginName: string; duration?: number }) {
    this.recordLog({
      phase: LogPhase.PLUGIN_INIT,
      level: 'info',
      component: 'usePluginManager',
      message: `Plugin initialization completed: ${pluginName}`,
      data: {
        pluginName,
        duration,
      },
    });
  }

  /**
   * Record context enhancement
   */
  logContextEnhance({ data }: { data: Record<string, unknown> }) {
    this.recordLog({
      phase: LogPhase.CONTEXT_ENHANCE,
      level: 'debug',
      component: 'useEnhancedTableContext',
      message: 'Context enhancement completed',
      data,
    });
  }

  /**
   * Record render phase
   */
  logRenderPhase({
    phase,
    data,
  }: { phase: string; data: Record<string, unknown> }) {
    this.recordLog({
      phase: LogPhase.RENDER_PREPARE,
      level: 'debug',
      component: 'CustomTable',
      message: `Render phase: ${phase}`,
      data,
    });
  }

  /**
   * Record render completion
   */
  logRenderComplete({ data }: { data: Record<string, unknown> }) {
    this.recordLog({
      phase: LogPhase.RENDER_COMPLETE,
      level: 'info',
      component: 'CustomTable',
      message: 'Component render completed',
      data: {
        ...data,
        totalDuration: Date.now() - this.startTime,
      },
    });
  }

  /**
   * Record error
   */
  /**
   * Record error - Use type guards to ensure type safety
   */
  logError({
    stage,
    error,
    context,
  }: { stage: string; error: unknown; context?: unknown }): void {
    // Use type guard to validate error object
    if (!this.isErrorLike(error)) {
      console.error('logError called with non-Error object:', error);
      return;
    }

    // Build type-safe error data
    const errorData: Record<string, unknown> = {
      error: error.message,
      stack: error.stack,
      ...(this.isValidLogData(context) ? { context } : {}),
      ...(error && typeof error === 'object' ? error : {}),
    };

    this.recordLog({
      phase: LogPhase.ERROR,
      level: 'error',
      component: 'CustomTable',
      message: `Error: ${stage}`,
      data: errorData,
    });
  }

  /**
   * Record query change
   */
  logQueryChange(
    oldQuery: Record<string, unknown>,
    newQuery: Record<string, unknown>,
  ) {
    this.recordLog({
      phase: LogPhase.QUERY_SYNC,
      level: 'debug',
      component: 'useTableState',
      message: 'Query changed',
      data: {
        oldQuery,
        newQuery,
      },
    });
  }

  /**
   * Record sorter change
   */
  logSorterChange(
    oldSorter: Record<string, unknown>,
    newSorter: Record<string, unknown>,
  ) {
    this.recordLog({
      phase: LogPhase.QUERY_SYNC,
      level: 'debug',
      component: 'useTableState',
      message: 'Sorter changed',
      data: {
        oldSorter,
        newSorter,
      },
    });
  }

  /**
   * Get trace ID
   */
  getTraceId(): string {
    return this.traceId;
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
    this.traceId = this.generateTraceId();
    this.startTime = Date.now();
  }

  /**
   * Generate complete log report
   */
  generateReport(): Record<string, unknown> {
    const duration = Date.now() - this.startTime;
    const errors = this.logs.filter((log) => log.level === 'error');
    const warnings = this.logs.filter((log) => log.level === 'warn');

    return {
      traceId: this.traceId,
      duration,
      reportTime: new Date().toISOString(),
      totalLogs: this.logs.length,
      errorCount: errors.length,
      warningCount: warnings.length,
      logs: this.logs,
      summary: {
        phases: Object.values(LogPhase).map((phase) => ({
          phase,
          count: this.logs.filter((log) => log.phase === phase).length,
        })),
      },
    };
  }

  /**
   * Export logs
   */
  exportLogs(): void {
    const report = this.generateReport();
    const filename = `custom-table-logs-${this.traceId}.json`;
    const blob = new Blob([JSON.stringify(report, null, 2)], {
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
  }
}

/**
 * Export singleton instance
 */
export const logCollector = CustomTableLogCollector.getInstance();

// Expose to global in development environment
if (process.env.NODE_ENV === 'development') {
  (window as unknown as Record<string, unknown>).customTableLogCollector =
    logCollector;
}
