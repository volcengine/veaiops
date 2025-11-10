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

import type { LogEntry, SelectBlockLogger } from '@veaiops/components';
import type { LogEntry as UtilsLogEntry } from '@veaiops/utils';
import type { EnhancedLoggerCollector } from '@veaiops/utils';

interface StateConsistencyDetails {
  elementsChecked: number;
  inconsistencies: Array<{
    elementIndex: number;
    issue: string;
    expected: string;
    actual: string | null | undefined;
  }>;
  timestamp: number;
}

interface StateConsistencyError {
  error: string;
}

type StateConsistencyResult = {
  consistent: boolean;
  details: StateConsistencyDetails | StateConsistencyError;
};

interface LoopDetectionResult {
  moduleStats: Record<string, number>;
  methodStats: Record<string, number>;
  messageStats: Record<string, number>;
  highFrequencyMessages: Array<[string, number]>;
  totalRecentLogs: number;
}

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
    VeAIOpsUtils: UtilsLogEntry[];
  };
}

interface FilterLogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'debug';
  component: string;
  message: string;
  data?: unknown;
}

declare global {
  interface Window {
    SelectBlockLogger?: SelectBlockLogger;
    StateSync?: {
      forceLoadingSync: (loading: boolean) => void;
      verifyAndFixInconsistencies: () => void;
      checkStateConsistency: () => StateConsistencyResult;
    };
    getSelectBlockLogs?: () => LogEntry[];
    getSelectBlockLogsByTrace?: (traceId: string) => LogEntry[];
    exportSelectBlockLogs?: (format?: 'json' | 'csv') => void;
    clearSelectBlockLogs?: () => void;
    getSelectBlockStats?: () => Record<string, number>;
    forceResetLoadingState?: () => void;
    checkLoadingConsistency?: () => StateConsistencyResult;
    exportAllComponentLogs?: () => ExportAllComponentLogsResult;
    detectSelectBlockLoop?: () => LoopDetectionResult;
    getCustomTableLogs?: () => LogEntry[];
    getFiltersLogs?: () => FilterLogEntry[];
    __taskFilterLogs?: LogEntry[];
    getQuerySyncLogs?: () => LogEntry[];
    __tableHelpersLogs?: LogEntry[];
    getTableFilterLogs?: () => LogEntry[];
    __veaiopsUtilsLogger?: {
      getLogs?: () => UtilsLogEntry[];
    };
    __veaiopsEnhancedCollector?: EnhancedLoggerCollector;
    getSearchHandlerDebugLogs?: () => LogEntry[];
    clearSearchHandlerDebugLogs?: () => void;
    exportSearchHandlerDebugLogs?: () => void;
    startGlobalGuideLogCollection?: () => void;
    exportGlobalGuideLogs?: () => void;
    quickExportGlobalGuideLogs?: () => void;
    getGlobalGuideLogSession?: () => string;
    isGlobalGuideLogCollecting?: () => boolean;
    analyzeGlobalGuide?: (issue: string) => void;
    quickDiagnoseGuide?: () => void;
    exportAllGlobalGuideLogs?: () => void;
    globalGuideAnalyzer?: Record<string, unknown>;
    __routePerformanceAnalyzer?: Record<string, unknown>;
    __REACT_DEVTOOLS_GLOBAL_HOOK__?: {
      version?: string;
    };
    [key: string]: unknown;
  }
}
