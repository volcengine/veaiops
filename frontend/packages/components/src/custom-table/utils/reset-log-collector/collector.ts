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
import { performanceLogger } from '../performance-logger';

export interface ResetLogEntry {
  timestamp: number;
  component: string;
  method: string;
  action: 'start' | 'end' | 'call' | 'error';
  data?: Record<string, unknown>;
  stackTrace?: string;
  duration?: number;
}

export interface ResetLogParams {
  component: string;
  method: string;
  action: ResetLogEntry['action'];
  data?: Record<string, unknown>;
  stackTrace?: string;
}

export interface ResetLogSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  logs: ResetLogEntry[];
  summary: {
    totalSteps: number;
    totalDuration: number;
    errorCount: number;
    components: string[];
  };
}

export class ResetLogCollector {
  private sessions: Map<string, ResetLogSession> = new Map();
  private currentSessionId: string | null = null;
  private enabled = false;

  enable(): void {
    this.enabled = true;
    logger.info({
      message: '[ResetLogCollector] Reset log collection enabled',
      data: {},
      source: 'ResetLogCollector',
      component: 'enable',
    });
  }

  disable(): void {
    this.enabled = false;
    logger.info({
      message: '[ResetLogCollector] Reset log collection disabled',
      data: {},
      source: 'ResetLogCollector',
      component: 'disable',
    });
  }

  startSession(sessionId?: string): string {
    if (!this.enabled) {
      return '';
    }

    const id =
      sessionId ||
      `reset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const session: ResetLogSession = {
      sessionId: id,
      startTime: Date.now(),
      logs: [],
      summary: {
        totalSteps: 0,
        totalDuration: 0,
        errorCount: 0,
        components: [],
      },
    };

    this.sessions.set(id, session);
    this.currentSessionId = id;

    this.log({
      component: 'ResetLogCollector',
      method: 'startSession',
      action: 'start',
      data: {
        sessionId: id,
        timestamp: new Date().toISOString(),
      },
    });

    logger.info({
      message: `[ResetLogCollector] Start reset session: ${id}`,
      data: { sessionId: id },
      source: 'ResetLogCollector',
      component: 'startSession',
    });
    return id;
  }

  endSession(): void {
    if (!this.enabled || !this.currentSessionId) {
      return;
    }

    const session = this.sessions.get(this.currentSessionId);
    if (!session) {
      return;
    }

    session.endTime = Date.now();
    session.summary.totalDuration = session.endTime - session.startTime;
    session.summary.totalSteps = session.logs.length;
    session.summary.components = [
      ...new Set(session.logs.map((log) => log.component)),
    ];

    this.log({
      component: 'ResetLogCollector',
      method: 'endSession',
      action: 'end',
      data: {
        sessionId: this.currentSessionId,
        summary: session.summary,
      },
    });

    logger.info({
      message: `[ResetLogCollector] End reset session: ${this.currentSessionId}`,
      data: { sessionId: this.currentSessionId, summary: session.summary },
      source: 'ResetLogCollector',
      component: 'endSession',
    });
    this.currentSessionId = null;
  }

  log({ component, method, action, data, stackTrace }: ResetLogParams): void {
    if (!this.enabled || !this.currentSessionId) {
      return;
    }

    const session = this.sessions.get(this.currentSessionId);
    if (!session) {
      return;
    }

    const entry: ResetLogEntry = {
      timestamp: Date.now(),
      component,
      method,
      action,
      data,
      stackTrace,
    };

    if (action === 'end') {
      const startLog = session.logs
        .reverse()
        .find(
          (log) =>
            log.component === component &&
            log.method === method &&
            log.action === 'start',
        );
      if (startLog) {
        entry.duration = entry.timestamp - startLog.timestamp;
      }
    }

    session.logs.push(entry);

    if (action === 'error') {
      session.summary.errorCount++;
    }

    const prefix = `[${component}.${method}]`;
    const message = `${action.toUpperCase()}`;

    switch (action) {
      case 'start': {
        logger.debug({
          message: `${message}`,
          data,
          source: 'ResetLogCollector',
          component: `${component}.${method}`,
        });
        break;
      }
      case 'end': {
        const endMessage = `${message}${entry.duration ? ` (${entry.duration}ms)` : ''}`;
        logger.debug({
          message: endMessage,
          data,
          source: 'ResetLogCollector',
          component: `${component}.${method}`,
        });
        break;
      }
      case 'call': {
        logger.debug({
          message: `Call: ${message}`,
          data,
          source: 'ResetLogCollector',
          component: `${component}.${method}`,
        });
        break;
      }
      case 'error': {
        logger.error({
          message: `Error: ${message}`,
          data: { data, stackTrace },
          source: 'ResetLogCollector',
          component: `${component}.${method}`,
        });
        break;
      }
      default:
        break;
    }
  }

  getCurrentSession(): ResetLogSession | null {
    if (!this.currentSessionId) {
      return null;
    }
    return this.sessions.get(this.currentSessionId) || null;
  }

  getAllSessions(): ResetLogSession[] {
    return Array.from(this.sessions.values());
  }

  exportResetLogs(): void {
    const sessions = this.getAllSessions();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `custom-table-reset-logs-${timestamp}.json`;

    const exportData = {
      metadata: {
        exportTime: new Date().toISOString(),
        totalSessions: sessions.length,
        collectorVersion: '1.0.0',
      },
      sessions,
      performanceLogs:
        (performanceLogger as { getLogs?: () => unknown }).getLogs?.() || [],
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
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

    logger.info({
      message: `[ResetLogCollector] Reset logs exported: ${filename}`,
      data: { filename },
      source: 'ResetLogCollector',
      component: 'exportResetLogs',
    });
  }

  clear(): void {
    this.sessions.clear();
    this.currentSessionId = null;
    logger.info({
      message: '[ResetLogCollector] All sessions cleared',
      data: undefined,
      source: 'ResetLogCollector',
      component: 'clear',
    });
  }

  getStats(): {
    totalSessions: number;
    totalLogs: number;
    averageSessionDuration: number;
    errorRate: number;
    mostActiveComponents: Array<{ component: string; count: number }>;
  } {
    const sessions = this.getAllSessions();
    const totalLogs = sessions.reduce(
      (sum, session) => sum + session.logs.length,
      0,
    );
    const totalErrors = sessions.reduce(
      (sum, session) => sum + session.summary.errorCount,
      0,
    );
    const totalDuration = sessions.reduce(
      (sum, session) => sum + session.summary.totalDuration,
      0,
    );

    const componentCounts = new Map<string, number>();
    sessions.forEach((session) => {
      session.logs.forEach((log) => {
        const count = componentCounts.get(log.component) || 0;
        componentCounts.set(log.component, count + 1);
      });
    });

    const mostActiveComponents = Array.from(componentCounts.entries())
      .map(([component, count]) => ({ component, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return {
      totalSessions: sessions.length,
      totalLogs,
      averageSessionDuration:
        sessions.length > 0 ? totalDuration / sessions.length : 0,
      errorRate: totalLogs > 0 ? (totalErrors / totalLogs) * 100 : 0,
      mostActiveComponents,
    };
  }
}

export const resetLogCollector = new ResetLogCollector();

if (process.env.NODE_ENV === 'development') {
  window.resetLogCollector = {
    enable: () => resetLogCollector.enable(),
    disable: () => resetLogCollector.disable(),
    startSession: (id?: string) => resetLogCollector.startSession(id),
    endSession: () => resetLogCollector.endSession(),
    export: () => resetLogCollector.exportResetLogs(),
    clear: () => resetLogCollector.clear(),
    stats: () => resetLogCollector.getStats(),
    getCurrentSession: () => resetLogCollector.getCurrentSession(),
  };
}
