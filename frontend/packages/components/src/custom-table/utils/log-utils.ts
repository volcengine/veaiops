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
 * Log utility functions
 * Provides consistent log formatting and serialization functionality, integrated with performance monitoring
 *
 * 🔥 Enhanced version: Integrated with @veaiops/utils logger and log-exporter
 */

import { logger } from '@veaiops/utils';
import React from 'react';
// import { useAutoLogExport } from '@veaiops/utils';
import { performanceLogger } from './performance-logger';

/**
 * serializeLog parameters interface
 */
export interface SerializeLogParams {
  data: unknown;
  space?: number;
}

/**
 * Serialize object to JSON string for easy copying and debugging
 * @param params Serialization parameters
 * @returns Formatted JSON string
 */
export function serializeLog({ data, space = 2 }: SerializeLogParams): string {
  try {
    return JSON.stringify(
      data,
      (key, value) => {
        // Handle circular references and special objects
        if (value instanceof Error) {
          return {
            name: value.name,
            message: value.message,
            stack: value.stack,
          };
        }

        // Handle functions
        if (typeof value === 'function') {
          return `[Function: ${value.name || 'anonymous'}]`;
        }

        // Handle undefined
        if (value === undefined) {
          return '[undefined]';
        }

        return value;
      },
      space,
    );
  } catch (error) {
    // If serialization fails, return string representation (silent handling, no log)
    return String(data);
  }
}

/**
 * CustomTable dedicated log utility (optimized version)
 *
 * ✅ Optimization: Unified use of @veaiops/utils logger
 * - Unified logger import (remove duplicate alias imports)
 * - Remove duplicate console output (logger handles internally)
 * - Remove duplicate timestamp formatting (logger handles internally)
 * - Retain performance monitoring dedicated functionality
 *
 * @example
 * ```typescript
 * devLog.error({ component: 'PluginExecutor', message: 'Plugin execution failed', data: { pluginName: 'test' } });
 * devLog.warn({ component: 'LifecycleManager', message: 'Lifecycle warning', data: { phase: 'onMount' } });
 * ```
 */
/**
 * devLog method parameters interface
 */
interface DevLogParams {
  component: string;
  message: string;
  data?: unknown;
}

interface DevLogRenderParams {
  component: string;
  data?: unknown;
}

export const devLog = {
  log: ({ component, message, data }: DevLogParams) => {
    const logData = data ? { data } : undefined;
    // ✅ Unified use of logger (logger internally handles console output and timestamp formatting)
    logger.log({
      message,
      data: logData,
      source: 'CustomTable',
      component,
    });
    // Performance monitoring (dedicated feature, retained)
    performanceLogger.log({
      level: 'debug',
      component,
      message,
      data: logData,
    });
  },

  warn: ({ component, message, data }: DevLogParams) => {
    const logData = data ? { data } : undefined;
    logger.warn({
      message,
      data: logData,
      source: 'CustomTable',
      component,
    });
    performanceLogger.log({ level: 'warn', component, message, data: logData });
  },

  error: ({ component, message, data }: DevLogParams) => {
    const logData = data ? { data } : undefined;
    logger.error({
      message,
      data: logData,
      source: 'CustomTable',
      component,
    });
    performanceLogger.log({
      level: 'error',
      component,
      message,
      data: logData,
    });
  },

  info: ({ component, message, data }: DevLogParams) => {
    const logData = data ? { data } : undefined;
    logger.info({
      message,
      data: logData,
      source: 'CustomTable',
      component,
    });
    performanceLogger.log({ level: 'info', component, message, data: logData });
  },

  // Render log dedicated method
  render: ({ component, data }: DevLogRenderParams) => {
    performanceLogger.logRender({ component });
    if (data) {
      logger.debug({
        message: 'Rendering data',
        data: { renderData: data },
        source: 'CustomTable',
        component,
      });
      performanceLogger.log({
        level: 'debug',
        component,
        message: 'Rendering data',
        data: { renderData: data },
      });
    }
  },

  // Performance log dedicated method
  performance: ({
    component,
    operation,
    duration,
    data,
  }: {
    component: string;
    operation: string;
    duration: number;
    data?: unknown;
  }) => {
    const logData = { duration, operation, data };
    logger.info({
      message: `Performance monitoring: ${operation}`,
      data: logData,
      source: 'CustomTable',
      component,
    });
    performanceLogger.log({
      level: 'info',
      component,
      message: `Performance monitoring: ${operation}`,
      data: logData,
    });
  },

  // Lifecycle log dedicated method
  lifecycle: ({
    component,
    event,
    data,
  }: {
    component: string;
    event: string;
    data?: unknown;
  }) => {
    logger.info({
      message: `Lifecycle: ${event}`,
      data: { event, data },
      source: 'CustomTable',
      component,
    });
    performanceLogger.log({
      level: 'info',
      component,
      message: `Lifecycle: ${event}`,
      data: { event, data },
    });
  },
};

// 🚀 New: CustomTable automatic log export Hook
/**
 * CustomTable automatic log export Hook (placeholder implementation)
 *
 * Note: log-exporter feature is not yet integrated, this is a placeholder implementation
 * Returns empty implementation, performs no operations, and prints no warnings
 *
 * @param options - Export options (currently unused)
 * @returns Export control object
 */
export const useCustomTableAutoLogExport = (options?: {
  autoStart?: boolean;
  exportOnUnload?: boolean;
  filename?: string;
}) => {
  // ✅ Silent handling: This is a known placeholder implementation, no warning printed
  // When log-exporter feature is integrated, can be replaced with actual implementation
  // Use useMemo to ensure return value reference is stable, avoid unnecessary re-renders
  return React.useMemo(
    () => ({
      isExporting: false,
      exportLogs: () => Promise.resolve(),
      clearLogs: () => {
        // Clear logs - this implementation is empty, specific logic handled by caller
      },
    }),
    [],
  );
};

// 🚀 New: Global log export interface for log-exporter use
if (typeof window !== 'undefined') {
  // Expose CustomTable log retrieval interface to unified log export system
  (window as any).getCustomTableLogs = () => {
    try {
      // Get performance logger logs
      const perfLogs = performanceLogger.generateReport().logs;

      // Get @veaiops/utils logger logs (filter for CustomTable related)
      const utilsLogs = logger
        .getLogs()
        .filter(
          (log) =>
            log.source === 'CustomTable' ||
            log.component?.startsWith('CustomTable'),
        );

      // Merge and deduplicate
      const allLogs = [...perfLogs, ...utilsLogs];
      const uniqueLogs = allLogs.filter(
        (log, index, self) =>
          index ===
          self.findIndex(
            (l) => l.timestamp === log.timestamp && l.message === log.message,
          ),
      );

      // Sort by time
      uniqueLogs.sort((a, b) => a.timestamp - b.timestamp);

      return uniqueLogs;
    } catch (error: unknown) {
      // ✅ Correct: Use logger to record error and pass through actual error info
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Failed to get CustomTable logs',
        data: { error: errorObj.message, stack: errorObj.stack },
        source: 'CustomTable',
        component: 'getCustomTableLogs',
      });
      return [];
    }
  };
}
