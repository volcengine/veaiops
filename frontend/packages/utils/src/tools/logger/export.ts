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
 * Unified log export utility
 *
 * ✅ Features: Unified export of all logs (including in-memory logs from dedicated log tools)
 * - Collect logs from unified logger
 * - Collect in-memory logs from dedicated log tools (via window interface)
 * - Support JSON and text format export
 */

import { logger } from './core';
import type { LogEntry } from './core';

/**
 * Get log count (from unified logger)
 */
export function getLogCount(): number {
  return logger.getLogCount();
}

/**
 * Clear collected logs (from unified logger)
 */
export function clearCollectedLogs(): void {
  logger.clearLogs();
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
 * Export all logs to file
 * @param formatOrFilename - Export format: 'json' | 'text', or directly pass custom filename (backward compatible)
 */
export function exportLogsToFile(
  formatOrFilename: 'json' | 'text' | string = 'json',
): void {
  const allLogs = collectAllLogs();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  let content: string;
  let filename: string;
  let mimeType: string;

  // If filename is passed (contains .json or .txt/.log extension), determine format based on extension
  if (formatOrFilename.includes('.json')) {
    filename = formatOrFilename;
    content = JSON.stringify(allLogs, null, 2);
    mimeType = 'application/json';
  } else if (
    formatOrFilename.includes('.txt') ||
    formatOrFilename.includes('.log')
  ) {
    filename = formatOrFilename;
    content = formatLogsAsText(allLogs);
    mimeType = 'text/plain;charset=utf-8';
  } else if (formatOrFilename === 'json') {
    content = JSON.stringify(allLogs, null, 2);
    filename = `veaiops-logs-${timestamp}.json`;
    mimeType = 'application/json';
  } else {
    // Default text format
    content = formatLogsAsText(allLogs);
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

/**
 * Collect all logs
 * - Unified logger logs (main source)
 * - In-memory logs from dedicated log tools (via window interface)
 */
export function collectAllLogs(): {
  unifiedLogs: LogEntry[];
  componentLogs: {
    customTable?: any[];
    filters?: any[];
    querySync?: any[];
    tableFilter?: any[];
    performance?: any[];
    resetLog?: any[];
    guide?: any[];
    selectBlock?: any[];
  };
  metadata: {
    exportTime: string;
    sessionId: string;
    totalUnifiedLogs: number;
    totalComponentLogs: number;
  };
} {
  // 1. Collect unified logger logs (main source)
  const unifiedLogs = logger.getLogs();

  // 2. Collect in-memory logs from dedicated log tools (if any)
  const componentLogs: any = {};

  if (typeof window !== 'undefined') {
    // CustomTable logs (including performance logs)
    try {
      const { getCustomTableLogs } = window as any;
      if (typeof getCustomTableLogs === 'function') {
        componentLogs.customTable = getCustomTableLogs();
      }
    } catch (error: unknown) {
      // ✅ Silently handle log collection errors (avoid blocking export functionality), but log warning
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[LogExporter] Failed to collect CustomTable logs',
          errorObj.message,
        );
      }
    }

    // Filters logs
    try {
      const { getFiltersLogs } = window as any;
      if (typeof getFiltersLogs === 'function') {
        componentLogs.filters = getFiltersLogs();
      }
    } catch (error: unknown) {
      // ✅ Silently handle log collection errors (avoid blocking export functionality), but log warning
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[LogExporter] Failed to collect Filters logs',
          errorObj.message,
        );
      }
    }

    // QuerySync logs
    try {
      const { getQuerySyncLogs } = window as any;
      if (typeof getQuerySyncLogs === 'function') {
        componentLogs.querySync = getQuerySyncLogs();
      }
    } catch (error: unknown) {
      // ✅ Silently handle log collection errors (avoid blocking export functionality), but log warning
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[LogExporter] Failed to collect QuerySync logs',
          errorObj.message,
        );
      }
    }

    // TableFilter logs
    try {
      const { getTableFilterLogs } = window as any;
      if (typeof getTableFilterLogs === 'function') {
        componentLogs.tableFilter = getTableFilterLogs();
      }
    } catch (error: unknown) {
      // ✅ Silently handle log collection errors (avoid blocking export functionality), but log warning
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[LogExporter] Failed to collect TableFilter logs',
          errorObj.message,
        );
      }
    }

    // Guide logs (via guideLogger)
    try {
      const guideLogger = (window as any).__guideLogger;
      if (guideLogger && typeof guideLogger.getAllLogs === 'function') {
        componentLogs.guide = guideLogger.getAllLogs();
      }
    } catch (error: unknown) {
      // ✅ Silently handle log collection errors (avoid blocking export functionality), but log warning
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[LogExporter] Failed to collect Guide logs',
          errorObj.message,
        );
      }
    }

    // SelectBlock logs
    try {
      const selectBlockLogger = (window as any).__selectBlockLogger;
      if (
        selectBlockLogger &&
        typeof selectBlockLogger.getLogs === 'function'
      ) {
        componentLogs.selectBlock = selectBlockLogger.getLogs();
      }
    } catch (error: unknown) {
      // ✅ Silently handle log collection errors (avoid blocking export functionality), but log warning
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      if (process.env.NODE_ENV === 'development') {
        console.warn(
          '[LogExporter] Failed to collect SelectBlock logs',
          errorObj.message,
        );
      }
    }
  }

  // Calculate total log count
  const totalComponentLogs = Object.values(componentLogs).reduce(
    (sum: number, logs: unknown) =>
      sum + (Array.isArray(logs) ? logs.length : 0),
    0,
  );

  return {
    unifiedLogs,
    componentLogs,
    metadata: {
      exportTime: new Date().toISOString(),
      sessionId: logger.getSessionId(),
      totalUnifiedLogs: unifiedLogs.length,
      totalComponentLogs,
    },
  };
}

/**
 * Format logs as text format
 */
function formatLogsAsText(allLogs: ReturnType<typeof collectAllLogs>): string {
  const { unifiedLogs, componentLogs, metadata } = allLogs;

  const header = [
    'VeAIOps Unified Log Export',
    `Export Time: ${metadata.exportTime}`,
    `Session ID: ${metadata.sessionId}`,
    `Unified Logs: ${metadata.totalUnifiedLogs}`,
    `Component Logs: ${metadata.totalComponentLogs}`,
    '='.repeat(80),
    '',
  ].join('\n');

  // Format unified logs
  const unifiedSection = [
    '## Unified Logger Logs',
    '='.repeat(80),
    ...unifiedLogs.map((log) => {
      const timestamp = new Date(log.timestamp).toISOString();
      const prefix = `[${timestamp}][${log.level.toUpperCase()}][${log.source}${
        log.component ? `/${log.component}` : ''
      }]`;
      const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
      return `${prefix} ${log.message}${dataStr}`;
    }),
    '',
  ].join('\n');

  // Format component logs
  const componentSections: string[] = [];

  Object.entries(componentLogs).forEach(([name, logs]) => {
    if (Array.isArray(logs) && logs.length > 0) {
      componentSections.push(
        `## ${name} Component Logs`,
        '='.repeat(80),
        ...logs.map((log: any) => {
          const timestamp = log.timestamp
            ? new Date(log.timestamp).toISOString()
            : new Date().toISOString();
          const level = log.level || 'info';
          const message = log.message || log.action || '';
          const data = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
          return `[${timestamp}][${level.toUpperCase()}] ${message}${data}`;
        }),
        '',
      );
    }
  });

  return [header, unifiedSection, ...componentSections].join('\n');
}

/**
 * Export logs within specified time range
 * @param startTime Start time (timestamp)
 * @param endTime End time (timestamp), if not provided, uses current time
 * @param formatOrFilename Export format: 'json' | 'text', or directly pass custom filename (backward compatible)
 */
export function exportLogsInTimeRange(
  startTime: number,
  endTime?: number,
  formatOrFilename: 'json' | 'text' | string = 'json',
): void {
  // If endTime is not provided, use current time
  const actualEndTime = endTime ?? Date.now();

  const logs = logger.getLogsInRange({ startTime, endTime: actualEndTime });
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

  let content: string;
  let filename: string;
  let mimeType: string;

  // If filename is passed (contains .json or .txt/.log extension), determine format by extension
  if (formatOrFilename.includes('.json')) {
    filename = formatOrFilename;
    content = JSON.stringify(
      {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(actualEndTime).toISOString(),
        totalLogs: logs.length,
        logs,
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
    const logLines = logs.map((log) => {
      const timestamp = new Date(log.timestamp).toISOString();
      const prefix = `[${timestamp}][${log.level.toUpperCase()}][${log.source}${
        log.component ? `/${log.component}` : ''
      }]`;
      const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
      return `${prefix} ${log.message}${dataStr}`;
    });
    content = header + logLines.join('\n');
    mimeType = 'text/plain;charset=utf-8';
  } else if (formatOrFilename === 'json') {
    content = JSON.stringify(
      {
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(actualEndTime).toISOString(),
        totalLogs: logs.length,
        logs,
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
    const logLines = logs.map((log) => {
      const timestamp = new Date(log.timestamp).toISOString();
      const prefix = `[${timestamp}][${log.level.toUpperCase()}][${log.source}${
        log.component ? `/${log.component}` : ''
      }]`;
      const dataStr = log.data ? ` | Data: ${JSON.stringify(log.data)}` : '';
      return `${prefix} ${log.message}${dataStr}`;
    });
    content = header + logLines.join('\n');
    filename = `veaiops-logs-${timestamp}.txt`;
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
