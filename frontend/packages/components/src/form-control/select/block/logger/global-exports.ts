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

import type { SelectBlockLogger } from '../logger';
import type { LogEntry } from '../types/logger';
import {
  checkStateConsistency,
  forceLoadingSync,
  verifyAndFixInconsistencies,
} from '../utils/state-sync';

interface LoopAnalysis {
  selectBlockRenderCount: number;
  propsUpdateCount: number;
  stateUpdateCount: number;
  suspiciousPatterns: string[];
}

interface ExportAllComponentLogsMetadata {
  exportTime: string;
  totalLogCount: number;
  components: Record<string, number>;
  loopAnalysis: LoopAnalysis;
}

interface ExportAllComponentLogsResult {
  metadata: ExportAllComponentLogsMetadata;
  logs: {
    SelectBlock: LogEntry[];
    CustomTable: LogEntry[];
    Filters: LogEntry[];
    TaskFilters: LogEntry[];
    QuerySync: LogEntry[];
    TableHelpers: LogEntry[];
    TableFilterPlugin: LogEntry[];
    VeAIOpsUtils: LogEntry[];
  };
}

interface LoopDetectionResult {
  moduleStats: Record<string, number>;
  methodStats: Record<string, number>;
  messageStats: Record<string, number>;
  highFrequencyMessages: Array<[string, number]>;
  totalRecentLogs: number;
}

const createSafeJSONReplacer = () => {
  const seen = new WeakSet();

  return (key: string, value: unknown): unknown => {
    if (typeof value === 'bigint') {
      return `${value.toString()}n`;
    }

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

    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        return '[Circular]';
      }
      seen.add(value);
    }

    return value;
  };
};

const createLoopAnalysis = (logs: LogEntry[]): LoopAnalysis => {
  const loopAnalysis: LoopAnalysis = {
    selectBlockRenderCount: 0,
    propsUpdateCount: 0,
    stateUpdateCount: 0,
    suspiciousPatterns: [],
  };

  logs.forEach((log) => {
    if (
      log.message.includes('Component started rendering') ||
      log.message.includes('Hook started executing')
    ) {
      loopAnalysis.selectBlockRenderCount++;
    }
    if (log.message === 'Props updated') {
      loopAnalysis.propsUpdateCount++;
    }
    if (log.method === 'setState') {
      loopAnalysis.stateUpdateCount++;
    }
  });

  if (loopAnalysis.selectBlockRenderCount > 50) {
    loopAnalysis.suspiciousPatterns.push(
      `⚠️ SelectBlock render count too high: ${loopAnalysis.selectBlockRenderCount}`,
    );
  }
  if (loopAnalysis.propsUpdateCount > 50) {
    loopAnalysis.suspiciousPatterns.push(
      `⚠️ Props update count too high: ${loopAnalysis.propsUpdateCount}`,
    );
  }
  if (loopAnalysis.stateUpdateCount > 100) {
    loopAnalysis.suspiciousPatterns.push(
      `⚠️ State update count too high: ${loopAnalysis.stateUpdateCount}`,
    );
  }

  return loopAnalysis;
};

export const exportAllComponentLogs = (
  logger: SelectBlockLogger,
): ExportAllComponentLogsResult => {
  const selectBlockLogs = logger.getLogs();
  const customTableLogs = window.getCustomTableLogs?.() || [];
  const filtersLogs = window.getFiltersLogs?.() || [];
  const taskFilterLogs = window.__taskFilterLogs || [];
  const querySyncLogs = window.getQuerySyncLogs?.() || [];
  const tableHelpersLogs = window.__tableHelpersLogs || [];
  const tableFilterPluginLogs = window.getTableFilterLogs?.() || [];
  const utilsLoggerLogs = window.__veaiopsUtilsLogger?.getLogs?.() || [];

  const loopAnalysis = createLoopAnalysis(selectBlockLogs);

  const allLogs: ExportAllComponentLogsResult = {
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
        VeAIOpsUtils: utilsLoggerLogs.length,
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
      VeAIOpsUtils: utilsLoggerLogs,
    },
  };

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

  console.log('📊 Log export successful:', allLogs.metadata);
  if (loopAnalysis.suspiciousPatterns.length > 0) {
    console.warn(
      '🚨 Suspicious loop patterns detected:',
      loopAnalysis.suspiciousPatterns,
    );
  }
  return allLogs;
};

export const detectSelectBlockLoop = (
  logger: SelectBlockLogger,
): LoopDetectionResult => {
  const logs = logger.getLogs();
  const recentLogs = logs.slice(-100);

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

  console.group('🔍 SelectBlock Loop Detection Report (Last 100 logs)');
  console.log('📊 Module call statistics:', moduleStats);
  console.log('📊 Method call statistics:', methodStats);
  console.log('📊 Message statistics:', messageStats);

  const highFrequencyThreshold = 10;
  const highFrequencyMessages = Object.entries(messageStats)
    .filter(([_, count]) => count > highFrequencyThreshold)
    .sort((a, b) => b[1] - a[1]);

  if (highFrequencyMessages.length > 0) {
    console.warn(
      '⚠️ High-frequency messages (possible loop points):',
      highFrequencyMessages,
    );
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

export const setupGlobalExports = (logger: SelectBlockLogger): void => {
  if (typeof window === 'undefined') {
    return;
  }

  window.SelectBlockLogger = logger;
  window.StateSync = {
    forceLoadingSync,
    verifyAndFixInconsistencies,
    checkStateConsistency,
  };

  window.getSelectBlockLogs = () => logger.getLogs();
  window.getSelectBlockLogsByTrace = (traceId: string) =>
    logger.getLogsByTraceId(traceId);
  window.exportSelectBlockLogs = (format: 'json' | 'csv' = 'json') =>
    logger.downloadLogs(undefined, format);
  window.clearSelectBlockLogs = () => logger.clearLogs();
  window.getSelectBlockStats = () => logger.getStats();

  window.forceResetLoadingState = () => forceLoadingSync(false);
  window.checkLoadingConsistency = () => checkStateConsistency();

  window.exportAllComponentLogs = () => exportAllComponentLogs(logger);
  window.detectSelectBlockLoop = () => detectSelectBlockLoop(logger);
};

