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

import { logger } from '@veaiops/utils';
import type {
  LogDirectActionParams,
  LogElementWaitParams,
  LogErrorParams,
  LogFeatureTypeJudgmentParams,
  LogHighlightGuideParams,
  LogNavigationJumpParams,
  LogParams,
  LogPerformanceParams,
  LogUserInteractionParams,
} from './types';

class GuideLogger {
  private static instance: GuideLogger;

  static getInstance(): GuideLogger {
    if (!GuideLogger.instance) {
      GuideLogger.instance = new GuideLogger();
    }
    return GuideLogger.instance;
  }

  private logs: Array<{
    timestamp: number;
    level: 'info' | 'warn' | 'error';
    category: string;
    action: string;
    data: any;
    sessionId: string;
  }> = [];
  private sessionId: string;

  private constructor() {
    this.sessionId = `guide_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  private log({ level, category, action, data = {} }: LogParams): void {
    const logEntry = {
      timestamp: Date.now(),
      level,
      category,
      action,
      data: {
        ...data,
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
      sessionId: this.sessionId,
    };

    this.logs.push(logEntry);

    const message = `[GlobalGuide-Logger] ${category} - ${action}`;
    logger[level]({
      message,
      data: logEntry.data,
      source: 'GlobalGuide',
      component: 'GuideLogger',
    });

    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  logFeatureTypeJudgment({
    featureId,
    actionType,
    selector,
    tooltipContent,
  }: LogFeatureTypeJudgmentParams) {
    this.log({
      level: 'info',
      category: 'FeatureTypeJudgment',
      action: 'Judge feature type',
      data: {
        featureId,
        actionType,
        selector,
        tooltipContent,
        judgment: actionType === 'direct' ? 'Direct trigger' : 'Navigation guide',
      },
    });
  }

  logDirectAction({
    featureId,
    selector,
    success,
    error,
  }: LogDirectActionParams) {
    this.log({
      level: success ? 'info' : 'error',
      category: 'DirectAction',
      action: 'Trigger feature directly',
      data: {
        featureId,
        selector,
        success,
        error,
        actionType: 'direct',
      },
    });
  }

  logNavigationJump({
    featureId,
    fromRoute,
    toRoute,
    success,
    error,
  }: LogNavigationJumpParams) {
    this.log({
      level: success ? 'info' : 'error',
      category: 'NavigationJump',
      action: 'Navigate',
      data: {
        featureId,
        fromRoute,
        toRoute,
        success,
        error,
        actionType: 'navigation',
      },
    });
  }

  logElementWait({
    featureId,
    selector,
    success,
    waitTime,
    error,
  }: LogElementWaitParams) {
    this.log({
      level: success ? 'info' : 'warn',
      category: 'ElementWait',
      action: 'Wait for element to load',
      data: {
        featureId,
        selector,
        success,
        waitTime,
        error,
        actionType: 'navigation',
      },
    });
  }

  logHighlightGuide({
    featureId,
    selector,
    success,
    scrollTime,
    error,
  }: LogHighlightGuideParams) {
    this.log({
      level: success ? 'info' : 'error',
      category: 'HighlightGuide',
      action: 'Show highlight guide',
      data: {
        featureId,
        selector,
        success,
        scrollTime,
        error,
        actionType: 'navigation',
      },
    });
  }

  logUserInteraction({
    featureId,
    actionType,
    userAction,
    success,
    data,
  }: LogUserInteractionParams) {
    this.log({
      level: success ? 'info' : 'warn',
      category: 'UserInteraction',
      action: 'User interaction',
      data: {
        featureId,
        actionType,
        userAction,
        success,
        ...data,
      },
    });
  }

  logPerformance({
    featureId,
    actionType,
    metrics,
  }: LogPerformanceParams) {
    this.log({
      level: 'info',
      category: 'Performance',
      action: 'Performance metrics',
      data: {
        featureId,
        actionType,
        metrics,
      },
    });
  }

  logError({
    category,
    action,
    error,
    context,
  }: LogErrorParams) {
    this.log({
      level: 'error',
      category,
      action,
      data: {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        context,
      },
    });
  }

  getAllLogs() {
    return [...this.logs];
  }

  getLogsInRange({
    startTime,
    endTime,
  }: {
    startTime: number;
    endTime: number;
  }) {
    return this.logs.filter(
      (log) => log.timestamp >= startTime && log.timestamp <= endTime,
    );
  }

  getLogsByCategory({ category }: { category: string }) {
    return this.logs.filter((log) => log.category === category);
  }

  getLogsByFeature({ featureId }: { featureId: string }) {
    return this.logs.filter((log) => log.data.featureId === featureId);
  }

  getSessionId() {
    return this.sessionId;
  }

  clearLogs() {
    this.logs = [];
  }

  getLogStats() {
    const stats = {
      total: this.logs.length,
      byLevel: { info: 0, warn: 0, error: 0 },
      byCategory: {} as Record<string, number>,
      byActionType: { direct: 0, navigation: 0 },
      byFeature: {} as Record<string, number>,
    };

    this.logs.forEach((log) => {
      stats.byLevel[log.level]++;
      stats.byCategory[log.category] =
        (stats.byCategory[log.category] || 0) + 1;

      if (
        log.data.actionType &&
        (log.data.actionType === 'direct' ||
          log.data.actionType === 'navigation')
      ) {
        stats.byActionType[log.data.actionType as 'direct' | 'navigation']++;
      }

      if (log.data.featureId) {
        stats.byFeature[log.data.featureId] =
          (stats.byFeature[log.data.featureId] || 0) + 1;
      }
    });

    return stats;
  }

  exportAsJSON() {
    const exportData = {
      sessionId: this.sessionId,
      exportTime: new Date().toISOString(),
      stats: this.getLogStats(),
      logs: this.logs,
      summary: {
        totalLogs: this.logs.length,
        sessionDuration:
          this.logs.length > 0
            ? this.logs[this.logs.length - 1].timestamp - this.logs[0].timestamp
            : 0,
        featuresUsed: Object.keys(this.getLogStats().byFeature),
        actionTypesUsed: Object.keys(this.getLogStats().byActionType),
      },
    };

    return JSON.stringify(exportData, null, 2);
  }

  exportAsText() {
    const stats = this.getLogStats();
    const header = [
      'Global Guide Feature Log Export',
      `Session ID: ${this.sessionId}`,
      `Export Time: ${new Date().toISOString()}`,
      `Total Logs: ${stats.total}`,
      `Action Type Stats: Direct (${stats.byActionType.direct}) | Navigation (${stats.byActionType.navigation})`,
      `Features Used: ${Object.keys(stats.byFeature).join(', ')}`,
      '='.repeat(80),
      '',
    ].join('\n');

    const logLines = this.logs.map((log) => {
      const timestamp = new Date(log.timestamp).toISOString();
      const prefix = `[${timestamp}][${log.level.toUpperCase()}][${
        log.category
      }]`;
      const dataStr = log.data
        ? ` | Data: ${JSON.stringify(log.data, null, 2)}`
        : '';
      return `${prefix} ${log.action}${dataStr}`;
    });

    return header + logLines.join('\n\n');
  }
}

export { GuideLogger };
