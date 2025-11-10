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

import { exportLogsToFile, getLogCount, logger } from '@veaiops/utils';
import { useCallback, useState } from 'react';
import { GuideLogger } from './lib/guide-logger';

/**
 * Global guide log collection Hook
 */
export const useGuideLogger = () => {
  const [guideLogger] = useState(() => GuideLogger.getInstance());
  const [isCollecting, setIsCollecting] = useState(true);

  // Start log collection
  const startCollection = useCallback(() => {
    setIsCollecting(true);
    logger.info({
      message: '[GlobalGuide] Start collecting global guide logs',
      data: { sessionId: guideLogger.getSessionId() },
      source: 'GlobalGuide',
      component: 'useGuideLogger',
    });
  }, [guideLogger]);

  // Stop log collection
  const stopCollection = useCallback(() => {
    setIsCollecting(false);
    logger.info({
      message: '[GlobalGuide] Stop collecting global guide logs',
      data: {
        sessionId: guideLogger.getSessionId(),
        totalLogs: guideLogger.getAllLogs().length,
      },
      source: 'GlobalGuide',
      component: 'useGuideLogger',
    });
  }, [guideLogger]);

  // Export global guide logs
  const exportGuideLogs = useCallback(
    (format: 'json' | 'text' = 'text') => {
      const logs = guideLogger.getAllLogs();
      if (logs.length === 0) {
        logger.warn({
          message: '[GlobalGuide] No global guide logs to export',
          data: {},
          source: 'GlobalGuide',
          component: 'useGuideLogger',
        });
        return;
      }

      const content =
        format === 'json'
          ? guideLogger.exportAsJSON()
          : guideLogger.exportAsText();

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-');
      link.download = `global-guide-logs-${timestamp}.${
        format === 'json' ? 'json' : 'txt'
      }`;
      link.href = url;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.info({
        message: '[GlobalGuide] Global guide logs exported',
        data: {
          format,
          logCount: logs.length,
          sessionId: guideLogger.getSessionId(),
        },
        source: 'GlobalGuide',
        component: 'useGuideLogger',
      });
    },
    [guideLogger],
  );

  // Export all logs (including global guide logs)
  const exportAllLogs = useCallback(() => {
    const allLogCount = getLogCount();
    const guideLogCount = guideLogger.getAllLogs().length;

    logger.info({
      message: '[GlobalGuide] Export all logs',
      data: {
        allLogCount,
        guideLogCount,
        sessionId: guideLogger.getSessionId(),
      },
      source: 'GlobalGuide',
      component: 'useGuideLogger',
    });

    // Export all logs
    exportLogsToFile();

    // Also export global guide specific logs
    if (guideLogCount > 0) {
      setTimeout(() => {
        exportGuideLogs('text');
      }, 500);
    }
  }, [guideLogger, exportGuideLogs]);

  // Clear logs
  const clearLogs = useCallback(() => {
    guideLogger.clearLogs();
    logger.info({
      message: '[GlobalGuide] Global guide logs cleared',
      data: { sessionId: guideLogger.getSessionId() },
      source: 'GlobalGuide',
      component: 'useGuideLogger',
    });
  }, [guideLogger]);

  // Get log statistics
  const getStats = useCallback(() => {
    return guideLogger.getLogStats();
  }, [guideLogger]);

  // Get logs within specified time range
  const getLogsInRange = useCallback(
    ({ startTime, endTime }: { startTime: number; endTime: number }) => {
      return guideLogger.getLogsInRange({ startTime, endTime });
    },
    [guideLogger],
  );

  // Get logs by feature
  const getLogsByFeature = useCallback(
    ({ featureId }: { featureId: string }) => {
      return guideLogger.getLogsByFeature({ featureId });
    },
    [guideLogger],
  );

  return {
    // Logging methods
    logFeatureTypeJudgment:
      guideLogger.logFeatureTypeJudgment.bind(guideLogger),
    logDirectAction: guideLogger.logDirectAction.bind(guideLogger),
    logNavigationJump: guideLogger.logNavigationJump.bind(guideLogger),
    logElementWait: guideLogger.logElementWait.bind(guideLogger),
    logHighlightGuide: guideLogger.logHighlightGuide.bind(guideLogger),
    logUserInteraction: guideLogger.logUserInteraction.bind(guideLogger),
    logPerformance: guideLogger.logPerformance.bind(guideLogger),
    logError: guideLogger.logError.bind(guideLogger),

    // Log management methods
    startCollection,
    stopCollection,
    exportGuideLogs,
    exportAllLogs,
    clearLogs,
    getStats,
    getLogsInRange,
    getLogsByFeature,

    // State
    isCollecting,
    sessionId: guideLogger.getSessionId(),
    logCount: guideLogger.getAllLogs().length,
  };
};

export const guideLogger = GuideLogger.getInstance();

export default useGuideLogger;
