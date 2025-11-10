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

import {
  exportLogsToFile,
  getLogCount,
  logger,
  startLogCollection,
} from '@veaiops/utils';
import { analyzeDOM, logInitialState } from './dom-analyzer';
import {
  analyzeLocalStorage,
  backupLocalStorage,
} from './local-storage-handler';
import { analyzePerformance } from './performance-analyzer';
import { generateRecommendations } from './report-generator';
import type { AnalysisReport } from './types';

/**
 * Global guide component interception issue analysis tool
 * Uses logging tools to analyze why first-time access is intercepted
 */
class GlobalGuideAnalyzer {
  private isAnalyzing = false;
  private analysisStartTime = 0;
  private localStorageBackup: Record<string, string> = {};

  /**
   * Start analysis
   */
  startAnalysis(): void {
    if (this.isAnalyzing) {
      // ✅ Correct: Use logger to record warning, data parameter should be object or undefined
      logger.warn({
        message: 'Analysis already in progress',
        data: undefined,
        source: 'GlobalGuideAnalyzer',
      });
      return;
    }

    this.isAnalyzing = true;
    this.analysisStartTime = Date.now();

    // Backup current localStorage state
    this.localStorageBackup = backupLocalStorage();

    // Start log collection
    startLogCollection();

    logger.info({
      message: 'Starting analysis of global guide component interception issue',
      data: {
        startTime: new Date().toISOString(),
        url: window.location.href,
      },
      source: 'GlobalGuideAnalyzer',
    });

    // Log critical state
    logInitialState();
  }

  /**
   * Stop analysis and export results
   */
  stopAnalysis(): void {
    if (!this.isAnalyzing) {
      // ✅ Correct: Use logger to record warning, data parameter should be object or undefined
      logger.warn({
        message: 'No analysis in progress',
        data: undefined,
        source: 'GlobalGuideAnalyzer',
      });
      return;
    }

    this.isAnalyzing = false;
    const analysisDuration = Date.now() - this.analysisStartTime;

    logger.info({
      message: 'Analysis completed',
      data: {
        duration: `${analysisDuration}ms`,
        logCount: getLogCount(),
      },
      source: 'GlobalGuideAnalyzer',
    });

    // Export analysis results
    this.exportAnalysisResults();
  }

  /**
   * Export analysis results
   */
  private exportAnalysisResults(): void {
    try {
      // Export logs
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/:/g, '-');
      const filename = `global-guide-analysis-${timestamp}.log`;

      exportLogsToFile(filename);

      // Create detailed analysis report
      const analysisReport = this.generateAnalysisReport();

      // Save analysis report to localStorage for later viewing
      const reportKey = `global-guide-analysis-report-${timestamp}`;
      localStorage.setItem(reportKey, JSON.stringify(analysisReport));

      logger.info({
        message: 'Analysis results exported',
        data: {
          logFile: filename,
          reportKey,
          reportSize: JSON.stringify(analysisReport).length,
        },
        source: 'GlobalGuideAnalyzer',
      });
    } catch (error) {
      // ✅ Correct: Use logger to record error and expose actual error information
      const errorObj =
        error instanceof Error ? error : new Error(String(error));
      logger.error({
        message: 'Failed to export analysis results',
        data: {
          error: errorObj.message,
          stack: errorObj.stack,
          errorObj,
        },
        source: 'GlobalGuideAnalyzer',
        component: 'exportAnalysisResults',
      });
    }
  }

  /**
   * Generate analysis report
   */
  private generateAnalysisReport(): AnalysisReport {
    return {
      analysisTime: new Date().toISOString(),
      duration: Date.now() - this.analysisStartTime,
      url: window.location.href,
      localStorageBackup: this.localStorageBackup,
      localStorageAnalysis: analyzeLocalStorage(this.localStorageBackup),
      domAnalysis: analyzeDOM(),
      performanceAnalysis: analyzePerformance(),
      recommendations: generateRecommendations(),
    };
  }

  /**
   * Quick diagnosis
   */
  quickDiagnosis(): void {
    // ✅ Correct: Use logger to record information, data parameter should be object or undefined
    logger.info({
      message: 'Starting quick diagnosis',
      data: undefined,
      source: 'GlobalGuideAnalyzer',
    });

    // Check localStorage
    const guideStore = localStorage.getItem('global-guide-store');
    if (guideStore) {
      try {
        const parsed = JSON.parse(guideStore);
        if ('state' in parsed && 'guideVisible' in parsed.state) {
          logger.error({
            message: 'Issue found: guideVisible is persisted',
            data: {
              value: parsed.state.guideVisible,
              store: parsed,
            },
            source: 'GlobalGuideAnalyzer',
          });
        }
      } catch (error) {
        // ✅ Correct: Use logger to record error and expose actual error information
        const errorObj =
          error instanceof Error ? error : new Error(String(error));
        logger.error({
          message: 'localStorage parse failed',
          data: {
            error: errorObj.message,
            stack: errorObj.stack,
            errorObj,
          },
          source: 'GlobalGuideAnalyzer',
          component: 'quickDiagnosis',
        });
      }
    }

    // Check DOM
    const visibleGuideElements = document.querySelectorAll(
      '[class*="global-guide"]:not([style*="display: none"])',
    );
    if (visibleGuideElements.length > 0) {
      logger.error({
        message: 'Issue found: visible guide elements exist',
        data: {
          count: visibleGuideElements.length,
          elements: Array.from(visibleGuideElements).map((el) => ({
            tagName: el.tagName,
            className: el.className,
          })),
        },
        source: 'GlobalGuideAnalyzer',
        component: 'quickDiagnosis',
      });
    }

    // ✅ Correct: Use logger to record information, data parameter should be object or undefined
    logger.info({
      message: 'Quick diagnosis completed',
      data: undefined,
      source: 'GlobalGuideAnalyzer',
    });
  }
}

// Create global analyzer instance
export const globalGuideAnalyzer = new GlobalGuideAnalyzer();

// Export convenience methods
export const analyzeGlobalGuideIssue = () => {
  globalGuideAnalyzer.startAnalysis();

  // Automatically stop analysis after 5 seconds
  setTimeout(() => {
    globalGuideAnalyzer.stopAnalysis();
  }, 5000);
};

export const quickDiagnoseGlobalGuide = () => {
  globalGuideAnalyzer.quickDiagnosis();
};

// Export convenience method for all related logs
export const exportAllGlobalGuideLogs = (filename?: string) => {
  const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
  const finalFilename =
    filename || `global-guide-complete-analysis-${timestamp}.log`;

  logger.info({
    message: 'Starting export of global guide related logs',
    data: {
      filename: finalFilename,
      timestamp: new Date().toISOString(),
    },
    source: 'GlobalGuideAnalyzer',
    component: 'exportAllGlobalGuideLogs',
  });

  // Use log-exporter to export logs
  exportLogsToFile(finalFilename);

  logger.info({
    message: 'Global guide logs export completed',
    data: {
      filename: finalFilename,
    },
    source: 'GlobalGuideAnalyzer',
  });
};

// Provide convenience methods in console
if (typeof window !== 'undefined') {
  (window as any).analyzeGlobalGuide = analyzeGlobalGuideIssue;
  (window as any).quickDiagnoseGuide = quickDiagnoseGlobalGuide;
  (window as any).exportAllGlobalGuideLogs = exportAllGlobalGuideLogs;
  (window as any).globalGuideAnalyzer = globalGuideAnalyzer;
}
