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
import type { FeatureActionType } from '../../lib';
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
} from './logger-types';

/**
 * Log entry type
 */
interface LogEntry {
  timestamp: number;
  level: 'info' | 'warn' | 'error';
  category: string;
  action: string;
  data: unknown;
  sessionId: string;
}

/**
 * Global guide log recorder class
 */
export class GuideLogger {
  private static instance: GuideLogger;

  static getInstance(): GuideLogger {
    if (!GuideLogger.instance) {
      GuideLogger.instance = new GuideLogger();
    }
    return GuideLogger.instance;
  }

  private logs: LogEntry[] = [];
  private sessionId: string;

  private constructor() {
    this.sessionId = `guide_${Date.now()}_${Math.random()
      .toString(36)
      .substr(2, 9)}`;
  }

  /**
   * Log entry
   */
  private log({ level, category, action, data = {} }: LogParams): void {
    const logEntry: LogEntry = {
      timestamp: Date.now(),
      level,
      category,
      action,
      data: {
        ...(data as Record<string, unknown>),
        sessionId: this.sessionId,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
      sessionId: this.sessionId,
    };

    this.logs.push(logEntry);

    // Also output to console
    const message = `[GlobalGuide-Logger] ${category} - ${action}`;
    logger[level]({
      message,
      data: logEntry.data,
      source: 'GlobalGuide',
      component: 'GuideLogger',
    });

    // Limit log count
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }
  }

  /**
   * Log feature type judgment
   */
  logFeatureTypeJudgment({
    featureId,
    actionType,
    selector,
    tooltipContent,
  }: LogFeatureTypeJudgmentParams): void {
    this.log({
      level: 'info',
      category: 'FeatureTypeJudgment',
      action: '判断功能类型',
      data: {
        featureId,
        actionType,
        selector,
        tooltipContent,
        judgment: actionType === 'direct' ? '直接触发型' : '导航引导型',
      },
    });
  }

  /**
   * Log direct action
   */
  logDirectAction({
    featureId,
    selector,
    success,
    error,
  }: LogDirectActionParams): void {
    this.log({
      level: success ? 'info' : 'error',
      category: 'DirectAction',
      action: '直接触发功能',
      data: {
        featureId,
        selector,
        success,
        error,
        actionType: 'direct',
      },
    });
  }

  /**
   * Log navigation jump
   */
  logNavigationJump({
    featureId,
    fromRoute,
    toRoute,
    success,
    error,
  }: LogNavigationJumpParams): void {
    this.log({
      level: success ? 'info' : 'error',
      category: 'NavigationJump',
      action: '导航跳转',
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

  /**
   * Log element wait
   */
  logElementWait({
    featureId,
    selector,
    success,
    waitTime,
    error,
  }: LogElementWaitParams): void {
    this.log({
      level: success ? 'info' : 'warn',
      category: 'ElementWait',
      action: '等待元素加载',
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

  /**
   * Log highlight guide
   */
  logHighlightGuide({
    featureId,
    selector,
    success,
    scrollTime,
    error,
  }: LogHighlightGuideParams): void {
    this.log({
      level: success ? 'info' : 'error',
      category: 'HighlightGuide',
      action: '高亮引导显示',
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

  /**
   * Log user interaction
   */
  logUserInteraction({
    featureId,
    actionType,
    userAction,
    success,
    data,
  }: LogUserInteractionParams): void {
    this.log({
      level: success ? 'info' : 'warn',
      category: 'UserInteraction',
      action: '用户交互',
      data: {
        featureId,
        actionType,
        userAction,
        success,
        ...(data as Record<string, unknown>),
      },
    });
  }

  /**
   * Log performance metrics
   */
  logPerformance({
    featureId,
    actionType,
    metrics,
  }: LogPerformanceParams): void {
    this.log({
      level: 'info',
      category: 'Performance',
      action: '性能指标',
      data: {
        featureId,
        actionType,
        metrics,
      },
    });
  }

  /**
   * Log error
   */
  logError({ category, action, error, context }: LogErrorParams): void {
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

  /**
   * Get all logs
   */
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs within specified time range
   */
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

  /**
   * Filter logs by category
   */
  getLogsByCategory({ category }: { category: string }): LogEntry[] {
    return this.logs.filter((log) => log.category === category);
  }

  /**
   * Filter logs by feature ID
   */
  getLogsByFeature({ featureId }: { featureId: string }): LogEntry[] {
    return this.logs.filter(
      (log) =>
        (log.data as Record<string, unknown>)?.featureId === featureId,
    );
  }

  /**
   * Get session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Clear logs
   */
  clearLogs(): void {
    this.logs = [];
  }

  /**
   * Get log statistics
   */
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

      const data = log.data as Record<string, unknown>;
      if (
        data.actionType &&
        (data.actionType === 'direct' || data.actionType === 'navigation')
      ) {
        // ✅ Fix: TypeScript has inferred type through conditional check, no need for additional assertion
        // Use type guard to ensure type safety
        if (data.actionType === 'direct') {
          stats.byActionType.direct++;
        } else if (data.actionType === 'navigation') {
          stats.byActionType.navigation++;
        }
      }

      if (data.featureId) {
        stats.byFeature[data.featureId as string] =
          (stats.byFeature[data.featureId as string] || 0) + 1;
      }
    });

    return stats;
  }

  /**
   * Export logs as JSON
   */
  exportAsJSON(): string {
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

  /**
   * Export logs as text
   */
  exportAsText(): string {
    const stats = this.getLogStats();
    const header = [
      '智能引导功能日志导出',
      `会话ID: ${this.sessionId}`,
      `导出时间: ${new Date().toISOString()}`,
      `总日志数: ${stats.total}`,
      `功能类型统计: 直接触发(${stats.byActionType.direct}) | 导航引导(${stats.byActionType.navigation})`,
      `使用功能: ${Object.keys(stats.byFeature).join(', ')}`,
      '='.repeat(80),
      '',
    ].join('\n');

    const logLines = this.logs.map((log) => {
      const timestamp = new Date(log.timestamp).toISOString();
      const prefix = `[${timestamp}][${log.level.toUpperCase()}][${
        log.category
      }]`;
      const dataStr = log.data
        ? ` | 数据: ${JSON.stringify(log.data, null, 2)}`
        : '';
      return `${prefix} ${log.action}${dataStr}`;
    });

    return header + logLines.join('\n\n');
  }
}
