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
 * Reset log analysis tool
 * Provides deep analysis and visualization functionality for log data
 */

import {
  type ResetLogEntry,
  type ResetLogSession,
  resetLogCollector,
} from './reset-log-collector';

export interface LogAnalysisResult {
  /** Session overview */
  sessionOverview: {
    totalSessions: number;
    averageDuration: number;
    successRate: number;
    errorRate: number;
  };

  /** Component performance analysis */
  componentAnalysis: Array<{
    component: string;
    method: string;
    callCount: number;
    averageDuration: number;
    errorCount: number;
    successRate: number;
  }>;

  /** Call chain analysis */
  callChainAnalysis: Array<{
    sessionId: string;
    chain: Array<{
      component: string;
      method: string;
      timestamp: number;
      duration?: number;
      success: boolean;
    }>;
    totalDuration: number;
    success: boolean;
  }>;

  /** Error analysis */
  errorAnalysis: Array<{
    component: string;
    method: string;
    errorMessage: string;
    occurrenceCount: number;
    sessions: string[];
  }>;

  /** Performance bottlenecks */
  performanceBottlenecks: Array<{
    component: string;
    method: string;
    averageDuration: number;
    maxDuration: number;
    callCount: number;
  }>;
}

/**
 * Reset log analyzer
 */
export class ResetLogAnalyzer {
  /**
   * Analyze log data for all sessions
   */
  analyzeLogs(): LogAnalysisResult {
    const sessions = resetLogCollector.getAllSessions();

    if (sessions.length === 0) {
      return this.getEmptyResult();
    }

    return {
      sessionOverview: this.analyzeSessionOverview(sessions),
      componentAnalysis: this.analyzeComponentPerformance(sessions),
      callChainAnalysis: this.analyzeCallChains(sessions),
      errorAnalysis: this.analyzeErrors(sessions),
      performanceBottlenecks: this.analyzePerformanceBottlenecks(sessions),
    };
  }

  /**
   * Analyze session overview
   */
  private analyzeSessionOverview(sessions: ResetLogSession[]) {
    const totalSessions = sessions.length;
    const totalDuration = sessions.reduce(
      (sum, session) => sum + session.summary.totalDuration,
      0,
    );
    const totalErrors = sessions.reduce(
      (sum, session) => sum + session.summary.errorCount,
      0,
    );
    const totalSteps = sessions.reduce(
      (sum, session) => sum + session.summary.totalSteps,
      0,
    );

    return {
      totalSessions,
      averageDuration: totalSessions > 0 ? totalDuration / totalSessions : 0,
      successRate:
        totalSteps > 0 ? ((totalSteps - totalErrors) / totalSteps) * 100 : 100,
      errorRate: totalSteps > 0 ? (totalErrors / totalSteps) * 100 : 0,
    };
  }

  /**
   * Analyze component performance
   */
  private analyzeComponentPerformance(sessions: ResetLogSession[]) {
    const componentStats = new Map<
      string,
      Map<
        string,
        {
          callCount: number;
          totalDuration: number;
          errorCount: number;
          durations: number[];
        }
      >
    >();

    // Collect statistics
    sessions.forEach((session) => {
      session.logs.forEach((log) => {
        if (!componentStats.has(log.component)) {
          componentStats.set(log.component, new Map());
        }

        const methodStats = componentStats.get(log.component)!;
        if (!methodStats.has(log.method)) {
          methodStats.set(log.method, {
            callCount: 0,
            totalDuration: 0,
            errorCount: 0,
            durations: [],
          });
        }

        const stats = methodStats.get(log.method)!;
        stats.callCount++;

        if (log.duration !== undefined) {
          stats.totalDuration += log.duration;
          stats.durations.push(log.duration);
        }

        if (log.action === 'error') {
          stats.errorCount++;
        }
      });
    });

    // Generate analysis results
    const result: LogAnalysisResult['componentAnalysis'] = [];

    componentStats.forEach((methodStats, component) => {
      methodStats.forEach((stats, method) => {
        result.push({
          component,
          method,
          callCount: stats.callCount,
          averageDuration:
            stats.callCount > 0 ? stats.totalDuration / stats.callCount : 0,
          errorCount: stats.errorCount,
          successRate:
            stats.callCount > 0
              ? ((stats.callCount - stats.errorCount) / stats.callCount) * 100
              : 100,
        });
      });
    });

    return result.sort((a, b) => b.callCount - a.callCount);
  }

  /**
   * Analyze call chains
   */
  private analyzeCallChains(sessions: ResetLogSession[]) {
    return sessions.map((session) => {
      const chain = session.logs
        .filter(
          (log) =>
            log.action === 'start' ||
            log.action === 'end' ||
            log.action === 'error',
        )
        .map((log) => ({
          component: log.component,
          method: log.method,
          timestamp: log.timestamp,
          duration: log.duration,
          success: log.action !== 'error',
        }));

      return {
        sessionId: session.sessionId,
        chain,
        totalDuration: session.summary.totalDuration,
        success: session.summary.errorCount === 0,
      };
    });
  }

  /**
   * Analyze errors
   */
  private analyzeErrors(sessions: ResetLogSession[]) {
    const errorMap = new Map<
      string,
      {
        component: string;
        method: string;
        errorMessage: string;
        occurrenceCount: number;
        sessions: Set<string>;
      }
    >();

    sessions.forEach((session) => {
      session.logs
        .filter((log) => log.action === 'error')
        .forEach((log) => {
          let errorMsg = 'unknown';
          if (log.data?.error instanceof Error) {
            errorMsg = log.data.error.message;
          } else if (typeof log.data?.error === 'string') {
            errorMsg = log.data.error;
          } else if (log.data?.error != null) {
            errorMsg = JSON.stringify(log.data.error);
          }
          const errorKey = `${log.component}.${log.method}.${errorMsg}`;

          if (!errorMap.has(errorKey)) {
            errorMap.set(errorKey, {
              component: log.component,
              method: log.method,
              errorMessage: (log.data?.error as string) || 'Unknown error',
              occurrenceCount: 0,
              sessions: new Set(),
            });
          }

          const error = errorMap.get(errorKey)!;
          error.occurrenceCount++;
          error.sessions.add(session.sessionId);
        });
    });

    return Array.from(errorMap.values())
      .map((error) => ({
        ...error,
        sessions: Array.from(error.sessions),
      }))
      .sort((a, b) => b.occurrenceCount - a.occurrenceCount);
  }

  /**
   * Analyze performance bottlenecks
   */
  private analyzePerformanceBottlenecks(sessions: ResetLogSession[]) {
    const componentStats = new Map<
      string,
      Map<
        string,
        {
          durations: number[];
          callCount: number;
        }
      >
    >();

    // Collect duration data
    sessions.forEach((session) => {
      session.logs
        .filter((log) => log.duration !== undefined)
        .forEach((log) => {
          if (!componentStats.has(log.component)) {
            componentStats.set(log.component, new Map());
          }

          const methodStats = componentStats.get(log.component)!;
          if (!methodStats.has(log.method)) {
            methodStats.set(log.method, {
              durations: [],
              callCount: 0,
            });
          }

          const stats = methodStats.get(log.method)!;
          stats.durations.push(log.duration!);
          stats.callCount++;
        });
    });

    // Calculate performance metrics
    const result: LogAnalysisResult['performanceBottlenecks'] = [];

    componentStats.forEach((methodStats, component) => {
      methodStats.forEach((stats, method) => {
        const durations = stats.durations.sort((a, b) => a - b);
        const averageDuration =
          durations.reduce((sum, d) => sum + d, 0) / durations.length;
        const maxDuration = durations[durations.length - 1];

        result.push({
          component,
          method,
          averageDuration,
          maxDuration,
          callCount: stats.callCount,
        });
      });
    });

    return result
      .sort((a, b) => b.averageDuration - a.averageDuration)
      .slice(0, 10); // Return top 10 performance bottlenecks
  }

  /**
   * Get empty result
   */
  private getEmptyResult(): LogAnalysisResult {
    return {
      sessionOverview: {
        totalSessions: 0,
        averageDuration: 0,
        successRate: 100,
        errorRate: 0,
      },
      componentAnalysis: [],
      callChainAnalysis: [],
      errorAnalysis: [],
      performanceBottlenecks: [],
    };
  }

  /**
   * Generate analysis report
   */
  generateReport(): string {
    const analysis = this.analyzeLogs();

    let report = '# CustomTable Reset Operation Analysis Report\n\n';
    report += `Generated at: ${new Date().toISOString()}\n\n`;

    // Session overview
    report += '## Session Overview\n\n';
    report += `- Total Sessions: ${analysis.sessionOverview.totalSessions}\n`;
    report += `- Average Duration: ${analysis.sessionOverview.averageDuration.toFixed(
      2,
    )}ms\n`;
    report += `- Success Rate: ${analysis.sessionOverview.successRate.toFixed(2)}%\n`;
    report += `- Error Rate: ${analysis.sessionOverview.errorRate.toFixed(2)}%\n\n`;

    // Component performance analysis
    if (analysis.componentAnalysis.length > 0) {
      report += '## Component Performance Analysis\n\n';
      report +=
        '| Component | Method | Call Count | Avg Duration(ms) | Error Count | Success Rate |\n';
      report +=
        '|------|------|----------|--------------|----------|--------|\n';

      analysis.componentAnalysis.forEach((item) => {
        report += `| ${item.component} | ${item.method} | ${
          item.callCount
        } | ${item.averageDuration.toFixed(2)} | ${
          item.errorCount
        } | ${item.successRate.toFixed(2)}% |\n`;
      });
      report += '\n';
    }

    // Performance bottlenecks
    if (analysis.performanceBottlenecks.length > 0) {
      report += '## Performance Bottlenecks\n\n';
      report +=
        '| Component | Method | Avg Duration(ms) | Max Duration(ms) | Call Count |\n';
      report += '|------|------|--------------|--------------|----------|\n';

      analysis.performanceBottlenecks.forEach((item) => {
        report += `| ${item.component} | ${
          item.method
        } | ${item.averageDuration.toFixed(2)} | ${item.maxDuration} | ${
          item.callCount
        } |\n`;
      });
      report += '\n';
    }

    // Error analysis
    if (analysis.errorAnalysis.length > 0) {
      report += '## Error Analysis\n\n';
      report +=
        '| Component | Method | Error Message | Occurrence Count | Affected Sessions |\n';
      report += '|------|------|----------|----------|------------|\n';

      analysis.errorAnalysis.forEach((item) => {
        report += `| ${item.component} | ${item.method} | ${item.errorMessage} | ${item.occurrenceCount} | ${item.sessions.length} |\n`;
      });
      report += '\n';
    }

    return report;
  }

  /**
   * Export analysis report
   */
  exportAnalysisReport(): void {
    const report = this.generateReport();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `custom-table-reset-analysis-${timestamp}.md`;

    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    console.log(`[ResetLogAnalyzer] Analysis report exported: ${filename}`);
  }
}

// Create global instance
export const resetLogAnalyzer = new ResetLogAnalyzer();

// Automatically expose to global in development environment
if (process.env.NODE_ENV === 'development') {
  (window as unknown as Record<string, unknown>).resetLogAnalyzer = {
    analyze: () => resetLogAnalyzer.analyzeLogs(),
    generateReport: () => resetLogAnalyzer.generateReport(),
    exportReport: () => resetLogAnalyzer.exportAnalysisReport(),
  };
}
